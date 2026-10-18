import { describe, expect, it } from "vitest";
import { inCollection, personalStatusForCafe, personalStatusLine } from "./personalStatus";

describe("personal status line", () => {
  it("says nothing when the café has no personal record", () => {
    expect(personalStatusLine({ saved: false, onBucket: false, visitCount: 0 })).toBeNull();
  });

  it("names each record the person actually has", () => {
    expect(personalStatusLine({ saved: true, onBucket: true, visitCount: 1 })).toBe(
      "Saved · Bucket list · Visit reported",
    );
    expect(personalStatusLine({ saved: false, onBucket: false, visitCount: 2 })).toBe(
      "2 visits reported",
    );
  });

  it("counts only records for the café", () => {
    expect(
      personalStatusForCafe("demo-north-margin", {
        favorites: [{ cafeId: "demo-north-margin" }],
        bucket: [{ cafeId: "demo-folded-page" }],
        visits: [{ cafeId: "demo-north-margin" }, { cafeId: "demo-north-margin" }, { cafeId: "demo-low-table" }],
      }),
    ).toBe("Saved · 2 visits reported");
  });

  it("matches one personal collection and ignores the others", () => {
    const personal = {
      favorites: [{ cafeId: "demo-north-margin" }],
      bucket: [{ cafeId: "demo-folded-page" }],
      visits: [{ cafeId: "demo-low-table" }],
    };
    expect(inCollection("demo-north-margin", "saved", personal)).toBe(true);
    expect(inCollection("demo-north-margin", "bucket", personal)).toBe(false);
    expect(inCollection("demo-low-table", "visited", personal)).toBe(true);
    expect(inCollection("demo-blank-entry", "saved", personal)).toBe(false);
  });
});
