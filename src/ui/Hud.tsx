import { useCallback, useRef } from 'react'
import { SECTIONS } from '../constants/scenes'
import { useChromeHidden, useExperience } from '../store/useExperience'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { scrollTo } from '../hooks/useLenis'

export default function Hud() {
  const section = useExperience((s) => s.section)
  // The rail and the counter are fixed at z-[75], above <main>, so while an
  // overlay is open they would otherwise be drawn straight through its glass —
  // and the rail's hover tooltips would land inside the panel's text.
  const hidden = useChromeHidden()
  const railFill = useRef<HTMLDivElement>(null)
  const topBar = useRef<HTMLDivElement>(null)
  const pct = useRef<HTMLSpanElement>(null)

  const onProgress = useCallback((p: number) => {
    if (railFill.current) railFill.current.style.transform = `scaleY(${p})`
    if (topBar.current) topBar.current.style.transform = `scaleX(${p})`
    if (pct.current) pct.current.textContent = `${String(Math.round(p * 100)).padStart(3, '0')}%`
  }, [])
  useScrollProgress(onProgress)

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[75] h-[3px] overflow-hidden bg-bone/15 md:hidden"
      >
        <div
          ref={topBar}
          className="h-full w-full origin-left bg-gradient-to-r from-pink via-gold to-lime"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      <nav
        aria-label="Sections"
        className={`fixed right-6 top-1/2 z-[75] hidden -translate-y-1/2 flex-col items-center transition-opacity duration-300 md:flex ${
          hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <div className="absolute right-[7px] top-0 h-full w-px bg-bone/15" />
        <div
          ref={railFill}
          className="absolute right-[7px] top-0 h-full w-px origin-top bg-gradient-to-b from-pink to-lime"
          style={{ transform: 'scaleY(0)' }}
        />
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => scrollTo(`[data-section="${s.id}"]`)}
            aria-label={`Go to ${s.label}`}
            aria-current={section === i}
            className="group relative flex h-9 w-9 items-center justify-center"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                section === i
                  ? 'h-2.5 w-2.5 bg-pink shadow-[0_0_12px_rgba(255,61,138,0.9)]'
                  : 'h-1.5 w-1.5 bg-bone/40 group-hover:bg-bone'
              }`}
            />
            <span className="pointer-events-none absolute right-8 whitespace-nowrap border border-bone/10 bg-ink/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/80 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
              {String(i + 1).padStart(2, '0')} · {s.label}
            </span>
          </button>
        ))}
      </nav>

      <div
        className={`fixed bottom-[max(env(safe-area-inset-bottom),14px)] left-5 z-[75] flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/70 transition-opacity duration-300 md:bottom-8 md:left-10 ${
          hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <span className="text-pink">{String(section + 1).padStart(2, '0')}</span>
        <span className="text-bone/30">/</span>
        <span>{String(SECTIONS.length).padStart(2, '0')}</span>
        <span className="hidden sm:inline">{SECTIONS[section]?.label}</span>
        <span ref={pct} className="text-lime">
          000%
        </span>
      </div>
    </>
  )
}
