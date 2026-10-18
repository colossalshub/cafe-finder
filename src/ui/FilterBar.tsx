import type { Amenity } from "../domain/types";
import type { PlaceCollection } from "../application/personalStatus";
import { AMENITY_LABELS } from "./labels";

type AmenityChipsProps = {
  amenities: Amenity[];
  amenity: Amenity | null;
  onAmenity: (value: Amenity | null) => void;
  includeAny?: boolean;
};

export function AmenityChips({ amenities, amenity, onAmenity, includeAny = true }: AmenityChipsProps) {
  return (
    <div className="chips">
      {includeAny ? (
        <button
          type="button"
          className="chip chip-any"
          aria-pressed={amenity === null}
          onClick={() => onAmenity(null)}
        >
          Any
        </button>
      ) : null}
      {amenities.map((value) => (
        <button
          key={value}
          type="button"
          className="chip"
          aria-pressed={amenity === value}
          onClick={() => onAmenity(!includeAny && amenity === value ? null : value)}
        >
          {AMENITY_LABELS[value]}
        </button>
      ))}
    </div>
  );
}

type FilterBarProps = {
  neighborhoods: string[];
  amenities: Amenity[];
  neighborhood: string | null;
  amenity: Amenity | null;
  collection: PlaceCollection | null;
  onNeighborhood: (value: string | null) => void;
  onAmenity: (value: Amenity | null) => void;
  onCollection: (value: PlaceCollection | null) => void;
};

export function FilterBar({
  neighborhoods,
  amenities,
  neighborhood,
  amenity,
  collection,
  onNeighborhood,
  onAmenity,
  onCollection,
}: FilterBarProps) {
  const collections: { value: PlaceCollection; label: string }[] = [
    { value: "saved", label: "Saved" },
    { value: "bucket", label: "Bucket list" },
    { value: "visited", label: "Visit reported" },
  ];

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
      <fieldset className="amenity-filter">
        <legend>Amenity</legend>
        <AmenityChips amenities={amenities} amenity={amenity} onAmenity={onAmenity} />
      </fieldset>
      <fieldset>
        <legend>Your places</legend>
        <div className="chips">
          <button
            type="button"
            className="chip chip-any"
            aria-pressed={collection === null}
            onClick={() => onCollection(null)}
          >
            Any
          </button>
          {collections.map((item) => (
            <button
              key={item.value}
              type="button"
              className="chip"
              aria-pressed={collection === item.value}
              onClick={() => onCollection(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
