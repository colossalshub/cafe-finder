import { describe, expect, it } from "vitest";
import type { Cafe, Coordinates } from "../domain/types";
import { NEARBY_RADIUS_METERS, nearbyCafes, rankCafes } from "./nearby";

function cafe(id: string, location: Coordinates | null, verification: "fixture" | "unverified" = "fixture"): Cafe {
  return {
    id,
    slug: id,
    name: id,
    nameSourceId: "src",
    verification: "fixture",
    neighborhood: null,
    address: null,
    location: location
      ? { value: location, sourceId: "src", verification }
      : null,
    hours: null,
    amenities: null,
    priceRange: null,
    menu: [],
    photos: [],
    sources: [],
  };
}

describe("nearbyCafes", () => {
  const origin = { latitude: 0, longitude: 0 };
  const viewportCenter = { latitude: 10, longitude: 10 };
  const near = cafe("near", { latitude: 0.001, longitude: 0 });
  const farther = cafe("farther", { latitude: 0.004, longitude: 0 });
  const outside = cafe("outside", { latitude: 10, longitude: 10 });
  const unlocated = cafe("unlocated", null);
  const hidden = cafe("hidden", { latitude: 0, longitude: 0 }, "unverified");

  it("returns an empty list for an empty catalog", () => {
    expect(nearbyCafes([], origin, NEARBY_RADIUS_METERS)).toEqual([]);
  });

  it("sorts by distance from the fix and excludes a café outside the radius", () => {
    const ranked = nearbyCafes([outside, unlocated, hidden, farther, near], origin, 1_000);
    expect(ranked.map((item) => item.cafe.id)).toEqual(["near", "farther"]);
    expect(ranked[0].distanceMeters).toBeLessThan(ranked[1].distanceMeters);
  });

  it("uses the supplied origin rather than another point", () => {
    const fromFix = nearbyCafes([outside, near], origin, 1_000).map((item) => item.cafe.id);
    const fromViewport = nearbyCafes([outside, near], viewportCenter, 1_000).map(
      (item) => item.cafe.id,
    );
    expect(fromFix).toEqual(["near"]);
    expect(fromViewport).toEqual(["outside"]);
  });
});

describe("rankCafes", () => {
  it("keeps catalog order and omits distances when there is no fix", () => {
    const cafes = [
      cafe("a", { latitude: 1, longitude: 1 }),
      cafe("b", null),
    ];
    expect(rankCafes(cafes, null, NEARBY_RADIUS_METERS).map((item) => item.cafe.id)).toEqual([
      "a",
      "b",
    ]);
    expect(rankCafes(cafes, null, NEARBY_RADIUS_METERS).every((item) => item.distanceMeters === null)).toBe(
      true,
    );
  });

  it("lists nearby cafés first and still returns the rest of the search", () => {
    const ranked = rankCafes(
      [
        cafe("outside", { latitude: 10, longitude: 10 }),
        cafe("blank", null),
        cafe("near", { latitude: 0.001, longitude: 0 }),
      ],
      { latitude: 0, longitude: 0 },
      1_000,
    );
    expect(ranked.map((item) => item.cafe.id)).toEqual(["near", "outside", "blank"]);
    expect(ranked[0].nearby).toBe(true);
    expect(ranked[1].distanceMeters).toBeGreaterThan(1_000);
    expect(ranked[2].distanceMeters).toBeNull();
  });
});
