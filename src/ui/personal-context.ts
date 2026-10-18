import { createContext, useContext } from "react";
import type { BucketItem, Favorite, Visit } from "../domain/types";

export type PersonalData = {
  status: "loading" | "ready" | "error";
  favorites: Favorite[];
  bucket: BucketItem[];
  visits: Visit[];
  message: string | null;
};

export type PersonalContextValue = PersonalData & {
  saveFavorite: (cafeId: string) => void;
  removeFavorite: (cafeId: string) => void;
  saveBucket: (cafeId: string) => void;
  removeBucket: (cafeId: string) => void;
  recordVisit: (cafeId: string, visitedAt: string) => void;
  removeVisit: (visitId: string) => void;
};

export const PersonalContext = createContext<PersonalContextValue | null>(null);

export function usePersonal(): PersonalContextValue {
  const value = useContext(PersonalContext);
  if (!value) {
    throw new Error("PersonalProvider missing");
  }
  return value;
}
