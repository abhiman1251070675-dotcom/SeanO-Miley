import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useExperience } from '../../store/useExperience'
import { QUALITY_TIERS } from '../../constants/scenes'

const VERT = `
  attribute float aScale;
  attribute vec3 aColor;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * aSpeed, 26.0) - 13.0;
    p.x += sin(uTime * 0.15 + position.y * 0.4) * 0.6;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * uPixelRatio * 46.0 / -mv.z;
    vColor = aColor;
  }
`

const FRAG = `
  varying vec3 vColor;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = smoothstep(0.5, 0.08, d);
    gl_FragColor = vec4(vColor, a * 0.85);
  }
`

export default function ParticleField() {
  const quality = useExperience((s) => s.quality)
  const count = QUALITY_TIERS[quality].particles

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    const palette = [
      new THREE.Color('#E9C46A'),
      new THREE.Color('#E9C46A'),
      new THREE.Color('#FF3D8A'),
      new THREE.Color('#C8FF3D'),
    ]
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2
      scales[i] = 0.4 + Math.random() * 1.6
      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
      speeds[i] = 0.25 + Math.random() * 0.9
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    const m = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
    })
    return { geometry: g, material: m }
  }, [count])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
