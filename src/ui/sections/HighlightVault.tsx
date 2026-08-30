import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { HIGHLIGHTS, TAG_LABEL, highlightFight } from '../../constants/highlights'
import { useExperience } from '../../store/useExperience'
import { lockScroll, scrollTo } from '../../hooks/useLenis'
import VaultScene from '../../three/vault/VaultScene'
import { VAULT_FOV, resetVaultState } from '../../three/vault/vaultState'
import { Reveal, Line } from '../Reveal'

function StatBar({
  label,
  value,
  max,
  color,
  delay,
  reduced,
}: {
  label: string
  value: number
  max: number
  color: string
  delay: number
  reduced: boolean
}) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-bone/55">
        <span>{label}</span>
        <span className="text-bone">{value}</span>
      </div>
      <div className="mt-1.5 h-[3px] w-full overflow-hidden bg-bone/10">
        <motion.div
          className="h-full"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
          initial={reduced ? false : { width: 0 }}
          animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
          transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

/** Decorative passport barcode — deterministic per highlight, not random. */
function Barcode({ seed }: { seed: string }) {
  const bars = Array.from({ length: 42 }, (_, i) => {
    const code = seed.charCodeAt(i % seed.length) + i * 7
    return (code % 3) + 1
  })
  return (
    <div aria-hidden className="flex h-6 items-end gap-[2px] opacity-60">
      {bars.map((w, i) => (
        <span key={i} className="bg-bone/70" style={{ width: `${w}px`, height: i % 4 === 0 ? '100%' : '72%' }} />
      ))}
    </div>
  )
}

export default function HighlightVault() {
  const reduced = useExperience((s) => s.reduced)
  const quality = useExperience((s) => s.quality)
  const paused = useExperience((s) => s.paused)
  const setPointerHot = useExperience((s) => s.setPointerHot)
  const setOverlayOpen = useExperience((s) => s.setOverlayOpen)

  const [focus, setFocus] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [touched, setTouched] = useState(false)
  const [panelIn, setPanelIn] = useState(false)
  const host = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const highlight = focus !== null ? HIGHLIGHTS[focus] : null
  const fight = highlight ? highlightFight(highlight) : null

  // Only render frames while the section is actually on screen.
  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '120px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    resetVaultState()
    return () => resetVaultState()
  }, [])

  const select = useCallback(
    (index: number) => {
      setTouched(true)
      setFocus(index)
      setHover(null)
      // The passport owns the interaction now; the pointer is no longer on a card,
      // so the custom cursor must not stay latched in its hot state.
      setPointerHot(false)
    },
    [setPointerHot],
  )

  const close = useCallback(() => {
    setFocus(null)
    setPointerHot(false)
    // Hand focus back to whatever opened the passport, if it is still in the
    // document; otherwise let it fall to the body.
    const origin = returnFocus.current
    returnFocus.current = null
    if (origin && document.body.contains(origin)) origin.focus({ preventScroll: true })
  }, [setPointerHot])

  const step = useCallback((dir: number) => {
    setFocus((f) => (f === null ? null : (f + dir + HIGHLIGHTS.length) % HIGHLIGHTS.length))
  }, [])

  /**
   * Opening from the index strip below the canvas: the stage — and with it the
   * passport — is off-screen above, so travel to it first. The jump is immediate
   * on purpose; a smooth Lenis scroll would be frozen half-way by the scroll lock
   * that opening the passport installs a moment later.
   */
  const openFromIndex = useCallback(
    (index: number, trigger: HTMLElement) => {
      returnFocus.current = trigger
      if (host.current) scrollTo(host.current, true)
      select(index)
    },
    [select],
  )

  const onHover = useCallback(
    (index: number | null) => {
      setHover(index)
      if (index !== null) setTouched(true)
      setPointerHot(index !== null)
    },
    [setPointerHot],
  )

  const open = focus !== null

  // Passport open == modal: hold the page still, wire Esc and arrow keys, and keep
  // Tab inside the panel. Runs only on open/close, so every lock is matched by
  // exactly one unlock — lockScroll is refcounted and this section is not the only
  // overlay on the page.
  useEffect(() => {
    if (!open) return
    lockScroll(true)
    setOverlayOpen(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key === 'ArrowRight') return step(1)
      if (e.key === 'ArrowLeft') return step(-1)
      if (e.key !== 'Tab') return
      // The page behind is scroll-locked and its chrome is faded out, so letting
      // Tab walk into it would strand the keyboard somewhere invisible. Wrap it.
      const root = panel.current
      if (!root) return
      const items = Array.from(
        root.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === root)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lockScroll(false)
      setOverlayOpen(false)
    }
  }, [open, close, step, setOverlayOpen])

  // The passport is *mounted* late rather than animated with a delay: an element
  // that sits at its initial transform for a quarter second reads as a pop, and
  // delaying the mount instead lets the camera fly most of the way in first.
  useEffect(() => {
    if (!open) {
      setPanelIn(false)
      return
    }
    if (reduced) {
      setPanelIn(true)
      return
    }
    const t = window.setTimeout(() => setPanelIn(true), 260)
    return () => window.clearTimeout(t)
  }, [open, reduced])

  // Move focus into the passport when it appears, so close and prev/next are one
  // Tab away instead of somewhere back up the page. preventScroll because the
  // panel's position is ours to decide, not the browser's.
  useEffect(() => {
    if (open && panelIn) panel.current?.focus({ preventScroll: true })
  }, [open, panelIn])

  useEffect(() => () => setPointerHot(false), [setPointerHot])

  const accent = highlight?.accent ?? '#FF3D8A'

  return (
    <section data-section="highlights" className="relative">
      <div className="mx-auto max-w-6xl px-5 pt-[18vh] md:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-pink md:text-xs">
          02 · Highlight Vault
        </p>
        <Reveal className="mt-6">
          <h2 className="font-display text-[clamp(2.2rem,6.5vw,5.2rem)] font-black leading-[1.04]">
            <Line>HIGHLIGHT</Line>
            <Line>
              <span className="text-stroke">VAULT.</span>
            </Line>
          </h2>
        </Reveal>
        <p className="mt-4 max-w-md font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
          Drag to spin the vault · click a card to open its fight passport
        </p>
      </div>

      {/* ---------- 3D stage ----------
          Portrait height is deliberately well under a full screen: a tall, narrow
          frame forces the camera to pull back to fit the orb's width, which strands
          it in empty vertical space. ~68svh keeps the orb filling its frame. */}
      <div
        ref={host}
        className="relative mt-8 h-[68svh] min-h-[440px] w-full md:mt-4 md:h-[92svh]"
      >
        {/* The canvas is decorative to assistive tech — the vault index below is the
            accessible equivalent, and it opens exactly the same passports. */}
        <Canvas
          aria-hidden
          frameloop={paused || !visible ? 'never' : 'always'}
          dpr={quality === 'high' ? [1, 2] : quality === 'medium' ? [1, 1.5] : [1, 1.25]}
          camera={{ fov: VAULT_FOV, near: 0.1, far: 80, position: [0, 0, 18] }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
          onPointerMissed={close}
        >
          <VaultScene
            focus={focus}
            hover={hover}
            reduced={reduced}
            quality={quality}
            onHover={onHover}
            onSelect={select}
          />
        </Canvas>

        {/* corner framing marks */}
        <div aria-hidden className="pointer-events-none absolute inset-4 md:inset-8">
          {[
            'left-0 top-0 border-l border-t',
            'right-0 top-0 border-r border-t',
            'left-0 bottom-0 border-l border-b',
            'right-0 bottom-0 border-r border-b',
          ].map((c) => (
            <span key={c} className={`absolute h-6 w-6 border-bone/20 ${c}`} />
          ))}
        </div>

        {/* hover readout */}
        <AnimatePresence>
          {hover !== null && focus === null && (
            <motion.div
              key="readout"
              aria-hidden
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
              className="pointer-events-none absolute bottom-6 left-6 z-10 md:bottom-10 md:left-10"
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ color: HIGHLIGHTS[hover].accent }}
              >
                {TAG_LABEL[HIGHLIGHTS[hover].tag]}
              </p>
              <p className="mt-1 font-display text-2xl font-black md:text-4xl">
                {HIGHLIGHTS[hover].title}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/50">
                {HIGHLIGHTS[hover].kicker}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* first-run hint */}
        <AnimatePresence>
          {!touched && focus === null && (
            <motion.p
              key="hint"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pointer-events-none absolute bottom-6 right-6 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40 md:bottom-10 md:right-10"
            >
              <span className="blink text-pink">✳</span> drag · click
            </motion.p>
          )}
        </AnimatePresence>

        {/* ---------- Fight Passport ---------- */}
        <AnimatePresence>
          {highlight && panelIn && (
            <motion.div
              key="passport"
              ref={panel}
              role="dialog"
              aria-modal
              tabIndex={-1}
              aria-label={`${highlight.title} — fight passport`}
              // The wrapper animates transform only. Anything that makes it a
              // backdrop root — opacity < 1, filter, mask — switches the child's
              // backdrop-blur off for the duration and snaps it back on at the end.
              // The fade therefore lives on the glass itself, where an element's
              // *own* opacity fades its backdrop-filter instead of killing it.
              // Variants (rather than per-element props) so the two stay in step:
              // framer propagates the label to children and waits for both.
              // Under prefers-reduced-motion the travel is dropped and only the
              // opacity cross-fade on the glass remains.
              variants={{
                hidden: reduced ? { y: 0, scale: 1 } : { y: 72, scale: 0.97 },
                shown: { y: 0, scale: 1 },
                gone: reduced
                  ? { y: 0, scale: 1, transition: { duration: 0.16 } }
                  : { y: 18, scale: 0.98, transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } },
              }}
              initial={reduced ? false : 'hidden'}
              animate="shown"
              exit="gone"
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ ['--accent' as string]: accent }}
              // Vertically centred by flex rather than -translate-y-1/2, because a
              // Tailwind transform class would be clobbered by the animated one.
              // The column itself is click-through so the canvas still gets the
              // stray clicks that dismiss the passport. focus-visible:outline-none
              // (not outline-none) so the global focus ring does not draw a
              // full-height box around this wrapper when it takes focus.
              className="pointer-events-none absolute inset-x-3 bottom-3 z-20 focus-visible:outline-none md:inset-x-auto md:bottom-8 md:right-8 md:top-8 md:flex md:w-[min(30rem,40vw)] md:items-center"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  shown: { opacity: 1 },
                  gone: { opacity: 0, transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } },
                }}
                className="pointer-events-auto relative max-h-[38svh] overflow-x-hidden overflow-y-auto overscroll-contain border border-bone/15 bg-bone/[0.045] p-5 shadow-[0_24px_80px_-24px_var(--accent)] backdrop-blur-2xl md:max-h-full md:p-7"
              >
                {/* accent edge + inner sheen */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(120% 80% at 100% 0%, ${accent}22, transparent 60%)`,
                  }}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-bone/45">
                      Fight Passport
                    </p>
                    <p
                      className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: accent }}
                    >
                      {TAG_LABEL[highlight.tag]}
                    </p>
                  </div>
                  <button
                    onClick={close}
                    aria-label="Close passport and return to the vault"
                    data-cursor
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-bone/25 text-bone transition-colors hover:border-pink hover:text-pink"
                  >
                    <X size={17} />
                  </button>
                </div>

                <h3 className="relative mt-4 font-display text-[clamp(1.5rem,4.2vw,2.4rem)] font-black uppercase leading-[1.05]">
                  {highlight.title}
                </h3>
                <p className="relative mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/55">
                  {highlight.kicker}
                </p>

                {fight ? (
                  <>
                    <div className="relative mt-5 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                      <span
                        className="rounded-sm border px-2 py-1 font-bold"
                        style={{
                          color: fight.result === 'W' ? '#C8FF3D' : fight.result === 'L' ? '#FF3D8A' : '#F2F0E9',
                          borderColor: `${fight.result === 'W' ? '#C8FF3D' : fight.result === 'L' ? '#FF3D8A' : '#F2F0E9'}55`,
                        }}
                      >
                        {fight.result === 'NC' ? 'NO CONTEST' : fight.result === 'W' ? 'WIN' : 'LOSS'}
                      </span>
                      <span className="text-bone/70">{fight.method}</span>
                      <span className="text-bone/45">
                        R{fight.round} · {fight.time}
                      </span>
                    </div>
                    {/* Keyed so prev/next remounts the bars and they re-grow from
                        zero instead of leaving the previous fight's numbers up for
                        the length of their stagger delay. */}
                    <div key={highlight.id} className="relative mt-5 space-y-3 border-t border-bone/10 pt-5">
                      <StatBar label="Sig. strikes landed ≈" value={fight.strikes.landed} max={200} color="#C8FF3D" delay={0.45} reduced={reduced} />
                      <StatBar label="Strikes absorbed ≈" value={fight.strikes.absorbed} max={200} color="#FF3D8A" delay={0.55} reduced={reduced} />
                      <StatBar label="Accuracy ≈" value={fight.strikes.accuracy} max={100} color="#E9C46A" delay={0.65} reduced={reduced} />
                    </div>
                  </>
                ) : (
                  <div className="relative mt-5 border-t border-bone/10 pt-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/55">
                      No scorecard · this one lives outside the octagon
                    </p>
                  </div>
                )}

                <p
                  className="relative mt-5 border-l-2 pl-4 text-sm leading-relaxed text-bone/80"
                  style={{ borderColor: accent }}
                >
                  {highlight.story}
                </p>

                <div className="relative mt-6 flex items-center justify-between gap-4 border-t border-bone/10 pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => step(-1)}
                      aria-label="Previous moment"
                      data-cursor
                      className="flex h-11 w-11 items-center justify-center border border-bone/20 text-bone/70 transition-colors hover:border-bone/60 hover:text-bone"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => step(1)}
                      aria-label="Next moment"
                      data-cursor
                      className="flex h-11 w-11 items-center justify-center border border-bone/20 text-bone/70 transition-colors hover:border-bone/60 hover:text-bone"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <span className="ml-1 font-mono text-[10px] tracking-[0.2em] text-bone/45">
                      {String((focus ?? 0) + 1).padStart(2, '0')} / {String(HIGHLIGHTS.length).padStart(2, '0')}
                    </span>
                  </div>
                  <Barcode seed={highlight.id} />
                </div>

                <p className="relative mt-4 font-mono text-[9px] uppercase tracking-[0.22em] text-bone/30">
                  Unofficial fan concept · striking stats approximate
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---------- keyboard-accessible index (doubles as a nav strip) ---------- */}
      <div className="mx-auto max-w-6xl px-5 pb-[14vh] md:px-10">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone/35">
          Vault index
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {HIGHLIGHTS.map((h, i) => (
            <li key={h.id}>
              <button
                onClick={(e) => openFromIndex(i, e.currentTarget)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                aria-label={`Open passport ${String(i + 1).padStart(2, '0')}: ${h.title} — ${h.kicker}`}
                data-cursor
                className={`group flex items-center gap-2 border px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  focus === i || hover === i
                    ? 'border-bone/50 text-bone'
                    : 'border-bone/10 text-bone/45 hover:border-bone/35 hover:text-bone/80'
                }`}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full transition-transform group-hover:scale-125"
                  style={{ background: h.accent }}
                />
                {String(i + 1).padStart(2, '0')}
                <span className="hidden sm:inline">{h.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
