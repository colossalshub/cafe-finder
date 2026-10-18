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
- A fix older than 2 minutes is stale. Distances still use it. The foreground watch is the thing that refreshes it, and only while the map is visible and the page is visible. A stale reading that is coarser than 100 meters stays described as approximate.
- On a phone, the collapsed results sheet is a short peek. A shorter screen uses a shorter peek so the map stays usable. The expanded list shows the amenity chips and the full cards.
- Detail pages show only displayable fixture fields. Missing sections say “Not listed.” A fix adds a distance when the café has coordinates.
- Open or closed is produced only when hours are `verified`. No fixture in this catalog has verified hours.
- The map style URL is `VITE_MAP_STYLE_URL`, read outside the domain. If it is missing, the map area says “The map style is not configured.” No tile host is hardcoded.
- On a phone, search and filters stay above the map. The café list peeks over the map and can expand. Desktop places search, filters, and the list beside the map.
- The expanded list, and the desktop list, can narrow results by amenities already listed on the records, such as Wi-Fi and outdoor seating.
- A detail page leads with save, bucket, and visit actions. Sections with sourced fields stay on the page. Missing sections are gathered into one “Not listed” line.
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

UI pass on the same date, still inside phases 4–6. Commands from `e:\Documents\Projects\cafe-finder`:

| Command | Result |
| --- | --- |
| `npm test` | Passed. Vitest 5.0.5, 11 files, 44 tests |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed. Vite 8.3.4. The build warned that the MapLibre chunks are larger than 500 kB. |

Browser checks used `http://localhost:5173/` with the existing gitignored map style.

- Explore showed “Makati”, “Cafés”, and “Demonstration records for Makati. Not a directory of real places.” Search for “zzzz” left “0 cafés” and “No cafés match these filters.” Clear search and filters restored 6 cafés. “Outdoor seating” left Low Table, one marker, and “Filters, 1”. Pressing it again restored 6 cafés.
- “Show on map” on North Margin collapsed the sheet, pressed the North Margin marker, and labelled the card “Selected”.
- At 390×844 the peek showed the location sentence and the North Margin card, including “Show on map”. Attribution read “OpenFreeMap © OpenMapTiles Data from OpenStreetMap” and was not covered by the location controls. No horizontal overflow.
- At 320×640 there was no horizontal overflow. Location and recenter controls were 44px tall, sat below the header, and did not cover the attribution. The North Margin name was visible in the peek. The visible map band was about 113px tall.
- At 1280×800 the list column was 420px at the left, the map began at 420px, the top navigation was visible, and the bottom navigation was not. Listed-amenity chips were in the list. Opening Filters showed neighborhoods. The amenity controls were not repeated in that panel. No horizontal overflow.
- North Margin’s detail page showed Legazpi, the demonstration note, save, bucket, and visit actions, sourced address, hours, amenities, price, and menu, and “Not listed: Photos.” Hours said “Demonstration hours. Not a verified schedule.” Blank Entry showed “Neighborhood not listed” and “Not listed: Address, Hours, Amenities, Price, Menu, Photos, Location.”
- Saving North Margin wrote `cafe-finder-prototype.personal`. The saved screen listed North Margin and “Nothing on the bucket list.” Removing the favorite restored “No favorites yet.” Recording a visit stored `id`, `cafeId`, `visitedAt`, `recordedAt`, and `method`, with no coordinates. The visit list showed “North Margin” and “18 Oct 2026, 18:20”. That browser record was then removed.

Sheet and location pass on 19 October 2026, still inside phases 4–6. Commands from `e:\Documents\Projects\cafe-finder`:

| Command | Result |
| --- | --- |
| `npm test` | Passed. Vitest 5.0.5, 11 files, 45 tests |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed, as part of `npm run build` |
| `npm run build` | Passed. Vite 8.3.4. The build warned that the MapLibre chunks are larger than 500 kB. |

Browser checks used `http://localhost:5174/` with the existing gitignored map style.

- At 320×640 the collapsed sheet was 168px. The map band between the header and the sheet was 205px. North Margin stayed on one line, with “Legazpi · Fixture” and a Map control inside the peek. Location and recenter controls were 44px tall, below the header, and clear of the attribution. Attribution read “OpenFreeMap © OpenMapTiles Data from OpenStreetMap” and was not clipped. No horizontal overflow. Expanding the list restored 28px names, the letter marks, and the amenity lines, and hid the map controls.
- At 390×844 the sheet was 208px and the map band was 359px. The first card name and neighborhood were visible. Attribution was clear of the controls. No horizontal overflow.
- At 1280×800 the list column was 420px, the map began at 420px, the top navigation was visible, and the bottom navigation was not. Cards showed “Show on map”. Selecting North Margin pressed its marker and changed the control to “Selected”. No horizontal overflow.
- Search for “Folded” left one café and one marker. Clearing it restored 6 cafés.
- A granted reading with 250 meter accuracy said “Approximate, within 250 meters.” The user marker was an open circle labelled “Your approximate location”. North Margin showed “155 m away”. A later 20 meter reading said “Distances use your location.” The user marker was a filled square labelled “Your location”. Denied, unavailable, and stale states were not repeated in the browser on this pass. The stale coarse sentence is covered by the unit test.

Filter panel pass on 19 October 2026, still inside phases 4–6. CSS only, in `src/index.css`. `npm test`, lint, typecheck, and build were not rerun.

On a phone, opening Filters while the list was expanded painted the neighborhood panel over the sheet grip and the location row. That panel now sits in the header while the list is expanded. On a screen shorter than 700px, those chips scroll on one line, and the in-sheet location row hides only while Filters is open, so the first café name stays on screen. Closing Filters shows the location row again.

Opening Filters over the map was covering the location controls. The dropdown now stops above those controls. On a short screen it also moves them into a row above the attribution while the dropdown is open, and the neighborhood chips scroll sideways. Closing Filters puts the controls back under the header.

Browser checks used `http://localhost:5174/`.

- At 320×640 with the list expanded and Filters open, the panel was in normal flow and did not overlap the sheet. North Margin’s name was fully inside the sheet. No horizontal overflow. Legazpi left 1 café. Closing Filters restored “Use location”.
- At 390×844 with the list expanded and Filters open, the panel did not cover the sheet or “Use location”. North Margin’s name was fully inside the sheet. Clearing the neighborhood restored 6 cafés. No horizontal overflow.
- At 1280×800 the list column was 420px, the map began at 420px, the top navigation was visible, and the bottom navigation was not. Amenity shortcuts were visible. The amenity field in the filter panel was hidden. No horizontal overflow.
- At 390×844 with the map showing and Filters open, the dropdown ended above “Use location” and “Recenter”. It did not cover the attribution or the café name. The panel scrolls.
- At 320×640 with the map showing and Filters open, the dropdown, the location controls, the attribution, and the café name did not overlap. “Use location” and “Recenter” were 44px tall. Any, Century City, and Legazpi were fully visible; later neighborhoods scroll sideways. No horizontal overflow. Closing Filters returned the controls to a row under the header, clear of the attribution and the café name.

Card and saved-list pass on 19 October 2026, still inside phases 4–6.

The café name link no longer stretches across the card body. The link itself is at least 44px tall, and the neighborhood line sits outside it. On desktop, the map control sits under the card text so the 28px name stays on one line. Saved-list remove buttons keep the visible label “Remove” and now have an accessible name that includes the café and the list. Detail actions at 320×640 were measured and left as they are: Save, the bucket control, and Record a visit are 44px tall and inside the content width, including “Remove from bucket list”. The source line clears the bottom navigation by 24px.

| Command | Result |
| --- | --- |
| `npm test` | Passed. Vitest 5.0.5, 11 files, 45 tests. Run again after the saved-list labels. |
| `npm run lint` | Passed. Run again after the saved-list labels. |
| `npm run typecheck` | Passed after the saved-list labels. |
| `npm run build` | Passed after the desktop card rule. Vite 8.3.4. The build warned that the MapLibre chunks are larger than 500 kB. |

Browser checks used `http://localhost:5174/`.

- At 320×640, collapsed and expanded, every café name link was at least 44px tall and did not cover the neighborhood line. No horizontal overflow. North Margin opened its detail page.
- At 320×640, North Margin’s detail actions were 44px tall. “Remove from bucket list” ended inside the content box. No horizontal overflow. That bucket item was then removed. The saved screen returned to “No favorites yet.” and “Nothing on the bucket list.”
- At 1280×800, each café name was one line and at least 44px tall. “Show on map” was 44px tall under the text. North Margin and Folded Page were both inside the 800px viewport. The list column was 420px and the map began at 420px. No horizontal overflow.
- At 320×640 after that desktop rule, the peek still placed the 44px “Map” control beside the name. No horizontal overflow.
- The bucket remove control’s accessible name was “Remove North Margin from the bucket list”.
- At 320×640, a recorded North Margin visit showed “19 Oct 2026, 01:27” on its own line. The name link was 44px tall. The time did not overflow. The stored visit had `id`, `cafeId`, `visitedAt`, `recordedAt`, and `method`, and no coordinates. That visit was then removed. The visits screen returned to “No visits recorded.”

Personal records on the discovery surfaces, 19 October 2026, still inside phases 4–6. The list and the café page now say when a café is saved, on the bucket list, or has a reported visit. Saved and visit rows include the neighborhood already on the catalog record. A reported visit can be removed by its id. The stored visit still has no coordinates.

| Command | Result |
| --- | --- |
| `npm test` | Passed. Vitest 5.0.5, 12 files, 50 tests |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed. Vite 8.3.4. The build warned that the MapLibre chunks are larger than 500 kB. |

Browser checks used `http://localhost:5174/`.

- Saving North Margin, adding it to the bucket list, and recording a visit made the café page say “Saved · Bucket list · Visit reported” and “You reported a visit.” with “19 Oct 2026, 01:40”. The stored visit keys were `id`, `cafeId`, `visitedAt`, `recordedAt`, and `method`.
- At 320×640 the collapsed list showed that status on North Margin and on no other card. The status was inside the sheet. No horizontal overflow.
- The saved screen listed North Margin under favorites and the bucket list, each with “Legazpi · Fixture”. No horizontal overflow.
- The visits screen listed “Legazpi · Fixture” and “19 Oct 2026, 01:40”. Removing the visit restored “No visits recorded.” Favorites and the bucket item remained. The storage had no coordinates.
- At 1280×800 the list showed “Saved · Bucket list” on North Margin. The list column was 420px, the map began at 420px, the top navigation was visible, and the bottom navigation was not. No horizontal overflow.

The map and list can now narrow to those same records. Filters includes Your places: Saved, Bucket list, or Visit reported. The saved and visit screens link back to that view. Markers follow the filtered list.

Browser checks used `http://localhost:5174/`.

- With only North Margin saved, Saved left 1 café and 1 marker. Visit reported left “0 cafés” and “No cafés match these filters.” Clear search and filters restored 6 cafés and 5 markers. No horizontal overflow.
- “Show favorites on the map” opened `/?places=saved` with Filters, 1, one café, and one marker.

## Prototype completion

Checked on 19 October 2026 from `e:\Documents\Projects\cafe-finder`. The local prototype, phases 0 through 6, meets the acceptance criteria in [MVP_SCOPE.md](MVP_SCOPE.md) and the checks in [TEST_PLAN.md](TEST_PLAN.md) for those phases. Phase 7 is not part of that completion.

| Command | Result |
| --- | --- |
| `npm test` | Passed. Vitest 5.0.5, 12 files, 50 tests |
| `npm run lint` | Passed |
| `npm run build` | Passed. Vite 8.3.4. The build warned that the MapLibre chunks are larger than 500 kB. |

Browser checks used `http://localhost:5174/`.

- At 390×844 the explore page showed 6 cafés, “Demonstration records for Makati. Not a directory of real places.”, and “Use your location to see what is nearby.” Recenter was disabled. Search for “Folded” left 1 café and 1 marker.
- Blank Entry showed “Demonstration record. This is not a real café.” and “Not listed: Address, Hours, Amenities, Price, Menu, Photos, Location.” It did not say open or closed.
- Saved showed “Saved on this device only.”, “No favorites yet.”, and “Nothing on the bucket list.”
- Visits showed “A visit is what you report. It does not store your location.” and “No visits recorded.” The page text had no badge, points, score, or companion. At 1280×800 the top navigation was visible and the bottom navigation was not.

A real device GPS prompt was not part of this pass. The location watch is covered by unit tests with a fake port. The missing-style message was not re-checked here, because the running server still has the gitignored map style.

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

Do not start another interface pass. Phases 0–6 are the functional prototype.

Phase 7 stays blocked. [MVP_SCOPE.md](MVP_SCOPE.md) defines it as replacing or supplementing the local adapters with Supabase Postgres and PostGIS, and it does not start until a project URL and anon key exist outside the repository. [ARCHITECTURE.md](ARCHITECTURE.md) says the same: no Supabase project exists, and the service role key stays off the client. This session does not authorize that work.

A committed tile host and a real café directory are also still open choices. They are not required for the local prototype to run.
