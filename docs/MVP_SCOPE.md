# MVP scope

Temporary identifier: `cafe-finder-prototype`. Current progress is in [STATE.md](STATE.md): Phases 4–6 are complete. Phase 7 is blocked on credentials.

Each phase is small enough to implement and verify on its own. A phase is done only when its acceptance criteria are met with evidence. Do not start the next phase without a separate instruction.

## In scope for the prototype

- Responsive, mobile-first web UI in English.
- Searchable Makati café directory and filters.
- Interactive map of cafés that have coordinates.
- Opt-in browser geolocation, a current-location marker, and a recenter control.
- Nearby ranking and distances from the location fix.
- One selected café shared by the map marker, the result card, and the detail route.
- Detail pages that show sourced photos, menus, prices, hours, addresses, and amenities, and that say when a section is not listed.
- Favorites and a personal bucket list stored on the device.
- A foundation for recording a personal visit, without storing a location trail.

## Out of scope until a later product decision

- A permanent name, logo, or brand system.
- Server rendering and search-engine landing pages.
- “Search this area” based on the map viewport.
- Accounts, sync, and multi-device collections.
- Live OpenStreetMap, Google Places, or any scraped directory.
- Reservations, orders, payments, reviews, or comments.
- Social features, activity feeds, or shared lists.
- A coffee companion, virtual pet, points, collection game, or AR.
- Background tracking, geofencing while the app is closed, or stored GPS tracks.
- Cafés outside Makati.
- Filipino localization.

## Phase 0 — Planning

Write the product, scope, architecture, data model, design, test, and state documents, plus the Cursor rules that keep later work inside those decisions.

### Acceptance criteria

- The files listed in [STATE.md](STATE.md) exist.
- The repository contains no application source, package manifest, café fixtures, map keys, or secrets.
- Documents distinguish planning from implemented behavior.
- Open choices for tiles, café licensing, and Supabase credentials are recorded as unresolved.

## Phase 1 — App shell

Create the React, TypeScript, and Vite application. Add routes and the editorial design tokens. Do not add café facts or a map.

Routes to establish:

- `/` exploration home
- `/cafes/:id` detail
- `/saved` favorites and bucket list
- `/visits` visit foundation

### Acceptance criteria

- The app builds and renders at a phone width and a desktop width.
- Each route loads without café claims, prices, hours, or photos.
- Tokens match [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
- No product name or logo is introduced.

## Phase 2 — Honest catalog

Add a typed fixture catalog behind the `CafeCatalog` port. Ship search, filters, and detail pages.

### Acceptance criteria

- Search matches café names from fixtures only.
- Filters cover neighborhood and amenity, and skip cafés that lack the filtered field.
- A detail page renders only fields present on the fixture.
- Missing menu, hours, price, address, amenity, or photo sections say they are not listed.
- Fixture cafés are labeled as fixtures.
- Open or closed is absent unless the fixture’s hours are marked verified.
- No network call is required to read the catalog.

## Phase 3 — Map and selection

Add MapLibre through the map adapter. Show markers for cafés with coordinates. Keep the list and the map on one mobile screen.

### Acceptance criteria

- Choosing a card highlights its marker. Choosing a marker highlights its card and can open the detail context.
- Panning the map does not change the selected café or invent a user location.
- Cafés without coordinates stay in the list and do not get a marker.
- The map shows tile attribution.
- Loading and empty catalog states are visible.
- The style URL is configured outside the domain code. If it is missing, the map shows a configuration error instead of a hardcoded provider.

## Phase 4 — Opt-in location and nearby

Add the geolocation port, the user marker, recenter, and nearby distances.

### Acceptance criteria

- The browser is not asked for location until the person opts in.
- Granted: a marker appears at the fix, with accuracy that is honest when the reading is coarse.
- Recenter moves the viewport to the latest fix and does not rewrite café data.
- Nearby results and distances use the fix and café coordinates, not the viewport center.
- Denied, unavailable, and timed-out states are explained. Search and the map still work.
- The foreground watch stops when leaving the map view or hiding the page.
- Coordinates are not written to the server and are not stored as a track.

## Phase 5 — Local collections

Add favorites and the bucket list through `PersonalStore`, backed by `localStorage`.

### Acceptance criteria

- A café can be favorited and added to or removed from the bucket list.
- The saved screen shows both groups and survives a reload.
- Copy states that this device is the only copy.
- Clearing storage empties the collections without affecting the catalog.
- No account is required.

## Phase 6 — Visit foundation

Add a manual visit record. This is a journal entry, not a game action.

### Acceptance criteria

- The person can record that they visited a café, with the time of the report.
- The visit list shows those records after reload.
- The stored visit does not include coordinates or a path.
- No points, badges, companion, or proximity automation are added.

## Phase 7 — Remote adapter

Replace or supplement local adapters with Supabase Postgres and PostGIS. This phase is blocked until a project URL and anon key exist outside the repository.

### Acceptance criteria

- Café reads go through `CafeCatalog`. Personal writes go through `PersonalStore`. UI code does not gain a second data path.
- Geospatial nearby queries use PostGIS `geography` and do not depend on MapLibre.
- Row-level security limits personal rows to the signed-in user.
- The service role key is never shipped to the client.
- Provenance rules from Phase 2 still hold for remote rows.
- If credentials are missing, the app keeps using the local adapters.

## Done means evidenced

A phase is not complete because the code was written. Completion requires the checks in [TEST_PLAN.md](TEST_PLAN.md) that apply to that phase, including a manual pass of any screen that changed.
