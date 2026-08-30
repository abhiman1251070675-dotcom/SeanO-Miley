import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useExperience, worldState } from '../store/useExperience'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null
export const getLenis = () => lenis

export function scrollTo(target: number | string | HTMLElement, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target as number, { immediate, duration: 1.6 })
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' })
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
  } else {
    target.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
  }
}

let scrollLocks = 0

/**
 * Refcounted so two overlays can be open at once (the fight table's modal and the
 * highlight vault's passport) without whichever closes first re-enabling the page
 * scroll underneath the other. Clamped at zero so an unmatched unlock can never
 * drive the count negative and wedge the page permanently locked.
 */
export function lockScroll(lock: boolean) {
  scrollLocks = Math.max(0, scrollLocks + (lock ? 1 : -1))
  const locked = scrollLocks > 0
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.body.style.overflow = locked ? 'hidden' : ''
}

function measure() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const ranges: { id: string; start: number; end: number }[] = []
  document.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => {
    const id = el.dataset.section
    if (!id) return
    const top = el.getBoundingClientRect().top + window.scrollY
    ranges.push({
      id,
      start: Math.min(1, Math.max(0, top / max)),
      end: Math.min(1, Math.max(0, (top + el.offsetHeight * 0.75) / max)),
    })
  })
  ranges.sort((a, b) => a.start - b.start)
  worldState.ranges = ranges
}

function sectionFromProgress(p: number): number {
  const ranges = worldState.ranges
  for (let i = 0; i < ranges.length; i++) {
    const next = ranges[i + 1]?.start ?? 1.01
    if (p >= ranges[i].start && p < next) return i
  }
  return Math.max(0, ranges.length - 1)
}

export function useLenis() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    useExperience.getState().setReduced(reduced)
    measure()

    const onScrollUpdate = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const p = lenis ? lenis.scroll / Math.max(lenis.limit, 1) : window.scrollY / max
      worldState.progress = Math.min(1, Math.max(0, p))
      worldState.velocity = lenis ? lenis.velocity : 0
      useExperience.getState().setSection(sectionFromProgress(worldState.progress))
      ScrollTrigger.update()
    }

    let raf: number | null = null
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
      lenis.on('scroll', onScrollUpdate)
      raf = requestAnimationFrame(function rafLoop(time: number) {
        lenis?.raf(time)
        raf = requestAnimationFrame(rafLoop)
      })
    } else {
      window.addEventListener('scroll', onScrollUpdate, { passive: true })
    }

    ;(window as unknown as { __lenis: Lenis | null }).__lenis = lenis

    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    const timers = [300, 900, 2000, 3500, 6000].map((t) => window.setTimeout(measure, t))

    return () => {
      window.removeEventListener('resize', onResize)
      timers.forEach((t) => clearTimeout(t))
      if (raf !== null) cancelAnimationFrame(raf)
      if (lenis) {
        lenis.destroy()
        lenis = null
      }
      window.removeEventListener('scroll', onScrollUpdate)
    }
  }, [])
}
