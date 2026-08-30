import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useExperience } from '../store/useExperience'

export default function Cursor() {
  const reduced = useExperience((s) => s.reduced)
  const pointerHot = useExperience((s) => s.pointerHot)
  const pointerText = useExperience((s) => s.pointerText)
  const [enabled, setEnabled] = useState(false)
  const [domHover, setDomHover] = useState(false)
  const [pressed, setPressed] = useState(false)
  const hovered = domHover || pointerHot
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.6 })

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)
    document.documentElement.classList.add('custom-cursor')
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null
      setDomHover(Boolean(t?.closest?.('a,button,[data-cursor]')))
    }
    const down = () => setPressed(true)
    const up = () => setPressed(false)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      document.documentElement.classList.remove('custom-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [reduced, x, y])

  if (!enabled) return null

  return (
    <>
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[90]" style={{ x: sx, y: sy }}>
        {pointerText ? (
          <div className="absolute left-3 top-0 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-black shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {pointerText}
          </div>
        ) : (
          <div
            className={`relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-200 ${
              hovered ? 'h-14 w-14 border-pink/80 bg-pink/10' : 'h-8 w-8 border-bone/70'
            } ${pressed ? 'scale-75' : ''}`}
          />
        )}
      </motion.div>
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[90]" style={{ x, y }}>
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full bg-lime transition-all duration-150 ${
            hovered || pointerText ? 'h-1 w-1' : 'h-1.5 w-1.5'
          }`}
        />
      </motion.div>
    </>
  )
}
