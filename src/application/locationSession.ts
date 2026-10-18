import type { LocationFix } from "../domain/types";
import { LocationRequestError, type GeolocationPort } from "../ports/geolocation";

export const LOCATION_STALE_AFTER_MS = 120_000;
export const COARSE_ACCURACY_METERS = 100;

export type LocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "stale";

export type LocationSessionState = {
  status: LocationStatus;
  fix: LocationFix | null;
};

export function isCoarse(accuracyMeters: number): boolean {
  return accuracyMeters > COARSE_ACCURACY_METERS;
}

export function activeFix(state: LocationSessionState): LocationFix | null {
  if (state.status === "idle" || state.status === "denied" || state.status === "unavailable") {
    return null;
  }
  return state.fix;
}

export function locationStatusCopy(state: LocationSessionState): string {
  switch (state.status) {
    case "idle":
      return "Use your location to see what is nearby.";
    case "requesting":
      return "Finding your location.";
    case "denied":
      return "Location is off. You can still search and browse the map.";
    case "unavailable":
      return "Your location could not be read.";
    case "stale":
      if (state.fix && isCoarse(state.fix.accuracyMeters)) {
        return `This location reading is no longer current. Approximate, within ${Math.round(state.fix.accuracyMeters)} meters.`;
      }
      return "This location reading is no longer current.";
    case "granted":
      if (state.fix && isCoarse(state.fix.accuracyMeters)) {
        return `Approximate, within ${Math.round(state.fix.accuracyMeters)} meters.`;
      }
      return "Distances use your location.";
  }
}

export function locationActionLabel(status: LocationStatus): string {
  switch (status) {
    case "idle":
      return "Use location";
    case "requesting":
      return "Finding location";
    case "granted":
      return "Location on";
    case "denied":
      return "Location off";
    case "unavailable":
      return "Try location again";
    case "stale":
      return "Refresh location";
  }
}

export type LocationSession = {
  getState(): LocationSessionState;
  subscribe(listener: () => void): () => void;
  optIn(): Promise<void>;
  setMapActive(active: boolean): void;
  setPageVisible(visible: boolean): void;
  evaluate(): void;
  stop(): void;
};

export function createLocationSession(
  port: GeolocationPort,
  now: () => number = Date.now,
): LocationSession {
  let state: LocationSessionState = { status: "idle", fix: null };
  let stopWatch: (() => void) | null = null;
  let watchGeneration = 0;
  let requestGeneration = 0;
  let mapActive = false;
  let pageVisible = true;
  let disposed = false;
  const listeners = new Set<() => void>();

  function emit() {
    for (const listener of listeners) {
      listener();
    }
  }

  function commit(next: LocationSessionState) {
    state = next;
    emit();
  }

  function readingStatus(fix: LocationFix): "granted" | "stale" {
    const at = Date.parse(fix.at);
    const age = Number.isFinite(at) ? now() - at : Number.POSITIVE_INFINITY;
    return age > LOCATION_STALE_AFTER_MS ? "stale" : "granted";
  }

  function stopWatching() {
    watchGeneration += 1;
    stopWatch?.();
    stopWatch = null;
  }

  function shouldWatch(): boolean {
    return (
      !disposed &&
      mapActive &&
      pageVisible &&
      state.fix !== null &&
      (state.status === "granted" || state.status === "stale")
    );
  }

  function startWatching() {
    if (stopWatch || !shouldWatch()) {
      return;
    }
    const generation = watchGeneration;
    stopWatch = port.watch((fix) => {
      if (disposed || generation !== watchGeneration) {
        return;
      }
      commit({ status: readingStatus(fix), fix });
    });
  }

  function syncWatch() {
    if (shouldWatch()) {
      startWatching();
    } else {
      stopWatching();
    }
  }

  return {
    getState() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    optIn() {
      if (disposed || state.status === "requesting") {
        return Promise.resolve();
      }
      const generation = ++requestGeneration;
      const previous = state.fix;
      commit({ status: "requesting", fix: previous });
      return port.requestOnce().then(
        (fix) => {
          if (disposed || generation !== requestGeneration) {
            return;
          }
          commit({ status: readingStatus(fix), fix });
          syncWatch();
        },
        (error: unknown) => {
          if (disposed || generation !== requestGeneration) {
            return;
          }
          stopWatching();
          const denied = error instanceof LocationRequestError && error.kind === "denied";
          if (denied) {
            commit({ status: "denied", fix: null });
            return;
          }
          if (previous) {
            commit({ status: "stale", fix: previous });
            syncWatch();
            return;
          }
          commit({ status: "unavailable", fix: null });
        },
      );
    },
    setMapActive(active) {
      mapActive = active;
      syncWatch();
    },
    setPageVisible(visible) {
      pageVisible = visible;
      syncWatch();
    },
    evaluate() {
      if (!state.fix || (state.status !== "granted" && state.status !== "stale")) {
        return;
      }
      commit({ status: readingStatus(state.fix), fix: state.fix });
    },
    stop() {
      disposed = true;
      requestGeneration += 1;
      stopWatching();
    },
  };
}
