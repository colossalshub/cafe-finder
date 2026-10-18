import type { LocationFix } from "../domain/types";

export class LocationRequestError extends Error {
  readonly kind: "denied" | "unavailable";

  constructor(kind: "denied" | "unavailable") {
    super(kind);
    this.name = "LocationRequestError";
    this.kind = kind;
  }
}

export type GeolocationPort = {
  requestOnce(): Promise<LocationFix>;
  watch(onFix: (fix: LocationFix) => void): () => void;
};
