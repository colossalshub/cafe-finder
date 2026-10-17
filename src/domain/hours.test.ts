import { describe, expect, it } from "vitest";
import { isOpenAt } from "./hours";
import type { WeeklyHours } from "./types";

const daytime: WeeklyHours = {
  periods: [{ day: "sun", opens: "08:00", closes: "17:00" }],
};

const overnight: WeeklyHours = {
  periods: [{ day: "sat", opens: "22:00", closes: "02:00" }],
};

describe("isOpenAt", () => {
  it("is open inside a same-day period in Asia/Manila", () => {
    expect(isOpenAt(daytime, new Date("2026-10-18T02:00:00Z"))).toBe(true);
  });

  it("is closed before opening", () => {
    expect(isOpenAt(daytime, new Date("2026-10-17T23:30:00Z"))).toBe(false);
  });

  it("treats the closing minute as closed", () => {
    expect(isOpenAt(daytime, new Date("2026-10-18T09:00:00Z"))).toBe(false);
  });

  it("covers an overnight period into the next morning", () => {
    expect(isOpenAt(overnight, new Date("2026-10-17T15:00:00Z"))).toBe(true);
    expect(isOpenAt(overnight, new Date("2026-10-17T17:30:00Z"))).toBe(true);
    expect(isOpenAt(overnight, new Date("2026-10-17T18:00:00Z"))).toBe(false);
  });
});
