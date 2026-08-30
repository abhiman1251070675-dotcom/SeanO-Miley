import { ArrowUp, Instagram, Twitter, Youtube } from 'lucide-react'
import Magnetic from '../Magnetic'
import { Reveal, Line } from '../Reveal'
import { SOCIALS } from '../../constants/content'
import { mediaById } from '../../constants/media.generated'
import { scrollTo } from '../../hooks/useLenis'

const COLLAGE_IDS = ['main-poster', 'collage', 'screaming-chest', 'close-braids']

export default function EndCard() {
  const collage = COLLAGE_IDS.map((id) => mediaById(id)).filter(
    (m): m is NonNullable<ReturnType<typeof mediaById>> => Boolean(m),
  )

  return (
    <section
      data-section="end"
      className="relative overflow-hidden px-5 pb-[max(env(safe-area-inset-bottom),24px)] pt-[16vh] md:px-10"
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3">
        {collage.map((m, i) => (
          <div
            key={m.id}
            className={`glitch h-24 w-20 border border-bone/10 md:h-32 md:w-24 ${i % 2 ? 'rotate-2' : '-rotate-2'}`}
          >
            <img src={m.src} alt={m.alt} loading="lazy" className="glitch-base" />
            <img src={m.src} alt="" aria-hidden loading="lazy" className="glitch-copy a" />
            <img src={m.src} alt="" aria-hidden loading="lazy" className="glitch-copy b" />
          </div>
        ))}
      </div>

      <Reveal className="mx-auto mt-16 max-w-6xl text-center">
        <h2 className="font-display text-[clamp(2.8rem,10vw,8.5rem)] font-black leading-[0.98]">
          <Line>STAY READY.</Line>
          <Line>
            <span className="text-pink">STAY SUGA.</span>
          </Line>
        </h2>
        <p className="mx-auto mt-8 max-w-xl leading-relaxed text-bone/70">
          Thanks for pulling up to the show. Catch the next walkout, queue the podcast, and keep
          the braids loud.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Magnetic>
            <button
              onClick={() => scrollTo(0)}
              className="flex h-12 items-center gap-3 rounded-full border border-lime/60 px-7 font-mono text-[11px] uppercase tracking-[0.3em] text-lime transition-colors hover:bg-lime hover:text-ink"
            >
              <ArrowUp size={15} />
              Back to the top
            </button>
          </Magnetic>
          {SOCIALS.map((s) => (
            <Magnetic key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${s.label} — ${s.handle}`}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-bone/20 text-bone transition-colors hover:border-pink hover:text-pink"
              >
                {s.label === 'Instagram' ? (
                  <Instagram size={17} />
                ) : s.label === 'X' ? (
                  <Twitter size={17} />
                ) : (
                  <Youtube size={17} />
                )}
              </a>
            </Magnetic>
          ))}
        </div>
      </Reveal>

      <footer className="mx-auto mt-24 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-bone/10 pt-6 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-bone/40 md:flex-row md:text-left">
        <span>Unofficial fan concept · not affiliated with Sean O'Malley or the UFC</span>
        <span>React Three Fiber · GSAP · Framer Motion</span>
        <span>© 2026 Suga Show</span>
      </footer>
    </section>
  )
}
