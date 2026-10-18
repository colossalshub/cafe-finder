# State

Temporary identifier: `cafe-finder-prototype`.

## Current phase

**Phases 4, 5, and 6 are complete.** Phase 7 is not started. It stays blocked until a Supabase project URL and anon key exist outside the repository. Do not add a Supabase client, a committed tile host, or a places API without a separate instruction.

Location is opt-in. The browser geolocation API is called only from the geolocation adapter, and only after the person uses the location control. Recenter moves the viewport to the latest fix and does not request location. Nearby ranking uses that fix and café coordinates. Panning does not move the user marker, change the selected café, or recompute distances.

Favorites, the bucket list, and visits go through `PersonalStore` and `localStorage`. A visit stores a café id, the reported time, the recorded time, and `method: "self_reported"`. It does not store coordinates.

## What runs

- React, TypeScript, Vite, and MapLibre GL JS.
- Routes: `/`, `/cafes/:id`, `/saved`, `/visits`.
- Editorial tokens from [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). No product name and no logo.
- Six demonstration cafés behind `CafeCatalog`. Every record is marked fixture. They are not real businesses.
- Search matches fixture names only. Neighborhood and amenity filters skip cafés that lack the selected field. Markers follow the filtered list.
- When a location fix exists, the same search results are ordered by distance from that fix. Cafés without coordinates stay at the end. Nearby means within 2 km. Cafés farther away stay in the search results and still show a distance.
- A reading coarser than 100 meters is described as approximate, and the map draws an accuracy ring instead of a precise dot.
- A fix older than 2 minutes is stale. Distances still use it. The foreground watch is the thing that refreshes it, and only while the map is visible and the page is visible.
- Detail pages show only displayable fixture fields. Missing sections say “Not listed.” A fix adds a distance when the café has coordinates.
- Open or closed is produced only when hours are `verified`. No fixture in this catalog has verified hours.
- The map style URL is `VITE_MAP_STYLE_URL`, read outside the domain. If it is missing, the map area says “The map style is not configured.” No tile host is hardcoded.
- On a phone, search and filters stay above the map. The café list peeks over the map and can expand. Desktop places search, filters, and the list beside the map.
- Saved places and visits persist in `localStorage` under `cafe-finder-prototype.personal`. The saved screen says “Saved on this device only.”

## Verification

Commands run from `e:\Documents\Projects\cafe-finder` on 18 October 2026, after phases 4–6:

| Command | Result |
| --- | --- |
| `npm test` | Passed. Vitest 5.0.5, 11 files, 44 tests |
| `npm run typecheck` | Passed, as part of `npm run build` |
| `npm run lint` | Passed |
| `npm run build` | Passed. Vite 8.3.4. The build warned that the MapLibre chunks are larger than 500 kB. |

No end-to-end test runner exists. Browser checks used `http://127.0.0.1:5181/` with the existing gitignored `.env.local` map style. That file is a local viewing setting, not a committed provider choice.

- Before the location control was used, the UI said “Use your location to see what is nearby.” Recenter was disabled. A counter on the geolocation methods was still 0. No user marker was present.
- A granted stub at the North Margin coordinates showed “Location on”, “0 m away” for North Margin, then 596 m, 1.4 km, 1.7 km, and 2.2 km. Blank Entry stayed last and had no distance. Five café markers remained. The user marker was “Your location”.
- An arrow-key pan moved the map. Distances, the selected café, and the marker count stayed the same. Recenter put the user marker back on the map center and did not call geolocation again.
- A 250 meter accuracy reading said “Approximate, within 250 meters.” The user marker was “Your approximate location”, with an open center rather than a filled dot.
- The automation tab reported `visibilityState` `hidden`, so the foreground watch did not start. That matches the hidden-page rule. The unit tests cover starting and stopping the watch with a fake port. A real device GPS prompt was not exercised. This browser profile already had geolocation permission for `127.0.0.1`.
- With no watch updates, the reading became stale and the page said “This location reading is no longer current.” Distances remained.
- Denied said “Location is off. You can still search and browse the map.” Search for “Folded” left one café and the map. Unavailable said “Your location could not be read.” No user marker appeared in either failure.
- At 390×844 the peek showed the North Margin card, including “0 m away”, and the location controls sat in the map above the sheet. Attribution read “OpenFreeMap © OpenMapTiles Data from OpenStreetMap”.
- At 320×640 the page did not scroll sideways. Location and recenter controls were at least 44px tall and did not cover the header or the attribution. At 1280×800 the list started at the left, the map at 420px, the top navigation was visible, and the bottom navigation was not. No horizontal overflow.
- North Margin’s detail page showed “About 0 m from your location.” Photos still said “Not listed.” Save, bucket, and visit actions were enabled. The page said “Saved on this device only.”
- Saving, adding to the bucket list, and recording a visit wrote `cafe-finder-prototype.personal`. The visit JSON had `id`, `cafeId`, `visitedAt`, `recordedAt`, and `method`. It had no coordinates. The visit list showed “North Margin” and “18 Oct 2026, 08:07” after a reload.
- Removing the favorite left the bucket item. Clearing that storage key and reloading left “No favorites yet.” and “Nothing on the bucket list.” The catalog still showed 6 cafés.
- A second server started with an empty `VITE_MAP_STYLE_URL`, and another started with `--mode test`, both still loaded the gitignored style file. The missing-style message was not re-checked in the browser on this pass. The branch that shows “The map style is not configured.” is still in the explore page.

## Not in this phase

- Supabase, accounts, row-level security, and secrets.
- A committed tile host.
- A companion, game, points, badges, AR, or social feature.
- Background location or a stored GPS track.

## Open issues

- Map tiles: still not chosen for the repository. OpenFreeMap Liberty remains only in gitignored `.env.local`. It needs no key and has no service commitment. Attribution must stay visible. Tile requests reveal the viewport to that host. MapTiler would need a key. Protomaps would need hosting.
- Café licensing: no approved vendor. The fixtures are not a Makati directory.
- Supabase: no project, URL, or anon key. Phase 7 cannot start.

## Next action

Wait for a Supabase project URL and anon key, supplied outside the repository, before any remote adapter. Do not add a committed tile host unless that choice is explicit.
