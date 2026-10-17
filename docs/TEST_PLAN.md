# Test plan

Temporary identifier: `cafe-finder-prototype`.

Vitest covers search, hours, provenance, and fixture labeling. The latest results are in [STATE.md](STATE.md). There is no end-to-end runner. A check below is not done until it is run for the phase being finished and the result is recorded.

Do not claim a behavior works because this document describes it.

## When testing starts

Phase 1 introduces the runner. Prefer Vitest for pure functions and component tests. End-to-end browser automation is optional and is not required to start.

Vitest is the runner for pure functions. Manual checks in the browser remain the evidence for UI work. Record what was opened, what was clicked, and what happened. A single screenshot is not evidence of behavior.

## Unit tests to write

These are specified now so the domain stays testable without MapLibre or a browser.

### Distance

- Two identical coordinates return 0.
- A known pair of WGS84 points returns a distance within 1 meter of a checked value.
- Order of the points does not change the result.

### Nearby

- Cafés without coordinates are excluded.
- Results sort by distance from the location fix, not from a viewport center.
- A café outside the radius is excluded.
- An empty catalog returns an empty list, not sample cafés.

### Provenance display

- `verified` and development `fixture` values may be shown.
- `unverified` values are treated as not listed.
- `community` may show a name or coordinate and must not show a menu, price, or hours as verified.
- A null menu, hours, photo, or amenity block is “Not listed”, never a generated substitute.
- Open or closed is produced only from verified hours. Missing hours produce no open or closed label.

### Selection

- Setting the selected id highlights one café.
- Clearing it selects none.
- Changing selection does not change the location fix.
- Changing the viewport does not change the selected id.

### Location session

- The session starts `idle` and does not call the geolocation port.
- Opt-in moves to `requesting`, then `granted`, `denied`, or `unavailable`.
- A granted fix stores accuracy and time.
- Unsubscribe stops further updates.
- A hidden page stops the watch.
- No test stores a sequence of coordinates.

Use a fake `GeolocationPort` in these tests. Do not call the real browser API.

## Manual checks by phase

Run the checks for the phase being finished. Do not skip ahead and call later phases done.

### Phase 1

- Build succeeds.
- `/`, `/cafes/:id`, `/saved`, and `/visits` render at a narrow phone width and a desktop width.
- No café facts, prices, or photos appear.
- No logo or product name appears.

### Phase 2

- Search returns fixture names only.
- A filter hides cafés that lack the amenity or neighborhood.
- A detail page with null sections shows “Not listed”.
- Fixture records are labeled as fixtures.
- The catalog loads without a network request to a places API.

### Phase 3

- Card selection and marker selection match.
- Panning does not change the selected café and does not create a user marker.
- A café without coordinates has no marker and remains in the list.
- Attribution is visible.
- An empty catalog and a missing style URL show their specified messages.

### Phase 4

- Before opt-in, the browser permission prompt has not appeared.
- Deny: the denied copy is visible, and search still works.
- Allow: the user marker is at the fix, and recenter moves the map there.
- Distances match the fix, including after the map is panned away.
- Leaving the map or hiding the page stops further location updates. Confirm with the browser’s sensor or by logging a single unsubscribe in development, then remove that log.
- A coarse accuracy value is described as approximate.

### Phase 5

- Favorite and bucket actions persist after reload.
- The saved screen says the data stays on this device.
- Clearing site data clears collections and leaves the catalog in place.

### Phase 6

- Recording a visit persists the café id and times.
- The stored record has no coordinates.
- No score, badge, or companion UI appears.

### Phase 7

- Do not start without credentials.
- Catalog and personal data still move through their ports.
- A personal row is not readable as another user.
- Removing the environment values falls back to local adapters.

## Review before calling a phase done

- Acceptance criteria in [MVP_SCOPE.md](MVP_SCOPE.md) are checked off with evidence.
- Unverified café facts were not introduced to make a screen look full.
- Location code does not watch in the background.
- The domain module, once it exists, does not import React, MapLibre, or Supabase.
- UI that changed was exercised in a browser, not only typechecked.

## What this plan does not prove

This document does not prove that MapLibre, a tile host, browser GPS, or Supabase will work in Makati. Those are verified in the phase that integrates them, on a real device when the check depends on GPS.
