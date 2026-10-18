import { describe, expect, it } from "vitest";
import type { LocationFix } from "../domain/types";
import { LocationRequestError, type GeolocationPort } from "../ports/geolocation";
import {
  LOCATION_STALE_AFTER_MS,
  activeFix,
  createLocationSession,
  locationStatusCopy,
} from "./locationSession";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => {};
  let reject: (error: unknown) => void = () => {};
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function fakePort() {
  let pending: Deferred<LocationFix> | null = null;
  let onFix: ((fix: LocationFix) => void) | null = null;
  const calls = { request: 0, watch: 0, unsubscribe: 0 };
  const port: GeolocationPort = {
    requestOnce() {
      calls.request += 1;
      pending = deferred();
      return pending.promise;
    },
    watch(callback) {
      calls.watch += 1;
      onFix = callback;
      return () => {
        calls.unsubscribe += 1;
        if (onFix === callback) {
          onFix = null;
        }
      };
    },
  };
  return {
    port,
    calls,
    resolve(fix: LocationFix) {
      pending?.resolve(fix);
    },
    reject(error: unknown) {
      pending?.reject(error);
    },
    push(fix: LocationFix) {
      onFix?.(fix);
    },
  };
}

const freshAt = new Date().toISOString();

function fix(latitude: number, at = freshAt, accuracyMeters = 20): LocationFix {
  return { latitude, longitude: 121, accuracyMeters, at };
}

describe("location session", () => {
  it("starts idle and does not call the geolocation port", () => {
    const fake = fakePort();
    const session = createLocationSession(fake.port);
    session.setMapActive(true);
    expect(session.getState()).toEqual({ status: "idle", fix: null });
    expect(fake.calls.request).toBe(0);
    expect(fake.calls.watch).toBe(0);
  });

  it("moves from requesting to granted and stores one fix", async () => {
    const fake = fakePort();
    const session = createLocationSession(fake.port);
    session.setMapActive(true);
    const first = fix(14.55);
    const second = fix(14.56);
    const pending = session.optIn();
    expect(session.getState().status).toBe("requesting");
    fake.resolve(first);
    await pending;
    expect(session.getState()).toEqual({ status: "granted", fix: first });
    expect(fake.calls.watch).toBe(1);
    fake.push(second);
    expect(session.getState()).toEqual({ status: "granted", fix: second });
  });

  it("records a denial without watching", async () => {
    const fake = fakePort();
    const session = createLocationSession(fake.port);
    const pending = session.optIn();
    fake.reject(new LocationRequestError("denied"));
    await pending;
    expect(session.getState()).toEqual({ status: "denied", fix: null });
    expect(fake.calls.watch).toBe(0);
    expect(locationStatusCopy(session.getState())).toBe(
      "Location is off. You can still search and browse the map.",
    );
  });

  it("records unavailable when the first reading fails", async () => {
    const fake = fakePort();
    const session = createLocationSession(fake.port);
    const pending = session.optIn();
    fake.reject(new LocationRequestError("unavailable"));
    await pending;
    expect(session.getState()).toEqual({ status: "unavailable", fix: null });
  });

  it("keeps the current fix on screen while a refresh is in progress", async () => {
    const fake = fakePort();
    const session = createLocationSession(fake.port);
    const reading = fix(14.55);
    const first = session.optIn();
    fake.resolve(reading);
    await first;
    const second = session.optIn();
    expect(session.getState().status).toBe("requesting");
    expect(activeFix(session.getState())).toEqual(reading);
    fake.resolve(fix(14.56));
    await second;
  });

  it("keeps the last fix as stale when a later reading fails", async () => {
    const fake = fakePort();
    const session = createLocationSession(fake.port);
    session.setMapActive(true);
    const first = session.optIn();
    fake.resolve(fix(14.55));
    await first;
    const second = session.optIn();
    fake.reject(new LocationRequestError("unavailable"));
    await second;
    expect(session.getState()).toEqual({ status: "stale", fix: fix(14.55) });
  });

  it("marks an old reading stale", async () => {
    const now = Date.parse("2026-10-18T02:00:00.000Z");
    const fake = fakePort();
    const session = createLocationSession(fake.port, () => now);
    const pending = session.optIn();
    const old = fix(14.55, new Date(now - LOCATION_STALE_AFTER_MS - 1).toISOString());
    fake.resolve(old);
    await pending;
    expect(session.getState()).toEqual({ status: "stale", fix: old });
  });

  it("stops the watch when the page is hidden or the map is left", async () => {
    const fake = fakePort();
    const session = createLocationSession(fake.port);
    session.setMapActive(true);
    const pending = session.optIn();
    fake.resolve(fix(14.55));
    await pending;
    session.setPageVisible(false);
    expect(fake.calls.unsubscribe).toBe(1);
    fake.push(fix(14.7));
    expect(session.getState().fix).toEqual(fix(14.55));
    session.setPageVisible(true);
    expect(fake.calls.watch).toBe(2);
    session.setMapActive(false);
    expect(fake.calls.unsubscribe).toBe(2);
    fake.push(fix(14.8));
    expect(session.getState().fix).toEqual(fix(14.55));
  });

  it("ignores a reading after unsubscribe", async () => {
    const fake = fakePort();
    const session = createLocationSession(fake.port);
    session.setMapActive(true);
    const pending = session.optIn();
    fake.resolve(fix(14.55));
    await pending;
    session.stop();
    fake.push(fix(14.9));
    expect(session.getState().fix).toEqual(fix(14.55));
    expect(fake.calls.unsubscribe).toBe(1);
  });

  it("describes a coarse granted fix as approximate", () => {
    expect(
      locationStatusCopy({
        status: "granted",
        fix: fix(14.55, "2026-10-18T01:00:00.000Z", 250),
      }),
    ).toBe("Approximate, within 250 meters.");
  });

  it("keeps a stale coarse fix from sounding precise", () => {
    expect(
      locationStatusCopy({
        status: "stale",
        fix: fix(14.55, "2026-10-18T01:00:00.000Z", 250),
      }),
    ).toBe(
      "This location reading is no longer current. Approximate, within 250 meters.",
    );
  });
});
