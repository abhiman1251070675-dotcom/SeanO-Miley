import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Ticker from '../Ticker'
import Countdown from '../Countdown'
import { TICKER_ITEMS } from '../../constants/content'
import { mediaById } from '../../constants/media.generated'
import { useExperience } from '../../store/useExperience'

const cutout = mediaById('praying-cutout')

export default function Hero() {
  const ready = useExperience((s) => s.phase === 'ready')

  return (
    <section
      data-section="octagon"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 pb-0 pt-[calc(max(env(safe-area-inset-top),16px)+72px)] md:px-10"
    >
      {cutout && (
        <motion.div
          initial={{ opacity: 0, y: 80, rotate: 5 }}
          animate={ready ? { opacity: 1, y: 0, rotate: 0 } : {}}
          transition={{ duration: 1.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute right-[-14%] top-[14%] z-0 aspect-square w-[78vw] max-w-[520px] opacity-40 md:right-[3%] md:top-[8%] md:w-[32vw] md:opacity-100"
        >
          {/* The asset is a tight cutout, so it is inset to the exact rectangle the
              subject occupied inside the old 800x800 canvas (left 133, top 93,
              534x707). That keeps the framing identical at every breakpoint while
              the file itself carries no empty margin. */}
          <img
            src={cutout.src}
            alt={cutout.alt}
            className="floaty absolute left-[16.63%] top-[11.63%] h-[88.38%] w-[66.75%] object-contain"
            style={{ filter: 'drop-shadow(0 0 70px rgba(255,61,138,0.4))' }}
            loading="eager"
          />
        </motion.div>
      )}

      <div className="relative z-10 mt-[6vh]">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="font-mono text-[10px] uppercase tracking-[0.4em] text-pink md:text-xs"
        >
          UFC Bantamweight · Helena, MT
        </motion.p>
        <h1 className="mt-4">
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: '110%' }}
              animate={ready ? { y: 0 } : {}}
              transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="block font-display text-[clamp(4.5rem,17vw,15rem)] font-black leading-[0.95] tracking-tight text-bone"
              style={{ textShadow: '4px 0 0 rgba(255,61,138,0.3), -4px 0 0 rgba(200,255,61,0.22)' }}
            >
              SUGA
            </motion.span>
          </span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-5 font-display text-sm font-bold tracking-[0.35em] text-bone/85 md:text-lg"
        >
          SEAN O'MALLEY <span className="text-lime">—</span> THE SUGA SHOW
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="mt-8"
        >
          <Countdown />
        </motion.div>
      </div>

      <div className="relative z-10 pb-[max(env(safe-area-inset-bottom),18px)]">
        <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/60">
          <ChevronDown size={14} className="animate-bounce text-lime" />
          Scroll to enter
        </div>
        <Ticker items={TICKER_ITEMS} className="border-y border-bone/10 py-3" />
      </div>
    </section>
  )
}
