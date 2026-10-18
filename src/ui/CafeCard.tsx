import { Link } from "react-router-dom";
import { displayValue } from "../domain/provenance";
import type { Cafe } from "../domain/types";
import { AMENITY_LABELS, formatDistance, placeLine } from "./labels";

type CafeCardProps = {
  cafe: Cafe;
  selected: boolean;
  distanceMeters?: number | null;
  status?: string | null;
  onSelect: (cafeId: string | null) => void;
};

export function CafeCard({ cafe, selected, distanceMeters = null, status = null, onSelect }: CafeCardProps) {
  const amenities = displayValue(cafe.amenities, "detail");
  const amenityLine =
    amenities && amenities.length > 0
      ? amenities.map((item) => AMENITY_LABELS[item]).join(" · ")
      : null;
  const initial = Array.from(cafe.name)[0]?.toLocaleUpperCase("en") ?? "";

  return (
    <article className={selected ? "cafe-card is-selected" : "cafe-card"} data-cafe-id={cafe.id}>
      <div className="cafe-card-body">
        <span className="cafe-mark" aria-hidden="true">
          {initial}
        </span>
        <div className="cafe-card-copy">
          <h2>
            <Link className="cafe-card-title" to={`/cafes/${cafe.id}`}>
              {cafe.name}
            </Link>
          </h2>
          {distanceMeters !== null ? (
            <p className="cafe-distance">{formatDistance(distanceMeters)} away</p>
          ) : null}
          {status ? <p className="personal-status">{status}</p> : null}
          <p className="meta">{placeLine(cafe)}</p>
          {amenityLine ? <p className="meta amenity-line">{amenityLine}</p> : null}
        </div>
      </div>
      <button
        type="button"
        className="map-action"
        aria-pressed={selected}
        aria-label={selected ? "Selected on map" : "Show on map"}
        onClick={() => onSelect(selected ? null : cafe.id)}
      >
        <span className="map-action-short">{selected ? "Selected" : "Map"}</span>
        <span className="map-action-full">{selected ? "Selected" : "Show on map"}</span>
      </button>
    </article>
  );
}
