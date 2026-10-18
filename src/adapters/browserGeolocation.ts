import type { LocationFix } from "../domain/types";
import { LocationRequestError, type GeolocationPort } from "../ports/geolocation";

const options: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 0,
};

function toFix(position: GeolocationPosition): LocationFix | null {
  const { latitude, longitude, accuracy } = position.coords;
  const at = new Date(position.timestamp);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(accuracy) ||
    Number.isNaN(at.getTime())
  ) {
    return null;
  }
  return {
    latitude,
    longitude,
    accuracyMeters: accuracy,
    at: at.toISOString(),
  };
}

function failureKind(error: GeolocationPositionError): "denied" | "unavailable" {
  return error.code === 1 ? "denied" : "unavailable";
}

export function browserGeolocation(): GeolocationPort {
  return {
    requestOnce() {
      const geolocation = navigator.geolocation;
      if (!geolocation) {
        return Promise.reject(new LocationRequestError("unavailable"));
      }
      return new Promise((resolve, reject) => {
        geolocation.getCurrentPosition(
          (position) => {
            const fix = toFix(position);
            if (!fix) {
              reject(new LocationRequestError("unavailable"));
              return;
            }
            resolve(fix);
          },
          (error) => {
            reject(new LocationRequestError(failureKind(error)));
          },
          options,
        );
      });
    },
    watch(onFix) {
      const geolocation = navigator.geolocation;
      if (!geolocation) {
        return () => {};
      }
      const id = geolocation.watchPosition(
        (position) => {
          const fix = toFix(position);
          if (fix) {
            onFix(fix);
          }
        },
        () => {},
        options,
      );
      return () => {
        geolocation.clearWatch(id);
      };
    },
  };
}
