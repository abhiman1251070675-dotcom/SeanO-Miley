import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { FIGHTS, type Fight } from '../../constants/content'
import { useExperience } from '../../store/useExperience'
import { lockScroll } from '../../hooks/useLenis'
import { Reveal, Line } from '../Reveal'

function resultColor(r: Fight['result']) {
  if (r === 'W') return 'text-lime border-lime/40 bg-lime/10'
  if (r === 'L') return 'text-pink border-pink/40 bg-pink/10'
  return 'text-bone/70 border-bone/30 bg-bone/5'
}

function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-bone/60">
        <span>{label}</span>
        <span className="text-bone">{value}</span>
      </div>
      <div className="mt-2 h-1.5 w-full bg-bone/10">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

export default function Vault() {
  const fightOpen = useExperience((s) => s.fightOpen)
  const setFightOpen = useExperience((s) => s.setFightOpen)
  const fight = fightOpen !== null ? FIGHTS[fightOpen] : null

  useEffect(() => {
    // Every lock must have exactly one matching unlock — lockScroll is refcounted.
    if (fight === null) return
    lockScroll(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFightOpen(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lockScroll(false)
    }
  }, [fight, setFightOpen])

  return (
    <section data-section="vault" className="relative mx-auto max-w-6xl px-5 py-[18vh] md:px-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-pink md:text-xs">
        03 · Fight Vault
      </p>
      <Reveal className="mt-6">
        <h2 className="font-display text-[clamp(2.2rem,6.5vw,5.2rem)] font-black leading-[1.04]">
          <Line>EVERY BOUT.</Line>
          <Line>
            <span className="text-stroke">EVERY SCAR.</span>
          </Line>
        </h2>
      </Reveal>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
        Tap a row for the tale of the tape · stats ≈
      </p>

      <div className="mt-12 border-t border-bone/10">
        {FIGHTS.map((f, i) => (
          <button
            key={i}
            onClick={() => setFightOpen(i)}
            data-cursor
            className="group relative grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-bone/10 py-4 text-left transition-all duration-300 hover:z-10 hover:-translate-y-1 hover:scale-[1.015] hover:border-transparent hover:bg-bone/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.7)] md:grid-cols-[7rem_1fr_11rem_6rem_3rem] md:gap-6 md:px-4 md:py-5"
          >
            <span className="font-mono text-[10px] text-bone/50">{f.date}</span>
            <span className="font-display text-xs font-bold tracking-wide text-bone transition-transform duration-300 group-hover:translate-x-2 md:text-base">
              {f.opponent}
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-bone/50 md:block">
              {f.event} · {f.method}
            </span>
            <span className="hidden text-right font-mono text-[10px] text-bone/50 md:block">
              R{f.round} · {f.time}
            </span>
            <span
              className={`justify-self-end rounded-sm border px-2 py-1 font-mono text-[10px] font-bold ${resultColor(f.result)}`}
            >
              {f.result}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {fight && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[95] flex items-end justify-center md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setFightOpen(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${fight.opponent} fight details`}
              autoFocus
              initial={{ y: 80, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="relative max-h-[88svh] w-full max-w-3xl overflow-y-auto border border-bone/15 bg-coal p-6 md:p-10"
            >
              <button
                onClick={() => setFightOpen(null)}
                aria-label="Close fight details"
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-bone/20 text-bone transition-colors hover:border-pink hover:text-pink"
              >
                <X size={18} />
              </button>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-pink">
                {fight.event} · {fight.date}
              </p>
              <h3 className="mt-3 font-display text-[clamp(1.6rem,5vw,3.2rem)] font-black leading-tight">
                {fight.opponent}
              </h3>
              <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
                <span className={`rounded-sm border px-2 py-1 font-bold ${resultColor(fight.result)}`}>
                  {fight.result === 'NC' ? 'NO CONTEST' : fight.result === 'W' ? 'WIN' : 'LOSS'}
                </span>
                <span className="text-bone/70">{fight.method}</span>
                <span className="text-bone/50">
                  ROUND {fight.round} · {fight.time}
                </span>
              </div>

              <div className="mt-8 space-y-5 border-t border-bone/10 pt-8">
                <Bar label="Sig. strikes landed ≈" value={fight.strikes.landed} max={200} color="bg-lime" />
                <Bar label="Strikes absorbed ≈" value={fight.strikes.absorbed} max={200} color="bg-pink" />
                <Bar label="Accuracy ≈" value={fight.strikes.accuracy} max={100} color="bg-gold" />
              </div>

              <p className="mt-8 border-l-2 border-pink pl-4 text-bone/80 italic">
                "{fight.note}"
              </p>

              <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.25em] text-bone/35">
                Unofficial fan concept · striking stats approximate
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
