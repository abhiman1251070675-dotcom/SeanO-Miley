import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SECTIONS } from '../../constants/scenes'
import { worldState } from '../../store/useExperience'

export default function Atmosphere() {
  const scene = useThree((s) => s.scene)
  const stops = useMemo(() => SECTIONS.map((s) => new THREE.Color(s.bg)), [])
  const current = useMemo(() => new THREE.Color('#131318'), [])

  useEffect(() => {
    scene.background = current
    scene.fog = new THREE.FogExp2('#131318', 0.032)
    return () => {
      scene.background = null
      scene.fog = null
    }
  }, [scene, current])

  useFrame(() => {
    const p = worldState.progress
    const n = stops.length
    const f = p * (n - 1)
    const i = Math.min(n - 2, Math.max(0, Math.floor(f)))
    const a = Math.min(1, Math.max(0, f - i))
    current.copy(stops[i]).lerp(stops[i + 1], a)
    if (scene.fog) (scene.fog as THREE.FogExp2).color.copy(current)
  })

  return null
}
