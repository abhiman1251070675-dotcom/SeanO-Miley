import { useEffect, useState } from 'react'
import { useExperience } from '../store/useExperience'

class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private podcastGain: GainNode | null = null
  analyser: AnalyserNode | null = null

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return
    }
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 128
    this.master.connect(this.analyser)
    this.analyser.connect(ctx.destination)

    // Ambient bed: detuned saws through a slowly-breathing lowpass.
    const bedGain = ctx.createGain()
    bedGain.gain.value = 0.16
    bedGain.connect(this.master)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 220
    lp.Q.value = 0.8
    lp.connect(bedGain)
    ;[55, 55.6, 110.3].forEach((f, i) => {
      const o = ctx.createOscillator()
      o.type = i === 2 ? 'triangle' : 'sawtooth'
      o.frequency.value = f
      const g = ctx.createGain()
      g.gain.value = i === 2 ? 0.12 : 0.3
      o.connect(g)
      g.connect(lp)
      o.start()
    })
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.06
    const lfoG = ctx.createGain()
    lfoG.gain.value = 90
    lfo.connect(lfoG)
    lfoG.connect(lp.frequency)
    lfo.start()

    // Podcast layer: warm chord pulse, faded in by the play button.
    this.podcastGain = ctx.createGain()
    this.podcastGain.gain.value = 0
    this.podcastGain.connect(this.master)
    const plp = ctx.createBiquadFilter()
    plp.type = 'lowpass'
    plp.frequency.value = 900
    plp.connect(this.podcastGain)
    ;[130.8, 164.8, 196, 261.6].forEach((f, i) => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = f
      const g = ctx.createGain()
      g.gain.value = 0.05 / (i + 1)
      o.connect(g)
      g.connect(plp)
      o.start()
    })
    const pulse = ctx.createOscillator()
    pulse.frequency.value = 0.5
    const pg = ctx.createGain()
    pg.gain.value = 0.02
    pulse.connect(pg)
    pg.connect(this.podcastGain.gain)
    pulse.start()
  }

  setMuted(m: boolean) {
    if (!this.ctx || !this.master) return
    const t = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setTargetAtTime(m ? 0 : 0.5, t, 0.25)
  }

  setPodcast(on: boolean) {
    this.ensure()
    if (!this.ctx || !this.podcastGain) return
    const t = this.ctx.currentTime
    this.podcastGain.gain.cancelScheduledValues(t)
    this.podcastGain.gain.setTargetAtTime(on ? 0.5 : 0, t, 0.3)
  }

  tick() {
    this.ensure()
    if (!this.ctx || !this.master) return
    const ctx = this.ctx
    const o = ctx.createOscillator()
    o.type = 'square'
    o.frequency.value = 1400
    const g = ctx.createGain()
    g.gain.value = 0.0001
    o.connect(g)
    g.connect(this.master)
    const t = ctx.currentTime
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
    o.start(t)
    o.stop(t + 0.1)
  }

  levels(n: number): number[] {
    const out: number[] = new Array(n).fill(0)
    if (!this.analyser) return out
    const data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(data)
    for (let i = 0; i < n; i++) {
      out[i] = data[Math.floor((i / n) * data.length)] / 255
    }
    return out
  }
}

export const audio = new AudioEngine()

export function useAudio() {
  const soundOn = useExperience((s) => s.soundOn)
  const [podcast, setPodcast] = useState(false)

  useEffect(() => {
    if (soundOn) audio.ensure()
    audio.setMuted(!soundOn)
  }, [soundOn])

  const togglePodcast = () => {
    setPodcast((p) => {
      audio.setPodcast(!p)
      return !p
    })
  }

  return { soundOn, podcast, togglePodcast }
}
