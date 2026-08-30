import { useRef } from 'react'
import { MoveHorizontal } from 'lucide-react'
import { FITS } from '../../constants/content'
import { mediaById } from '../../constants/media.generated'
import { Reveal, Line } from '../Reveal'

export default function FitCheck() {
  const scroller = useRef<HTMLDivElement>(null)
  const drag = useRef({ down: false, startX: 0, scroll: 0, moved: false })

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const el = scroller.current
    if (!el) return
    drag.current = { down: true, startX: e.clientX, scroll: el.scrollLeft, moved: false }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return
    const el = scroller.current
    if (!el) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 4) drag.current.moved = true
    el.scrollLeft = drag.current.scroll - dx
  }
  const end = () => {
    drag.current.down = false
  }

  return (
    <section data-section="fitcheck" className="relative py-[18vh]">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold md:text-xs">
          05 · Fit Check
        </p>
        <Reveal className="mt-6">
          <h2 className="font-display text-[clamp(2.2rem,6.5vw,5.2rem)] font-black leading-[1.04]">
            <Line>EVERY KIT</Line>
            <Line>
              <span className="text-stroke">IS A MOMENT.</span>
            </Line>
          </h2>
        </Reveal>
        <p className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
          <MoveHorizontal size={14} className="text-gold" />
          Drag through the colorways
        </p>
      </div>

      <div
        ref={scroller}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerLeave={end}
        className="no-scrollbar mt-12 flex cursor-grab select-none snap-x snap-mandatory gap-5 overflow-x-auto px-5 active:cursor-grabbing md:px-10"
      >
        {FITS.map((fit) => {
          const media = fit.mediaId ? mediaById(fit.mediaId) : undefined
          return (
            <article
              key={fit.index}
              data-cursor
              className="group relative h-[420px] w-[300px] shrink-0 snap-center overflow-hidden border border-bone/10 md:h-[480px] md:w-[340px]"
              style={media ? undefined : { background: fit.gradient }}
            >
              {media ? (
                <img
                  src={media.src}
                  alt={media.alt}
                  draggable={false}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="relative h-full w-full">
                  <span className="text-stroke-thin absolute -right-4 -top-8 font-display text-[10rem] font-black leading-none">
                    {fit.index}
                  </span>
                  <div className="absolute inset-0 bg-black/15 transition-opacity duration-500 group-hover:opacity-0" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pt-20">
                <div>
                  <p className="font-display text-lg font-black text-bone">{fit.name}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-bone/70">
                    {fit.meta}
                  </p>
                </div>
                <span className="font-mono text-[10px]" style={{ color: fit.accent }}>
                  {fit.index}
                </span>
              </div>
            </article>
          )
        })}
        <div className="w-1 shrink-0" aria-hidden />
      </div>
    </section>
  )
}
