import { describe, expect, it } from "vitest";
import { fixtureCafes } from "../data/fixtures";
import { searchCafes } from "./searchCafes";

describe("searchCafes", () => {
  it("matches fixture names only", () => {
    const results = searchCafes(fixtureCafes, {
      text: "folded",
      neighborhood: null,
      amenity: null,
    });
    expect(results.map((cafe) => cafe.name)).toEqual(["Folded Page"]);
  });

  it("skips cafés that lack the selected neighborhood", () => {
    const results = searchCafes(fixtureCafes, {
      text: "",
      neighborhood: "Legazpi",
      amenity: null,
    });
    expect(results.map((cafe) => cafe.id)).toEqual(["demo-north-margin"]);
  });

  it("skips cafés that lack the selected amenity", () => {
    const results = searchCafes(fixtureCafes, {
      text: "",
      neighborhood: null,
      amenity: "wifi",
    });
    expect(results.map((cafe) => cafe.id)).toEqual([
      "demo-north-margin",
      "demo-folded-page",
    ]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(
      searchCafes(fixtureCafes, {
        text: "no-such-cafe",
        neighborhood: null,
        amenity: null,
      }),
    ).toEqual([]);
  });
});
