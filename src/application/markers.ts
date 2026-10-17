import { displayValue } from "../domain/provenance";
import type { Cafe } from "../domain/types";

export type CafeMarker = {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
};

export function markerCafes(cafes: Cafe[]): CafeMarker[] {
  const markers: CafeMarker[] = [];
  for (const cafe of cafes) {
    const location = displayValue(cafe.location, "identity");
    if (!location) {
      continue;
    }
    markers.push({
      id: cafe.id,
      name: cafe.name,
      longitude: location.longitude,
      latitude: location.latitude,
    });
  }
  return markers;
}
