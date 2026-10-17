import type { Cafe } from "../domain/types";

export type CafeCatalog = {
  list(): Promise<Cafe[]>;
  get(id: string): Promise<Cafe | null>;
};
