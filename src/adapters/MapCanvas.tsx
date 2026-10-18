import { useEffect, useRef, useState, type ReactNode } from "react";
import { AttributionControl, GeoJSONSource, Map, Marker, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import type { CafeMarker } from "../application/markers";
import type { Viewport } from "../application/selection";
import { accuracyRing } from "../domain/distance";

setWorkerUrl(workerUrl);

export type MapUser = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  approximate: boolean;
};

export type CameraRequest = {
  token: number;
  longitude: number;
  latitude: number;
};

type MapCanvasProps = {
  styleUrl: string;
  markers: CafeMarker[];
  selectedCafeId: string | null;
  viewport: Viewport;
  user: MapUser | null;
  camera: CameraRequest | null;
  onSelect: (cafeId: string) => void;
  onViewport: (viewport: Viewport) => void;
  children?: ReactNode;
};

function whenStyleReady(map: Map, sync: () => void) {
  if (map.isStyleLoaded()) {
    sync();
    return;
  }
  map.once("load", sync);
}

function accuracyData(user: MapUser | null) {
  if (!user?.approximate || user.accuracyMeters <= 0) {
    return { type: "FeatureCollection" as const, features: [] };
  }
  const ring = accuracyRing(
    { latitude: user.latitude, longitude: user.longitude },
    user.accuracyMeters,
  );
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "Polygon" as const,
          coordinates: [ring.map((point) => [point.longitude, point.latitude])],
        },
      },
    ],
  };
}

export function MapCanvas({
  styleUrl,
  markers,
  selectedCafeId,
  viewport,
  user,
  camera,
  onSelect,
  onViewport,
  children,
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
    whenStyleReady(map, sync);
    return () => {
      map.off("load", sync);
      markerHandles.current.forEach((marker) => marker.remove());
      markerHandles.current = [];
    };
  }, [markers, selectedCafeId, styleUrl]);

  const userHandle = useRef<Marker | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const sync = () => {
      userHandle.current?.remove();
      userHandle.current = null;
      if (!user) {
        return;
      }
      const mark = document.createElement("div");
      mark.className = user.approximate ? "user-marker is-approximate" : "user-marker";
      mark.setAttribute("role", "img");
      mark.setAttribute("aria-label", user.approximate ? "Your approximate location" : "Your location");
      const dot = document.createElement("span");
      mark.append(dot);
      userHandle.current = new Marker({ element: mark, anchor: "center" })
        .setLngLat([user.longitude, user.latitude])
        .addTo(map);
    };
    whenStyleReady(map, sync);
    return () => {
      map.off("load", sync);
      userHandle.current?.remove();
      userHandle.current = null;
    };
  }, [styleUrl, user]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const data = accuracyData(user);
    const apply = () => {
      const existing = map.getSource("user-accuracy");
      if (existing instanceof GeoJSONSource) {
        existing.setData(data);
        return;
      }
      const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
      map.addSource("user-accuracy", { type: "geojson", data });
      map.addLayer({
        id: "user-accuracy-fill",
        type: "fill",
        source: "user-accuracy",
        paint: {
          "fill-color": ink || "#1c1917",
          "fill-opacity": 0.12,
        },
      });
      map.addLayer({
        id: "user-accuracy-line",
        type: "line",
        source: "user-accuracy",
        paint: {
          "line-color": ink || "#1c1917",
          "line-width": 1.5,
        },
      });
    };
    whenStyleReady(map, apply);
    return () => {
      map.off("load", apply);
    };
  }, [styleUrl, user]);

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
    whenStyleReady(map, move);
    return () => {
      map.off("load", move);
    };
  }, [markers, selectedCafeId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !camera || camera.token === 0) {
      return;
    }
    const center: [number, number] = [camera.longitude, camera.latitude];
    const move = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        map.jumpTo({ center });
      } else {
        map.easeTo({ center, duration: 200 });
      }
    };
    whenStyleReady(map, move);
    return () => {
      map.off("load", move);
    };
  }, [camera]);

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
      {children}
    </div>
  );
}
