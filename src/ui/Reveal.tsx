import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useExperience } from '../store/useExperience'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function Reveal({
  children,
  className,
  delay = 0,
  stagger = 0.09,
}: {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const lines = ref.current?.querySelectorAll('[data-reveal]')
      if (!lines || lines.length === 0) return
      // Read the preference here rather than subscribing to the store: useGSAP runs
      // in a layout effect, and the store's `reduced` flag is written by useLenis in
      // a passive effect one level up — i.e. strictly after this. Subscribed, the
      // flag is still its default `false` on the only pass that matters, and every
      // reveal animates for users who asked for no motion.
      const reduced =
        useExperience.getState().reduced ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        gsap.set(lines, { yPercent: 0, rotate: 0 })
        return
      }
      gsap.fromTo(
        lines,
        { yPercent: 120, rotate: 3 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.1,
          ease: 'power4.out',
          stagger,
          delay,
          scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
        },
      )
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export function Line({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={`block overflow-hidden pb-[0.08em] ${className ?? ''}`}>
      <span data-reveal className="block will-change-transform">
        {children}
      </span>
    </span>
  )
}
