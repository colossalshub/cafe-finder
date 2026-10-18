import type { BucketItem, Favorite, Visit } from "../domain/types";

export type PersonalStore = {
  listFavorites(): Promise<Favorite[]>;
  listBucket(): Promise<BucketItem[]>;
  listVisits(): Promise<Visit[]>;
  saveFavorite(cafeId: string): Promise<void>;
  removeFavorite(cafeId: string): Promise<void>;
  saveBucket(cafeId: string): Promise<void>;
  removeBucket(cafeId: string): Promise<void>;
  recordVisit(cafeId: string, visitedAt: string): Promise<void>;
};
