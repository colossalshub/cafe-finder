import type { Amenity } from "../domain/types";
import { AMENITY_LABELS } from "./labels";

type FilterBarProps = {
  neighborhoods: string[];
  amenities: Amenity[];
  neighborhood: string | null;
  amenity: Amenity | null;
  onNeighborhood: (value: string | null) => void;
  onAmenity: (value: Amenity | null) => void;
};

export function FilterBar({
  neighborhoods,
  amenities,
  neighborhood,
  amenity,
  onNeighborhood,
  onAmenity,
}: FilterBarProps) {
  return (
    <div className="filters">
      <fieldset>
        <legend>Neighborhood</legend>
        <div className="chips">
          <button
            type="button"
            className="chip chip-any"
            aria-pressed={neighborhood === null}
            onClick={() => onNeighborhood(null)}
          >
            Any
          </button>
          {neighborhoods.map((value) => (
            <button
              key={value}
              type="button"
              className="chip"
              aria-pressed={neighborhood === value}
              onClick={() => onNeighborhood(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Amenity</legend>
        <div className="chips">
          <button
            type="button"
            className="chip chip-any"
            aria-pressed={amenity === null}
            onClick={() => onAmenity(null)}
          >
            Any
          </button>
          {amenities.map((value) => (
            <button
              key={value}
              type="button"
              className="chip"
              aria-pressed={amenity === value}
              onClick={() => onAmenity(value)}
            >
              {AMENITY_LABELS[value]}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
