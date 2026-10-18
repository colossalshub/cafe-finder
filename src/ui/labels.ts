import type { Amenity, Verification } from "../domain/types";

export const AMENITY_LABELS: Record<Amenity, string> = {
  wifi: "Wi-Fi",
  power_outlets: "Power outlets",
  outdoor_seating: "Outdoor seating",
  air_conditioning: "Air conditioning",
  work_friendly: "Work-friendly",
  food: "Food",
  decaf: "Decaf",
};

const php = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export function formatPhp(amount: number): string {
  return php.format(amount);
}

export function placeLine(cafe: { neighborhood: string | null; verification: Verification }): string {
  return [cafe.neighborhood ?? "Neighborhood not listed", cafe.verification === "fixture" ? "Fixture" : null]
    .filter((part): part is string => part !== null)
    .join(" · ");
}

const DAY_LABELS = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
} as const;

export function dayLabel(day: keyof typeof DAY_LABELS): string {
  return DAY_LABELS[day];
}

export function formatRetrieved(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) {
    return "";
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const kilometers = meters / 1000;
  return `${kilometers.toFixed(kilometers >= 10 ? 0 : 1)} km`;
}

export function formatVisitTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}
