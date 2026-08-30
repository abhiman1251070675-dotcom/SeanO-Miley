import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import { rangeOf, worldState } from '../../store/useExperience'

export default function Gloves() {
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)

  const mats = useMemo(() => ({
    leather: new THREE.MeshStandardMaterial({ 
      color: '#151515', 
      metalness: 0.25, 
      roughness: 0.55 
    }),
    pink: new THREE.MeshStandardMaterial({
      color: '#FF3D8A',
      emissive: '#FF3D8A',
      emissiveIntensity: 0.15,
      roughness: 0.5,
    }),
    lime: new THREE.MeshStandardMaterial({
      color: '#C8FF3D',
      emissive: '#C8FF3D',
      emissiveIntensity: 0.15,
      roughness: 0.5,
    }),
    trim: new THREE.MeshStandardMaterial({
      color: '#000000',
      metalness: 0.6,
      roughness: 0.3,
    }),
    inner: new THREE.MeshBasicMaterial({
      color: '#000000',
      side: THREE.DoubleSide
    })
  }), [])

  useFrame((state, dt) => {
    const fit = rangeOf('fitcheck')
    const merch = rangeOf('merch')
    const p = worldState.progress
    const inRange =
      THREE.MathUtils.smoothstep(p, fit.start - 0.04, fit.start + 0.02) *
      (1 - THREE.MathUtils.smoothstep(p, merch.end + 0.02, merch.end + 0.07))
    const t = state.clock.elapsedTime
    const pairs = [
      [left, -1],
      [right, 1],
    ] as const
    for (const [ref, dir] of pairs) {
      const g = ref.current
      if (!g) continue
      g.visible = inRange > 0.01
      g.position.set(dir * 2.9, -1 + Math.sin(t * 0.8 + dir) * 0.25, -4)
      g.rotation.y = THREE.MathUtils.damp(
        g.rotation.y,
        dir * (0.5 + worldState.pointerX * 0.3) + t * 0.15,
        2,
        dt,
      )
      g.scale.setScalar(THREE.MathUtils.lerp(0.001, 0.9, inRange))
    }
  })

  const glove = (cuffMat: THREE.Material, thumbSide: number) => (
    <group rotation={[Math.PI / 8, 0, 0]}>
      
      {/* Hand Core / Palm (Slimmed down to stay inside the pads) */}
      <mesh material={mats.leather} position={[0, 0, 0.1]} scale={[0.48, 0.2, 0.6]}>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>

      {/* Main Knuckle Pad (Flatter and less rounded) */}
      <group position={[0, 0.18, 0.45]} rotation={[0.15, 0, 0]}>
        <RoundedBox args={[1.0, 0.25, 0.4]} radius={0.08} smoothness={4} material={mats.leather} />
        {/* UFC Branding */}
        <Text
          position={[0, 0.13, 0.05]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.2}
          color="#FFF"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf"
          letterSpacing={-0.05}
          material-toneMapped={false}
        >
          UFC
        </Text>
      </group>
      
      {/* Back of Hand Pad (Unified flat smooth block) */}
      <RoundedBox args={[0.95, 0.15, 0.6]} radius={0.06} smoothness={4} material={mats.leather} position={[0, 0.12, -0.15]} rotation={[-0.1, 0, 0]} />

      {/* Exposed Finger Pads curving downward (Slimmer and flatter) */}
      {[-0.34, -0.11, 0.11, 0.34].map((x, i) => (
        <RoundedBox key={i} args={[0.22, 0.15, 0.4]} radius={0.05} smoothness={4} material={mats.leather} position={[x, 0.0, 0.55]} rotation={[0.4, 0, 0]} />
      ))}

      {/* Thumb Architecture (Smaller and tighter) */}
      <group position={[thumbSide * 0.55, -0.05, 0.15]} rotation={[0, thumbSide * 0.3, 0]}>
        <RoundedBox args={[0.2, 0.2, 0.4]} radius={0.06} smoothness={4} material={mats.leather} position={[0, 0, 0]} rotation={[0.1, 0, 0]} />
        <RoundedBox args={[0.15, 0.15, 0.3]} radius={0.05} smoothness={4} material={mats.leather} position={[0, -0.05, 0.25]} rotation={[0.4, 0, 0]} />
      </group>

      {/* Hollow Cuff / Hand Opening (Narrower and scaled down to fit slim glove) */}
      <group position={[0, -0.02, -0.65]}>
        {/* Outer glowing shell */}
        <mesh material={cuffMat} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.32, 0.35, 32, 1, true]} />
        </mesh>
        {/* Inner dark lining */}
        <mesh material={mats.inner} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.34, 0.31, 0.35, 32, 1, true]} />
        </mesh>
        {/* Edge trim to seal the opening lip nicely */}
        <mesh material={cuffMat} position={[0, 0, -0.175]}>
          <torusGeometry args={[0.315, 0.015, 8, 32]} />
        </mesh>
        {/* The deep void to block light from passing all the way through */}
        <mesh material={mats.inner} position={[0, 0, 0.15]}>
          <circleGeometry args={[0.33, 32]} />
        </mesh>
      </group>
      
      {/* Velcro Strap Layer 1 (Base leather wrap) */}
      <RoundedBox args={[0.8, 0.08, 0.32]} radius={0.02} smoothness={2} material={mats.leather} position={[0, 0.15, -0.65]} rotation={[0.1, 0, 0]} />
      
      {/* Velcro Strap Layer 2 (Colored hook-and-loop wrap) */}
      <RoundedBox args={[0.6, 0.04, 0.25]} radius={0.01} smoothness={2} material={cuffMat} position={[thumbSide * -0.1, 0.18, -0.65]} rotation={[0.1, 0, thumbSide * -0.05]} />

      {/* Trim Lines / Branding details */}
      <mesh material={mats.trim} position={[0, 0.35, 0.45]} rotation={[0.15, 0, 0]}>
        <planeGeometry args={[0.3, 0.1]} />
      </mesh>
    </group>
  )

  return (
    <>
      <group ref={left}>{glove(mats.pink, -1)}</group>
      <group ref={right}>{glove(mats.lime, 1)}</group>
    </>
  )
}
