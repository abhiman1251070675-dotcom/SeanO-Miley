import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import type { Quality } from '../../store/useExperience'
import { createHaloMaterial } from './cardMaterial'
import VaultCamera from './VaultCamera'
import VaultDust from './VaultDust'
import VaultOrb from './VaultOrb'
import { vaultState } from './vaultState'

/**
 * The glowing nucleus the cards orbit. Purely emissive — the cards use a custom
 * shader and are unlit by design, so "lighting" here is bloom-driven rather than
 * a light rig. Fades out as the camera flies inward so it never occludes the
 * focused card.
 */
function VaultCore({ reduced }: { reduced: boolean }) {
  const core = useRef<THREE.Mesh>(null)
  const shell = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const glow = useMemo(() => createHaloMaterial('#FF3D8A'), [])

  useEffect(() => () => glow.material.dispose(), [glow])

  useFrame((_state, dt) => {
    // Shared section clock rather than clock.elapsedTime, which R3F resets every
    // time this canvas toggles frameloop on scroll.
    const t = vaultState.time
    const fade = 1 - vaultState.flyProgress
    const pulse = reduced ? 1 : 0.9 + Math.sin(t * 1.6) * 0.1
    const d = Math.min(dt, 0.05)

    if (core.current) {
      const m = core.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.85 * fade * pulse
      core.current.scale.setScalar(pulse)
    }
    if (shell.current) {
      const m = shell.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.18 * fade
      if (!reduced) {
        shell.current.rotation.y += d * 0.12
        shell.current.rotation.x += d * 0.05
      }
    }
    if (glowRef.current) glow.uniforms.uStrength.value = 0.14 * fade
  })

  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshBasicMaterial color="#FF6FA8" transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.7, 1]} />
        <meshBasicMaterial
          color="#E9C46A"
          wireframe
          transparent
          opacity={0.18}
          toneMapped={false}
        />
      </mesh>
      {/* Wide, soft backdrop bloom so the orb reads against the starfield. */}
      <mesh ref={glowRef} position={[0, 0, -3]} scale={16} raycast={() => null}>
        <planeGeometry args={[1, 1]} />
        <primitive object={glow.material} attach="material" />
      </mesh>
    </group>
  )
}

interface Props {
  focus: number | null
  hover: number | null
  reduced: boolean
  quality: Quality
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
}

export default function VaultScene({ focus, hover, reduced, quality, onHover, onSelect }: Props) {
  const textureWidth = quality === 'high' ? 640 : quality === 'medium' ? 512 : 384

  return (
    <>
      <VaultCore reduced={reduced} />
      <VaultOrb
        focus={focus}
        hover={hover}
        reduced={reduced}
        textureWidth={textureWidth}
        onHover={onHover}
        onSelect={onSelect}
      />
      {/* Declared after <VaultOrb> on purpose: useFrame callbacks run in
          subscription order, so the camera reads the focused card's transform in the
          same frame the orb publishes it. (A non-zero useFrame priority would
          achieve the same but also switches R3F to manual rendering, which would
          blank the canvas.) */}
      <VaultCamera focus={focus} reduced={reduced} />
      <VaultDust count={quality === 'high' ? 170 : quality === 'medium' ? 100 : 55} reduced={reduced} />
      {quality !== 'low' && (
        <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
          <Bloom
            mipmapBlur
            intensity={0.9}
            luminanceThreshold={0.22}
            luminanceSmoothing={0.32}
            radius={0.72}
          />
          <Vignette offset={0.28} darkness={0.62} />
        </EffectComposer>
      )}
    </>
  )
}
