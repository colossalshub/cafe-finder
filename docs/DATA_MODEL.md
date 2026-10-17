# Data model

Temporary identifier: `cafe-finder-prototype`. This is the intended model. It is not a database or a migration. TypeScript types and labeled fixture records exist under `src/`. There are no database rows.

Unknown data is omitted. The model has no field whose empty value should be displayed as a real hour, price, amenity, or photo.

## Provenance

A sourced value carries a source. An absent value means “not listed”. Do not substitute a guess.

```ts
type Verification = "fixture" | "unverified" | "community" | "verified";

type Source = {
  id: string;
  kind: "fixture" | "manual" | "osm" | "owner";
  title: string;
  url: string | null;
  retrievedAt: string; // ISO 8601
  license: string | null;
};

type Sourced<T> = {
  value: T;
  sourceId: string;
  verification: Verification;
};
```

Display rules:

- `fixture` — show the value and a visible fixture label. Development only.
- `unverified` — do not show the value as fact. Treat it as not listed.
- `community` — may support a name or coordinate with attribution. Do not treat it as a verified menu, price, or set of hours.
- `verified` — show the value, and keep the source available for inspection.

`verification` is per value, not only per café. A verified address does not verify the menu.

## Café

```ts
type Cafe = {
  id: string;
  slug: string;
  name: string;
  nameSourceId: string;
  verification: Verification; // overall label, usually the weakest important field
  neighborhood: string | null; // Makati area label, e.g. Legazpi, when sourced
  address: Sourced<Address> | null;
  location: Sourced<Coordinates> | null;
  hours: Sourced<WeeklyHours> | null;
  amenities: Sourced<Amenity[]> | null;
  priceRange: Sourced<PriceRange> | null;
  menu: MenuItem[];
  photos: Photo[];
  sources: Source[];
};

type Address = {
  lines: string[];
  city: "Makati";
  country: "PH";
};

type Coordinates = {
  latitude: number;  // WGS84
  longitude: number;
};

type PriceRange = 1 | 2 | 3 | 4; // relative, PHP context, only when sourced
```

`name` is required because a café cannot be listed without one. The name still has a source id. Every other factual section is nullable.

Neighborhood labels are geographic filters, not claims about the character of a business. Use a neighborhood only when the address supports it.

### Hours

```ts
type WeeklyHours = {
  periods: {
    day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
    opens: string;  // "HH:mm" in Asia/Manila
    closes: string; // "HH:mm"; may be after midnight
  }[];
};
```

Open or closed is computed only from `hours` when `hours.verification` is `verified`. Fixture hours may be shown as a demonstration schedule and do not produce an open or closed label. Missing, unverified, or community hours are not listed. The model does not store a boolean `isOpen`.

### Menu

```ts
type MenuItem = {
  id: string;
  name: string;
  category: string | null;
  price: {
    amount: number; // PHP
    currency: "PHP";
  } | null;
  sourceId: string;
  verification: Verification;
};
```

An item without a verified price is shown without a price, or hidden, according to the same verification rules. Do not invent a price.

### Photos

```ts
type Photo = {
  id: string;
  url: string;
  alt: string;
  attribution: string;
  license: string;
  sourceId: string;
  verification: Verification;
};
```

A photo without attribution and a license is invalid and must not be rendered.

### Amenities

Allowed values, only when sourced:

`wifi`, `power_outlets`, `outdoor_seating`, `air_conditioning`, `work_friendly`, `food`, `decaf`.

Do not add an amenity because it is typical for cafés.

## Personal collections

These rows are device-local in the prototype. They are not café facts.

```ts
type Favorite = {
  cafeId: string;
  savedAt: string;
};

type BucketItem = {
  cafeId: string;
  addedAt: string;
};

type Visit = {
  id: string;
  cafeId: string;
  visitedAt: string; // when the person says they went
  recordedAt: string;
  method: "self_reported";
};
```

`Visit` has no latitude, longitude, accuracy, or path. `method` has one value so a later proximity confirmation would be a new value and a new product decision, not a silent extra column filled today.

Favorites and bucket items are separate. A café may be in either, both, or neither.

## Location session (not persisted as café data)

The location fix is runtime state. It is not a table in the prototype.

```ts
type LocationFix = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  at: string;
};
```

Do not store a sequence of fixes.

## Identifiers and routes

`id` is stable and opaque. `slug` is for readable URLs and is not the foreign key. Personal rows reference `cafeId`.

The detail route is `/cafes/:id`.

## Future PostGIS shape

Not a migration. Do not create this schema until Phase 7 and a Supabase project exist.

- `cafes`
  - `id uuid` primary key
  - `slug text` unique
  - `name text` not null
  - `neighborhood text` null
  - `address jsonb` null
  - `location geography(Point, 4326)` null
  - `hours jsonb` null
  - `amenities text[]` null
  - `price_range smallint` null
  - provenance columns or a side table for `sources` and per-field verification
- `menu_items` — `cafe_id`, name, category, amount, currency, source, verification
- `photos` — `cafe_id`, url, alt, attribution, license, source, verification
- `sources` — kind, title, url, retrieved_at, license
- `favorites` — `user_id`, `cafe_id`, `saved_at`, unique pair
- `bucket_items` — `user_id`, `cafe_id`, `added_at`, unique pair
- `visits` — `id`, `user_id`, `cafe_id`, `visited_at`, `recorded_at`, `method`

Nearby query, conceptually: `ST_DWithin(location, ST_MakePoint(lng, lat)::geography, radius_meters)` ordered by `ST_Distance`. Cafés with a null `location` are absent from that query. The radius and the origin come from the location session, not from the map viewport.

Row-level security:

- Café, menu, photo, and source rows are readable by the client.
- Inserts and updates to café content are not allowed with the anon key.
- Favorites, bucket items, and visits are readable and writable only where `user_id` is the signed-in user.

The service role key is not a client concern and must not be committed.

## Fixture policy

Phase 2 fixtures must set `verification` to `fixture` and include a source whose kind is `fixture`. They are sample records for the interface. They are not a Makati directory and must not be described as one.

A fixture may leave hours, menu, photos, or amenities null so the empty states can be verified. It must not fill those sections with unsourced realistic detail about a real business.

## Licensing notes

- OpenStreetMap data, if used later, is covered by the Open Database License. The product must attribute OpenStreetMap contributors. Community verification does not expire that duty.
- Photos need their own license. OSM membership is not a photo license.
- There is no approved commercial places vendor. Do not add Google Places fields “temporarily”.
