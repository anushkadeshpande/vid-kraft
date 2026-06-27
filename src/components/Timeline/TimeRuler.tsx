import { timeToPixels, rulerTickInterval } from '../../core/timeline'

interface TimeRulerProps {
  pxPerSecond: number
  contentWidth: number
}

function formatTick(seconds: number): string {
  const total = Math.round(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** A horizontal ruler whose ticks are spaced by a "nice" interval for the zoom. */
function TimeRuler({ pxPerSecond, contentWidth }: TimeRulerProps) {
  const interval = rulerTickInterval(pxPerSecond)
  const totalSeconds = pxPerSecond > 0 ? contentWidth / pxPerSecond : 0

  const ticks: number[] = []
  for (let t = 0; t <= totalSeconds; t += interval) {
    ticks.push(t)
  }

  return (
    <div className="timeline-ruler" style={{ width: contentWidth }}>
      {ticks.map((t) => (
        <div
          key={t}
          className="timeline-ruler__tick"
          style={{ left: timeToPixels(t, pxPerSecond) }}
        >
          <span className="timeline-ruler__label">{formatTick(t)}</span>
        </div>
      ))}
    </div>
  )
}

export default TimeRuler
