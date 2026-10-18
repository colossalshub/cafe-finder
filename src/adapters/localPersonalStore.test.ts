import { describe, expect, it } from "vitest";
import { createLocalPersonalStore, PERSONAL_STORAGE_KEY } from "./localPersonalStore";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    },
  };
}

describe("local personal store", () => {
  it("saves and removes favorites and bucket items independently", async () => {
    const storage = memoryStorage();
    const now = new Date("2026-10-18T09:00:00.000Z");
    const store = createLocalPersonalStore(storage, () => now);
    await store.saveFavorite("demo-north-margin");
    await store.saveFavorite("demo-north-margin");
    await store.saveBucket("demo-folded-page");
    expect(await store.listFavorites()).toEqual([
      { cafeId: "demo-north-margin", savedAt: "2026-10-18T09:00:00.000Z" },
    ]);
    expect(await store.listBucket()).toEqual([
      { cafeId: "demo-folded-page", addedAt: "2026-10-18T09:00:00.000Z" },
    ]);
    await store.removeFavorite("demo-north-margin");
    expect(await store.listFavorites()).toEqual([]);
    expect(await store.listBucket()).toHaveLength(1);
    const reopened = createLocalPersonalStore(storage, () => now);
    expect(await reopened.listBucket()).toHaveLength(1);
  });

  it("stores a visit as a café id and times, with no coordinates", async () => {
    const storage = memoryStorage();
    const store = createLocalPersonalStore(
      storage,
      () => new Date("2026-10-18T09:30:00.000Z"),
      () => "visit-1",
    );
    await store.recordVisit("demo-low-table", "2026-10-18T09:30:00.000Z");
    const raw = storage.getItem(PERSONAL_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(raw).not.toMatch(/latitude|longitude|accuracy|path/i);
    const stored = JSON.parse(raw ?? "{}") as { visits: Record<string, unknown>[] };
    expect(Object.keys(stored.visits[0]).sort()).toEqual([
      "cafeId",
      "id",
      "method",
      "recordedAt",
      "visitedAt",
    ]);
    expect(await store.listVisits()).toEqual([
      {
        id: "visit-1",
        cafeId: "demo-low-table",
        visitedAt: "2026-10-18T09:30:00.000Z",
        recordedAt: "2026-10-18T09:30:00.000Z",
        method: "self_reported",
      },
    ]);
    await store.removeVisit("visit-1");
    expect(await store.listVisits()).toEqual([]);
    const after = storage.getItem(PERSONAL_STORAGE_KEY) ?? "";
    expect(after).not.toMatch(/latitude|longitude|accuracy|path/i);
  });

  it("removes one visit and leaves another for the same café", async () => {
    const storage = memoryStorage();
    let next = 0;
    const store = createLocalPersonalStore(
      storage,
      () => new Date("2026-10-18T09:30:00.000Z"),
      () => `visit-${++next}`,
    );
    await store.recordVisit("demo-low-table", "2026-10-18T09:00:00.000Z");
    await store.recordVisit("demo-low-table", "2026-10-18T10:00:00.000Z");
    await store.removeVisit("visit-1");
    expect((await store.listVisits()).map((visit) => visit.id)).toEqual(["visit-2"]);
    expect(await store.listFavorites()).toEqual([]);
  });

  it("returns empty collections after storage is cleared", async () => {
    const storage = memoryStorage();
    const store = createLocalPersonalStore(storage);
    await store.saveFavorite("demo-north-margin");
    await store.recordVisit("demo-north-margin", "2026-10-18T09:00:00.000Z");
    storage.removeItem(PERSONAL_STORAGE_KEY);
    expect(await store.listFavorites()).toEqual([]);
    expect(await store.listBucket()).toEqual([]);
    expect(await store.listVisits()).toEqual([]);
  });
});
