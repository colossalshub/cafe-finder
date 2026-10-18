import type { BucketItem, Favorite, Visit } from "../domain/types";
import type { PersonalStore } from "../ports/personalStore";

export const PERSONAL_STORAGE_KEY = "cafe-finder-prototype.personal";

type StoredPersonal = {
  favorites: Favorite[];
  bucket: BucketItem[];
  visits: Visit[];
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function emptyStore(): StoredPersonal {
  return { favorites: [], bucket: [], visits: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readList<T>(value: unknown, parse: (item: unknown) => T | null): T[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    const parsed = parse(item);
    return parsed ? [parsed] : [];
  });
}

function parseFavorite(item: unknown): Favorite | null {
  if (!isRecord(item) || typeof item.cafeId !== "string" || item.cafeId.length === 0) {
    return null;
  }
  if (typeof item.savedAt !== "string") {
    return null;
  }
  return { cafeId: item.cafeId, savedAt: item.savedAt };
}

function parseBucket(item: unknown): BucketItem | null {
  if (!isRecord(item) || typeof item.cafeId !== "string" || item.cafeId.length === 0) {
    return null;
  }
  if (typeof item.addedAt !== "string") {
    return null;
  }
  return { cafeId: item.cafeId, addedAt: item.addedAt };
}

function parseVisit(item: unknown): Visit | null {
  if (!isRecord(item)) {
    return null;
  }
  if (typeof item.id !== "string" || typeof item.cafeId !== "string" || item.cafeId.length === 0) {
    return null;
  }
  if (typeof item.visitedAt !== "string" || typeof item.recordedAt !== "string") {
    return null;
  }
  if (item.method !== "self_reported") {
    return null;
  }
  return {
    id: item.id,
    cafeId: item.cafeId,
    visitedAt: item.visitedAt,
    recordedAt: item.recordedAt,
    method: "self_reported",
  };
}

function read(storage: StorageLike): StoredPersonal {
  const raw = storage.getItem(PERSONAL_STORAGE_KEY);
  if (!raw) {
    return emptyStore();
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return emptyStore();
    }
    return {
      favorites: readList(parsed.favorites, parseFavorite),
      bucket: readList(parsed.bucket, parseBucket),
      visits: readList(parsed.visits, parseVisit),
    };
  } catch {
    return emptyStore();
  }
}

function write(storage: StorageLike, data: StoredPersonal) {
  storage.setItem(PERSONAL_STORAGE_KEY, JSON.stringify(data));
}

export function createLocalPersonalStore(
  storage: StorageLike,
  now: () => Date = () => new Date(),
  createId: () => string = () => crypto.randomUUID(),
): PersonalStore {
  return {
    async listFavorites() {
      return read(storage).favorites;
    },
    async listBucket() {
      return read(storage).bucket;
    },
    async listVisits() {
      return read(storage).visits;
    },
    async saveFavorite(cafeId) {
      if (!cafeId) {
        return;
      }
      const data = read(storage);
      if (data.favorites.some((item) => item.cafeId === cafeId)) {
        return;
      }
      data.favorites.unshift({ cafeId, savedAt: now().toISOString() });
      write(storage, data);
    },
    async removeFavorite(cafeId) {
      const data = read(storage);
      data.favorites = data.favorites.filter((item) => item.cafeId !== cafeId);
      write(storage, data);
    },
    async saveBucket(cafeId) {
      if (!cafeId) {
        return;
      }
      const data = read(storage);
      if (data.bucket.some((item) => item.cafeId === cafeId)) {
        return;
      }
      data.bucket.unshift({ cafeId, addedAt: now().toISOString() });
      write(storage, data);
    },
    async removeBucket(cafeId) {
      const data = read(storage);
      data.bucket = data.bucket.filter((item) => item.cafeId !== cafeId);
      write(storage, data);
    },
    async recordVisit(cafeId, visitedAt) {
      if (!cafeId) {
        return;
      }
      const data = read(storage);
      data.visits.unshift({
        id: createId(),
        cafeId,
        visitedAt,
        recordedAt: now().toISOString(),
        method: "self_reported",
      });
      write(storage, data);
    },
    async removeVisit(visitId) {
      if (!visitId) {
        return;
      }
      const data = read(storage);
      data.visits = data.visits.filter((visit) => visit.id !== visitId);
      write(storage, data);
    },
  };
}
