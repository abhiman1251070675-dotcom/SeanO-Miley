import { useEffect, useRef } from 'react'
import { Play, Pause, Radio, Youtube, Twitch } from 'lucide-react'
import { PODCAST_EPISODES, PODCAST_LINKS } from '../../constants/content'
import { mediaById } from '../../constants/media.generated'
import { audio, useAudio } from '../../hooks/useAudio'
import { Reveal, Line } from '../Reveal'

const BARS = 48

export default function Podcast() {
  const { soundOn, podcast, togglePodcast } = useAudio()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const portrait = mediaById('teal-portrait')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let t = 0
    const draw = () => {
      t += 0.03
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const levels = podcast && soundOn ? audio.levels(BARS) : null
      const bw = w / BARS
      for (let i = 0; i < BARS; i++) {
        const idle = 0.15 + Math.abs(Math.sin(t * 2 + i * 0.35)) * 0.25
        const v = levels ? Math.max(idle, levels[i] * 0.95) : idle
        const bh = Math.max(2, v * h)
        const grad = ctx.createLinearGradient(0, h, 0, h - bh)
        grad.addColorStop(0, '#FF3D8A')
        grad.addColorStop(1, '#C8FF3D')
        ctx.fillStyle = grad
        ctx.fillRect(i * bw + bw * 0.25, h - bh, bw * 0.5, bh)
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [podcast, soundOn])

  return (
    <section data-section="sugar-show" className="relative mx-auto max-w-6xl px-5 py-[18vh] md:px-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-lime md:text-xs">
        04 · Podcast Hub
      </p>
      <Reveal className="mt-6">
        <h2 className="font-display text-[clamp(2.2rem,6.5vw,5.2rem)] font-black leading-[1.04]">
          <Line>TIMBO SUGAR</Line>
          <Line>
            <span className="text-lime">SHOW.</span>
          </Line>
        </h2>
      </Reveal>

      <div className="mt-16 grid items-start gap-10 md:grid-cols-2 md:gap-14">
        <div>
          <p className="max-w-md leading-relaxed text-bone/70">
            Two brothers-in-law, one microphone, zero filter. The TimboSugarShow drops weekly —
            fight breakdowns, locker-room stories and the occasional heated debate about who
            really runs the household.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {PODCAST_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center gap-2 rounded-full border border-bone/20 px-5 font-mono text-[10px] uppercase tracking-[0.25em] text-bone transition-colors hover:border-lime hover:text-lime"
              >
                {l.label === 'Twitch' ? <Twitch size={14} /> : <Youtube size={14} />}
                {l.label}
              </a>
            ))}
          </div>

          <div className="mt-10 border-t border-bone/10">
            {PODCAST_EPISODES.map((e) => (
              <div
                key={e.ep}
                className="flex items-center justify-between gap-4 border-b border-bone/10 py-4"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] text-lime">{e.ep}</span>
                  <span className="text-sm text-bone/85">{e.title}</span>
                </div>
                <span className="font-mono text-[10px] text-bone/50">{e.duration}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          {portrait && (
            <img
              src={portrait.src}
              alt={portrait.alt}
              loading="lazy"
              className="pointer-events-none absolute -top-16 right-0 hidden w-44 rotate-3 opacity-60 md:block"
              style={{ filter: 'drop-shadow(0 0 40px rgba(200,255,61,0.25))' }}
            />
          )}
          <div className="relative border border-bone/15 bg-coal/80 p-6 backdrop-blur-sm md:p-8">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70">
                <Radio size={14} className="text-pink" />
                On air
              </span>
              <span className="flex items-center gap-2 rounded-sm border border-pink/40 bg-pink/10 px-2 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-pink">
                <span className="blink inline-block h-1.5 w-1.5 rounded-full bg-pink" />
                LIVE
              </span>
            </div>
            <canvas ref={canvasRef} width={480} height={120} className="mt-6 h-24 w-full" />
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={togglePodcast}
                aria-pressed={podcast}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-lime/50 text-lime transition-all hover:bg-lime hover:text-ink"
                aria-label={podcast ? 'Stop podcast ambience' : 'Play podcast ambience'}
              >
                {podcast ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
              </button>
              <p className="max-w-[55%] text-right font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-bone/50">
                Procedural studio ambience — {soundOn ? 'sound on' : 'enable sound (top right) for audio'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
