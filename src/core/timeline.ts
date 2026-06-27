// ============================================================
// Timeline math — pure helpers for time <-> pixel mapping and snapping
// ============================================================

/** Convert a time in seconds to a horizontal pixel offset at a given zoom. */
export function timeToPixels(seconds: number, pxPerSecond: number): number {
  return seconds * pxPerSecond
}

/** Convert a horizontal pixel offset back to time in seconds at a given zoom. */
export function pixelsToTime(pixels: number, pxPerSecond: number): number {
  if (pxPerSecond <= 0) return 0
  return pixels / pxPerSecond
}

/**
 * Snap a value to the nearest candidate within `threshold`.
 * Returns the closest candidate when one is within range, otherwise the
 * original value unchanged. A threshold of 0 only snaps to exact matches.
 */
export function snap(value: number, candidates: number[], threshold: number): number {
  let best = value
  let bestDist = threshold
  for (const candidate of candidates) {
    const dist = Math.abs(candidate - value)
    if (dist <= bestDist) {
      bestDist = dist
      best = candidate
    }
  }
  return best
}

/**
 * Snap a dragged clip's start time so that either its leading or trailing
 * edge aligns to one of the candidate times (other clip edges, the playhead,
 * the origin). Whichever edge produces the closer snap wins.
 */
export function snapClipStart(
  start: number,
  duration: number,
  candidates: number[],
  threshold: number
): number {
  const snappedStart = snap(start, candidates, threshold)
  const startDelta = Math.abs(snappedStart - start)

  const end = start + duration
  const snappedEnd = snap(end, candidates, threshold)
  const endDelta = Math.abs(snappedEnd - end)

  if (startDelta === 0 && endDelta === 0) return start
  // Prefer the edge that moved the least (and actually snapped).
  if (endDelta > 0 && (startDelta === 0 || endDelta < startDelta)) {
    return snappedEnd - duration
  }
  return snappedStart
}

/** Choose a "nice" tick interval (seconds) so ruler labels stay readable. */
export function rulerTickInterval(pxPerSecond: number, minTickPx = 60): number {
  const niceSteps = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600]
  for (const step of niceSteps) {
    if (step * pxPerSecond >= minTickPx) return step
  }
  return niceSteps[niceSteps.length - 1]
}
