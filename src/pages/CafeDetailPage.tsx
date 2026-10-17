import { Link, useParams } from "react-router-dom";
import { canShowSourced, displayValue } from "../domain/provenance";
import { openStatus } from "../domain/openStatus";
import { DetailSection } from "../ui/DetailSection";
import { EmptyState } from "../ui/EmptyState";
import { AMENITY_LABELS, dayLabel, formatPhp, formatRetrieved } from "../ui/labels";
import { VerificationNote } from "../ui/VerificationNote";
import { useCafe } from "../ui/useCafeCatalog";

export function CafeDetailPage() {
  const { id } = useParams();
  const catalog = useCafe(id);
  const cafe = catalog.status === "ready" ? catalog.data : null;
  const address = cafe ? displayValue(cafe.address, "detail") : null;
  const hours = cafe ? displayValue(cafe.hours, "detail") : null;
  const amenities = cafe ? displayValue(cafe.amenities, "detail") : null;
  const priceRange = cafe ? displayValue(cafe.priceRange, "detail") : null;
  const location = cafe ? displayValue(cafe.location, "identity") : null;
  const menu = cafe
    ? cafe.menu.filter((item) => canShowSourced(item.verification, "detail"))
    : [];
  const photos = cafe
    ? cafe.photos.filter(
        (photo) =>
          canShowSourced(photo.verification, "detail") &&
          photo.attribution.length > 0 &&
          photo.license.length > 0,
      )
    : [];
  const status = cafe ? openStatus(cafe.hours, new Date()) : null;
  const source = cafe?.sources[0];

  return (
    <article className="detail">
      <p className="back">
        <Link to="/">Back to cafés</Link>
      </p>
      {catalog.status === "loading" ? <EmptyState>Loading cafés.</EmptyState> : null}
      {catalog.status === "error" ? (
        <EmptyState>The café list could not be loaded.</EmptyState>
      ) : null}
      {catalog.status === "ready" && !cafe ? (
        <EmptyState>This café is not in the catalog.</EmptyState>
      ) : null}
      {cafe ? (
        <>
          <h1>{cafe.name}</h1>
          <VerificationNote verification={cafe.verification} />
          <DetailSection title="Address" empty={!address}>
            {address ? (
              <p>
                {address.lines.join(", ")}
                <br />
                {address.city}
              </p>
            ) : null}
          </DetailSection>
          <DetailSection title="Hours" empty={!hours}>
            {hours ? (
              <>
                <ul className="hours">
                  {hours.periods.map((period) => (
                    <li key={period.day}>
                      <span>{dayLabel(period.day)}</span>
                      <span>
                        {period.opens}–{period.closes}
                      </span>
                    </li>
                  ))}
                </ul>
                {status ? (
                  <p>{status === "open" ? "Open" : "Closed"}.</p>
                ) : (
                  <p>Demonstration hours. Not a verified schedule.</p>
                )}
              </>
            ) : null}
          </DetailSection>
          <DetailSection title="Amenities" empty={!amenities || amenities.length === 0}>
            {amenities && amenities.length > 0 ? (
              <ul className="plain-list">
                {amenities.map((amenity) => (
                  <li key={amenity}>{AMENITY_LABELS[amenity]}</li>
                ))}
              </ul>
            ) : null}
          </DetailSection>
          <DetailSection title="Price" empty={!priceRange}>
            {priceRange ? <p>{priceRange} of 4. Demonstration only.</p> : null}
          </DetailSection>
          <DetailSection title="Menu" empty={menu.length === 0}>
            {menu.length > 0 ? (
              <ul className="menu">
                {menu.map((item) => (
                  <li key={item.id}>
                    <span>{item.name}</span>
                    <span>{item.price ? formatPhp(item.price.amount) : "Price not listed."}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </DetailSection>
          <DetailSection title="Photos" empty={photos.length === 0} />
          <DetailSection title="Location" empty={!location}>
            {location ? (
              <p>
                {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}.
                Demonstration coordinates.
              </p>
            ) : null}
          </DetailSection>
          <section className="section actions">
            <h2>Personal</h2>
            <div className="action-row">
              <button type="button" className="action" disabled>
                Save
              </button>
              <button type="button" className="action" disabled>
                Add to bucket list
              </button>
              <button type="button" className="action" disabled>
                Record a visit
              </button>
            </div>
            <p className="meta">Not yet implemented.</p>
          </section>
          {source ? (
            <p className="meta source-line">
              Source: {source.title}. Retrieved {formatRetrieved(source.retrievedAt)}.{" "}
              {source.license}
            </p>
          ) : null}
        </>
      ) : null}
    </article>
  );
}
