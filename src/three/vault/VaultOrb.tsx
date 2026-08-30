import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { HIGHLIGHTS } from '../../constants/highlights'
import { worldState } from '../../store/useExperience'
import HighlightCard from './HighlightCard'
import { buildCardTexture } from './cardTexture'
import { ORB_RADIUS, ORB_SQUASH, fibonacciSphere, orbScaleFor, vaultState } from './vaultState'

const tmpPos = new THREE.Vector3()
const tmpQuat = new THREE.Quaternion()
const tmpScale = new THREE.Vector3()
const dummy = new THREE.Object3D()

interface Props {
  focus: number | null
  hover: number | null
  reduced: boolean
  textureWidth: number
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
}

export default function VaultOrb({
  focus,
  hover,
  reduced,
  textureWidth,
  onHover,
  onSelect,
}: Props) {
  const group = useRef<THREE.Group>(null)
  const cards = useRef<(THREE.Group | null)[]>([])
  const spin = useRef(0)
  const dragDistance = useRef(0)
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  // The orb's scale is damped toward the aspect-derived target every frame, so
  // without a starting value it enters at 1.0 and shrinks over ~1s — on a phone
  // (target 0.58) that first second has the outer cards punching through the near
  // plane. Captured once, so a later resize still animates rather than snapping.
  const initialScale = useRef(orbScaleFor(size.width / Math.max(size.height, 1)))

  const [textures, setTextures] = useState<(THREE.Texture | null)[]>(() =>
    HIGHLIGHTS.map(() => null),
  )

  /** Fixed placement + outward-facing orientation for each card. */
  const layout = useMemo(() => {
    const points = fibonacciSphere(HIGHLIGHTS.length, ORB_RADIUS, ORB_SQUASH)
    return points.map((position) => {
      dummy.position.copy(position)
      dummy.up.set(0, 1, 0)
      dummy.lookAt(position.clone().multiplyScalar(2))
      return { position, outward: dummy.quaternion.clone() }
    })
  }, [])

  // ---- textures: built one at a time so cards fade in as a stagger ----
  // Resolution is decided once per canvas. The device quality tier resolves in an
  // effect one level up, so the first paint would otherwise bake twelve canvases
  // at 640px and immediately re-bake them at 384px; and re-baking later, on a
  // performance downgrade, would blink the whole vault out for no frame-time win.
  const widthRef = useRef(textureWidth)
  widthRef.current = textureWidth

  useEffect(() => {
    let cancelled = false
    const built: THREE.Texture[] = []
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())

    const start = window.setTimeout(() => {
      const width = widthRef.current
      void (async () => {
        for (let i = 0; i < HIGHLIGHTS.length; i++) {
          try {
            const { texture } = await buildCardTexture(HIGHLIGHTS[i], i, width, anisotropy)
            if (cancelled) {
              texture.dispose()
              return
            }
            built.push(texture)
            setTextures((prev) => {
              const next = prev.slice()
              next[i] = texture
              return next
            })
          } catch (err) {
            // One card that fails to paint must not take the other eleven with it.
            if (import.meta.env.DEV) console.warn(`[vault] card ${i} failed to paint`, err)
          }
        }
      })()
    }, 120)

    return () => {
      cancelled = true
      window.clearTimeout(start)
      // Disposal waits a frame: a disposed texture that is still bound to a live
      // uniform is silently re-uploaded on the next draw, which leaks the new
      // GPU allocation instead of freeing the old one.
      const doomed = built.slice()
      requestAnimationFrame(() => doomed.forEach((t) => t.dispose()))
    }
  }, [gl])

  // ---- drag to spin, with inertia ----
  useEffect(() => {
    const el = gl.domElement
    let active = false
    let lastX = 0
    let lastY = 0
    const K = 0.0055

    const down = (e: PointerEvent) => {
      active = true
      vaultState.dragging = true
      dragDistance.current = 0
      lastX = e.clientX
      lastY = e.clientY
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        /* not fatal */
      }
    }
    const move = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      vaultState.pointerX = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1
      vaultState.pointerY = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1
      if (!active) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      dragDistance.current += Math.abs(dx) + Math.abs(dy)
      vaultState.rotY += dx * K
      vaultState.rotX += dy * K * 0.55
      // Approximate angular velocity in rad/s for frame-rate-independent inertia.
      vaultState.velY = THREE.MathUtils.clamp(dx * K * 60, -6, 6)
      vaultState.velX = THREE.MathUtils.clamp(dy * K * 0.55 * 60, -4, 4)
    }
    const up = (e: PointerEvent) => {
      active = false
      vaultState.dragging = false
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        /* not fatal */
      }
    }
    // Parallax has to recentre when the pointer goes away, or the camera keeps the
    // last offset forever — the orb sits permanently off-axis after one mouse-out.
    // Touch pointers get a pointerleave right after pointerup, so this covers both.
    const recentre = () => {
      vaultState.pointerX = 0
      vaultState.pointerY = 0
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('lostpointercapture', up)
    el.addEventListener('pointerleave', recentre)
    el.addEventListener('pointercancel', recentre)
    // If pointer capture failed and the release happens off-canvas, the element
    // never sees pointerup — the drag would stay latched on for the rest of the
    // session, killing auto-spin and spinning the orb on plain mouse moves.
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('lostpointercapture', up)
      el.removeEventListener('pointerleave', recentre)
      el.removeEventListener('pointercancel', recentre)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [gl])

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    // The single clock for the whole section. Clamped per frame so a tab that was
    // backgrounded for a minute resumes instead of jumping every idle animation.
    vaultState.time += d

    const g = group.current
    if (!g) return

    // ---- rotation: auto-spin + inertia + a nudge from page scroll velocity ----
    const wantSpin = focus !== null || hover !== null || vaultState.dragging ? 0 : reduced ? 0 : 0.18
    spin.current += (wantSpin - spin.current) * (1 - Math.exp(-3 * d))

    if (!vaultState.dragging) {
      vaultState.rotY += vaultState.velY * d
      vaultState.rotX += vaultState.velX * d
      const decay = Math.exp(-(focus !== null ? 7 : 3.2) * d)
      vaultState.velY *= decay
      vaultState.velX *= decay
    }
    vaultState.rotY += spin.current * d
    if (!reduced) {
      vaultState.rotY += THREE.MathUtils.clamp(worldState.velocity, -80, 80) * 0.00003
    }
    // Keep the angle bounded over a long session. The wrap is 4π, not 2π, because
    // the breathing tilt below is sin(rotY * 0.5) — period 4π — and wrapping at 2π
    // would flip its sign, popping the whole orb once per revolution.
    if (Math.abs(vaultState.rotY) > Math.PI * 4) vaultState.rotY %= Math.PI * 4

    const clampedX = THREE.MathUtils.clamp(vaultState.rotX, -0.5, 0.5)
    if (clampedX !== vaultState.rotX) {
      vaultState.rotX = clampedX
      vaultState.velX = 0
    }

    g.rotation.y = vaultState.rotY
    g.rotation.x = vaultState.rotX + (reduced ? 0 : Math.sin(vaultState.rotY * 0.5) * 0.03)

    // ---- responsive orb scale ----
    const aspect = size.width / Math.max(size.height, 1)
    const target = orbScaleFor(aspect)
    const s = g.scale.x + (target - g.scale.x) * (1 - Math.exp(-4 * d))
    g.scale.setScalar(s)

    // ---- publish the focused card's live world transform for the camera ----
    const focused = focus !== null ? cards.current[focus] : null
    if (focused) {
      focused.updateWorldMatrix(true, false)
      focused.matrixWorld.decompose(tmpPos, tmpQuat, tmpScale)
      vaultState.focusPos.copy(tmpPos)
      vaultState.focusNormal.set(0, 0, 1).applyQuaternion(tmpQuat).normalize()
      vaultState.focusUp.set(0, 1, 0).applyQuaternion(tmpQuat).normalize()
      vaultState.focusValid = true
    } else {
      vaultState.focusValid = false
    }
  })

  const register = useCallback((index: number, obj: THREE.Group | null) => {
    cards.current[index] = obj
  }, [])

  // A drag that ends on a card must not read as a click.
  const select = useCallback(
    (index: number) => {
      if (dragDistance.current > 10) return
      onSelect(index)
    },
    [onSelect],
  )

  return (
    <group ref={group} scale={initialScale.current}>
      {HIGHLIGHTS.map((h, i) => (
        <HighlightCard
          key={h.id}
          highlight={h}
          index={i}
          position={layout[i].position}
          outward={layout[i].outward}
          texture={textures[i]}
          hovered={hover === i}
          focused={focus === i}
          dimmed={focus !== null && focus !== i}
          reduced={reduced}
          onHover={onHover}
          onSelect={select}
          onReady={register}
        />
      ))}
    </group>
  )
}
