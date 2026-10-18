import { Link } from "react-router-dom";
import { EmptyState } from "../ui/EmptyState";
import { formatVisitTime, placeLine } from "../ui/labels";
import { usePersonal } from "../ui/personal-context";
import { useCafeList } from "../ui/useCafeCatalog";

export function VisitsPage() {
  const personal = usePersonal();
  const catalog = useCafeList();

  function cafeName(cafeId: string): string {
    if (catalog.status === "loading") {
      return "Loading cafés.";
    }
    if (catalog.status === "error") {
      return "The café list could not be loaded.";
    }
    return catalog.data.find((cafe) => cafe.id === cafeId)?.name ?? "This café is not in the catalog.";
  }

  function listedCafe(cafeId: string) {
    if (catalog.status !== "ready") {
      return null;
    }
    return catalog.data.find((cafe) => cafe.id === cafeId) ?? null;
  }

  return (
    <article className="detail">
      <h1>Visits</h1>
      <p className="lede">A visit is what you report. It does not store your location.</p>
      {personal.status === "loading" ? <EmptyState>Loading visits.</EmptyState> : null}
      {personal.status === "error" && personal.message ? (
        <EmptyState>{personal.message}</EmptyState>
      ) : null}
      {personal.status === "ready" && personal.visits.length === 0 ? (
        <EmptyState action={<Link className="text-action" to="/">Browse cafés</Link>}>No visits recorded.</EmptyState>
      ) : null}
      {personal.status === "ready" && personal.visits.length > 0 ? (
        <>
          <p>
            <Link className="text-action" to="/?places=visited">Show reported visits on the map</Link>
          </p>
          <ul className="saved-list">
          {personal.visits.map((visit) => {
            const cafe = listedCafe(visit.cafeId);
            const name = cafeName(visit.cafeId);
            return (
            <li key={visit.id}>
              <div>
                <Link to={`/cafes/${visit.cafeId}`}>{name}</Link>
                {cafe ? <p className="meta">{placeLine(cafe)}</p> : null}
                <p className="meta">{formatVisitTime(visit.visitedAt)}</p>
              </div>
              <button
                type="button"
                className="quiet-action"
                aria-label={`Remove the reported visit to ${name}`}
                onClick={() => personal.removeVisit(visit.id)}
              >
                Remove
              </button>
            </li>
            );
          })}
          </ul>
        </>
      ) : null}
    </article>
  );
}
