export interface SectionDef {
  id: string
  label: string
  bg: string
  accent: string
}

export const SECTIONS: SectionDef[] = [
  { id: 'octagon', label: 'THE OCTAGON', bg: '#131318', accent: '#FF3D8A' },
  { id: 'record', label: 'THE RECORD', bg: '#111112', accent: '#C8FF3D' },
  { id: 'highlights', label: 'HIGHLIGHT VAULT', bg: '#141018', accent: '#FF3D8A' },
  { id: 'vault', label: 'FIGHT VAULT', bg: '#160F15', accent: '#FF3D8A' },
  { id: 'sugar-show', label: 'TIMBOSUGARSHOW', bg: '#0E1410', accent: '#C8FF3D' },
  { id: 'fitcheck', label: 'FIT CHECK', bg: '#131019', accent: '#E9C46A' },
  { id: 'merch', label: 'SUGA MERCH', bg: '#101013', accent: '#FF3D8A' },
  { id: 'end', label: 'STAY SUGA', bg: '#0A0A0C', accent: '#C8FF3D' },
]

export const QUALITY_TIERS = {
  high: { particles: 1400, dpr: [1, 2] as [number, number] },
  medium: { particles: 700, dpr: [1, 1.5] as [number, number] },
  low: { particles: 320, dpr: [1, 1.25] as [number, number] },
}
