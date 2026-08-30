import { useEffect } from 'react'
import { useLenis } from './hooks/useLenis'
import { useMouseParallax } from './hooks/useMouseParallax'
import { useDeviceQuality } from './hooks/useDeviceQuality'
import { useExperience } from './store/useExperience'
import Experience from './three/Experience'
import Cursor from './ui/Cursor'
import Loader from './ui/Loader'
import Nav from './ui/Nav'
import Hud from './ui/Hud'
import Hero from './ui/sections/Hero'
import Legacy from './ui/sections/Legacy'
import HighlightVault from './ui/sections/HighlightVault'
import Vault from './ui/sections/Vault'
import Podcast from './ui/sections/Podcast'
import FitCheck from './ui/sections/FitCheck'
import Merch from './ui/sections/Merch'
import EndCard from './ui/sections/EndCard'

export default function App() {
  useLenis()
  useMouseParallax()
  useDeviceQuality()

  const paused = useExperience((s) => s.paused)
  const overlayOpen = useExperience((s) => s.overlayOpen)
  useEffect(() => {
    const onVis = () => useExperience.getState().setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-0">
        <Experience paused={paused} />
      </div>
      <div aria-hidden className="grain" />
      {/* Page vignette. It sits above <main>, so it also washes over any open
          overlay — it lifts while one is up so the glass reads clean. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[55] transition-opacity duration-500"
        style={{
          background: 'radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.5) 100%)',
          opacity: overlayOpen ? 0 : 1,
        }}
      />
      <Cursor />
      <Loader />
      <Nav />
      <Hud />
      <main className="relative z-10">
        <Hero />
        <Legacy />
        <HighlightVault />
        <Vault />
        <Podcast />
        <FitCheck />
        <Merch />
        <EndCard />
      </main>
    </>
  )
}
