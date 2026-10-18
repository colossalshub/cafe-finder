import { Link } from "react-router-dom";
import { displayValue } from "../domain/provenance";
import type { Cafe } from "../domain/types";
import { AMENITY_LABELS, formatDistance } from "./labels";

type CafeCardProps = {
  cafe: Cafe;
  selected: boolean;
  distanceMeters?: number | null;
  onSelect: (cafeId: string | null) => void;
};

export function CafeCard({ cafe, selected, distanceMeters = null, onSelect }: CafeCardProps) {
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
          {cafe.verification === "fixture" ? <p className="section-label">Fixture</p> : null}
          <h2>
            <Link className="cafe-card-title" to={`/cafes/${cafe.id}`}>
              {cafe.name}
            </Link>
          </h2>
          <p className="meta">{cafe.neighborhood ?? "Neighborhood not listed"}</p>
          {distanceMeters !== null ? <p className="meta">{formatDistance(distanceMeters)} away</p> : null}
          {amenityLine ? <p className="meta">{amenityLine}</p> : null}
        </div>
      </div>
      <button
        type="button"
        className="map-action"
        aria-pressed={selected}
        onClick={() => onSelect(selected ? null : cafe.id)}
      >
        {selected ? "Selected" : "Show on map"}
      </button>
    </article>
  );
}
