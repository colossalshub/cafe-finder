import { isOpenAt } from "./hours";
import type { WeeklyHours, Sourced } from "./types";

export function openStatus(
  hours: Sourced<WeeklyHours> | null,
  now: Date,
): "open" | "closed" | null {
  if (!hours || hours.verification !== "verified") {
    return null;
  }
  return isOpenAt(hours.value, now) ? "open" : "closed";
}
