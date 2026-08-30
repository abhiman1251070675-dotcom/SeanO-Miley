import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useExperience } from '../store/useExperience'
import { QUALITY_TIERS } from '../constants/scenes'
import CameraRig from './CameraRig'
import Effects from './Effects'
import Atmosphere from './environment/Atmosphere'
import ParticleField from './environment/ParticleField'
import Lighting from './environment/Lighting'
import EnvMap from './environment/EnvMap'
import Belt from './props/Belt'
import Gloves from './props/Gloves'

export default function Experience({ paused }: { paused: boolean }) {
  const quality = useExperience((s) => s.quality)
  const setQuality = useExperience((s) => s.setQuality)
  const tier = QUALITY_TIERS[quality]

  return (
    <Canvas
      eventSource={document.getElementById('root')!}
      eventPrefix="client"
      frameloop={paused ? 'never' : 'always'}
      dpr={tier.dpr}
      camera={{ fov: 42, near: 0.1, far: 90, position: [0, 0, 14] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Suspense fallback={null}>
        <PerformanceMonitor
          onDecline={() => {
            if (quality === 'high') setQuality('medium')
            else if (quality === 'medium') setQuality('low')
          }}
        />
        <EnvMap />
        <CameraRig />
        <Lighting />
        <Atmosphere />
        <ParticleField />
        <Belt />
        <Gloves />
        <Effects />
      </Suspense>
    </Canvas>
  )
}
