import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createLocalPersonalStore } from "../adapters/localPersonalStore";
import type { PersonalStore } from "../ports/personalStore";
import { PersonalContext, type PersonalData } from "./personal-context";

function createStore(): PersonalStore | null {
  try {
    return createLocalPersonalStore(window.localStorage);
  } catch {
    return null;
  }
}

const loadingData: PersonalData = {
  status: "loading",
  favorites: [],
  bucket: [],
  visits: [],
  message: null,
};

export function PersonalProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<PersonalStore | null>(null);
  const [data, setData] = useState<PersonalData>(loadingData);

  const refresh = useCallback(async () => {
    const store = storeRef.current;
    if (!store) {
      setData({
        status: "error",
        favorites: [],
        bucket: [],
        visits: [],
        message: "Saved places are unavailable on this device.",
      });
      return;
    }
    try {
      const [favorites, bucket, visits] = await Promise.all([
        store.listFavorites(),
        store.listBucket(),
        store.listVisits(),
      ]);
      setData({ status: "ready", favorites, bucket, visits, message: null });
    } catch {
      setData({
        status: "error",
        favorites: [],
        bucket: [],
        visits: [],
        message: "Saved places could not be read.",
      });
    }
  }, []);

  useEffect(() => {
    let active = true;
    storeRef.current = createStore();
    void (async () => {
      await Promise.resolve();
      if (!active) {
        return;
      }
      const store = storeRef.current;
      if (!store) {
        setData({
          status: "error",
          favorites: [],
          bucket: [],
          visits: [],
          message: "Saved places are unavailable on this device.",
        });
        return;
      }
      try {
        const [favorites, bucket, visits] = await Promise.all([
          store.listFavorites(),
          store.listBucket(),
          store.listVisits(),
        ]);
        if (active) {
          setData({ status: "ready", favorites, bucket, visits, message: null });
        }
      } catch {
        if (active) {
          setData({
            status: "error",
            favorites: [],
            bucket: [],
            visits: [],
            message: "Saved places could not be read.",
          });
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const run = useCallback(
    (action: (store: PersonalStore) => Promise<void>) => {
      const store = storeRef.current;
      if (!store) {
        setData((current) => ({
          ...current,
          message: "Saved places are unavailable on this device.",
        }));
        return;
      }
      void action(store).then(
        () => refresh(),
        () => {
          setData((current) => ({
            ...current,
            message: "This device could not save that.",
          }));
        },
      );
    },
    [refresh],
  );

  const saveFavorite = useCallback((cafeId: string) => {
    run((store) => store.saveFavorite(cafeId));
  }, [run]);
  const removeFavorite = useCallback((cafeId: string) => {
    run((store) => store.removeFavorite(cafeId));
  }, [run]);
  const saveBucket = useCallback((cafeId: string) => {
    run((store) => store.saveBucket(cafeId));
  }, [run]);
  const removeBucket = useCallback((cafeId: string) => {
    run((store) => store.removeBucket(cafeId));
  }, [run]);
  const recordVisit = useCallback((cafeId: string, visitedAt: string) => {
    run((store) => store.recordVisit(cafeId, visitedAt));
  }, [run]);

  const value = useMemo(
    () => ({
      ...data,
      saveFavorite,
      removeFavorite,
      saveBucket,
      removeBucket,
      recordVisit,
    }),
    [data, recordVisit, removeBucket, removeFavorite, saveBucket, saveFavorite],
  );

  return <PersonalContext.Provider value={value}>{children}</PersonalContext.Provider>;
}
