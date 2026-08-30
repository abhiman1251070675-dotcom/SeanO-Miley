import { useEffect, useState } from 'react'
import { nextFightTs } from '../constants/content'

export default function Countdown() {
  const [target] = useState(nextFightTs)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, target - now)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff / 3600000) % 24)
  const m = Math.floor((diff / 60000) % 60)
  const s = Math.floor((diff / 1000) % 60)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/70">
      <span className="flex items-center gap-2">
        <span className="blink inline-block h-1.5 w-1.5 rounded-full bg-pink" />
        Next walkout · TBA
      </span>
      <span className="text-bone">
        {pad(d)}D : {pad(h)}H : {pad(m)}M : {pad(s)}S
      </span>
    </div>
  )
}
