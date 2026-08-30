// Numeric verification of the vault's framing math.
// Hand port of src/three/vault/vaultState.ts — keep in sync if those constants move.
const ORB_RADIUS = 4.9
const CARD_W = 2.25
const CARD_H = CARD_W / (3 / 4)
const ORB_SQUASH = 0.95
const VAULT_FOV = 45
const CARD_REACH_X = CARD_W * 0.34
const CARD_REACH_Y = CARD_H * 0.52
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const t45 = Math.tan((VAULT_FOV / 2) * (Math.PI / 180))

const orbScaleFor = (aspect) => clamp(aspect / 1.6, 0.58, 1)

function orbDistanceFor(aspect) {
  const scale = orbScaleFor(aspect)
  const reachX = (ORB_RADIUS + CARD_REACH_X) * scale
  const reachY = (ORB_RADIUS * ORB_SQUASH + CARD_REACH_Y) * scale
  return Math.max(reachY / t45, reachX / (t45 * Math.max(aspect, 0.01))) * 1.03
}

function focusFrameFor(aspect, fov = VAULT_FOV) {
  const scale = orbScaleFor(aspect)
  const t = Math.tan((fov / 2) * (Math.PI / 180))
  const wide = aspect > 1
  const halfH = ((CARD_H * 1.16) / 2) * scale
  const halfW = ((CARD_W * 1.16) / 2) * scale
  const fillH = wide ? 0.72 : 0.38
  const fillW = wide ? 0.42 : 0.9
  const dist = Math.max(halfH / fillH / t, halfW / fillW / (t * Math.max(aspect, 0.01)))
  const viewHalfH = dist * t
  return { dist, shiftX: wide ? viewHalfH * aspect * 0.46 : 0, shiftY: wide ? 0 : -viewHalfH * 0.56 }
}

function fibonacciSphere(n, radius, squash) {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const out = []
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5) / n) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = i * golden
    out.push([Math.cos(theta) * r * radius, y * radius * squash, Math.sin(theta) * r * radius])
  }
  return out
}

let fails = 0
const ok = (cond, msg) => {
  if (!cond) fails++
  console.log(`${cond ? '  ok  ' : '  FAIL'}  ${msg}`)
}

// ---- 1. Lattice: no poles, no crushing overlap ----
console.log(`\n[1] Fibonacci lattice  n=12 r=${ORB_RADIUS} squash=${ORB_SQUASH}`)
const pts = fibonacciSphere(12, ORB_RADIUS, ORB_SQUASH)
let minD = Infinity
let minHoriz = Infinity
for (let i = 0; i < pts.length; i++) {
  const [x, y, z] = pts[i]
  if (![x, y, z].every(Number.isFinite)) ok(false, `p${i} finite`)
  minHoriz = Math.min(minHoriz, Math.hypot(x, z))
  for (let j = i + 1; j < pts.length; j++) {
    minD = Math.min(minD, Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]))
  }
}
const cardDiag = Math.hypot(CARD_W, CARD_H)
console.log(`  min neighbour distance ${minD.toFixed(2)} · card ${CARD_W}x${CARD_H} diag ${cardDiag.toFixed(2)}`)
ok(minD > CARD_W * 1.15, 'neighbour spacing clears card width')
ok(minHoriz > 0.4, 'no point on/near a pole (outward lookAt stays well defined)')

// ---- 2. Whole orb fits at orbit distance ----
console.log('\n[2] Orbit framing — orb + card corners inside the frustum')
for (const [label, aspect] of [
  ['desktop 1072x828', 1.294],
  ['wide 1600x900', 1.778],
  ['ultrawide 2400x900', 2.667],
  ['tablet 800x900', 0.889],
  ['phone 350x574', 0.61],
  ['phone tall 350x726', 0.482],
]) {
  const scale = orbScaleFor(aspect)
  const dist = orbDistanceFor(aspect)
  const reachX = (ORB_RADIUS + CARD_REACH_X) * scale
  const reachY = (ORB_RADIUS * ORB_SQUASH + CARD_REACH_Y) * scale
  const halfH = dist * t45
  const fillX = reachX / (halfH * aspect)
  const fillY = reachY / halfH
  console.log(
    `  ${label.padEnd(18)} a=${aspect.toFixed(2)} scale=${scale.toFixed(2)} dist=${dist.toFixed(2)}  fillX ${fillX.toFixed(2)} fillY ${fillY.toFixed(2)}`,
  )
  ok(fillX <= 1.0 && fillY <= 1.0, `${label}: nothing clipped`)
  ok(Math.max(fillX, fillY) > 0.6, `${label}: orb still fills its frame (no lost-in-space look)`)
  ok(dist - ORB_RADIUS * scale > 2, `${label}: camera clears the near face of the orb`)
}

// ---- 3. Focused card framing vs the passport glass ----
console.log('\n[3] Focus framing — card visible and clear of the Fight Passport')
for (const [label, aspect, panelNdcLeft, sheetNdcTop] of [
  // panelNdcLeft: NDC x of the passport's left edge  =  1 - 2*(min(30rem,40vw)+2rem)/stageWidth
  ['desktop 1072x828', 1.294, 1 - 2 * ((461 + 32) / 1072), null],
  ['wide 1600x900', 1.778, 1 - 2 * ((480 + 32) / 1600), null],
  ['ultrawide 2400x900', 2.667, 1 - 2 * ((480 + 32) / 2400), null],
  // portrait: sheet is max-h-[38svh] inside a 68svh stage, anchored bottom
  ['phone 350x574', 0.61, null, -1 + 2 * (38 / 68)],
]) {
  const scale = orbScaleFor(aspect)
  const { dist, shiftX, shiftY } = focusFrameFor(aspect)
  const halfH = dist * t45
  const halfW = halfH * aspect
  const cw = ((CARD_W * 1.16) / 2) * scale
  const ch = ((CARD_H * 1.16) / 2) * scale
  const [cx, cy] = [-shiftX, -shiftY]
  const [l, r, b, tp] = [(cx - cw) / halfW, (cx + cw) / halfW, (cy - ch) / halfH, (cy + ch) / halfH]
  console.log(
    `  ${label.padEnd(18)} dist=${dist.toFixed(2)} shift=(${shiftX.toFixed(2)},${shiftY.toFixed(2)})  ndc x[${l.toFixed(2)},${r.toFixed(2)}] y[${b.toFixed(2)},${tp.toFixed(2)}]`,
  )
  ok(l > -1 && r < 1 && b > -1 && tp < 1, `${label}: card fully inside the frame`)
  ok((r - l) * (tp - b) > 0.25, `${label}: card is a hero, not a stamp`)
  ok(dist > 2.5, `${label}: focus distance clears the near plane and halo`)
  if (panelNdcLeft !== null) {
    ok(r < panelNdcLeft - 0.03, `${label}: card clear of the panel (panel edge x=${panelNdcLeft.toFixed(2)})`)
  } else {
    const visible = (tp - Math.max(b, sheetNdcTop)) / (tp - b)
    ok(visible > 0.7, `${label}: ${(visible * 100).toFixed(0)}% of the card sits above the bottom sheet`)
    ok(tp < 0.98, `${label}: card top edge not jammed into the frame edge`)
  }
}

// ---- 4. The fly-in actually flies, and lands outside the orb ----
console.log('\n[4] Fly-in')
for (const [label, aspect] of [['desktop', 1.294], ['wide', 1.778], ['phone ', 0.61]]) {
  const scale = orbScaleFor(aspect)
  const orbit = orbDistanceFor(aspect)
  const focus = focusFrameFor(aspect).dist
  // camera lands along the card's outward normal, so its distance from the orb centre is:
  const camFromCentre = ORB_RADIUS * scale + focus
  console.log(`  ${label}: orbit ${orbit.toFixed(2)} -> card+${focus.toFixed(2)} (camera ${camFromCentre.toFixed(2)} from centre)`)
  ok(focus < orbit - 2, `${label}: focus is meaningfully closer than orbit`)
  ok(camFromCentre > ORB_RADIUS * scale + 1, `${label}: camera ends outside the orb — no cards between it and the target`)
}

// ---- 5. Dust field: no sprite can balloon, wherever the camera goes ----
// Port of src/three/vault/VaultDust.tsx. gl_PointSize = uSize*aSize*dpr*25/depth
// (device px), so CSS px = uSize*aSize*25/depth — independent of dpr. The near
// fade has to beat that 1/depth growth or a mote the camera passes becomes a smear.
console.log('\n[5] Dust field — near-fade beats 1/depth sprite growth')
const D_SIZE = 2.2
const D_ASIZE_MAX = 0.45 + 1.15
const D_OPACITY = 0.62
const D_CLAMP_CSS = 16 // min(gl_PointSize, 16*dpr) => 16 CSS px
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
const dustSizeCss = (d) => Math.min((D_SIZE * D_ASIZE_MAX * 25) / Math.max(d, 0.5), D_CLAMP_CSS)
const dustAlpha = (d) => D_OPACITY * smoothstep(2, 7, d) * (1 - smoothstep(24, 38, d))

// Typical mid-field mote, for scale.
const refD = 12
const refSize = dustSizeCss(refD)
console.log(`  reference: depth ${refD} -> ${refSize.toFixed(1)}px @ alpha ${dustAlpha(refD).toFixed(2)}`)

let worstSize = 0
let worstAt = 0
let worstEffective = 0
for (let d = 0.05; d <= 45; d += 0.05) {
  // "Visible" = alpha the eye can actually register against the dark plate.
  if (dustAlpha(d) > 0.08 && dustSizeCss(d) > worstSize) {
    worstSize = dustSizeCss(d)
    worstAt = d
  }
  worstEffective = Math.max(worstEffective, dustSizeCss(d) * (dustAlpha(d) / D_OPACITY))
}
console.log(`  largest visible mote: ${worstSize.toFixed(1)}px at depth ${worstAt.toFixed(2)}`)
console.log(`  peak size x opacity-share: ${worstEffective.toFixed(1)}px-equivalent`)
ok(worstSize < 4 * refSize, 'no visible mote exceeds 4x the mid-field size')
ok(worstEffective < 3 * refSize, 'peak size-weighted-by-alpha stays in the same league as mid-field')
ok(dustAlpha(1.0) < 0.001, 'anything within 1 unit of the camera is fully faded out')

// And the geometry: the shell surrounds every camera position, so the fade — not
// the distribution — is what has to hold. Confirm the camera really does end up
// inside the shell (i.e. that we cannot rely on distance alone).
for (const [label, aspect] of [['desktop', 1.294], ['wide', 1.778], ['phone ', 0.61]]) {
  const scale = orbScaleFor(aspect)
  const camFocus = ORB_RADIUS * scale + focusFrameFor(aspect).dist
  const camOrbit = orbDistanceFor(aspect)
  const inside = camFocus < 16 && camOrbit < 16
  console.log(`  ${label}: camera radius ${camFocus.toFixed(2)}..${camOrbit.toFixed(2)} vs shell 3.0..16.0${inside ? ' (inside)' : ''}`)
  ok(inside, `${label}: camera sits inside the shell — the fade is load-bearing, as designed`)
}

console.log(`\n${fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
