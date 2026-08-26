# Credits — SUGA SHOW

## The idea

> *"Pitch black baseline, neon pink + lime + iridescent gold, brutalist ultra-wide display with technical mono, VHS glitch + metallic gradients, a 3D cursor-tracked championship belt, scroll-triggered cinematics, a Fit Check drag-carousel, a fight vault timeline, a TimboSugarShow audio-reactive hub and a hover-to-reveal merch grid."* — the user's vision (see `README.md`'s source-of-truth section). This document is the adaptation per master-prompt §1.

The default concept was **LUMEN** (deep-sea dive). That source lives in `HACKATHON_PROMPT.md` / master-prompt §4 and was intentionally not used — the project honours the replacement vision and logs the adaptation in `DECISIONS.md`.

## The user's media (9 usable — 3 excluded, see `docs/asset-manifest.md`)

The five chat attachments plus the Downloads auto-collected set (all as written into `assets_upload/` before processing). Optimised via `npm run assets` (`sharp` → WebP q82, ≤1600 px, transparency kept).

| Slot | Source | Optimized | Used where |
| --- | --- | --- | --- |
| `hero-portrait` | `newim-main.jpg` (Documents — user wrote "newimg is the main image") | `public/images/hero-portrait.webp` | Legacy exhibit, Braids Cap merch |
| `main-poster` | `images-11.jpg` | `public/images/main-poster.webp` | Legacy alt, Duotone Poster merch, EndCard collage |
| `octagon-arms` | `newsean.jpg` | `public/images/octagon-arms.webp` | Octagon print merch + EndCard collage |
| `collage` | `sean.jpg` | `public/images/collage.webp` | Fit Check "Splash World" + Suga Show Tee + EndCard wash |
| `celebrate-alt` | `sean2.webp` | `public/images/celebrate-alt.webp` | EndCard collage |
| `praying-cutout` | `sean-transparent-praying.png` | `public/images/praying-cutout.webp` | Hero floating cutout (alpha preserved) |
| `fight-stance` | `images-13b.jpeg` | `public/images/fight-stance.webp` | Fit Check + EndCard + octagon print alt |
| `teal-portrait` | `images-14.jpg` | `public/images/teal-portrait.webp` | Podcast portrait + Fit Check + Champ Shorts merch |
| `walkout-jacket` | `f339-poster.jpeg` | `public/images/walkout-jacket.webp` | Fit Check "Walkout 24" + walkout jacket merch |

Excluded (logged in the manifest): `images-12.jpg + images-13a.jpg` (same bloodied photo — all-ages rule) and the 25 MB `recording-2026-08-26.mp4`.

All user photos are **user-owned**; Sean O'Malley likeness/records are public sporting facts reproduced in an **unofficial fan concept** (footer disclaimer).

## Procedural / code

- Championship belt (curved strap + plates, inlay + octagon ring, gems with `emissiveIntensity > 2`, `Sparkles`), gloves, particle field, lighting and post — authored with Three.js/r3f/drei, no purchased models.
- OG card (`public/og-image.jpg`) + apple-touch icon — generated SVG → `sharp` (`scripts/generate-og.mjs`).
- Audio ambience — synthesized at runtime with Web Audio (no files).
- Merch "flat" side — inline SVG line art.

## Fonts — OFL

- *Unbounded Variable* (display), *Space Grotesk Variable* (body), *JetBrains Mono Variable* (mono) — via `fontsource` (`@fontsource-variable/*`), all OFL.

## Icons

- `lucide-react` — ISC/MIT.

## Frameworks & libs (all free/open-source — MIT)

- `react@18` + `three@0.170` + `@react-three/fiber + drei + postprocessing` + `postprocessing` + `gsap` + `@gsap/react` + `framer-motion` + `zustand` + `lenis` + `sharp` (asset pipeline) + `playwright` (screenshots) — see `package.json`.

## No paid software, APIs, subscriptions or licensed assets were used.
