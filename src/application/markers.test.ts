import { describe, expect, it } from "vitest";
import { fixtureCafes } from "../data/fixtures";
import type { Cafe } from "../domain/types";
import { markerCafes } from "./markers";

describe("markerCafes", () => {
  it("omits cafés without coordinates and keeps the others in the list data", () => {
    const markers = markerCafes(fixtureCafes);
    expect(fixtureCafes.some((cafe) => cafe.location === null)).toBe(true);
    expect(markers.map((marker) => marker.id)).not.toContain("demo-blank-entry");
    expect(markers).toHaveLength(fixtureCafes.length - 1);
  });

  it("hides an unverified coordinate and shows a community coordinate", () => {
    const hidden = {
      ...fixtureCafes[0],
      id: "hidden",
      location: {
        value: { latitude: 14.55, longitude: 121.02 },
        sourceId: "src",
        verification: "unverified",
      },
    } satisfies Cafe;
    const community = {
      ...fixtureCafes[0],
      id: "community",
      location: {
        value: { latitude: 14.56, longitude: 121.03 },
        sourceId: "src",
        verification: "community",
      },
    } satisfies Cafe;
    expect(markerCafes([hidden, community]).map((marker) => marker.id)).toEqual(["community"]);
  });
});
