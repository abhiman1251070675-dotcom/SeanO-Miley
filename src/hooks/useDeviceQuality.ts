import { useEffect } from 'react'
import { useExperience, type Quality } from '../store/useExperience'

export function useDeviceQuality() {
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const minDim = Math.min(window.screen.width, window.screen.height)
    const cores = navigator.hardwareConcurrency ?? 8
    let tier: Quality = 'high'
    if (coarse && minDim < 780) tier = 'low'
    else if (coarse || minDim < 900 || cores <= 4) tier = 'medium'
    useExperience.getState().setQuality(tier)
  }, [])
}
