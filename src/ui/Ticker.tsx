export default function Ticker({
  items,
  fast,
  className,
}: {
  items: string[]
  fast?: boolean
  className?: string
}) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span
          key={i}
          className="flex items-center whitespace-nowrap font-mono text-xs uppercase tracking-[0.3em]"
        >
          <span className="px-6 text-bone/80">{item}</span>
          <span className="text-lime">✷</span>
        </span>
      ))}
    </div>
  )
  return (
    <div className={`relative flex overflow-hidden ${className ?? ''}`}>
      <div className={`marquee-track flex w-max ${fast ? 'marquee-fast' : ''}`}>
        {row}
        {row}
      </div>
    </div>
  )
}
