import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { focusFrameFor, orbDistanceFor, vaultState } from './vaultState'

const posTarget = new THREE.Vector3()
const lookTarget = new THREE.Vector3()
const right = new THREE.Vector3()
const upVec = new THREE.Vector3()
const lookMatrix = new THREE.Matrix4()
const lookQuat = new THREE.Quaternion()

/**
 * Two-mode camera. Orbit: a wide, pointer-parallaxed view of the whole vault.
 * Focus: framed square-on to the selected card, reading that card's *live* world
 * matrix every frame so the lock-on stays exact while the orb's spin decays.
 */
export default function VaultCamera({
  focus,
  reduced,
}: {
  focus: number | null
  reduced: boolean
}) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  useFrame((_state, dt) => {
    const d = Math.min(dt, 0.05)
    const aspect = size.width / Math.max(size.height, 1)
    const focusing = focus !== null && vaultState.focusValid

    if (focusing) {
      const fov = (camera as THREE.PerspectiveCamera).fov
      const frame = focusFrameFor(aspect, fov)
      const n = vaultState.focusNormal
      upVec.copy(vaultState.focusUp)
      // Camera basis is x = y × z, and +z points from the card back to the camera.
      right.crossVectors(upVec, n).normalize()

      lookTarget
        .copy(vaultState.focusPos)
        .addScaledVector(right, frame.shiftX)
        .addScaledVector(upVec, frame.shiftY)
      posTarget.copy(lookTarget).addScaledVector(n, frame.dist)
    } else {
      const t = vaultState.time
      // Pointer parallax is motion the user did not ask for, so it goes away
      // entirely under prefers-reduced-motion — along with the idle drift.
      posTarget.set(
        reduced ? 0 : vaultState.pointerX * 0.9,
        reduced ? 0 : -vaultState.pointerY * 0.6 + Math.sin(t * 0.35) * 0.15,
        orbDistanceFor(aspect),
      )
      lookTarget.set(0, 0, 0)
      upVec.set(0, 1, 0)
    }

    const k = reduced ? 1 : 1 - Math.exp(-(focusing ? 3.6 : 2.6) * d)
    camera.position.lerp(posTarget, k)

    // Matrix4.lookAt(eye, target, up) is the *camera* convention: -Z ends up
    // pointing at the target. Object3D.lookAt would silently use the opposite
    // convention (+Z at the target) for anything that isn't a camera or a light,
    // which points the camera exactly backwards.
    lookMatrix.lookAt(camera.position, lookTarget, upVec)
    lookQuat.setFromRotationMatrix(lookMatrix)
    camera.quaternion.slerp(lookQuat, k)

    vaultState.flyProgress += ((focusing ? 1 : 0) - vaultState.flyProgress) * k
  })

  return null
}
