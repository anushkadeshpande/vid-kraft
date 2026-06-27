// ============================================================
// Waveform helpers — pure peak bucketing for timeline rendering
// ============================================================

/**
 * Reduce a list of source peaks to exactly `buckets` values, taking the max
 * absolute amplitude in each bucket. Returns zeros when there are no peaks so
 * callers can render a flat line while waveform data loads.
 */
export function bucketPeaks(peaks: number[], buckets: number): number[] {
  if (buckets <= 0) return []
  const out = new Array<number>(buckets).fill(0)
  if (peaks.length === 0) return out
  for (let b = 0; b < buckets; b++) {
    const start = Math.floor((b * peaks.length) / buckets)
    const end = Math.max(start + 1, Math.floor(((b + 1) * peaks.length) / buckets))
    let max = 0
    for (let i = start; i < end && i < peaks.length; i++) {
      const v = Math.abs(peaks[i])
      if (v > max) max = v
    }
    out[b] = max
  }
  return out
}

/**
 * Slice the peaks covering the source time range `[fromSec, fromSec + lengthSec]`.
 * Peaks are assumed evenly spaced across `sourceDuration` seconds; this lets a
 * trimmed clip render only the portion of the source it actually shows.
 */
export function slicePeaks(
  peaks: number[],
  sourceDuration: number,
  fromSec: number,
  lengthSec: number
): number[] {
  if (peaks.length === 0 || sourceDuration <= 0 || lengthSec <= 0) return []
  const perSec = peaks.length / sourceDuration
  const start = Math.max(0, Math.floor(fromSec * perSec))
  const end = Math.min(peaks.length, Math.ceil((fromSec + lengthSec) * perSec))
  return peaks.slice(start, Math.max(start, end))
}
