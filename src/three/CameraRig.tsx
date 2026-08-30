import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { worldState } from '../store/useExperience'

export default function CameraRig() {
  const size = useThree((s) => s.size)
  const camera = useThree((s) => s.camera)

  useFrame((state, dt) => {
    if (worldState.blenderMode) return
    const aspect = size.width / Math.max(1, size.height)
    const targetZ = THREE.MathUtils.clamp(14 * Math.max(1, 1 / aspect) * 0.92, 14, 26)
    const t = state.clock.elapsedTime
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.5, dt)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, worldState.pointerX * 0.7, 3, dt)
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      -worldState.pointerY * 0.4 + Math.sin(t * 0.4) * 0.1,
      3,
      dt,
    )
    camera.lookAt(0, 0, 0)
  })

  return null
}
