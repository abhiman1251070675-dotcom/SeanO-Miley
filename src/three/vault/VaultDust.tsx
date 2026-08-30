import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { vaultState } from './vaultState'

/**
 * Ambient dust around the vault.
 *
 * This replaces drei's <Sparkles>, which was wrong for this scene on two counts.
 * It distributes particles through an axis-aligned *box*, so a wide field always
 * has corners sitting exactly where the fly-in camera ends up (min radius ~8.7,
 * box corner at scale/2·√3) — and point sprites scale as 1/depth, so a mote the
 * camera passes within half a unit of covers a quarter of the screen. It also
 * drives its drift from `clock.elapsedTime`, which R3F zeroes on both ends of a
 * frameloop flip, so the whole field teleported back to its t=0 layout every time
 * the section scrolled back into view.
 *
 * Here: a spherical shell (uniform by volume, so it doesn't clump at the centre),
 * a hard clamp on sprite size, a near-fade that dissolves anything the camera gets
 * close to, and the shared section clock.
 */

const DUST_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uOpacity;
  attribute float aSize;
  attribute float aPhase;
  varying float vAlpha;

  void main() {
    // Lazy three-axis drift. Amplitude stays under half a unit — this should read
    // as suspended dust catching the light, not as snowfall.
    vec3 pos = position;
    pos.y += sin(uTime * 0.24 + aPhase) * 0.34;
    pos.x += cos(uTime * 0.19 + aPhase * 1.7) * 0.30;
    pos.z += sin(uTime * 0.21 + aPhase * 2.3) * 0.30;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float depth = -mv.z;
    gl_Position = projectionMatrix * mv;

    // Dissolve the near field rather than letting it balloon, and taper the far
    // field so the shell has no visible outer edge.
    float near = smoothstep(2.0, 7.0, depth);
    float far = 1.0 - smoothstep(24.0, 38.0, depth);
    vAlpha = uOpacity * near * far;

    gl_PointSize = uSize * aSize * uPixelRatio * (25.0 / max(depth, 0.5));
    // Belt and braces: even with the fade, nothing is allowed past ~2x the size of
    // a mid-field mote, so the worst case reads as soft near-field bokeh.
    gl_PointSize = min(gl_PointSize, 16.0 * uPixelRatio);
  }
`

const DUST_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = smoothstep(0.5, 0.05, d);
    if (a * vAlpha <= 0.002) discard;
    gl_FragColor = vec4(uColor, a * vAlpha);
    #include <colorspace_fragment>
  }
`

const R_MIN = 3.0
const R_MAX = 16.0

interface Props {
  count: number
  reduced: boolean
}

export default function VaultDust({ count, reduced }: Props) {
  const dpr = useThree((s) => s.viewport.dpr)

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const phases = new Float32Array(count)
    const v = new THREE.Vector3()
    const rMin3 = R_MIN ** 3
    const rMax3 = R_MAX ** 3

    for (let i = 0; i < count; i++) {
      // Cube-root of a uniform sample spreads points evenly *by volume*; sampling
      // the radius directly would pile most of the field up against R_MIN.
      const r = Math.cbrt(rMin3 + Math.random() * (rMax3 - rMin3))
      v.setFromSphericalCoords(r, Math.acos(2 * Math.random() - 1), Math.random() * Math.PI * 2)
      positions[i * 3] = v.x
      positions[i * 3 + 1] = v.y
      positions[i * 3 + 2] = v.z
      sizes[i] = 0.45 + Math.random() * 1.15
      phases[i] = Math.random() * Math.PI * 2
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    // Points are frustum-culled against a bounding sphere, which is not computed
    // for a geometry we built by hand.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), R_MAX + 1)
    return g
  }, [count])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: DUST_VERT,
        fragmentShader: DUST_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uSize: { value: 2.2 },
          uOpacity: { value: 0.62 },
          uColor: { value: new THREE.Color('#F6F3EA') },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useEffect(() => {
    material.uniforms.uPixelRatio.value = dpr
  }, [material, dpr])

  useEffect(() => {
    const g = geometry
    const m = material
    return () => {
      g.dispose()
      m.dispose()
    }
  }, [geometry, material])

  const points = useRef<THREE.Points>(null)
  useFrame(() => {
    if (!reduced) material.uniforms.uTime.value = vaultState.time
  })

  return <points ref={points} geometry={geometry} material={material} raycast={() => null} />
}
