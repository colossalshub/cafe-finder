import { Link } from "react-router-dom";
import { EmptyState } from "../ui/EmptyState";
import { placeLine } from "../ui/labels";
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

  function listedCafe(cafeId: string) {
    if (catalog.status !== "ready") {
      return null;
    }
    return catalog.data.find((cafe) => cafe.id === cafeId) ?? null;
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
            {personal.favorites.length === 0 ? (
              <EmptyState action={<Link className="text-action" to="/">Browse cafés</Link>}>No favorites yet.</EmptyState>
            ) : null}
            {personal.favorites.length > 0 ? (
              <>
              <p>
                <Link className="text-action" to="/?places=saved">Show favorites on the map</Link>
              </p>
              <ul className="saved-list">
                {personal.favorites.map((item) => {
                  const cafe = listedCafe(item.cafeId);
                  return (
                  <li key={item.cafeId}>
                    <div>
                      <Link to={`/cafes/${item.cafeId}`}>{cafeName(item.cafeId)}</Link>
                      {cafe ? <p className="meta">{placeLine(cafe)}</p> : null}
                    </div>
                    <button
                      type="button"
                      className="quiet-action"
                      aria-label={
                        catalog.status === "ready"
                          ? `Remove ${cafeName(item.cafeId)} from favorites`
                          : "Remove from favorites"
                      }
                      onClick={() => personal.removeFavorite(item.cafeId)}
                    >
                      Remove
                    </button>
                  </li>
                  );
                })}
              </ul>
              </>
            ) : null}
          </section>
          <section className="section">
            <h2>Bucket list</h2>
            {personal.bucket.length === 0 ? (
              <EmptyState action={<Link className="text-action" to="/">Browse cafés</Link>}>Nothing on the bucket list.</EmptyState>
            ) : null}
            {personal.bucket.length > 0 ? (
              <>
              <p>
                <Link className="text-action" to="/?places=bucket">Show the bucket list on the map</Link>
              </p>
              <ul className="saved-list">
                {personal.bucket.map((item) => {
                  const cafe = listedCafe(item.cafeId);
                  return (
                  <li key={item.cafeId}>
                    <div>
                      <Link to={`/cafes/${item.cafeId}`}>{cafeName(item.cafeId)}</Link>
                      {cafe ? <p className="meta">{placeLine(cafe)}</p> : null}
                    </div>
                    <button
                      type="button"
                      className="quiet-action"
                      aria-label={
                        catalog.status === "ready"
                          ? `Remove ${cafeName(item.cafeId)} from the bucket list`
                          : "Remove from the bucket list"
                      }
                      onClick={() => personal.removeBucket(item.cafeId)}
                    >
                      Remove
                    </button>
                  </li>
                  );
                })}
              </ul>
              </>
            ) : null}
          </section>
        </>
      ) : null}
    </article>
  );
}
