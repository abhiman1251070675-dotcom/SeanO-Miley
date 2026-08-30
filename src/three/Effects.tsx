import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import type { BloomEffect } from 'postprocessing'
import * as THREE from 'three'
import { useExperience, worldState } from '../store/useExperience'

export default function Effects() {
  const quality = useExperience((s: any) => s.quality)
  const bloom = useRef<any>(null)
  const caOffset = useMemo(() => new THREE.Vector2(0.00045, 0.00065), [])

  useFrame(() => {
    if (bloom.current) {
      const target = 0.55 + worldState.progress * 0.8
      bloom.current.intensity = THREE.MathUtils.lerp(bloom.current.intensity, target, 0.05)
    }
  })

  return (
    <EffectComposer multisampling={0}>
      {[
        <Bloom
          key="bloom"
          ref={bloom}
          mipmapBlur
          intensity={0.7}
          luminanceThreshold={0.18}
          luminanceSmoothing={0.3}
          radius={0.75}
        />,
        ...(quality === 'high'
          ? [<ChromaticAberration key="ca" offset={caOffset} radialModulation={false} modulationOffset={0} />]
          : []),
        <Noise key="noise" opacity={0.06} />,
        <Vignette key="vignette" offset={0.22} darkness={0.78} />,
      ]}
    </EffectComposer>
  )
}
