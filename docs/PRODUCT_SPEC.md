# Product spec

Temporary identifier: `cafe-finder-prototype`. The product has no name. This document describes the experience, not a brand.

Status: the list, search, filters, map, detail pages, opt-in location, on-device favorites, bucket list, and manual visits exist for labeled demonstration cafés. The map needs `VITE_MAP_STYLE_URL` and does not ship a tile host. Accounts and Supabase are not implemented. See [STATE.md](STATE.md).

## Purpose

Help someone in Makati find a café, judge whether the published details are actually known, save places they care about, and keep a personal record of visits.

The map is a primary way to explore, not a decoration beside a list. Search, filters, and café pages must remain useful when location permission is denied.

A later direction is more immersive: see yourself and nearby cafés while moving, collect visits, and eventually interact with a coffee companion. That direction constrains the architecture. It is not part of the prototype behavior.

## Who it is for

A person on a phone, already in or heading to Makati, who wants a café that matches practical needs: where it is, what it is like, whether hours and menu prices are known, and whether they have saved it before.

The interface is English. Times use `Asia/Manila`. Prices use PHP. Filipino copy is a later decision, not an MVP requirement.

## Jobs to be done

1. Find cafés in Makati by name, neighborhood, amenity, and distance.
2. See those cafés on a map and in a list that stay in sync.
3. Optionally share the browser’s location and see which cafés are nearby.
4. Open a café and read only the details that have a source.
5. Save a favorite or add a café to a personal bucket list.
6. Record a visit without storing a location trail.

## Coverage

The first geographic scope is Makati, Philippines. Cafés outside Makati are out of the prototype even if the map can be panned there.

A café without coordinates can appear in search and on its detail page. It does not appear on the map and it is excluded from nearby results.

## Trust rules for café facts

The product must not present unknown or unverified information as fact.

- Every displayed fact needs a source on the record: who published it, when it was retrieved, and under what license.
- Missing hours, menus, prices, amenities, addresses, or photos are omitted or labeled as not listed. They are never filled with plausible values.
- Open or closed is shown only when the hours used for that judgment are verified. Fixture hours may be listed as demonstration data and do not produce that label. Missing or unverified hours say they are not listed.
- A community source such as OpenStreetMap may support a name or a coordinate later. It does not, by itself, verify a menu or a price.
- Photos appear only with attribution and a license. A stock or generated image is never shown as a picture of the café.
- Fixture data used in development must be visibly marked as fixture data. A fixture is not a claim about a real business.

Curation is the actual product problem. Buying or scraping a places API does not remove the need to know which fields are trustworthy.

## Map and location

Location access is opt-in. The product asks only after the person chooses to use their location. Denial is a normal state: search, the map, and café pages still work.

The product distinguishes three things:

- **Location fix.** A permissioned GPS reading with coordinates, accuracy, and a timestamp. This is the person.
- **Map viewport.** Where the map is pointed. Panning and zooming do not move the person and do not change “nearby”.
- **Selection.** The café currently highlighted. The marker, the result card, and the detail route share one id.

Nearby cafés are computed from the location fix and café coordinates. “Search this area” is not in the prototype.

While the map is visible and permission has been granted, the client may watch the position in the foreground. The watch stops when the person leaves the map, hides the page, or denies permission. The product does not track in the background, does not store a path, and does not send coordinates to a server in the prototype.

A control recenters the viewport on the latest fix. It does not start tracking by itself if permission was never granted.

Accuracy is shown in plain language when it is poor. A large accuracy radius must not be presented as a precise dot.

## Detail page

A café page can show, when present on the record:

- photos with attribution
- menu items and prices
- opening hours
- address
- amenities
- distance from the current fix, when a fix exists

When a section has no sourced data, the page says it is not listed. It does not hide the gap by inventing content.

## Personal collections

Favorites and the bucket list are personal and private to the device in the prototype. They are stored locally. They can be lost if the browser storage is cleared. The interface must say that. Account sync is a later phase.

A visit is a self-reported record that the person says they went. The prototype does not save the GPS coordinates of the visit. A later proximity hint may compare a current fix with the café and then discard the coordinates.

## What the web app can do well

- An interactive map, café markers, and a list on one mobile screen.
- Opt-in location while the page is open, a user marker, and recenter.
- Distance and nearby ranking from coordinates.
- Search, filters, and honest detail pages.
- Local favorites, a bucket list, and a manual visit log.
- A shareable café URL.

## What a PWA adds later

A Progressive Web App can provide a home-screen icon, a standalone window, and an offline cache of the Makati catalog. That is worth doing after the catalog is real.

A PWA does not make background movement, closed-app geofencing, or an always-on companion reliable. iOS Safari in particular will not support those in a way this product should depend on.

## What belongs in a native app later

- Background location with a separate, explicit consent and a visible reason.
- Geofences that fire when the app is not open.
- A companion or virtual pet drawn over the live environment.
- Tighter control of GPS accuracy and battery use.

Those features must not be simulated in the web prototype by polling location in a hidden tab or by storing a track “for later”.

## Out of product scope

Reservations, ordering, payments, reviews, social graphs, and the companion are not part of this spec. They need their own product decision before any design work.
