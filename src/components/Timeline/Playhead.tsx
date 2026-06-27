import type { MouseEvent } from 'react'
import { timeToPixels } from '../../core/timeline'

interface PlayheadProps {
  currentTime: number
  pxPerSecond: number
  onGrab: (e: MouseEvent) => void
}

/** The vertical playhead line with a draggable handle, spanning all lanes. */
function Playhead({ currentTime, pxPerSecond, onGrab }: PlayheadProps) {
  const left = timeToPixels(currentTime, pxPerSecond)
  return (
    <div className="timeline-playhead" style={{ left }}>
      <div
        className="timeline-playhead__handle"
        onMouseDown={onGrab}
        title="Drag to scrub"
      />
      <div className="timeline-playhead__line" />
    </div>
  )
}

export default Playhead
