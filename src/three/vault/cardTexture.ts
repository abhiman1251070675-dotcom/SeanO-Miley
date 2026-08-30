import * as THREE from 'three'
import { mediaById } from '../../constants/media.generated'
import { highlightFight, TAG_LABEL, type Highlight } from '../../constants/highlights'

/** 3:4 portrait cards. Texture height is derived from the quality tier. */
export const CARD_ASPECT = 3 / 4

const BONE = '#F2F0E9'
const COAL = '#0B0B0D'

function absolute(src: string) {
  return new URL(src, document.baseURI).href
}

function loadImage(src: string, cors: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // Required for cross-origin pixels to be readable by WebGL. Without a
    // matching Access-Control-Allow-Origin response header the load is refused,
    // which is exactly the failure we fall back from.
    if (cors) img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`image failed: ${src}`))
    img.src = src
  })
}

/**
 * Try the real remote URL first, then the bundled local photo, then give up and
 * let the caller render type-only art. Never throws.
 */
async function resolveCardImage(h: Highlight): Promise<HTMLImageElement | null> {
  if (h.remoteUrl) {
    try {
      return await loadImage(h.remoteUrl, true)
    } catch {
      if (import.meta.env.DEV) {
        console.warn(
          `[vault] remote texture rejected for "${h.id}" (likely CORS or hotlink protection) — using bundled photo`,
        )
      }
    }
  }
  const local = h.mediaId ? mediaById(h.mediaId) : undefined
  if (local) {
    try {
      return await loadImage(absolute(local.src), false)
    } catch {
      /* fall through to type-only art */
    }
  }
  return null
}

/**
 * Draw text with explicit per-character tracking. Canvas `letterSpacing` is not
 * universally supported, and wide mono tracking is load-bearing in this design.
 */
function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
) {
  let cx = x
  for (const ch of text) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + tracking
  }
  return cx - x - tracking
}

function trackedWidth(ctx: CanvasRenderingContext2D, text: string, tracking: number) {
  let w = 0
  for (const ch of text) w += ctx.measureText(ch).width + tracking
  return Math.max(0, w - tracking)
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, max = 3) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, max)
}

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  focus: [number, number],
) {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const scale = Math.max(w / iw, h / ih)
  const dw = iw * scale
  const dh = ih * scale
  const dx = (w - dw) * focus[0]
  const dy = (h - dh) * focus[1]
  ctx.drawImage(img, dx, dy, dw, dh)
}

/**
 * `roundRect` only landed in Safari 16.4. It is not worth losing an entire card —
 * the call throws and the whole bake rejects — over two 3px corner radii, so
 * older engines get square badges.
 */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const count = Math.floor((w * h) / 900)
  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  for (let i = 0; i < count; i++) {
    const a = Math.random() * amount
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
  }
  ctx.restore()
}

function gradientArt(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stops: [string, string, string],
) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, stops[0])
  g.addColorStop(0.52, stops[1])
  g.addColorStop(1, stops[2])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // Soft chromatic blooms so the flat gradient reads as lit, not printed.
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  for (let i = 0; i < 3; i++) {
    const r = ctx.createRadialGradient(
      w * (0.2 + i * 0.3),
      h * (0.25 + (i % 2) * 0.4),
      0,
      w * (0.2 + i * 0.3),
      h * (0.25 + (i % 2) * 0.4),
      w * 0.55,
    )
    r.addColorStop(0, `${stops[i]}66`)
    r.addColorStop(1, 'transparent')
    ctx.fillStyle = r
    ctx.fillRect(0, 0, w, h)
  }
  ctx.restore()

  // Brutalist scanline overlay to match the site's VHS treatment.
  ctx.save()
  ctx.globalAlpha = 0.16
  ctx.fillStyle = COAL
  for (let y = 0; y < h; y += 6) ctx.fillRect(0, y, w, 2)
  ctx.restore()
}

/**
 * Composite the full card face: art + scrim + typography, baked once into a
 * CanvasTexture. Typography lives in the texture (not 3D text) so it uses the
 * real Unbounded/JetBrains faces with zero extra network requests.
 */
function paintCard(h: Highlight, img: HTMLImageElement | null, index: number, W: number) {
  const H = Math.round(W / CARD_ASPECT)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const s = W / 640 // layout scale, authored at 640px wide
  const pad = 34 * s

  ctx.fillStyle = COAL
  ctx.fillRect(0, 0, W, H)

  if (img) {
    ctx.save()
    try {
      ctx.filter = 'saturate(1.12) contrast(1.06)'
    } catch {
      /* filter unsupported — draw straight */
    }
    coverDraw(ctx, img, W, H, h.focus ?? [0.5, 0.35])
    ctx.restore()

    // Accent wash in the midtones ties nine differently-lit photos together.
    ctx.save()
    ctx.globalCompositeOperation = 'overlay'
    ctx.globalAlpha = 0.22
    ctx.fillStyle = h.accent
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
  } else if (h.gradient) {
    gradientArt(ctx, W, H, h.gradient)
  }

  // Bottom scrim so type always clears the art.
  const scrim = ctx.createLinearGradient(0, H * 0.34, 0, H)
  scrim.addColorStop(0, 'rgba(11,11,13,0)')
  scrim.addColorStop(0.45, 'rgba(11,11,13,0.72)')
  scrim.addColorStop(1, 'rgba(11,11,13,0.97)')
  ctx.fillStyle = scrim
  ctx.fillRect(0, H * 0.34, W, H * 0.66)

  // Top scrim for the index + tag row.
  const top = ctx.createLinearGradient(0, 0, 0, H * 0.22)
  top.addColorStop(0, 'rgba(11,11,13,0.8)')
  top.addColorStop(1, 'rgba(11,11,13,0)')
  ctx.fillStyle = top
  ctx.fillRect(0, 0, W, H * 0.22)

  grain(ctx, W, H, img ? 0.1 : 0.16)

  // ---- index (top-left) ----
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = h.accent
  ctx.font = `700 ${20 * s}px "JetBrains Mono Variable", monospace`
  drawTracked(ctx, String(index + 1).padStart(2, '0'), pad, pad + 18 * s, 2.5 * s)

  // ---- tag badge (top-right) ----
  const label = TAG_LABEL[h.tag]
  ctx.font = `600 ${13 * s}px "JetBrains Mono Variable", monospace`
  const tw = trackedWidth(ctx, label, 3.4 * s)
  const bw = tw + 26 * s
  const bh = 30 * s
  const bx = W - pad - bw
  const by = pad
  ctx.strokeStyle = `${h.accent}99`
  ctx.lineWidth = 1.4 * s
  ctx.fillStyle = 'rgba(11,11,13,0.5)'
  ctx.beginPath()
  roundRectPath(ctx, bx, by, bw, bh, 3 * s)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = h.accent
  drawTracked(ctx, label, bx + 13 * s, by + 20 * s, 3.4 * s)

  // ---- bottom block ----
  const fight = highlightFight(h)
  let y = H - pad

  if (fight) {
    // result chip + method line
    ctx.font = `600 ${13 * s}px "JetBrains Mono Variable", monospace`
    const chip = fight.result === 'NC' ? 'NC' : fight.result === 'W' ? 'WIN' : 'LOSS'
    const chipColor = fight.result === 'W' ? '#C8FF3D' : fight.result === 'L' ? '#FF3D8A' : BONE
    const cw = trackedWidth(ctx, chip, 3 * s) + 22 * s
    ctx.strokeStyle = `${chipColor}88`
    ctx.lineWidth = 1.4 * s
    ctx.beginPath()
    roundRectPath(ctx, pad, y - 22 * s, cw, 28 * s, 3 * s)
    ctx.stroke()
    ctx.fillStyle = chipColor
    drawTracked(ctx, chip, pad + 11 * s, y - 3 * s, 3 * s)

    ctx.fillStyle = 'rgba(242,240,233,0.62)'
    ctx.font = `500 ${13 * s}px "JetBrains Mono Variable", monospace`
    drawTracked(ctx, `R${fight.round} · ${fight.time}`, pad + cw + 14 * s, y - 3 * s, 2.4 * s)
    y -= 46 * s
  } else {
    ctx.fillStyle = 'rgba(242,240,233,0.5)'
    ctx.font = `500 ${13 * s}px "JetBrains Mono Variable", monospace`
    drawTracked(ctx, 'THE SUGA SHOW', pad, y - 3 * s, 3 * s)
    y -= 40 * s
  }

  // ---- title ----
  const titleSize = h.title.length > 16 ? 44 * s : h.title.length > 11 ? 54 * s : 64 * s
  ctx.font = `900 ${titleSize}px "Unbounded Variable", sans-serif`
  ctx.fillStyle = BONE
  const lines = wrap(ctx, h.title.toUpperCase(), W - pad * 2, 3)
  const lh = titleSize * 1.04
  for (let i = lines.length - 1; i >= 0; i--) {
    ctx.fillText(lines[i], pad, y)
    y -= lh
  }

  // ---- kicker + accent rule ----
  y -= 6 * s
  ctx.fillStyle = h.accent
  ctx.font = `600 ${13 * s}px "JetBrains Mono Variable", monospace`
  drawTracked(ctx, h.kicker, pad, y, 3 * s)
  y -= 20 * s
  ctx.fillStyle = h.accent
  ctx.fillRect(pad, y, 54 * s, 2.5 * s)

  return canvas
}

/** Ensure the variable faces are parsed before any text is rasterised. */
let fontsReady: Promise<unknown> | null = null
function ensureFonts() {
  if (!fontsReady) {
    const faces = [
      '900 64px "Unbounded Variable"',
      '600 13px "JetBrains Mono Variable"',
      '700 20px "JetBrains Mono Variable"',
    ]
    fontsReady = Promise.all([
      ...faces.map((f) => document.fonts.load(f).catch(() => null)),
      document.fonts.ready,
    ]).catch(() => null)
  }
  return fontsReady
}

export interface CardTexture {
  texture: THREE.CanvasTexture
  hasPhoto: boolean
}

export async function buildCardTexture(
  h: Highlight,
  index: number,
  width: number,
  anisotropy: number,
): Promise<CardTexture> {
  const [img] = await Promise.all([resolveCardImage(h), ensureFonts()])
  const canvas = paintCard(h, img, index, width)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = anisotropy
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.needsUpdate = true
  return { texture, hasPhoto: Boolean(img) }
}
