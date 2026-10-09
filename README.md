# Dream Universe

Dream Universe is the third stage of the Dream family: a social destination for exploring extraordinary virtual worlds together. This GitHub Pages site is a working discovery interface and concept-world preview, not a deployed multiplayer or VR engine.

## What works

- Search six imagined destinations by name, category, atmosphere, and description.
- Filter by Wonder, Nature, Music, and Stories.
- Open illustrated world previews and pan across the scene artwork with a keyboard-accessible control.
- Save and unsave favourite worlds. Preferences stay in this browser using local storage; a restricted browser falls back to memory for the visit.
- Plan a multi-world journey, select destinations, and copy a shareable invitation URL. Visitors to the URL see the same itinerary and previews.
- Open world deep links, use browser Back, and close native dialogs with Escape.

Shared routes are invitations to explore concept previews. They do not create live rooms, accounts, messages, multiplayer presence, VR sessions, or reservations. No live-user counts or fictional community activity are presented. Film and music are experiences within the social universe rather than the primary navigation.

## Source

- `index.html`: responsive social-platform shell, world directory, community planning, and original Dream branding.
- `styles.css`: parchment-and-ink application layout.
- `app.js`: dependency-free discovery, browser-local favourites, world dialogs, and itinerary links.
- `interactions.css`: world preview and journey planner styling.
- `CNAME`: `dreamuniverse.one`.
- `.nojekyll`: direct static serving.

The original `assets/dream-unity-portals-refined.webp` and `assets/parchment-texture.svg` remain unchanged. Dream Unity and Dream University continue to be linked in the progression navigation, including on mobile.

## Artwork provenance

Created with the built-in imagegen tool for this website; WebP conversion only, no crops or colour alterations. All three are 1672 × 941 pixels. They depict imagined environments, not existing playable worlds.

| Asset | Prompt direction |
|---|---|
| `assets/world-threshold.webp` | Three travellers exploring together through an immense celestial ring arch toward floating terraced garden cities and luminous rivers of mist. |
| `assets/world-observatory.webp` | Shared exploration of an ivory-stone observatory above clouds, enormous engraved bronze orbital rings and a moonlit celestial sky. |
| `assets/world-wilds.webp` | Three friends overlooking a vast botanical canyon, circular ruins, hanging gardens and a waterfall pouring through a monumental ring. |

Shared art direction: dimensional cinematic concept realism, intricate engraved details, restrained parchment ivory, charcoal, antique gold, and muted olive. No text, interface, watermarks, or modern headset closeups. The additional Tidal Sanctuary, Resonance Hall, and Storykeepers' Theatre concepts reuse the closest scene illustrations as clearly labelled previews.

## Deployment

GitHub Pages publishes `main` from `/(root)` at https://dreamuniverse.one/. Keep the root `CNAME` file in future changes. This redesign does not alter DNS, email, or GitHub Pages configuration.

The website uses no build process, external JavaScript dependencies, analytics, or third-party font requests. Local-storage key: `dream-universe-explorer-v1`. Invitation URLs contain only the selected public world identifiers; no personal profile data is sent.
