import { displayValue } from "../domain/provenance";
import type { Amenity, Cafe } from "../domain/types";

export type CafeSearch = {
  text: string;
  neighborhood: string | null;
  amenity: Amenity | null;
};

export function searchCafes(cafes: Cafe[], criteria: CafeSearch): Cafe[] {
  const text = criteria.text.trim().toLowerCase();
  return cafes.filter((cafe) => {
    if (text && !cafe.name.toLowerCase().includes(text)) {
      return false;
    }
    if (criteria.neighborhood && cafe.neighborhood !== criteria.neighborhood) {
      return false;
    }
    if (criteria.amenity) {
      const amenities = displayValue(cafe.amenities, "detail");
      if (!amenities?.includes(criteria.amenity)) {
        return false;
      }
    }
    return true;
  });
}
