import { useEffect, useRef, useState } from "react";
import { AttributionControl, Map, Marker, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import type { CafeMarker } from "../application/markers";
import type { Viewport } from "../application/selection";

setWorkerUrl(workerUrl);

type MapCanvasProps = {
  styleUrl: string;
  markers: CafeMarker[];
  selectedCafeId: string | null;
  viewport: Viewport;
  onSelect: (cafeId: string) => void;
  onViewport: (viewport: Viewport) => void;
};

export function MapCanvas({
  styleUrl,
  markers,
  selectedCafeId,
  viewport,
  onSelect,
  onViewport,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const viewportRef = useRef(viewport);
  const onSelectRef = useRef(onSelect);
  const onViewportRef = useRef(onViewport);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onViewportRef.current = onViewport;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const initial = viewportRef.current;
    const map = new Map({
      container,
      style: styleUrl,
      center: [initial.longitude, initial.latitude],
      zoom: initial.zoom,
      attributionControl: false,
      fadeDuration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300,
    });
    map.addControl(new AttributionControl({ compact: false }), "top-right");
    mapRef.current = map;
    let appliedTop = Number.NaN;
    let appliedBottom = Number.NaN;
    const readVar = (name: string) => {
      const parsed = panelRef.current
        ? Number.parseFloat(getComputedStyle(panelRef.current).getPropertyValue(name))
        : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const fit = () => {
      const chrome = readVar("--chrome-block");
      const sheet = readVar("--sheet-block");
      const keyboard = readVar("--keyboard-inset");
      const top = chrome > 0 ? chrome + 8 : 12;
      const bottom = sheet > 0 ? sheet + keyboard + 36 : 12;
      map.resize();
      if (top === appliedTop && bottom === appliedBottom) {
        return;
      }
      appliedTop = top;
      appliedBottom = bottom;
      map.setPadding({ top, right: 12, bottom, left: 12 });
    };
    map.on("load", fit);
    const observer = new ResizeObserver(() => {
      fit();
    });
    if (panelRef.current) {
      observer.observe(panelRef.current);
    }
    const screen = panelRef.current?.parentElement;
    const styleObserver = new MutationObserver(() => {
      fit();
    });
    if (screen) {
      styleObserver.observe(screen, { attributes: true, attributeFilter: ["style"] });
    }
    map.on("error", () => {
      if (!map.isStyleLoaded()) {
        setFailed(true);
      }
    });
    map.on("moveend", () => {
      const center = map.getCenter();
      onViewportRef.current({
        longitude: center.lng,
        latitude: center.lat,
        zoom: map.getZoom(),
      });
    });
    return () => {
      observer.disconnect();
      styleObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [styleUrl]);

  const markerHandles = useRef<Marker[]>([]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const sync = () => {
      markerHandles.current.forEach((marker) => marker.remove());
      markerHandles.current = markers.map((cafe) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "cafe-marker";
        button.setAttribute("aria-label", cafe.name);
        button.setAttribute("aria-pressed", cafe.id === selectedCafeId ? "true" : "false");
        const dot = document.createElement("span");
        button.append(dot);
        button.addEventListener("click", () => onSelectRef.current(cafe.id));
        return new Marker({ element: button, anchor: "center" })
          .setLngLat([cafe.longitude, cafe.latitude])
          .addTo(map);
      });
    };
    if (map.loaded()) {
      sync();
    } else {
      map.once("load", sync);
    }
    return () => {
      map.off("load", sync);
      markerHandles.current.forEach((marker) => marker.remove());
      markerHandles.current = [];
    };
  }, [markers, selectedCafeId, styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCafeId) {
      return;
    }
    const selected = markers.find((marker) => marker.id === selectedCafeId);
    if (!selected) {
      return;
    }
    const center: [number, number] = [selected.longitude, selected.latitude];
    const move = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        map.jumpTo({ center });
      } else {
        map.easeTo({ center, duration: 200 });
      }
    };
    if (map.loaded()) {
      move();
    } else {
      map.once("load", move);
    }
    return () => {
      map.off("load", move);
    };
  }, [markers, selectedCafeId]);

  return (
    <div className="map-panel" ref={panelRef}>
      <div className="map-frame" role="application" aria-label="Café map" tabIndex={0}>
        <div ref={containerRef} className="map-canvas" />
      </div>
      {failed ? (
        <p className="map-status" role="status">
          The map style could not be loaded.
        </p>
      ) : null}
    </div>
  );
}
