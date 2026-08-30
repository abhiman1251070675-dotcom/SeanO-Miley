import { useEffect } from 'react'
import { worldState } from '../store/useExperience'

export function useScrollProgress(cb: (progress: number, velocity: number) => void) {
  useEffect(() => {
    let raf = 0
    const loop = () => {
      cb(worldState.progress, worldState.velocity)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [cb])
}
