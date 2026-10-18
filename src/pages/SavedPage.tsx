import { Link } from "react-router-dom";
import { EmptyState } from "../ui/EmptyState";
import { usePersonal } from "../ui/personal-context";
import { useCafeList } from "../ui/useCafeCatalog";

export function SavedPage() {
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
      <h1>Saved</h1>
      <p className="lede">Saved on this device only.</p>
      {personal.status === "loading" ? <EmptyState>Loading saved places.</EmptyState> : null}
      {personal.status === "error" && personal.message ? (
        <EmptyState>{personal.message}</EmptyState>
      ) : null}
      {personal.status === "ready" ? (
        <>
          <section className="section">
            <h2>Favorites</h2>
            {personal.favorites.length === 0 ? <p>No favorites yet.</p> : null}
            {personal.favorites.length > 0 ? (
              <ul className="saved-list">
                {personal.favorites.map((item) => (
                  <li key={item.cafeId}>
                    <Link to={`/cafes/${item.cafeId}`}>{cafeName(item.cafeId)}</Link>
                    <button
                      type="button"
                      className="quiet-action"
                      onClick={() => personal.removeFavorite(item.cafeId)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
          <section className="section">
            <h2>Bucket list</h2>
            {personal.bucket.length === 0 ? <p>Nothing on the bucket list.</p> : null}
            {personal.bucket.length > 0 ? (
              <ul className="saved-list">
                {personal.bucket.map((item) => (
                  <li key={item.cafeId}>
                    <Link to={`/cafes/${item.cafeId}`}>{cafeName(item.cafeId)}</Link>
                    <button
                      type="button"
                      className="quiet-action"
                      onClick={() => personal.removeBucket(item.cafeId)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </>
      ) : null}
    </article>
  );
}
