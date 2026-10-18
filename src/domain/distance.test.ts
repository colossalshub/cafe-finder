import { describe, expect, it } from "vitest";
import { distanceMeters } from "./distance";

describe("distanceMeters", () => {
  it("returns 0 for the same coordinate", () => {
    const point = { latitude: 14.554, longitude: 121.024 };
    expect(distanceMeters(point, point)).toBe(0);
  });

  it("matches the equatorial arc length of one degree within a meter", () => {
    const arcMeters = (Math.PI / 180) * 6_371_000;
    const distance = distanceMeters(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
    );
    expect(Math.abs(distance - arcMeters)).toBeLessThan(1);
  });

  it("does not change when the points are swapped", () => {
    const makati = { latitude: 14.554, longitude: 121.024 };
    const salcedo = { latitude: 14.559, longitude: 121.022 };
    expect(distanceMeters(makati, salcedo)).toBe(distanceMeters(salcedo, makati));
  });
});
