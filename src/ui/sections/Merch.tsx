import { useState } from 'react'
import { PRODUCTS, type Product } from '../../constants/content'
import { mediaById } from '../../constants/media.generated'
import { Reveal, Line } from '../Reveal'

function Glyph({ glyph, accent }: { glyph: Product['glyph']; accent: string }) {
  const common = {
    fill: 'none',
    stroke: '#F2F0E9',
    strokeWidth: 1.5,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  }
  return (
    <svg width="96" height="96" viewBox="0 0 64 64" aria-hidden>
      {glyph === 'tee' && (
        <g {...common}>
          <path d="M22 10 L28 6 C30 10 34 10 36 6 L42 10 L52 18 L46 26 L44 24 L44 56 L20 56 L20 24 L18 26 L12 18 Z" />
          <path d="M24 44 L40 44" stroke={accent} />
        </g>
      )}
      {glyph === 'cap' && (
        <g {...common}>
          <path d="M14 34 C14 20 50 20 50 34 L50 38 L14 38 Z" />
          <path d="M14 38 C8 38 6 44 12 45 L52 45" />
          <circle cx="32" cy="24" r="1.5" fill={accent} stroke="none" />
        </g>
      )}
      {glyph === 'shorts' && (
        <g {...common}>
          <path d="M16 12 L48 12 L50 30 L44 54 L34 54 L32 36 L30 54 L20 54 L14 30 Z" />
          <path d="M16 20 L48 20" stroke={accent} />
        </g>
      )}
      {glyph === 'jacket' && (
        <g {...common}>
          <path d="M20 10 L28 6 L32 12 L36 6 L44 10 L52 18 L48 28 L46 26 L46 56 L18 56 L18 26 L16 28 L12 18 Z" />
          <path d="M32 12 L32 56" stroke={accent} />
        </g>
      )}
      {glyph === 'poster' && (
        <g {...common}>
          <rect x="14" y="6" width="36" height="52" />
          <path d="M14 44 L50 16" stroke={accent} />
          <path d="M14 52 L50 24" />
        </g>
      )}
      {glyph === 'print' && (
        <g {...common}>
          <rect x="12" y="10" width="40" height="44" />
          <path d="M12 44 L24 32 L32 40 L44 26 L52 34" stroke={accent} />
        </g>
      )}
    </svg>
  )
}

function ProductCard({ p }: { p: Product }) {
  const [flipped, setFlipped] = useState(false)
  const media = p.mediaId ? mediaById(p.mediaId) : undefined
  const fine = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

  return (
    <article
      data-cursor
      onPointerEnter={() => fine && setFlipped(true)}
      onPointerLeave={() => fine && setFlipped(false)}
      onClick={() => {
        if (!fine) setFlipped((f) => !f)
      }}
      className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden border border-bone/10 bg-[#141416] transition-colors hover:border-bone/30"
    >
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 transition-all duration-500 ${
          flipped ? 'scale-90 opacity-0' : 'opacity-100'
        }`}
      >
        <Glyph glyph={p.glyph} accent={p.accent} />
        <div className="text-center">
          <p className="font-display text-sm font-bold tracking-widest text-bone">{p.name}</p>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.25em] text-bone/50">
            {p.tag}
          </p>
          <p className="mt-3 font-mono text-xs" style={{ color: p.accent }}>
            {p.price}
          </p>
        </div>
      </div>

      <div
        className={`absolute inset-0 transition-all duration-500 ${
          flipped ? 'opacity-100' : 'scale-110 opacity-0'
        }`}
      >
        {media ? (
          <img src={media.src} alt={media.alt} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `linear-gradient(160deg, ${p.accent}44, #111112 70%)` }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 pt-14">
          <p className="font-display text-sm font-black text-bone">{p.name}</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-bone/60">
            Modeled · concept store
          </p>
        </div>
      </div>

      <span className="absolute right-3 top-3 border border-bone/20 bg-ink/70 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.2em] text-bone/60">
        {fine ? 'Hover to model' : 'Tap to model'}
      </span>
    </article>
  )
}

export default function Merch() {
  return (
    <section data-section="merch" className="relative mx-auto max-w-6xl px-5 py-[18vh] md:px-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-pink md:text-xs">
        06 · Suga Merch
      </p>
      <Reveal className="mt-6">
        <h2 className="font-display text-[clamp(2.2rem,6.5vw,5.2rem)] font-black leading-[1.04]">
          <Line>WEAR THE SHOW.</Line>
        </h2>
      </Reveal>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
        Concept drop 001 · nothing actually for sale
      </p>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.name} p={p} />
        ))}
      </div>
    </section>
  )
}
