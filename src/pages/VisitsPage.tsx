import { Link } from "react-router-dom";
import { EmptyState } from "../ui/EmptyState";
import { formatVisitTime } from "../ui/labels";
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

  return (
    <article className="detail">
      <h1>Visits</h1>
      <p className="lede">A visit is what you report. It does not store your location.</p>
      {personal.status === "loading" ? <EmptyState>Loading visits.</EmptyState> : null}
      {personal.status === "error" && personal.message ? (
        <EmptyState>{personal.message}</EmptyState>
      ) : null}
      {personal.status === "ready" && personal.visits.length === 0 ? (
        <p>No visits recorded.</p>
      ) : null}
      {personal.status === "ready" && personal.visits.length > 0 ? (
        <ul className="saved-list">
          {personal.visits.map((visit) => (
            <li key={visit.id}>
              <div>
                <Link to={`/cafes/${visit.cafeId}`}>{cafeName(visit.cafeId)}</Link>
                <p className="meta">{formatVisitTime(visit.visitedAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
