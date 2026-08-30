import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useExperience } from '../store/useExperience'

const LETTERS = ['S', 'U', 'G', 'A']

export default function Loader() {
  const phase = useExperience((s) => s.phase)
  const setPhase = useExperience((s) => s.setPhase)
  const [progress, setProgress] = useState(0)
  const done = useRef(false)

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = () => {
      const elapsed = performance.now() - start
      let target = Math.min(92, (elapsed / 1400) * 100)
      if (document.readyState === 'complete' && elapsed > 1400) target = 100
      setProgress((p) => Math.max(p, target))
      if (target >= 100 && !done.current) {
        done.current = true
        window.setTimeout(() => setPhase('ready'), 350)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [setPhase])

  return (
    <AnimatePresence>
      {phase === 'loading' && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex overflow-hidden">
            {LETTERS.map((l, i) => (
              <motion.span
                key={i}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 + i * 0.09, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-[24vw] font-black leading-none tracking-tight text-bone md:text-[15vw]"
              >
                {l}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-4 font-mono text-[10px] uppercase tracking-[0.4em] text-bone/60"
          >
            Loading the Suga Show
          </motion.p>
          <div className="mt-8 h-px w-48 overflow-hidden bg-bone/15">
            <div
              className="h-full bg-gradient-to-r from-pink via-gold to-lime transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 font-mono text-[10px] tracking-[0.3em] text-lime">
            {String(Math.round(progress)).padStart(3, '0')}%
          </p>
          <p className="absolute bottom-[max(env(safe-area-inset-bottom),20px)] font-mono text-[9px] uppercase tracking-[0.3em] text-bone/35">
            Unofficial fan concept
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
