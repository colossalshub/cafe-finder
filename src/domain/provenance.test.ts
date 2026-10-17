import { describe, expect, it } from "vitest";
import { openStatus } from "./openStatus";
import { canShowSourced, displayValue } from "./provenance";
import type { WeeklyHours } from "./types";

const hours: WeeklyHours = {
  periods: [{ day: "sun", opens: "08:00", closes: "17:00" }],
};

describe("provenance", () => {
  it("shows fixture and verified details", () => {
    expect(canShowSourced("fixture", "detail")).toBe(true);
    expect(canShowSourced("verified", "detail")).toBe(true);
  });

  it("hides unverified values", () => {
    expect(
      displayValue(
        { value: hours, sourceId: "src", verification: "unverified" },
        "detail",
      ),
    ).toBeNull();
  });

  it("allows a community name or coordinate and hides community hours", () => {
    expect(canShowSourced("community", "identity")).toBe(true);
    expect(canShowSourced("community", "detail")).toBe(false);
    expect(openStatus({ value: hours, sourceId: "src", verification: "community" }, new Date())).toBeNull();
  });

  it("returns no open or closed status when hours are missing", () => {
    expect(openStatus(null, new Date("2026-10-18T02:00:00Z"))).toBeNull();
  });

  it("returns no open or closed status for fixture hours", () => {
    expect(
      openStatus(
        { value: hours, sourceId: "src", verification: "fixture" },
        new Date("2026-10-18T02:00:00Z"),
      ),
    ).toBeNull();
  });

  it("returns a status only for verified hours", () => {
    expect(
      openStatus(
        { value: hours, sourceId: "src", verification: "verified" },
        new Date("2026-10-18T02:00:00Z"),
      ),
    ).toBe("open");
  });
});
