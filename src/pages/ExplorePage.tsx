import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { MapCanvas, type CameraRequest, type MapUser } from "../adapters/MapCanvas";
import { mapStyleUrl } from "../adapters/mapStyle";
import { markerCafes } from "../application/markers";
import { NEARBY_RADIUS_METERS, rankCafes } from "../application/nearby";
import {
  activeFix,
  isCoarse,
  locationActionLabel,
  locationStatusCopy,
} from "../application/locationSession";
import {
  clearSelection,
  makatiViewport,
  moveViewport,
  selectCafe,
  type SelectionState,
} from "../application/selection";
import { searchCafes } from "../application/searchCafes";
import { displayValue } from "../domain/provenance";
import type { Amenity } from "../domain/types";
import { CafeCard } from "../ui/CafeCard";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { useLocationSession } from "../ui/location-context";
import { SearchField } from "../ui/SearchField";
import { useCafeList } from "../ui/useCafeCatalog";

export function ExplorePage() {
  const catalog = useCafeList();
  const styleUrl = mapStyleUrl(import.meta.env.VITE_MAP_STYLE_URL);
  const screenRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [text, setText] = useState("");
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [amenity, setAmenity] = useState<Amenity | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [chromeBlock, setChromeBlock] = useState(0);
  const [sheetBlock, setSheetBlock] = useState(0);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [camera, setCamera] = useState<CameraRequest | null>(null);
  const location = useLocationSession();
  const { setMapActive } = location;
  const [session, setSession] = useState<SelectionState>({
    selectedCafeId: null,
    viewport: makatiViewport,
    locationFix: null,
  });

  const neighborhoods = useMemo(() => {
    if (catalog.status !== "ready") {
      return [];
    }
    return [...new Set(catalog.data.map((cafe) => cafe.neighborhood).filter(Boolean))].sort() as string[];
  }, [catalog]);

  const amenities = useMemo(() => {
    if (catalog.status !== "ready") {
      return [];
    }
    const values = new Set<Amenity>();
    for (const cafe of catalog.data) {
      const listed = displayValue(cafe.amenities, "detail");
      listed?.forEach((item) => values.add(item));
    }
    return [...values];
  }, [catalog]);

  const results = useMemo(() => {
    if (catalog.status !== "ready") {
      return [];
    }
    return searchCafes(catalog.data, { text, neighborhood, amenity });
  }, [catalog, text, neighborhood, amenity]);

  const markers = useMemo(() => markerCafes(results), [results]);
  const fix = activeFix(location.state);
  const ranked = useMemo(
    () =>
      rankCafes(
        results,
        fix ? { latitude: fix.latitude, longitude: fix.longitude } : null,
        NEARBY_RADIUS_METERS,
      ),
    [fix, results],
  );
  const user = useMemo<MapUser | null>(() => {
    if (!fix) {
      return null;
    }
    return {
      latitude: fix.latitude,
      longitude: fix.longitude,
      accuracyMeters: fix.accuracyMeters,
      approximate: isCoarse(fix.accuracyMeters),
    };
  }, [fix]);
  const filterCount = (neighborhood ? 1 : 0) + (amenity ? 1 : 0);
  const canAsk = location.state.status !== "granted" && location.state.status !== "requesting";

  useEffect(() => {
    setMapActive(true);
    return () => setMapActive(false);
  }, [setMapActive]);

  useEffect(() => {
    const screen = screenRef.current;
    const discover = discoverRef.current;
    const sheet = sheetRef.current;
    if (!screen || !discover || !sheet) {
      return;
    }
    const mobileQuery = window.matchMedia("(max-width: 959px)");
    const measure = () => {
      const mobile = mobileQuery.matches;
      const nextChrome = mobile ? Math.round(discover.getBoundingClientRect().height) : 0;
      const nextSheet = mobile ? Math.round(sheet.getBoundingClientRect().height) : 0;
      setChromeBlock((current) => (current === nextChrome ? current : nextChrome));
      setSheetBlock((current) => (current === nextSheet ? current : nextSheet));
    };
    const viewport = window.visualViewport;
    const keyboard = () => {
      const inset =
        viewport && mobileQuery.matches
          ? Math.max(0, Math.round(window.innerHeight - viewport.offsetTop - viewport.height))
          : 0;
      setKeyboardInset((current) => (current === inset ? current : inset));
    };
    const onMode = () => {
      measure();
      keyboard();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(discover);
    observer.observe(sheet);
    mobileQuery.addEventListener("change", onMode);
    viewport?.addEventListener("resize", keyboard);
    viewport?.addEventListener("scroll", keyboard);
    measure();
    keyboard();
    return () => {
      observer.disconnect();
      mobileQuery.removeEventListener("change", onMode);
      viewport?.removeEventListener("resize", keyboard);
      viewport?.removeEventListener("scroll", keyboard);
    };
  }, []);

  useEffect(() => {
    if (!filtersOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      setFiltersOpen(false);
      filterButtonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  useEffect(() => {
    if (!session.selectedCafeId || !sheetRef.current) {
      return;
    }
    sheetRef.current
      .querySelector(`[data-cafe-id="${CSS.escape(session.selectedCafeId)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [session.selectedCafeId]);

  function choose(cafeId: string | null) {
    setSession((current) => (cafeId === null ? clearSelection(current) : selectCafe(current, cafeId)));
    if (cafeId !== null) {
      setSheetMode(false);
    }
  }

  function setSheetMode(expanded: boolean) {
    setSheetExpanded(expanded);
    sheetRef.current?.scrollTo({ top: 0 });
  }

  function recenter() {
    if (!fix) {
      return;
    }
    setSession((current) =>
      moveViewport(current, {
        longitude: fix.longitude,
        latitude: fix.latitude,
        zoom: current.viewport.zoom,
      }),
    );
    setCamera((current) => ({
      token: (current?.token ?? 0) + 1,
      longitude: fix.longitude,
      latitude: fix.latitude,
    }));
  }

  const mapControls = (
    <div className="map-controls">
      <button
        type="button"
        aria-pressed={location.state.status === "granted" || location.state.status === "stale"}
        aria-describedby="location-status"
        disabled={location.state.status === "requesting"}
        onClick={() => {
          if (location.state.status !== "granted") {
            location.optIn();
          }
        }}
      >
        {locationActionLabel(location.state.status)}
      </button>
      <button type="button" onClick={recenter} disabled={fix === null} aria-describedby="location-status">
        Recenter
      </button>
    </div>
  );

  return (
    <div
      className="explore-screen"
      ref={screenRef}
      style={
        {
          "--chrome-block": `${chromeBlock}px`,
          "--sheet-block": `${sheetBlock}px`,
          "--keyboard-inset": `${keyboardInset}px`,
        } as CSSProperties
      }
    >
      <div className="explore-column">
        <div className="discover" ref={discoverRef}>
          <header className="discover-intro">
            <h1>Cafés</h1>
          </header>
          <div className="discover-toolbar">
            <SearchField value={text} onChange={setText} />
            <div className="discover-actions">
              <button
                ref={filterButtonRef}
                type="button"
                className={filterCount > 0 ? "filter-toggle has-filters" : "filter-toggle"}
                aria-expanded={filtersOpen}
                aria-controls="cafe-filters"
                onClick={() => setFiltersOpen((open) => !open)}
              >
                {filterCount > 0 ? `Filters, ${filterCount}` : "Filters"}
              </button>
              <div className="placement" role="group" aria-label="Map and list">
                <button type="button" aria-pressed={!sheetExpanded} onClick={() => setSheetMode(false)}>
                  Map
                </button>
                <button type="button" aria-pressed={sheetExpanded} onClick={() => setSheetMode(true)}>
                  List
                </button>
              </div>
            </div>
          </div>
          <p className="lede">Demonstration records for Makati. Not a directory of real places.</p>
          <div id="cafe-filters" className="filter-panel" hidden={!filtersOpen}>
            {catalog.status === "ready" ? (
              <FilterBar
                neighborhoods={neighborhoods}
                amenities={amenities}
                neighborhood={neighborhood}
                amenity={amenity}
                onNeighborhood={setNeighborhood}
                onAmenity={setAmenity}
              />
            ) : null}
          </div>
        </div>
        <section
          ref={sheetRef}
          className={sheetExpanded ? "sheet is-expanded" : "sheet"}
          aria-label="Café list"
        >
          <div className="sheet-toolbar">
            <button
              type="button"
              className="sheet-grip"
              aria-expanded={sheetExpanded}
              onClick={() => setSheetMode(!sheetExpanded)}
            >
              <span className="sheet-handle" aria-hidden="true" />
              <span className="sr-only">{sheetExpanded ? "Show map" : "Show list"}</span>
            </button>
            {catalog.status === "ready" && catalog.data.length > 0 ? (
              <p className="meta results-count" aria-live="polite">
                {results.length === 1 ? "1 café" : `${results.length} cafés`}
              </p>
            ) : null}
          </div>
          {catalog.status === "loading" ? <EmptyState>Loading cafés.</EmptyState> : null}
          {catalog.status === "error" ? (
            <EmptyState>The café list could not be loaded.</EmptyState>
          ) : null}
          {catalog.status === "ready" && catalog.data.length === 0 ? (
            <EmptyState>No cafés are in the catalog.</EmptyState>
          ) : null}
          {catalog.status === "ready" && catalog.data.length > 0 && results.length === 0 ? (
            <EmptyState>No cafés match these filters.</EmptyState>
          ) : null}
          {catalog.status === "ready" && results.length > 0 ? (
            <div className="card-list">
              {ranked.map((item) => (
                <CafeCard
                  key={item.cafe.id}
                  cafe={item.cafe}
                  selected={session.selectedCafeId === item.cafe.id}
                  distanceMeters={item.distanceMeters}
                  onSelect={choose}
                />
              ))}
            </div>
          ) : null}
          <div className="location-row">
            <p id="location-status" className="meta location-note" aria-live="polite">
              {locationStatusCopy(location.state)}
            </p>
            {canAsk ? (
              <button type="button" className="location-list-action" onClick={location.optIn}>
                {locationActionLabel(location.state.status)}
              </button>
            ) : null}
          </div>
        </section>
      </div>
      {styleUrl ? (
        <MapCanvas
          styleUrl={styleUrl}
          markers={markers}
          selectedCafeId={session.selectedCafeId}
          viewport={session.viewport}
          user={user}
          camera={camera}
          onSelect={choose}
          onViewport={(viewport) => setSession((current) => moveViewport(current, viewport))}
        >
          {mapControls}
        </MapCanvas>
      ) : (
        <div className="map-panel">
          <div className="map-pending" role="status">
            <p className="section-label">Map</p>
            <p>The map style is not configured.</p>
          </div>
          {mapControls}
        </div>
      )}
    </div>
  );
}
