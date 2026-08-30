import { FIGHTS, type Fight } from './content'

export type HighlightTag = 'TITLE' | 'KO' | 'WAR' | 'CULTURE' | 'SCAR'

export interface Highlight {
  /** Stable slug — used for texture cache keys and deep links. */
  id: string
  /** Big display line on the card face + passport headline. */
  title: string
  /** Small mono line above the title. */
  kicker: string
  tag: HighlightTag
  /** Passport body copy. Written as concept-site narration, not reported fact. */
  story: string
  /** Neon accent driving the border, halo, bloom and passport chrome. */
  accent: string
  /** Index into FIGHTS — single source of truth for date/method/stats. */
  fightIndex?: number
  /** Bundled, pre-optimised local photo id from media.generated.ts. */
  mediaId?: string
  /**
   * Optional real, absolute web URL — tried FIRST when building the card texture.
   *
   * Two hard requirements for a remote URL to survive as a WebGL texture:
   *   1. the host must send `Access-Control-Allow-Origin` (we request
   *      `crossOrigin="anonymous"`; without the header the GPU upload is refused)
   *   2. the host must not hotlink-protect the file
   *
   * Wikimedia (`upload.wikimedia.org`) satisfies both. Getty / Zuffa / Imagn do
   * not, and their fight imagery is rights-managed besides. Any failure — CORS,
   * 403, 404, offline — falls back silently to `mediaId` in cardTexture.ts, so a
   * dead URL degrades to the bundled photo instead of a black card.
   */
  remoteUrl?: string
  /** Type-only card art when there is no photograph for the moment. */
  gradient?: [string, string, string]
  /** Cover-crop focal point, 0..1 in image space. Defaults to centre-top. */
  focus?: [number, number]
}

const PINK = '#FF3D8A'
const LIME = '#C8FF3D'
const GOLD = '#E9C46A'
const CYAN = '#4CC9F0'
const VIOLET = '#B5179E'

/**
 * Twelve moments, distributed on a Fibonacci sphere in the Highlight Vault.
 * Nine carry a real bundled photograph; three are typographic cards for moments
 * we have no usable photo of (deliberate, and consistent with the Fit Check
 * section's gradient-card pattern).
 */
export const HIGHLIGHTS: Highlight[] = [
  {
    id: 'and-new',
    title: 'AND NEW',
    kicker: 'UFC 292 · TD GARDEN · BOSTON',
    tag: 'TITLE',
    story:
      'Round two, fifty-one seconds. The right hand lands on the counter, the belt changes hands, and the arena stops pretending it saw it coming.',
    accent: PINK,
    fightIndex: 9,
    mediaId: 'celebrate-alt',
    focus: [0.5, 0.4],
  },
  {
    id: 'the-uppercut',
    title: 'THE UPPERCUT',
    kicker: 'UFC 250 · WINELAND',
    tag: 'KO',
    story:
      'One minute fifty-four. A single uppercut travels about eight inches and buys a career’s worth of highlight reel.',
    accent: LIME,
    fightIndex: 2,
    mediaId: 'wineland-uppercut',
    focus: [0.5, 0.42],
  },
  {
    id: 'revenge-clean',
    title: 'REVENGE, CLEAN',
    kicker: 'UFC 299 · VERA II',
    tag: 'TITLE',
    story:
      'Twenty-five minutes to settle a four-year-old debt. No drama, no shortcut — just five rounds of arithmetic in his favour.',
    accent: GOLD,
    fightIndex: 10,
    mediaId: 'octagon-arms',
    focus: [0.5, 0.45],
  },
  {
    id: 'instant-classic',
    title: 'INSTANT CLASSIC',
    kicker: 'UFC 280 · YAN',
    tag: 'WAR',
    story:
      'The split decision people still argue about. Fifteen minutes against the division’s technician, and the hype stopped being hype.',
    accent: PINK,
    fightIndex: 8,
    mediaId: 'fight-stance',
    focus: [0.5, 0.35],
  },
  {
    id: 'full-send',
    title: 'FULL SEND',
    kicker: 'UFC 264 · MOUTINHO',
    tag: 'WAR',
    story:
      'Seven straight minutes of forward pressure in front of a Vegas crowd that never sat down. The stoppage arrived late and nobody minded.',
    accent: LIME,
    fightIndex: 5,
    mediaId: 'collage',
    focus: [0.5, 0.5],
  },
  {
    id: 'lights-out',
    title: 'LIGHTS OUT',
    kicker: 'UFC 269 · PAIVA',
    tag: 'KO',
    story:
      'Four minutes forty-two of patience, then a left hook thrown like it was rehearsed. It was.',
    accent: CYAN,
    fightIndex: 6,
    mediaId: 'teal-portrait',
    focus: [0.5, 0.3],
  },
  {
    id: 'third-round-lightning',
    title: 'THIRD-ROUND LIGHTNING',
    kicker: 'UFC 260 · ALMEIDA',
    tag: 'KO',
    story:
      'Two rounds of reading the room, then one minute seven into the third the read pays out all at once.',
    accent: GOLD,
    fightIndex: 4,
    mediaId: 'hero-portrait',
    focus: [0.5, 0.32],
  },
  {
    id: 'the-walkout',
    title: 'THE WALKOUT',
    kicker: 'ARENA LIGHTS · VENUM KIT',
    tag: 'CULTURE',
    story:
      'The fight starts before the cage door shuts. Hood up, arena black, forty thousand phone lights doing the lighting design.',
    accent: CYAN,
    mediaId: 'walkout-jacket',
    focus: [0.5, 0.3],
  },
  {
    id: 'the-ritual',
    title: 'THE RITUAL',
    kicker: 'PRE-FIGHT · CENTRE CAGE',
    tag: 'CULTURE',
    story:
      'Rainbow braids, gloves taped, head down. The loudest fighter on the card takes his last quiet moment on purpose.',
    accent: GOLD,
    mediaId: 'praying-cutout',
    focus: [0.5, 0.45],
  },
  {
    id: 'rainbow-road',
    title: 'RAINBOW ROAD',
    kicker: 'THE BRAIDS · SIGNATURE LOOK',
    tag: 'CULTURE',
    story:
      'Pink, teal, lime, gold — a new colourway per camp. Half fashion statement, half psychological warfare, entirely on brand.',
    accent: VIOLET,
    mediaId: 'close-braids',
    focus: [0.5, 0.5],
  },
  {
    id: 'the-adversity-arc',
    title: 'THE ADVERSITY ARC',
    kicker: 'UFC 252 · VERA I',
    tag: 'SCAR',
    story:
      'The leg gives out in round one and the internet writes the obituary early. Every good arc needs the part where it stops working.',
    accent: PINK,
    fightIndex: 3,
    mediaId: 'screaming-chest',
    focus: [0.5, 0.4],
  },
  {
    id: 'the-machines-night',
    title: "THE MACHINE'S NIGHT",
    kicker: 'UFC 306 · DVALISHVILI',
    tag: 'SCAR',
    story:
      'Twenty-five rounds’ worth of pressure inside five, under the Sphere’s lights. The belt leaves, the climb resets, the show goes on.',
    accent: '#F2F0E9',
    fightIndex: 11,
    mediaId: 'cage-look',
    focus: [0.5, 0.45],
  },
]

/** Resolve the linked fight record, if this highlight maps to one. */
export function highlightFight(h: Highlight): Fight | null {
  return h.fightIndex !== undefined ? (FIGHTS[h.fightIndex] ?? null) : null
}

export const TAG_LABEL: Record<HighlightTag, string> = {
  TITLE: 'TITLE FIGHT',
  KO: 'KNOCKOUT',
  WAR: 'FIVE-ALARM WAR',
  CULTURE: 'THE CULTURE',
  SCAR: 'THE SCAR',
}
