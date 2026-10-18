import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { activeFix, isCoarse } from "../application/locationSession";
import { personalStatusForCafe } from "../application/personalStatus";
import { distanceMeters } from "../domain/distance";
import { canShowSourced, displayValue } from "../domain/provenance";
import { openStatus } from "../domain/openStatus";
import { DetailSection } from "../ui/DetailSection";
import { EmptyState } from "../ui/EmptyState";
import { AMENITY_LABELS, dayLabel, formatDistance, formatPhp, formatRetrieved, formatVisitTime } from "../ui/labels";
import { useLocationSession } from "../ui/location-context";
import { usePersonal } from "../ui/personal-context";
import { VerificationNote } from "../ui/VerificationNote";
import { useCafe } from "../ui/useCafeCatalog";

export function CafeDetailPage() {
  const { id } = useParams();
  const catalog = useCafe(id);
  const personal = usePersonal();
  const locationSession = useLocationSession();
  const [visitNote, setVisitNote] = useState<{ cafeId: string; text: string } | null>(null);
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
  const fix = activeFix(locationSession.state);
  const meters = fix && location ? distanceMeters(fix, location) : null;
  const approximate = fix ? isCoarse(fix.accuracyMeters) : false;
  const placeMeta = [
    cafe ? (cafe.neighborhood ?? "Neighborhood not listed") : null,
    meters === null
      ? null
      : approximate
        ? `About ${formatDistance(meters)} away`
        : `${formatDistance(meters)} away`,
  ]
    .filter((part): part is string => part !== null)
    .join(" · ");
  const gaps = [
    cafe && !address ? "Address" : null,
    cafe && !hours ? "Hours" : null,
    cafe && (!amenities || amenities.length === 0) ? "Amenities" : null,
    cafe && !priceRange ? "Price" : null,
    cafe && menu.length === 0 ? "Menu" : null,
    cafe && photos.length === 0 ? "Photos" : null,
    cafe && !location ? "Location" : null,
  ].filter((item): item is string => item !== null);
  const saved = cafe ? personal.favorites.some((item) => item.cafeId === cafe.id) : false;
  const onBucket = cafe ? personal.bucket.some((item) => item.cafeId === cafe.id) : false;
  const personalReady = personal.status === "ready";
  const visibleVisitNote = visitNote && visitNote.cafeId === id ? visitNote.text : null;
  const statusLine = cafe && personalReady ? personalStatusForCafe(cafe.id, personal) : null;
  const reportedVisits = cafe && personalReady ? personal.visits.filter((visit) => visit.cafeId === cafe.id) : [];

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
          <header className="detail-header">
            <h1>{cafe.name}</h1>
            {placeMeta ? <p className="meta">{placeMeta}</p> : null}
            {statusLine ? <p className="personal-status">{statusLine}</p> : null}
            <VerificationNote verification={cafe.verification} />
          </header>
          <section className="section actions">
            <h2>Personal</h2>
            <div className="action-row">
              <button
                type="button"
                className="action"
                aria-pressed={saved}
                disabled={!personalReady}
                onClick={() => {
                  if (!cafe) {
                    return;
                  }
                  if (saved) {
                    personal.removeFavorite(cafe.id);
                  } else {
                    personal.saveFavorite(cafe.id);
                  }
                }}
              >
                {saved ? "Saved" : "Save"}
              </button>
              <button
                type="button"
                className="action"
                aria-pressed={onBucket}
                disabled={!personalReady}
                onClick={() => {
                  if (!cafe) {
                    return;
                  }
                  if (onBucket) {
                    personal.removeBucket(cafe.id);
                  } else {
                    personal.saveBucket(cafe.id);
                  }
                }}
              >
                {onBucket ? "Remove from bucket list" : "Add to bucket list"}
              </button>
              <button
                type="button"
                className="action"
                disabled={!personalReady}
                onClick={() => {
                  if (!cafe) {
                    return;
                  }
                  personal.recordVisit(cafe.id, new Date().toISOString());
                  setVisitNote({ cafeId: cafe.id, text: "Visit recorded." });
                }}
              >
                Record a visit
              </button>
            </div>
            <p className="meta">Saved on this device only.</p>
            {reportedVisits.length > 0 ? (
              <>
                <p className="meta">
                  {reportedVisits.length === 1
                    ? "You reported a visit."
                    : `You reported ${reportedVisits.length} visits.`}
                </p>
                <ul className="plain-list">
                  {reportedVisits.map((visit) => (
                    <li key={visit.id}>{formatVisitTime(visit.visitedAt)}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {visibleVisitNote ? <p className="meta">{visibleVisitNote}</p> : null}
            {personal.message ? <p className="meta">{personal.message}</p> : null}
          </section>
          {address ? (
            <DetailSection title="Address">
              <p>
                {address.lines.join(", ")}
                <br />
                {address.city}
              </p>
            </DetailSection>
          ) : null}
          {hours ? (
            <DetailSection title="Hours">
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
            </DetailSection>
          ) : null}
          {amenities && amenities.length > 0 ? (
            <DetailSection title="Amenities">
              <ul className="plain-list">
                {amenities.map((amenity) => (
                  <li key={amenity}>{AMENITY_LABELS[amenity]}</li>
                ))}
              </ul>
            </DetailSection>
          ) : null}
          {priceRange ? (
            <DetailSection title="Price">
              <p>{priceRange} of 4. Demonstration only.</p>
            </DetailSection>
          ) : null}
          {menu.length > 0 ? (
            <DetailSection title="Menu">
              <ul className="menu">
                {menu.map((item) => (
                  <li key={item.id}>
                    <span>{item.name}</span>
                    <span>{item.price ? formatPhp(item.price.amount) : "Price not listed."}</span>
                  </li>
                ))}
              </ul>
            </DetailSection>
          ) : null}
          {photos.length > 0 ? (
            <DetailSection title="Photos">
              <ul className="photo-list">
                {photos.map((photo) => (
                  <li key={photo.id}>
                    <figure>
                      <img src={photo.url} alt={photo.alt} />
                      <figcaption className="meta">
                        {photo.attribution}. {photo.license}.
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </DetailSection>
          ) : null}
          {location ? (
            <DetailSection title="Location">
              <p>
                {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}. Demonstration coordinates.
                {meters !== null ? (
                  <>
                    {" "}
                    {approximate
                      ? `About ${formatDistance(meters)} from your location.`
                      : `${formatDistance(meters)} from your location.`}
                  </>
                ) : null}
              </p>
            </DetailSection>
          ) : null}
          {gaps.length > 0 ? <p className="meta not-listed-summary">Not listed: {gaps.join(", ")}.</p> : null}
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
