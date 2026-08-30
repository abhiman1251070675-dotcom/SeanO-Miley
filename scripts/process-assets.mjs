import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const UP = join(ROOT, 'assets_upload')
const OUT = join(ROOT, 'public', 'images')
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

const SPEC = [
  { file: 'newim-main.jpg', id: 'hero-portrait', alt: 'Studio portrait of Sean O\'Malley with braids and face tattoos', use: 'Legacy exhibit (main image) + braids cap merch' },
  { file: 'images-11.jpg', id: 'main-poster', alt: 'Duotone pink and purple poster of Sean O\'Malley raising both fists', use: 'Legacy exhibit + merch duotone poster + EndCard collage' },
  { file: 'newsean.jpg', id: 'octagon-arms', alt: 'Sean O\'Malley arms spread wide in the octagon with red braids', use: 'EndCard collage + octagon print merch' },
  { file: 'sean.jpg', id: 'collage', alt: 'Pink and green paint-splash collage of Sean O\'Malley', use: 'Fit Check card + Suga Show tee merch + EndCard collage' },
  { file: 'sean2.webp', id: 'celebrate-alt', alt: 'Sean O\'Malley celebrating in the octagon', use: 'EndCard collage (alt celebration)' },
  { file: 'sean-praying-cutout.png', id: 'praying-cutout', alt: 'Cutout of Sean O\'Malley praying with rainbow braids and UFC gloves', use: 'Hero floating cutout (transparency preserved)' },
  { file: 'images-13b.jpeg', id: 'fight-stance', alt: 'Sean O\'Malley in a fighting stance with red gloves and pink and blue braids', use: 'Fit Check card + EndCard collage' },
  { file: 'images-14.jpg', id: 'teal-portrait', alt: 'Portrait of Sean O\'Malley with teal braids and pink UFC shorts in the octagon', use: 'Podcast portrait + Fit Check card + champ shorts merch' },
  { file: 'f339-poster.jpeg', id: 'walkout-jacket', alt: 'Sean O\'Malley in a hooded UFC walkout jacket under arena lights', use: 'Fit Check card + walkout jacket merch' },
  { file: 'media_1788027923704.png', id: 'pink-zebra', alt: 'Sean O\'Malley in pink zebra suit with USA flags', use: 'Fit Check card' },
  { file: 'media_1788027923724.png', id: 'screaming-chest', alt: 'Sean O\'Malley screaming with pink braids and chest tattoo', use: 'EndCard collage' },
  { file: 'media_1788027923732.png', id: 'screaming-chest-alt', alt: 'Sean O\'Malley screaming (alternate angle)', use: 'EndCard collage' },
  { file: 'media_1788027923733.jpg', id: 'cage-look', alt: 'Sean O\'Malley in the cage looking away', use: 'EndCard collage' },
  { file: 'media_1788027923734.jpg', id: 'close-braids', alt: 'Sean O\'Malley looking down with multi-color braids', use: 'EndCard collage' },
  { file: 'media_1788028500252.jpg', id: 'champion-belt', alt: 'Sean O\'Malley standing in octagon with championship belt', use: 'Fit Check card' },
  { file: 'media_1788028500254.jpg', id: 'rainbow-collage', alt: 'Neon rainbow collage of Sean O\'Malley', use: 'Fit Check card' },
  { file: 'media_1788028500325.jpg', id: 'walkout-belt', alt: 'Sean O\'Malley walking out with championship belt', use: 'Fit Check card' },
  { file: 'media_1788030442790.jpg', id: 'wineland-uppercut', alt: 'Sean O\'Malley landing an uppercut on Eddie Wineland in the octagon', use: 'Fit Check card' },
]

const ALIASES = {}

const EXCLUSIONS = [
  { file: 'images-13a.jpg', reason: 'Visible blood — excluded by all-ages rule (master prompt §5.10). Raw file kept locally, gitignored.' },
  { file: 'images-12.jpg', reason: 'Byte-identical duplicate of images-13a.jpg (itself excluded for visible blood).' },
  { file: 'recording-2026-08-26.mp4', reason: '25 MB video exceeds the ≤3 MB video budget; no ffmpeg on the build machine to transcode to a muted loop. Raw file kept locally, gitignored.' },
]

const files = existsSync(UP) ? readdirSync(UP) : []
const excluded = [...EXCLUSIONS]

// Auto-detect byte-identical duplicates (skipping files already excluded)
const hashes = new Map()
const excludedFiles = new Set(EXCLUSIONS.map((x) => x.file))
for (const f of files) {
  if (excludedFiles.has(f)) continue
  const p = join(UP, f)
  if (!statSync(p).isFile()) continue
  const h = createHash('sha1').update(readFileSync(p)).digest('hex')
  if (hashes.has(h)) {
    excluded.push({ file: f, reason: `byte-identical duplicate of ${hashes.get(h)}` })
  } else {
    hashes.set(h, f)
  }
}

const entries = []
for (const spec of SPEC) {
  const src = join(UP, spec.file)
  if (!existsSync(src)) {
    excluded.push({ file: spec.file, reason: 'not found in assets_upload/' })
    continue
  }
  const meta = await sharp(src).metadata()
  const targetW = Math.min(meta.width ?? 1600, 1600)
  const outName = `${spec.id}.webp`
  const outPath = join(OUT, outName)
  await sharp(src)
    .rotate()
    .resize({ width: targetW, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(outPath)
  const outMeta = await sharp(outPath).metadata()
  const bytes = statSync(outPath).size
  entries.push({
    id: spec.id,
    src: `images/${outName}`,
    w: outMeta.width,
    h: outMeta.height,
    alt: spec.alt,
    use: spec.use,
    srcFile: spec.file,
    bytes,
  })
  for (const alias of ALIASES[spec.id] ?? []) {
    entries.push({
      id: alias,
      src: `images/${outName}`,
      w: outMeta.width,
      h: outMeta.height,
      alt: spec.alt,
      use: spec.use,
      srcFile: spec.file,
      bytes,
    })
  }
  console.log(`✓ ${spec.file} → ${outName} (${outMeta.width}×${outMeta.height}, ${(bytes / 1024).toFixed(0)} KB)`)
}

const ts = `// AUTO-GENERATED by scripts/process-assets.mjs — do not edit by hand.
export interface MediaItem {
  id: string
  src: string
  w: number
  h: number
  alt: string
  credit: 'user'
}

export const MEDIA: MediaItem[] = ${JSON.stringify(
  entries.map(({ id, src, w, h, alt }) => ({ id, src, w, h, alt, credit: 'user' })),
  null,
  2,
)}

export const mediaById = (id: string): MediaItem | undefined => MEDIA.find((m) => m.id === id)
`
writeFileSync(join(ROOT, 'src', 'constants', 'media.generated.ts'), ts)
console.log(`✓ wrote src/constants/media.generated.ts (${entries.length} entries)`)

const rows = entries
  .filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i)
  .map(
    (e) =>
      `| \`${e.srcFile}\` | \`public/images/${e.id}.webp\` | \`${e.id}\` | ${e.use} | ${(e.bytes / 1024).toFixed(0)} KB · ${e.w}×${e.h} |`,
  )
const manifest = `# Asset Manifest — SUGA SHOW

Pipeline: \`sharp\` → WebP q82, max width 1600px, no upscaling, transparency preserved for cutouts.
Run via \`npm run assets\`. Raw originals in \`assets_upload/\` are gitignored per the master prompt.

## User media — intake result (all user-supplied, Sean O'Malley photography)

| Source (assets_upload/) | Optimized | Slot id | Used where | Output |
| --- | --- | --- | --- | --- |
${rows.join('\n')}

## Excluded

${excluded.map((x) => `- \`${x.file}\` — ${x.reason}`).join('\n')}

## Procedural (no download required)

- 3D championship belt, gloves, particles, lighting — pure Three.js/R3F code (see CREDITS.md)
- Merch "flat" product graphics — inline SVG line art
- OG image + apple-touch-icon — generated SVG → sharp (\`npm run og\`)
- Ambience/podcast audio — synthesized at runtime with Web Audio API (no files)

## Videos

None shipped. The single uploaded video was excluded (see above). All cinematics are real-time
WebGL instead — no video assets needed.
`
writeFileSync(join(ROOT, 'docs', 'asset-manifest.md'), manifest)
console.log('✓ wrote docs/asset-manifest.md')
console.log(excluded.length ? `⚠ excluded: ${excluded.map((x) => x.file).join(', ')}` : 'no exclusions')
