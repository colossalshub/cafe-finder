import { createContext, useContext } from "react";
import type { LocationSessionState } from "../application/locationSession";

export type LocationContextValue = {
  state: LocationSessionState;
  optIn: () => void;
  setMapActive: (active: boolean) => void;
};

export const LocationContext = createContext<LocationContextValue | null>(null);

export function useLocationSession(): LocationContextValue {
  const value = useContext(LocationContext);
  if (!value) {
    throw new Error("LocationProvider missing");
  }
  return value;
}
