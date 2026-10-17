import { fixtureCafes } from "../data/fixtures";
import type { CafeCatalog } from "../ports/cafeCatalog";

export const fixtureCafeCatalog: CafeCatalog = {
  async list() {
    return fixtureCafes;
  },
  async get(id) {
    return fixtureCafes.find((cafe) => cafe.id === id) ?? null;
  },
};
