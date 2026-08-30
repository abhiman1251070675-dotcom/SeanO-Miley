import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { worldState, useExperience } from '../../store/useExperience'
import beltUrl from '../../assets/ufc-belt-realistic-curved.glb?url'

const R = 4.6

const TARGET_WIDTH = 2 * R * Math.sin(1.05)
const BASE_ROTATION: [number, number, number] = [0, Math.PI, 0]
const UNMIRRORED = '__sugaUnmirrored'

function unmirrorOnce(root: THREE.Object3D) {
  root.traverse((child) => {
    const geo = (child as Partial<THREE.Mesh>).geometry
    if (!geo || geo.userData[UNMIRRORED]) return
    geo.userData[UNMIRRORED] = true

    for (const name of ['position', 'normal'] as const) {
      const attr = geo.getAttribute(name)
      if (!attr) continue
      for (let i = 0; i < attr.count; i += 1) attr.setX(i, -attr.getX(i))
      attr.needsUpdate = true
    }

    const index = geo.getIndex()
    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        const first = index.getX(i)
        index.setX(i, index.getX(i + 2))
        index.setX(i + 2, first)
      }
      index.needsUpdate = true
    }

    geo.computeBoundingBox()
    geo.computeBoundingSphere()
  })
}

export default function Belt() {
  const group = useRef<THREE.Group>(null)
  const { scene } = useGLTF(beltUrl, false)

  const belt = useMemo(() => {
    unmirrorOnce(scene)
    return scene.clone(true)
  }, [scene])

  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(belt)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    return { center, scale: TARGET_WIDTH / (size.x || 1) }
  }, [belt])

  const handlePointerOver = (e: any) => {
    e.stopPropagation()
    useExperience.getState().setPointerHot(true)
    useExperience.getState().setPointerText('take a look')
  }

  const handlePointerOut = () => {
    useExperience.getState().setPointerHot(false)
    useExperience.getState().setPointerText(null)
  }

  const handleClick = (e: any) => {
    e.stopPropagation()
    handlePointerOut()
    window.history.pushState({}, '', '?mode=blender')
    window.dispatchEvent(new Event('pushstate'))
  }

  useEffect(() => {
    const clearHover = (e: PointerEvent) => {
      const el = e.target as HTMLElement
      if (el && el.tagName !== 'CANVAS') {
        if (useExperience.getState().pointerText === 'take a look') {
          useExperience.getState().setPointerHot(false)
          useExperience.getState().setPointerText(null)
        }
      }
    }
    window.addEventListener('pointermove', clearHover, { capture: true })
    return () => window.removeEventListener('pointermove', clearHover, { capture: true })
  }, [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return

    const t = state.clock.elapsedTime
    const exit = THREE.MathUtils.smoothstep(worldState.progress, 0.085, 0.2)
    g.rotation.y = THREE.MathUtils.damp(
      g.rotation.y,
      worldState.pointerX * 0.55 + t * 0.1,
      2.5,
      dt,
    )
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.1 - worldState.pointerY * 0.2, 2.5, dt)
    g.position.y = -0.4 + Math.sin(t * 0.9) * 0.14 + exit * 7.5
    g.rotation.z = exit * 0.4
    g.scale.setScalar(1 - exit * 0.35)
    g.visible = exit < 0.995
  })

  return (
    <group 
      ref={group}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <group rotation={BASE_ROTATION} scale={fit.scale}>
        <primitive object={belt} position={[-fit.center.x, -fit.center.y, -fit.center.z]} />
      </group>
      
      <Sparkles
        count={50}
        scale={[9, 6, 4]}
        size={2.4}
        speed={0.35}
        color="#E9C46A"
        position={[0, 0, 3]}
        opacity={0.7}
      />
    </group>
  )
}

useGLTF.preload(beltUrl, false)