import { distanceMeters } from "../domain/distance";
import { displayValue } from "../domain/provenance";
import type { Cafe, Coordinates } from "../domain/types";

export const NEARBY_RADIUS_METERS = 2_000;

export type NearbyCafe = {
  cafe: Cafe;
  distanceMeters: number;
};

export type RankedCafe = {
  cafe: Cafe;
  distanceMeters: number | null;
  nearby: boolean;
};

export function nearbyCafes(
  cafes: Cafe[],
  origin: Coordinates,
  radiusMeters: number,
): NearbyCafe[] {
  const ranked: NearbyCafe[] = [];
  for (const cafe of cafes) {
    const location = displayValue(cafe.location, "identity");
    if (!location) {
      continue;
    }
    const meters = distanceMeters(origin, location);
    if (meters > radiusMeters) {
      continue;
    }
    ranked.push({ cafe, distanceMeters: meters });
  }
  ranked.sort(
    (left, right) =>
      left.distanceMeters - right.distanceMeters || left.cafe.id.localeCompare(right.cafe.id),
  );
  return ranked;
}

export function rankCafes(
  cafes: Cafe[],
  origin: Coordinates | null,
  radiusMeters: number,
): RankedCafe[] {
  if (!origin) {
    return cafes.map((cafe) => ({ cafe, distanceMeters: null, nearby: false }));
  }
  const nearby = nearbyCafes(cafes, origin, radiusMeters);
  const nearbyIds = new Set(nearby.map((item) => item.cafe.id));
  const rest: RankedCafe[] = [];
  for (const cafe of cafes) {
    if (nearbyIds.has(cafe.id)) {
      continue;
    }
    const location = displayValue(cafe.location, "identity");
    rest.push({
      cafe,
      distanceMeters: location ? distanceMeters(origin, location) : null,
      nearby: false,
    });
  }
  rest.sort((left, right) => {
    if (left.distanceMeters === null && right.distanceMeters === null) {
      return 0;
    }
    if (left.distanceMeters === null) {
      return 1;
    }
    if (right.distanceMeters === null) {
      return -1;
    }
    return left.distanceMeters - right.distanceMeters;
  });
  return [
    ...nearby.map((item) => ({
      cafe: item.cafe,
      distanceMeters: item.distanceMeters,
      nearby: true,
    })),
    ...rest,
  ];
}
