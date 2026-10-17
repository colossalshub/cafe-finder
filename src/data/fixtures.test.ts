import { describe, expect, it } from "vitest";
import { fixtureCafes } from "./fixtures";

describe("fixture cafes", () => {
  it("labels every record as a fixture and includes a fixture source", () => {
    expect(fixtureCafes.length).toBeGreaterThan(0);
    for (const cafe of fixtureCafes) {
      expect(cafe.verification).toBe("fixture");
      expect(cafe.photos).toEqual([]);
      expect(cafe.sources.some((source) => source.kind === "fixture")).toBe(true);
    }
  });

  it("includes a record with missing sections and one without coordinates", () => {
    expect(fixtureCafes.some((cafe) => cafe.hours === null)).toBe(true);
    expect(fixtureCafes.some((cafe) => cafe.menu.length === 0)).toBe(true);
    expect(fixtureCafes.some((cafe) => cafe.location === null)).toBe(true);
    expect(fixtureCafes.some((cafe) => cafe.neighborhood === null)).toBe(true);
  });
});
