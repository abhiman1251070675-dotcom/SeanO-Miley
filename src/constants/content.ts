export interface Fight {
  date: string
  event: string
  opponent: string
  result: 'W' | 'L' | 'NC'
  method: string
  round: string
  time: string
  note: string
  strikes: { landed: number; absorbed: number; accuracy: number }
}

export const FIGHTS: Fight[] = [
  { date: '2018-03-03', event: 'UFC 222', opponent: 'André Soukhamthath', result: 'W', method: 'DECISION (UNAN)', round: '3', time: '5:00', note: 'Hype train leaves the station.', strikes: { landed: 78, absorbed: 61, accuracy: 54 } },
  { date: '2020-03-07', event: 'UFC 248', opponent: 'José Quinónez', result: 'W', method: 'TKO (BODY KICK)', round: '1', time: '2:02', note: 'Body shot ends it. First UFC finish.', strikes: { landed: 31, absorbed: 8, accuracy: 61 } },
  { date: '2020-06-06', event: 'UFC 250', opponent: 'Eddie Wineland', result: 'W', method: 'KO (UPPERCUT)', round: '1', time: '1:54', note: 'The uppercut heard around the world.', strikes: { landed: 24, absorbed: 6, accuracy: 63 } },
  { date: '2020-08-15', event: 'UFC 252', opponent: 'Marlon "Chito" Vera', result: 'L', method: 'TKO (LEG INJURY)', round: '1', time: '3:26', note: 'Leg gives out. The adversity arc begins.', strikes: { landed: 18, absorbed: 14, accuracy: 44 } },
  { date: '2021-03-27', event: 'UFC 260', opponent: 'Thomas Almeida', result: 'W', method: 'KO (PUNCH)', round: '3', time: '1:07', note: 'Third-round lightning.', strikes: { landed: 74, absorbed: 39, accuracy: 51 } },
  { date: '2021-07-10', event: 'UFC 264', opponent: 'Kris Moutinho', result: 'W', method: 'TKO (PUNCHES)', round: '3', time: '2:02', note: 'Full send for seven straight minutes.', strikes: { landed: 138, absorbed: 92, accuracy: 57 } },
  { date: '2021-12-11', event: 'UFC 269', opponent: 'Raulian Paiva', result: 'W', method: 'KO (LEFT HOOK)', round: '1', time: '4:42', note: 'Left hook. Lights out.', strikes: { landed: 41, absorbed: 12, accuracy: 58 } },
  { date: '2022-07-02', event: 'UFC 276', opponent: 'Pedro Munhoz', result: 'NC', method: 'ACCIDENTAL EYE POKE', round: '2', time: '3:09', note: 'Unfinished business.', strikes: { landed: 33, absorbed: 21, accuracy: 47 } },
  { date: '2022-10-22', event: 'UFC 280', opponent: 'Petr Yan', result: 'W', method: 'DECISION (SPLIT)', round: '3', time: '5:00', note: 'Instant classic against the division\'s best.', strikes: { landed: 126, absorbed: 83, accuracy: 49 } },
  { date: '2023-08-19', event: 'UFC 292', opponent: 'Aljamain Sterling', result: 'W', method: 'KO (UPPERCUT)', round: '2', time: '0:51', note: 'AND NEW. Uppercut. History in Boston.', strikes: { landed: 110, absorbed: 16, accuracy: 61 } },
  { date: '2024-03-09', event: 'UFC 299', opponent: 'Marlon "Chito" Vera', result: 'W', method: 'DECISION (UNAN)', round: '5', time: '5:00', note: 'Revenge served clean over five rounds.', strikes: { landed: 178, absorbed: 96, accuracy: 52 } },
  { date: '2024-09-14', event: 'UFC 306', opponent: 'Merab Dvalishvili', result: 'L', method: 'DECISION (UNAN)', round: '5', time: '5:00', note: 'The Machine\'s night. The climb continues.', strikes: { landed: 121, absorbed: 178, accuracy: 46 } },
]

export const TICKER_ITEMS = [
  '18-2-0 PRO',
  '12 KO / TKO',
  'UFC BANTAMWEIGHT CHAMPION 2023–2024',
  'UFC 292 · KO · STERLING',
  'UFC 280 · SD · YAN',
  'UFC 299 · UD · VERA',
  'HELENA, MONTANA',
  'SOUTHPAW',
  'THE SUGA SHOW',
  'TIMBOSUGARSHOW',
]

export interface Fit {
  index: string
  name: string
  meta: string
  mediaId?: string
  gradient?: string
  accent: string
}

export const FITS: Fit[] = [
  { index: '01', name: 'RAINBOW ROAD', meta: 'BRAIDS · SIGNATURE LOOK', mediaId: 'rainbow-collage', accent: '#C8FF3D' },
  { index: '02', name: 'PINK PANTHER', meta: 'RED GLOVES · FIGHT NIGHT', mediaId: 'fight-stance', accent: '#FF3D8A' },
  { index: '03', name: 'TEAL BOMB', meta: 'UFC 299 KIT · PINK SHORTS', mediaId: 'teal-portrait', accent: '#4CC9F0' },
  { index: '04', name: 'GOLDEN CHILD', meta: 'CHAMPION 2023', mediaId: 'champion-belt', accent: '#E9C46A' },
  { index: '05', name: 'WALKOUT 24', meta: 'VENUM KIT · ARENA LIGHTS', mediaId: 'walkout-jacket', accent: '#4CC9F0' },
  { index: '06', name: 'SPLASH WORLD', meta: 'PRESS SHOOT · COLLAGE', mediaId: 'collage', accent: '#FF3D8A' },
  // No photo for this one: it referenced a 'clasped-vertical' asset that was never
  // generated, and with neither mediaId nor gradient the card rendered as an empty
  // outline. Treated as a colour plate, like 01 and 04.
  { index: '07', name: 'PINK ZEBRA', meta: 'PRESS CONFERENCE · USA FLAGS', mediaId: 'pink-zebra', gradient: 'linear-gradient(150deg, #4CC9F0 0%, #4361EE 48%, #3A0CA3 100%)', accent: '#4CC9F0' },
]

export interface Product {
  name: string
  price: string
  tag: string
  mediaId?: string
  glyph: 'tee' | 'cap' | 'shorts' | 'jacket' | 'poster' | 'print'
  accent: string
}

export const PRODUCTS: Product[] = [
  { name: 'SUGA SHOW TEE', price: '$40', tag: 'HEAVY COTTON · BOXY', mediaId: 'collage', glyph: 'tee', accent: '#FF3D8A' },
  { name: 'CHAMP SHORTS', price: '$55', tag: 'SPLIT SIDE · FIGHT CUT', mediaId: 'teal-portrait', glyph: 'shorts', accent: '#C8FF3D' },
  { name: 'WALKOUT JACKET', price: '$180', tag: 'SATIN · EMBROIDERED', mediaId: 'walkout-jacket', glyph: 'jacket', accent: '#4CC9F0' },
  { name: 'DUOTONE POSTER', price: '$25', tag: 'A2 · GLOSS', mediaId: 'main-poster', glyph: 'poster', accent: '#B5179E' },
  { name: 'BRAIDS CAP', price: '$35', tag: 'SNAPBACK · 3D PUFF', mediaId: 'hero-portrait', glyph: 'cap', accent: '#E9C46A' },
  { name: 'OCTAGON PRINT', price: '$30', tag: '16×20 · MATTE', mediaId: 'octagon-arms', glyph: 'print', accent: '#FF3D8A' },
]

export const PODCAST_EPISODES = [
  { ep: 'EP 142', title: 'AND NEW — UFC 292 REACTION', duration: '62:14' },
  { ep: 'EP 118', title: 'SUGA VS YAN — THE BREAKDOWN', duration: '58:03' },
  { ep: 'EP 097', title: 'RAINBOW BRAIDS ORIGIN STORY', duration: '49:41' },
]

export const SOCIALS = [
  { label: 'Instagram', handle: '@sugaseanmma', href: 'https://www.instagram.com/sugaseanmma' },
  { label: 'X', handle: '@SugaSeanMMA', href: 'https://x.com/SugaSeanMMA' },
  { label: 'YouTube', handle: 'Sean O\'Malley', href: 'https://www.youtube.com/results?search_query=sean+omalley' },
]

export const PODCAST_LINKS = [
  { label: 'Twitch', href: 'https://www.twitch.tv/timbosugarshow' },
  { label: 'YouTube', href: 'https://www.youtube.com/results?search_query=timbosugarshow' },
]

const BASE_FIGHT_DATE = new Date('2026-12-12T03:00:00Z').getTime()

export function nextFightTs(): number {
  let t = BASE_FIGHT_DATE
  const now = Date.now()
  while (t <= now) t += 1000 * 60 * 60 * 24 * 112
  return t
}
