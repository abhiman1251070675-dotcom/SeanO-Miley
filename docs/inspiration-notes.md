# Inspiration — Feel Study

Visited 2026-08-26 before writing any code. JS-heavy pages return sparse text; study combined live fetch of `landonorris.com` + known characteristics of every default site.

## Primary site

**landonorris.com** — vertical "drive": tap-to-lock tape, bold serif + mono detail, long vertical scroll with hard-cut photography (race locations + year captions), marquee "mclaren f1 since 2019", bottom-fixed "Next Race: Shanghai GP" + zero-to-100 loading CTA, helmet Hall of Fame horizontal drag carousel (15+ draggable cards), lo-fi grain, strict pink/lime/gold palette. Feels heavy, collectible, motorsport luxury.

## Defaults (sparse returns — identifying by reputation + available copy)

- **bruno-simon.com** — a drivable little world: the whole page is a toy car. Personality > perfection.
- **lusion.co** — particle craft, 3D storytelling reels, continuous worlds, bloom-lit dark voids.
- **chartogne-taillet.com** — quiet champagne scroll: eased inertia, faint parallax, elegant reveals.
- **activetheory.net** — moody studio site: curtain transitions, sound-led atmosphere, staged loads.
- **unseen.co** — brutal restraint: huge negative space, tiny mono labels, almost-black.

## 10 Feel Rules (binding — re-audited in the hardening pass)

1. **Inertia, not velocity** — `lenis` lerp `≈ 0.09`, `lagSmoothing(0)`. The scroll feels weighted; a flick carries before it settles. _chartogne-taillet_
2. **Reveals lead the eye** — `ScrollTrigger` fires at `start: "top 85%"` and once. Lines arrive before the reader parses them. _lusion + chartogne_
3. **Everything is a little magnetic** — hoverables pull toward the pointer (≈ `0.35 * delta`), `200 ms` spring out, with a quiet tick. _landonorris + bruno-simon_
4. **A cursor with manners** — on `(pointer: fine)` a ring + lime dot follows with blend-difference. Never blocks (44 px hit areas stay real). _landonorris_
5. **Hand-offs are fades of light, not cuts** — background / `FogExp2` / `Bloom` intensity lerp across section ranges. No hard scene cuts. _activetheory_
6. **One world** — a single persistent `<Canvas>` behind DOM. Everything in-WebGL lives in the same coordinate world. _lusion_
7. **Orientation without a menu** — a persistent progress rail + `SECTOR 02/07 · FIGHT VAULT`. You always know where you are. _landonorris + unseen_
8. **Branded, truthful loader** — `useProgress` + a minimum 1.2 s pose. The exit is a curtain-up clip-path, not a fade. _activetheory + landonorris_
9. **Micro-details earn "premium"** — staggered `yPercent: 120 → 0` line reveals, `letter-spacing` settles, `Noise` grain (`opacity 0.06`), `Vignette` (`0.22/0.78`), and a relentless marquee. _unseen + bruno-simon_
10. **Restraint** — at any moment at most two accents (pink / lime / gold) share the frame. Black does the talking. _unseen_

## Best single trick per site (borrowed in the build)

- **landonorris.com** — Hall of Fame drag carousel → our **Fit Check** carousel (drag-to-scroll, momentum, no scrollbar).
- **bruno-simon.com** — make the world playful first → the **belt slow-spin + sparkles** and custom cursor.
- **lusion.co** — bloom as atmosphere → post-FX intensity keyed to scroll depth.
- **chartogne-taillet.com** — inertia as storytelling pace → Lenis + `GSAP.ticker` integration.
- **activetheory.net** — transitions as load design → curtain Loader + section color lerp.
- **unseen.co** — silence and type → brutalist display + technical mono + 67% negative space.
