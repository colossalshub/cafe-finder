import type { Coordinates } from "./types";

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function distanceMeters(from: Coordinates, to: Coordinates): number {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

export function accuracyRing(center: Coordinates, radiusMeters: number, steps = 64): Coordinates[] {
  const ring: Coordinates[] = [];
  const metersPerDegreeLatitude = 111_195;
  const metersPerDegreeLongitude =
    Math.cos(toRadians(center.latitude)) * metersPerDegreeLatitude;
  const longitudeScale =
    Math.abs(metersPerDegreeLongitude) < 1 ? 1 : metersPerDegreeLongitude;
  for (let step = 0; step <= steps; step += 1) {
    const angle = (step / steps) * 2 * Math.PI;
    ring.push({
      latitude: center.latitude + (Math.sin(angle) * radiusMeters) / metersPerDegreeLatitude,
      longitude: center.longitude + (Math.cos(angle) * radiusMeters) / longitudeScale,
    });
  }
  return ring;
}
