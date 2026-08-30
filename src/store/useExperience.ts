import { create } from 'zustand'

export type Quality = 'high' | 'medium' | 'low'

export const worldState = {
  progress: 0,
  velocity: 0,
  pointerX: 0,
  pointerY: 0,
  ranges: [] as { id: string; start: number; end: number }[],
  blenderMode: false,
}

const SECTION_IDS = ['octagon', 'record', 'highlights', 'vault', 'sugar-show', 'fitcheck', 'merch', 'end']

export function rangeOf(id: string): { start: number; end: number } {
  const found = worldState.ranges.find((r) => r.id === id)
  if (found) return found
  const i = SECTION_IDS.indexOf(id)
  const n = SECTION_IDS.length
  return { start: i / n, end: (i + 1) / n }
}

interface ExperienceState {
  phase: 'loading' | 'ready'
  setPhase: (p: 'loading' | 'ready') => void
  soundOn: boolean
  toggleSound: () => void
  section: number
  setSection: (i: number) => void
  quality: Quality
  setQuality: (q: Quality) => void
  reduced: boolean
  setReduced: (v: boolean) => void
  fightOpen: number | null
  setFightOpen: (i: number | null) => void
  /**
   * True while a section-level overlay owns the screen. Fixed chrome (the section
   * rail, the progress counter, the corner controls) lives in a higher stacking
   * context than <main>, so it cannot be layered under an overlay with z-index
   * alone — it has to step aside explicitly.
   */
  overlayOpen: boolean
  setOverlayOpen: (v: boolean) => void
  /** True while the pointer is over an interactive object *inside* a 3D canvas. */
  pointerHot: boolean
  setPointerHot: (v: boolean) => void
  paused: boolean
  setPaused: (v: boolean) => void
  holdProgress: number
  setHoldProgress: (p: number) => void
  pointerText: string | null
  setPointerText: (t: string | null) => void
}

export const useExperience = create<ExperienceState>()((set) => ({
  phase: 'loading',
  setPhase: (phase) => set({ phase }),
  soundOn: false,
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  section: 0,
  setSection: (section) => set((s) => (s.section === section ? s : { section })),
  quality: 'high',
  setQuality: (quality) => set({ quality }),
  reduced: false,
  setReduced: (reduced) => set({ reduced }),
  fightOpen: null,
  setFightOpen: (fightOpen) => set({ fightOpen }),
  overlayOpen: false,
  setOverlayOpen: (overlayOpen) => set((s) => (s.overlayOpen === overlayOpen ? s : { overlayOpen })),
  pointerHot: false,
  setPointerHot: (pointerHot) => set((s) => (s.pointerHot === pointerHot ? s : { pointerHot })),
  paused: false,
  setPaused: (paused) => set({ paused }),
  holdProgress: 0,
  setHoldProgress: (holdProgress) => set({ holdProgress }),
  pointerText: null,
  setPointerText: (pointerText) => set({ pointerText }),
}))

/** True when fixed chrome should get out of an overlay's way. */
export const useChromeHidden = () =>
  useExperience((s) => s.overlayOpen || s.fightOpen !== null)
