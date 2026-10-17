import { useEffect, useState } from "react";
import { fixtureCafeCatalog } from "../adapters/fixtureCafeCatalog";
import type { Cafe } from "../domain/types";

type LoadState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error" };

export function useCafeList(): LoadState<Cafe[]> {
  const [state, setState] = useState<LoadState<Cafe[]>>({ status: "loading" });

  useEffect(() => {
    let active = true;
    fixtureCafeCatalog.list().then(
      (data) => {
        if (active) {
          setState({ status: "ready", data });
        }
      },
      () => {
        if (active) {
          setState({ status: "error" });
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return state;
}

type CafeState =
  | { status: "loading" }
  | { status: "ready"; id: string; data: Cafe | null }
  | { status: "error"; id: string };

export function useCafe(id: string | undefined): LoadState<Cafe | null> {
  const [state, setState] = useState<CafeState>({ status: "loading" });

  useEffect(() => {
    if (!id) {
      return;
    }
    let active = true;
    fixtureCafeCatalog.get(id).then(
      (data) => {
        if (active) {
          setState({ status: "ready", id, data });
        }
      },
      () => {
        if (active) {
          setState({ status: "error", id });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [id]);

  if (!id) {
    return { status: "ready", data: null };
  }
  if (state.status === "loading" || state.id !== id) {
    return { status: "loading" };
  }
  if (state.status === "error") {
    return { status: "error" };
  }
  return { status: "ready", data: state.data };
}
