import { useEffect } from 'react'
import { worldState } from '../store/useExperience'

export function useMouseParallax() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const move = (e: PointerEvent) => {
      worldState.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      worldState.pointerY = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
}
