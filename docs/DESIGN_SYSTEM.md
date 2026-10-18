# Design system

Temporary identifier: `cafe-finder-prototype`. The shell in `src/index.css` uses these tokens. This document is not a component library or a brand identity. The exploration screen is a map with a list sheet when `VITE_MAP_STYLE_URL` is set. Without that URL, the map area says the style is not configured.

The product has no name and no logo. Do not add a wordmark, monogram, or icon that pretends to be one. Screen titles describe the task: “Cafés”, “Saved”, “Visits”, or the café’s own name.

## Direction

Premium, minimalist, and editorial. The screen should feel like a well-printed city guide: a lot of quiet space, a serif for names, a small amount of color, and photography only when it is actually of the place.

Avoid a generic startup palette, coffee-brown decoration, and map chrome that competes with the places.

## Type

- **Names and titles:** [Fraunces](https://fonts.google.com/specimen/Fraunces), a variable serif under the SIL Open Font License. Use it for café names and page titles.
- **Interface:** [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3), also OFL. Use it for search, filters, meta text, and buttons.

Keep the scale short.

| Role | Face | Size | Weight |
| --- | --- | --- | --- |
| Café name | Fraunces | 28px | 560 |
| Page title | Fraunces | 22px | 560 |
| Section label | Source Sans 3 | 13px | 600, small caps or letterspaced |
| Body | Source Sans 3 | 16px | 400 |
| Meta | Source Sans 3 | 14px | 400 |

Line length on detail pages stays near 36rem. Do not justify text.

## Color

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#f6f3ee` | Page background |
| `paper-raised` | `#fffcf8` | Cards and the bottom sheet |
| `ink` | `#1c1917` | Primary text |
| `ink-muted` | `#5c564e` | Meta text, not-listed notes |
| `line` | `#e4ddd4` | Hairline borders |
| `oxide` | `#8c4a3a` | One accent: selected marker, focus, a single text link |

`oxide` is rare. It is not a fill for large buttons or headers. Primary actions are ink on paper, or paper on ink.

Map land should be desaturated and close to `paper`, with roads quieter than café markers. Water and parks stay subdued. The base map must not use a bright default style if that style fights the page.

Contrast for body text on `paper` must meet WCAG AA. `ink-muted` on `paper` must be checked before it is used for anything the person must read. Do not put `oxide` on `paper` for small text unless the contrast ratio passes.

## Layout

Mobile first. The exploration screen is one surface: a map, with a bottom sheet of results over it. The sheet peeks, expands, and can collapse. The list is not a separate mode the person must discover.

Desktop may place the sheet beside the map. Do not design a different product for desktop.

Safe areas and the home indicator stay clear of the sheet controls. Tap targets are at least 44px. The location control sits where a thumb can reach it, above the sheet peek, and it must not cover attribution.

## Map chrome

- Markers are small and quiet. The selected marker is the oxide accent.
- The user marker is distinct from café markers and includes an accuracy treatment when the fix is coarse.
- Controls: recenter, and the existing MapLibre attribution. Do not add zoom buttons on mobile unless testing shows they are needed.
- Attribution remains visible. Do not crop it, restyle it into unreadability, or hide it behind the sheet.

## Components to build later

These names are the implementation vocabulary. The exploration screen now includes them.

- `AppBar` — task title only, no logo
- `SearchField`
- `FilterBar` — neighborhood and amenity
- `CafeCard` — name, neighborhood, distance when a fix exists, fixture or not-listed cues
- `BottomSheet`
- `MapCanvas`
- `LocationButton`
- `DetailSection` — a labeled block that can render content or “Not listed”
- `EmptyState`
- `VerificationNote` — fixture, community source, or not listed

## Empty, loading, and denied states

Write these in plain sentences.

- Loading the catalog: “Loading cafés.”
- No matches: “No cafés match these filters.”
- A missing section: “Not listed.”
- Location still idle: “Use your location to see what is nearby.”
- Location denied: “Location is off. You can still search and browse the map.”
- Location unavailable: “Your location could not be read.”
- Map not configured: “The map style is not configured.”
- Saved items, local only: “Saved on this device only.”

Do not use jokes, fake café names, or illustration characters in these states.

## Photography

Show a photo only when the café record includes a URL, alt text, attribution, and a license. If it does not, the card is typographic. Do not insert stock photography, a generated image, or a generic cup.

## Motion

Transitions stay under 200ms. The sheet may move with the finger. Do not bounce. Respect `prefers-reduced-motion`.

## Accessibility

- Visible focus in `oxide` or `ink`, never removed.
- The map is not the only way to reach a café. The list and the detail route work without it.
- Icon-only controls have accessible names, including the location control.
- Color is not the only signal for selection. The selected card is also indicated in text or a border.
- Hours, prices, and distances are text, not only marks on the map.

## What not to add

- A logo, favicon illustration, or brand name
- A second accent color
- Dark theme, until the light editorial system is implemented and reviewed
- Decorative patterns, stamps, or coffee iconography used as a brand
