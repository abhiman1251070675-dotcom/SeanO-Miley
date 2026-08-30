import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import beltUrl from './assets/ufc-belt-realistic-curved.glb?url'

function BlenderBelt() {
  const { scene } = useGLTF(beltUrl)
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          mesh.material = (mesh.material as THREE.Material).clone()
          ;(mesh.material as THREE.MeshStandardMaterial).wireframe = true
        }
      }
    })
    return clone
  }, [scene])

  return (
    <group scale={12} rotation={[0.4, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  )
}

export default function BlenderApp() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
      <Canvas camera={{ position: [0, 1, 6], fov: 45 }}>
        <color attach="background" args={['#0a0a0a']} />
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 10]} intensity={2} />
        <Environment preset="city" />
        <BlenderBelt />
        <OrbitControls makeDefault autoRotate autoRotateSpeed={2} enablePan={true} enableZoom={true} />
        <gridHelper args={[30, 30, '#333333', '#1a1a1a']} position={[0, -2, 0]} />
        <axesHelper args={[5]} position={[0, -2, 0]} />
      </Canvas>
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'monospace', fontSize: 12 }}>
        [ OBSERVATION MODE ]<br/>
        LEFT CLICK: Rotate<br/>
        RIGHT CLICK: Pan<br/>
        SCROLL: Zoom<br/><br/>
        <button 
          onClick={() => {
            window.history.pushState({}, '', window.location.pathname)
            window.dispatchEvent(new Event('pushstate'))
          }}
          style={{
            background: '#C8FF3D', color: '#000', padding: '8px 16px', 
            fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', 
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}
        >
          &larr; Back to Experience
        </button>
      </div>
    </div>
  )
}