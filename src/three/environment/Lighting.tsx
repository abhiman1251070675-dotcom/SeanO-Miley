import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { worldState } from '../../store/useExperience'

export default function Lighting() {
  const key = useRef<THREE.DirectionalLight>(null)

  useFrame((_, dt) => {
    if (!key.current) return
    key.current.position.x = THREE.MathUtils.damp(
      key.current.position.x,
      4 + worldState.pointerX * 2.5,
      3,
      dt,
    )
    key.current.position.y = THREE.MathUtils.damp(
      key.current.position.y,
      6 - worldState.pointerY * 2,
      3,
      dt,
    )
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight ref={key} position={[4, 6, 6]} intensity={2.2} color="#FFF4E0" />
      <directionalLight position={[-5, -2, -6]} intensity={1.1} color="#FF3D8A" />
      <pointLight position={[0, -4, 3]} intensity={30} distance={18} decay={2} color="#FF3D8A" />
      <pointLight position={[5, 1, 3]} intensity={12} distance={14} decay={2} color="#C8FF3D" />
    </>
  )
}
