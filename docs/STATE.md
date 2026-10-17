# State

Temporary identifier: `cafe-finder-prototype`.

## Current phase

**Phase 3 is complete.** Stop here. Do not start Phase 4 without a separate instruction.

MapLibre lives in the map adapter. Markers come from café coordinates that are allowed to be shown. The list and the map share one selected café id. Panning changes the viewport only. There is no user marker, and the page does not call the Geolocation API.

## What runs

- React, TypeScript, Vite, and MapLibre GL JS.
- Routes: `/`, `/cafes/:id`, `/saved`, `/visits`.
- Editorial tokens from [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). No product name and no logo.
- Six demonstration cafés behind `CafeCatalog`. Every record is marked fixture. They are not real businesses.
- Search matches fixture names only. Neighborhood and amenity filters skip cafés that lack the selected field. Markers follow the filtered list.
- Detail pages show only displayable fixture fields. Missing sections say “Not listed.”
- Open or closed is produced only when hours are `verified`. No fixture in this catalog has verified hours.
- The map style URL is `VITE_MAP_STYLE_URL`, read outside the domain. If it is missing, the map area says “The map style is not configured.” No tile host is hardcoded.
- On a phone, search and filters stay above the map. The café list peeks over the map and can expand. Desktop places search, filters, and the list beside the map.
- Saved, visits, and location stay disabled.

## Verification

Commands run from `e:\Documents\Projects\cafe-finder` on 18 October 2026:

| Command | Result |
| --- | --- |
| `npm test` | Passed. Vitest 5.0.5, 7 files, 23 tests |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed. Vite 8.3.4. The build warned that the MapLibre chunks are larger than 500 kB. |

No end-to-end test runner exists. Browser checks used `http://127.0.0.1:5175/` with an uncommitted `.env.local` set to OpenFreeMap’s public Liberty style (`https://tiles.openfreemap.org/styles/liberty`). That file is gitignored. It is a local viewing setting, not a committed provider choice. No account and no key were created.

- Five café markers appeared. Blank Entry stayed in the list and had no marker.
- Selecting North Margin pressed its marker and changed the card button to “Selected”. Choosing the Folded Page marker selected that card and released North Margin.
- The Folded Page name opened `/cafes/demo-folded-page`.
- An arrow-key pan moved the markers. Folded Page stayed selected. The marker count stayed five. No user marker appeared.
- Attribution stayed visible: “OpenFreeMap © OpenMapTiles Data from OpenStreetMap”. Requests went to `tiles.openfreemap.org`, the app, and the typefaces. No places API was requested.
- The Legazpi filter left one café and one marker. “no-such-cafe” showed “No cafés match these filters.” The map remained.
- At 390×844, the list sheet sat above the bottom navigation, and attribution sat above the sheet. No horizontal overflow. “Show list” expanded the sheet.
- A second server at `http://127.0.0.1:5177/`, started without the style file, showed “The map style is not configured.” Search and the six café cards still worked.
- “Loading cafés.” was not caught in a snapshot because the fixture catalog resolves on the first effect. “No cafés are in the catalog.” was not shown because the fixture list is not empty.

## UI refinement

Checked on 18 October 2026 after the phase 3 layout above. This did not start Phase 4.

| Command | Result |
| --- | --- |
| `npm test` | Passed. Vitest 5.0.5, 7 files, 23 tests |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed. Vite 8.3.4. The build warned that the MapLibre chunks are larger than 500 kB. |

Browser checks used `http://127.0.0.1:5180/` with the same gitignored `.env.local` map style as the phase 3 pass.

- At 390×844, search, Filters, and Map/List were visible without scrolling. The sheet showed North Margin, including Select. Attribution sat above the sheet: “OpenFreeMap © OpenMapTiles Data from OpenStreetMap”.
- Legazpi left 1 café and 1 marker. Escape closed Filters and returned focus to that button. “no-such-cafe” showed “No cafés match these filters.” Clearing the search restored 6 cafés. Blank Entry stayed in the list. Marker count was 5.
- Choosing the North Margin marker set the card button to “Selected” and pressed the marker.
- List expanded under the search bar. The list scrolled to the location note, which stayed above the bottom navigation.
- At 1280×800, the list column sat beside the map, the top navigation was visible, and the bottom navigation was not. Scrolling the column kept search on screen. No horizontal overflow.
- At 320×640, controls stayed at least 44px tall and the page did not scroll sideways. Attribution wrapped to two lines and stayed above the sheet in Map.
- `/cafes/demo-north-margin` showed the fixture detail and “Not listed” for photos. The source line stayed above the bottom navigation. `/saved` showed the existing not-implemented copy.

A software keyboard was not opened, so the visual-viewport inset was not seen. Synthetic Tab presses did not paint `:focus-visible`; the oxide focus rule is in `src/index.css`.

A later pass on the same day changed the result card and markers only. Each card links to its detail page, lists neighborhood and any fixture amenities, and uses a letter tile because no fixture has a licensed photo. “Show on map” selects the café and returns to the map. Markers are slightly larger, with an oxide selected state. No bookmark and no location control were added. Phase 4 and Phase 5 are still not started.

Checked again from `e:\Documents\Projects\cafe-finder`:

| Command | Result |
| --- | --- |
| `npm test` | Passed. Vitest 5.0.5, 7 files, 23 tests |
| `npm run lint` | Passed |
| `npm run build` | Passed. Vite 8.3.4. The MapLibre chunk-size warning remains. |

Browser checks used `http://127.0.0.1:5180/`. At 390×844 the peek showed the full North Margin card, including “Show on map”, and attribution stayed above the sheet. “Show on map” for Folded Page left the list, pressed that marker, and showed its card. The name opened `/cafes/demo-folded-page`. At 320×640 the page did not scroll sideways, and the card button stayed above the bottom navigation. At 1280×800 the same cards sat beside the map.

## Not in this phase

- Browser geolocation, a user marker, recenter, and distances.
- `localStorage` favorites, bucket list, and visits.
- Supabase, accounts, and secrets.
- A companion, game, AR, or social feature.

## Open issues

- Map tiles: still not chosen for the repository. OpenFreeMap Liberty was used only in gitignored `.env.local` so the map could be viewed. It needs no key and has no service commitment. Attribution must stay visible. Tile requests reveal the viewport to that host. MapTiler would need a key. Protomaps would need hosting.
- Café licensing: no approved vendor. The fixtures are not a Makati directory.
- Supabase: no project, URL, or anon key.

## Next action

Wait for a review of the map. The next instruction should name Phase 4 before any location work. Do not add a committed tile host unless that choice is explicit.
