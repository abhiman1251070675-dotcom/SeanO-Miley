import { Volume2, VolumeX, RotateCcw } from 'lucide-react'
import { useChromeHidden, useExperience } from '../store/useExperience'
import { scrollTo } from '../hooks/useLenis'
import Magnetic from './Magnetic'

function Controls({ column }: { column?: boolean }) {
  const soundOn = useExperience((s) => s.soundOn)
  const toggleSound = useExperience((s) => s.toggleSound)
  return (
    <div className={`flex ${column ? 'flex-col' : 'flex-row'} gap-3`}>
      <Magnetic>
        <button
          onClick={toggleSound}
          aria-label={soundOn ? 'Mute ambience' : 'Unmute ambience'}
          aria-pressed={soundOn}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/20 bg-ink/60 text-bone backdrop-blur-md transition-colors hover:border-lime hover:text-lime"
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </Magnetic>
      <Magnetic>
        <button
          onClick={() => scrollTo(0)}
          aria-label="Restart experience"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/20 bg-ink/60 text-bone backdrop-blur-md transition-colors hover:border-pink hover:text-pink"
        >
          <RotateCcw size={18} />
        </button>
      </Magnetic>
    </div>
  )
}

export default function Nav() {
  // The round controls sit in the two corners an open overlay reaches into (top
  // right on desktop, bottom right on mobile), and they outrank <main>, so they
  // step aside rather than sitting on top of the glass. The wordmark stays.
  const hidden = useChromeHidden()
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[80] flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] md:px-10">
        <Magnetic>
          <button
            onClick={() => scrollTo(0)}
            aria-label="SUGA SHOW — back to top"
            className="group flex items-center gap-2 font-display text-sm font-bold tracking-[0.2em] text-bone"
          >
            <span>SUGA</span>
            <span className="inline-block text-lime transition-transform duration-500 group-hover:rotate-180">
              ✷
            </span>
            <span>SHOW</span>
          </button>
        </Magnetic>
        <div
          className={`hidden transition-opacity duration-300 md:flex ${
            hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <Controls />
        </div>
      </header>
      <div
        className={`fixed bottom-[max(env(safe-area-inset-bottom),16px)] right-[max(env(safe-area-inset-right),16px)] z-[80] transition-opacity duration-300 md:hidden ${
          hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <Controls column />
      </div>
    </>
  )
}
