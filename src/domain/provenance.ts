import type { Sourced, Verification } from "./types";

export type FactRole = "identity" | "detail";

export function canShowSourced(
  verification: Verification,
  role: FactRole,
): boolean {
  if (verification === "fixture" || verification === "verified") {
    return true;
  }
  return verification === "community" && role === "identity";
}

export function displayValue<T>(
  sourced: Sourced<T> | null,
  role: FactRole,
): T | null {
  if (!sourced || !canShowSourced(sourced.verification, role)) {
    return null;
  }
  return sourced.value;
}
