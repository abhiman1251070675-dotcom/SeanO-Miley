import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Highlight } from '../../constants/highlights'
import { createCardMaterial, createHaloMaterial } from './cardMaterial'
import { CARD_H, CARD_W, vaultState } from './vaultState'

const cardGeometry = new THREE.PlaneGeometry(CARD_W, CARD_H)
const haloGeometry = new THREE.PlaneGeometry(CARD_W * 2.2, CARD_H * 1.8)

const dummy = new THREE.Object3D()
const parentInverse = new THREE.Matrix4()
const camLocal = new THREE.Vector3()

interface Props {
  highlight: Highlight
  index: number
  position: THREE.Vector3
  outward: THREE.Quaternion
  texture: THREE.Texture | null
  hovered: boolean
  focused: boolean
  dimmed: boolean
  reduced: boolean
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
  onReady: (index: number, group: THREE.Group | null) => void
}

export default function HighlightCard({
  highlight,
  index,
  position,
  outward,
  texture,
  hovered,
  focused,
  dimmed,
  reduced,
  onHover,
  onSelect,
  onReady,
}: Props) {
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const uv = useRef(new THREE.Vector2(0.5, 0.5))
  const blend = useRef(0.42)
  const seed = useMemo(() => index * 1.7, [index])

  const card = useMemo(() => createCardMaterial(highlight.accent, CARD_W / CARD_H), [highlight.accent])
  const halo = useMemo(() => createHaloMaterial(highlight.accent), [highlight.accent])
  // A dimmed card is at 0.16 opacity behind the focused one. If it keeps its
  // handlers it stays in R3F's interaction set, so it both swallows the click
  // (switching the passport to a card you can barely see) and suppresses
  // onPointerMissed, which is what dismisses the overlay on a background click.
  const clickable = !dimmed

  useEffect(() => {
    card.uniforms.uMap.value = texture
    // The shader falls back to an accent gradient with no map bound, so the
    // plate is a designed object from the very first frame rather than a black
    // rectangle waiting on its canvas bake.
    card.uniforms.uHasMap.value = texture ? 1 : 0
  }, [card, texture])

  useEffect(() => {
    onReady(index, outer.current)
    return () => onReady(index, null)
  }, [index, onReady])

  // StrictMode's simulated remount runs this cleanup without re-running the
  // useMemo above, so the committed materials are briefly disposed in dev. Three
  // re-initialises a disposed material on its next draw (and the program is a
  // cache hit), so this is harmless — it is not worth restructuring for.
  useEffect(
    () => () => {
      card.material.dispose()
      halo.material.dispose()
    },
    [card, halo],
  )

  useFrame((state, dt) => {
    const g = outer.current
    const i = inner.current
    if (!g || !i) return
    const t = vaultState.time
    const k = reduced ? 1 : 1 - Math.exp(-8 * dt)

    // ---- orientation: blend outward-facing with camera-facing ----
    // Outward alone hides the far side; camera-facing alone flattens the orb.
    // A partial blend keeps every card legible while preserving depth. The
    // focused card locks to pure outward so the camera has a fixed target.
    blend.current += ((focused ? 0 : 0.42) - blend.current) * k
    if (g.parent) {
      parentInverse.copy(g.parent.matrixWorld).invert()
      camLocal.copy(state.camera.position).applyMatrix4(parentInverse)
      dummy.position.copy(position)
      dummy.up.set(0, 1, 0)
      dummy.lookAt(camLocal)
      g.quaternion.copy(outward).slerp(dummy.quaternion, blend.current)
    }

    // ---- hover tilt, scale, idle drift ----
    const tiltY = hovered && !focused ? (uv.current.x - 0.5) * 0.52 : 0
    const tiltX = hovered && !focused ? -(uv.current.y - 0.5) * 0.44 : 0
    i.rotation.y += (tiltY - i.rotation.y) * k
    i.rotation.x += (tiltX - i.rotation.x) * k

    const scale = focused ? 1.16 : hovered ? 1.11 : dimmed ? 0.95 : 1
    i.scale.x += (scale - i.scale.x) * k
    i.scale.y = i.scale.x
    i.scale.z = i.scale.x

    // The focused card settles dead still — the camera is framing it, and a
    // bobbing target would read as a jittery lock-on.
    if (reduced || focused) {
      i.position.z += (0 - i.position.z) * k
      i.position.y += (0 - i.position.y) * k
    } else {
      i.position.z = Math.sin(t * 0.6 + seed) * 0.13
      i.position.y = Math.sin(t * 0.45 + seed * 1.3) * 0.07
    }

    // ---- uniforms ----
    const u = card.uniforms
    u.uTime.value = t
    u.uHover.value += ((hovered ? 1 : 0) - u.uHover.value) * k
    u.uFocus.value += ((focused ? 1 : 0) - u.uFocus.value) * k
    u.uDim.value += ((dimmed ? 1 : 0) - u.uDim.value) * k
    // Develop-in for the photo the moment its canvas lands.
    u.uReveal.value += ((texture ? 1 : 0) - u.uReveal.value) * (reduced ? 1 : 1 - Math.exp(-3.4 * dt))
    u.uOpacity.value += ((dimmed ? 0.16 : 1) - u.uOpacity.value) * (reduced ? 1 : 1 - Math.exp(-5 * dt))
    // Dim cards stop writing depth so they cannot veil the focused card.
    card.material.depthWrite = u.uDim.value < 0.5

    halo.uniforms.uStrength.value +=
      ((hovered ? 0.55 : focused ? 0.7 : 0.12) * (dimmed ? 0.15 : 1) - halo.uniforms.uStrength.value) * k
  })

  const enter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(index)
  }
  const move = (e: ThreeEvent<PointerEvent>) => {
    if (e.uv) uv.current.copy(e.uv)
  }
  const leave = () => onHover(null)

  return (
    <group ref={outer} position={position}>
      <group ref={inner}>
        <mesh geometry={haloGeometry} position={[0, 0, -0.06]} raycast={() => null}>
          <primitive object={halo.material} attach="material" />
        </mesh>
        <mesh
          geometry={cardGeometry}
          onPointerOver={clickable ? enter : undefined}
          onPointerMove={clickable ? move : undefined}
          onPointerOut={clickable ? leave : undefined}
          onClick={
            clickable
              ? (e) => {
                  e.stopPropagation()
                  onSelect(index)
                }
              : undefined
          }
        >
          <primitive object={card.material} attach="material" />
        </mesh>
      </group>
    </group>
  )
}
