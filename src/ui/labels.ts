import type { Amenity } from "../domain/types";

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
