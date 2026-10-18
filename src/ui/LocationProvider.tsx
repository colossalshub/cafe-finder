import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { browserGeolocation } from "../adapters/browserGeolocation";
import {
  LOCATION_STALE_AFTER_MS,
  createLocationSession,
  type LocationSession,
  type LocationSessionState,
} from "../application/locationSession";
import { LocationContext } from "./location-context";

const geolocationPort = browserGeolocation();

const idleState: LocationSessionState = { status: "idle", fix: null };

export function LocationProvider({ children }: { children: ReactNode }) {
  const sessionRef = useRef<LocationSession | null>(null);
  const mapActiveRef = useRef(false);
  const [state, setState] = useState<LocationSessionState>(idleState);

  useEffect(() => {
    const session = createLocationSession(geolocationPort);
    sessionRef.current = session;
    session.setMapActive(mapActiveRef.current);
    session.setPageVisible(document.visibilityState !== "hidden");
    const unsubscribe = session.subscribe(() => {
      setState(session.getState());
    });
    const onVisibility = () => {
      session.setPageVisible(document.visibilityState !== "hidden");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      unsubscribe();
      session.stop();
      sessionRef.current = null;
    };
  }, []);

  useEffect(() => {
    const session = sessionRef.current;
    if (!session || state.status !== "granted" || !state.fix) {
      return;
    }
    const age = Date.now() - Date.parse(state.fix.at);
    const wait = Math.max(0, LOCATION_STALE_AFTER_MS - age);
    const timer = window.setTimeout(() => {
      session.evaluate();
    }, wait);
    return () => {
      window.clearTimeout(timer);
    };
  }, [state.fix, state.status]);

  const optIn = useCallback(() => {
    void sessionRef.current?.optIn();
  }, []);

  const setMapActive = useCallback((active: boolean) => {
    mapActiveRef.current = active;
    sessionRef.current?.setMapActive(active);
  }, []);

  const value = useMemo(
    () => ({ state, optIn, setMapActive }),
    [optIn, setMapActive, state],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
