import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Reveal, Line } from '../Reveal'
import { mediaById } from '../../constants/media.generated'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const portrait = mediaById('hero-portrait')

export default function Legacy() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const nums = scope.current?.querySelectorAll<HTMLElement>('[data-count]')
      nums?.forEach((el) => {
        const end = parseFloat(el.dataset.count ?? '0')
        const obj = { v: 0 }
        gsap.to(obj, {
          v: end,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v))
          },
        })
      })
    },
    { scope },
  )

  return (
    <section
      data-section="record"
      ref={scope}
      className="relative mx-auto max-w-6xl px-5 py-[18vh] md:px-10"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-pink md:text-xs">
        01 · The Record
      </p>
      <Reveal className="mt-6">
        <h2 className="font-display text-[clamp(2.2rem,6.5vw,5.2rem)] font-black leading-[1.04]">
          <Line>RAINBOW-HEADED</Line>
          <Line>
            <span className="text-stroke">MENACE</span> FROM HELENA.
          </Line>
        </h2>
      </Reveal>

      <div className="mt-16 grid items-center gap-10 md:grid-cols-2 md:gap-14">
        {portrait ? (
          <figure className="glitch scanlines aspect-[4/5] w-full border border-bone/10">
            <img src={portrait.src} alt={portrait.alt} className="glitch-base" loading="lazy" />
            <img src={portrait.src} alt="" aria-hidden className="glitch-copy a" loading="lazy" />
            <img src={portrait.src} alt="" aria-hidden className="glitch-copy b" loading="lazy" />
            <figcaption className="absolute bottom-0 left-0 z-10 bg-ink/80 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.25em] text-bone/70">
              HELENA, MT → LAS VEGAS · EST. 2017
            </figcaption>
          </figure>
        ) : (
          <div className="aspect-[4/5] w-full border border-bone/10 bg-gradient-to-br from-pink/30 via-ink to-lime/20" />
        )}

        <div>
          <p className="max-w-md leading-relaxed text-bone/70">
            Walkouts turned runways. Bantamweights turned highlight reels. From Contender Series
            knockouts to the UFC 292 uppercut that crowned him in Boston — Sean O'Malley fights
            like he dresses: loud, precise, and impossible to ignore.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { n: 18, label: 'PRO WINS', color: 'text-lime' },
              { n: 12, label: 'KO / TKO', color: 'text-pink' },
              { n: 67, label: '% FINISH', color: 'text-gold' },
            ].map((s) => (
              <div key={s.label} className="border border-bone/10 p-4 md:p-6">
                <p className={`font-display text-3xl font-black md:text-5xl ${s.color}`}>
                  <span data-count={s.n}>0</span>
                </p>
                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.25em] text-bone/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/60 md:grid-cols-4">
            {[
              ['HEIGHT', "5'11"],
              ['REACH', '72"'],
              ['STANCE', 'SOUTHPAW'],
              ['DIVISION', '135 LB'],
            ].map(([k, v]) => (
              <div key={k} className="border border-bone/10 p-3">
                <p className="text-bone/40">{k}</p>
                <p className="mt-1 text-sm tracking-[0.15em] text-bone">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
