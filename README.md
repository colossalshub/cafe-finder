# cafe-finder-prototype

Temporary project identifier for a premium, mobile-first café discovery web application aimed at the Philippines. The first coverage area is Makati.

Phases 4–6 are a runnable local prototype: an editorial shell, labeled demonstration café records, search, filters, a map, opt-in location, on-device favorites and a bucket list, and a manual visit log. It is not a directory of real cafés. Open or closed is shown only for verified hours. The map reads `VITE_MAP_STYLE_URL` and does not include a tile host in source. Supabase is not connected.

`cafe-finder-prototype` is not a product name. The product is unnamed. Do not treat any title in these documents as a brand, and do not add a logo.

## Status

| Item | State |
| --- | --- |
| Planning documents | Present |
| Application | Phases 4–6: map, catalog, opt-in location, and on-device collections. Labeled demonstration cafés. |
| Tests | Vitest unit tests for search, hours, provenance, markers, selection, distance, nearby ranking, the location session, and local collections. No end-to-end suite. |
| Git repository | Not initialized |
| Map | MapLibre in the map adapter. Style URL from `VITE_MAP_STYLE_URL`. No provider is committed. |
| Location | Opt-in only. A user marker, recenter, and distances from the GPS fix. |
| Saved places and visits | `localStorage` through `PersonalStore`. This device is the only copy. |
| Supabase project | Not created. Phase 7 is blocked. |

```bash
npm install
npm run dev
```

The dev server prints a local URL. Café names in the interface are fixtures. Do not treat them as real businesses.

## Documents

- [Product spec](docs/PRODUCT_SPEC.md) — who it is for, what “true” means for café facts, and how location privacy works.
- [MVP scope](docs/MVP_SCOPE.md) — what is in and out of the prototype, plus acceptance criteria for each phase.
- [Architecture](docs/ARCHITECTURE.md) — layers, map and GPS boundaries, and ports that keep data independent of the UI.
- [Data model](docs/DATA_MODEL.md) — café records, provenance, collections, and the future PostGIS shape.
- [Design system](docs/DESIGN_SYSTEM.md) — editorial visual direction without a brand identity.
- [Test plan](docs/TEST_PLAN.md) — checks for later phases. Current test results are in [State](docs/STATE.md).
- [State](docs/STATE.md) — decisions, open issues, and the current phase.

## Non-goals

This prototype does not include:

- a committed tile host or a live café directory
- accounts or a Supabase project
- a coffee companion, game mechanics, AR, background location, or social features
- a permanent name, logo, or brand system

Phase 7 needs a Supabase URL and anon key outside the repository. See [docs/STATE.md](docs/STATE.md).
