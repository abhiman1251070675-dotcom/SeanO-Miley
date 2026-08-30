# Asset Manifest — SUGA SHOW

Pipeline: `sharp` → WebP q82, max width 1600px, no upscaling, transparency preserved for cutouts.
Run via `npm run assets`. Raw originals in `assets_upload/` are gitignored per the master prompt.

## User media — intake result (all user-supplied, Sean O'Malley photography)

| Source (assets_upload/) | Optimized | Slot id | Used where | Output |
| --- | --- | --- | --- | --- |
| `newim-main.jpg` | `public/images/hero-portrait.webp` | `hero-portrait` | Legacy exhibit (main image) + braids cap merch | 30 KB · 400×500 |
| `images-11.jpg` | `public/images/main-poster.webp` | `main-poster` | Legacy exhibit + merch duotone poster + EndCard collage | 77 KB · 516×387 |
| `newsean.jpg` | `public/images/octagon-arms.webp` | `octagon-arms` | EndCard collage + octagon print merch | 17 KB · 408×234 |
| `sean.jpg` | `public/images/collage.webp` | `collage` | Fit Check card + Suga Show tee merch + EndCard collage | 101 KB · 800×450 |
| `sean2.webp` | `public/images/celebrate-alt.webp` | `celebrate-alt` | EndCard collage (alt celebration) | 16 KB · 408×234 |
| `sean-praying-cutout.png` | `public/images/praying-cutout.webp` | `praying-cutout` | Hero floating cutout (transparency preserved) | 39 KB · 534×707 |
| `images-13b.jpeg` | `public/images/fight-stance.webp` | `fight-stance` | Fit Check card + EndCard collage | 30 KB · 387×516 |
| `images-14.jpg` | `public/images/teal-portrait.webp` | `teal-portrait` | Podcast portrait + Fit Check card + champ shorts merch | 23 KB · 484×634 |
| `f339-poster.jpeg` | `public/images/walkout-jacket.webp` | `walkout-jacket` | Fit Check card + walkout jacket merch | 96 KB · 736×1261 |
| `media_1788027923704.png` | `public/images/pink-zebra.webp` | `pink-zebra` | Fit Check card | 73 KB · 408×612 |
| `media_1788027923724.png` | `public/images/screaming-chest.webp` | `screaming-chest` | EndCard collage | 28 KB · 768×512 |
| `media_1788027923732.png` | `public/images/screaming-chest-alt.webp` | `screaming-chest-alt` | EndCard collage | 17 KB · 500×333 |
| `media_1788027923733.jpg` | `public/images/cage-look.webp` | `cage-look` | EndCard collage | 16 KB · 497×335 |
| `media_1788027923734.jpg` | `public/images/close-braids.webp` | `close-braids` | EndCard collage | 10 KB · 492×320 |
| `media_1788028500252.jpg` | `public/images/champion-belt.webp` | `champion-belt` | Fit Check card | 54 KB · 415×737 |
| `media_1788028500254.jpg` | `public/images/rainbow-collage.webp` | `rainbow-collage` | Fit Check card | 78 KB · 494×619 |
| `media_1788028500325.jpg` | `public/images/walkout-belt.webp` | `walkout-belt` | Fit Check card | 47 KB · 399×501 |
| `media_1788030442790.jpg` | `public/images/wineland-uppercut.webp` | `wineland-uppercut` | Fit Check card | 14 KB · 340×239 |

## Excluded

- `images-13a.jpg` — Visible blood — excluded by all-ages rule (master prompt §5.10). Raw file kept locally, gitignored.
- `images-12.jpg` — Byte-identical duplicate of images-13a.jpg (itself excluded for visible blood).
- `recording-2026-08-26.mp4` — 25 MB video exceeds the ≤3 MB video budget; no ffmpeg on the build machine to transcode to a muted loop. Raw file kept locally, gitignored.

## Procedural (no download required)

- 3D championship belt, gloves, particles, lighting — pure Three.js/R3F code (see CREDITS.md)
- Merch "flat" product graphics — inline SVG line art
- OG image + apple-touch-icon — generated SVG → sharp (`npm run og`)
- Ambience/podcast audio — synthesized at runtime with Web Audio API (no files)

## Videos

None shipped. The single uploaded video was excluded (see above). All cinematics are real-time
WebGL instead — no video assets needed.
