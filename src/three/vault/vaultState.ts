import * as THREE from 'three'

/** World-space radius of the card orb before responsive scaling. */
export const ORB_RADIUS = 4.9
/** Card face size in world units (3:4 portrait). */
export const CARD_W = 2.25
export const CARD_H = CARD_W / (3 / 4)
/**
 * Vertical squash. Kept close to 1 on purpose: a strongly flattened orb frames
 * badly in tall viewports, where the camera has to pull back to fit the width and
 * the orb then floats in a sea of empty vertical space.
 */
export const ORB_SQUASH = 0.95
export const VAULT_FOV = 45

/**
 * How far a card reaches past its lattice point in screen space. Cards near the
 * left/right silhouette are seen close to edge-on, so their horizontal reach is a
 * fraction of the card width; vertical reach is always the full half-height,
 * because spinning the orb about Y never foreshortens height.
 */
const CARD_REACH_X = CARD_W * 0.34
const CARD_REACH_Y = CARD_H * 0.52

/**
 * Continuous, per-frame vault state. Deliberately a module-level mutable object
 * rather than zustand — it is written and read inside useFrame every frame, and
 * routing it through React would re-render the whole section 60 times a second.
 * Mirrors the existing `worldState` pattern in store/useExperience.ts.
 */
export const vaultState = {
  /**
   * Monotonic seconds since the section mounted. Deliberately *not*
   * `clock.elapsedTime`: the section flips `frameloop` between 'never' and
   * 'always' as it scrolls in and out of view, and R3F zeroes the clock every
   * time it does, which would snap every idle animation back to its phase 0.
   */
  time: 0,
  /** Orb rotation (radians) and inertial velocity. */
  rotX: 0.1,
  rotY: 0,
  velX: 0,
  velY: 0,
  dragging: false,
  /** Pointer position within the section, -1..1. */
  pointerX: 0,
  pointerY: 0,
  /** Live world transform of the focused card, written by VaultOrb each frame. */
  focusPos: new THREE.Vector3(),
  focusNormal: new THREE.Vector3(0, 0, 1),
  focusUp: new THREE.Vector3(0, 1, 0),
  focusValid: false,
  /** 0 = wide orbit, 1 = fully framed on a card. Drives UI reveal timing. */
  flyProgress: 0,
}

export function resetVaultState() {
  vaultState.time = 0
  vaultState.rotX = 0.1
  vaultState.rotY = 0
  vaultState.velX = 0
  vaultState.velY = 0
  vaultState.dragging = false
  vaultState.focusValid = false
  vaultState.flyProgress = 0
}

/** Shrink the orb on narrow viewports so it still fills the frame on a phone. */
export function orbScaleFor(aspect: number) {
  return THREE.MathUtils.clamp(aspect / 1.6, 0.58, 1)
}

/** Camera distance that fits the whole orb — cards included — on both axes. */
export function orbDistanceFor(aspect: number) {
  const scale = orbScaleFor(aspect)
  const t = Math.tan((VAULT_FOV / 2) * (Math.PI / 180))
  const reachX = (ORB_RADIUS + CARD_REACH_X) * scale
  const reachY = (ORB_RADIUS * ORB_SQUASH + CARD_REACH_Y) * scale
  return Math.max(reachY / t, reachX / (t * Math.max(aspect, 0.01))) * 1.03
}

/**
 * How to frame a single card so it fills a predictable share of the viewport on
 * both axes *and* stays clear of the Fight Passport glass. On wide screens the
 * view slides right so the card lands in the left half and the panel owns the
 * right rail; on portrait the view slides down so the card lifts above the
 * bottom sheet. Fractions below are the share of the half-viewport the card is
 * allowed to occupy, and were solved against the panel's real CSS footprint.
 */
export function focusFrameFor(aspect: number, fov = VAULT_FOV) {
  const scale = orbScaleFor(aspect)
  const t = Math.tan((fov / 2) * (Math.PI / 180))
  const wide = aspect > 1
  // 1.16 matches the focused card's scale-up in HighlightCard.
  const halfH = ((CARD_H * 1.16) / 2) * scale
  const halfW = ((CARD_W * 1.16) / 2) * scale
  const fillH = wide ? 0.72 : 0.38
  const fillW = wide ? 0.42 : 0.9
  const distH = halfH / fillH / t
  const distW = halfW / fillW / (t * Math.max(aspect, 0.01))
  const dist = Math.max(distH, distW)
  const viewHalfH = dist * t
  return {
    dist,
    /** View offset along the card's right vector — moves the card left on screen. */
    shiftX: wide ? viewHalfH * aspect * 0.46 : 0,
    /** View offset along the card's up vector — negative lifts the card on screen. */
    shiftY: wide ? 0 : -viewHalfH * 0.56,
  }
}

/** Evenly distribute n points on a sphere (Fibonacci lattice), poles avoided. */
export function fibonacciSphere(n: number, radius: number, squash: number) {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const out: THREE.Vector3[] = []
  for (let i = 0; i < n; i++) {
    // (i + 0.5) keeps the first and last points off the exact poles, which would
    // make the outward-facing lookAt degenerate against a (0,1,0) up vector.
    const y = 1 - ((i + 0.5) / n) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = i * golden
    out.push(
      new THREE.Vector3(Math.cos(theta) * r * radius, y * radius * squash, Math.sin(theta) * r * radius),
    )
  }
  return out
}
