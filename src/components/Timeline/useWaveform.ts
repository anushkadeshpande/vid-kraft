import { useEffect, useState } from 'react'
import type { Id, MediaAsset } from '../../core/types'
import { extractPeaks } from '../../services/ffmpeg'

// Module-level caches so each asset's peaks are extracted once and shared
// across every clip that references the asset.
const peakCache = new Map<Id, number[]>()
const pending = new Map<Id, Promise<number[]>>()

function hasAudio(asset?: MediaAsset): boolean {
  return !!asset && (asset.type === 'audio' || asset.type === 'video')
}

/**
 * Load and cache normalized audio peaks for an asset. Returns `null` while the
 * waveform is still being extracted (or when the asset has no audio).
 */
export function useWaveform(asset?: MediaAsset): number[] | null {
  const [peaks, setPeaks] = useState<number[] | null>(() =>
    asset ? peakCache.get(asset.id) ?? null : null
  )

  useEffect(() => {
    if (!hasAudio(asset)) {
      setPeaks(null)
      return
    }
    const id = asset!.id
    const cached = peakCache.get(id)
    if (cached) {
      setPeaks(cached)
      return
    }

    let active = true
    let promise = pending.get(id)
    if (!promise) {
      promise = extractPeaks(asset!.path)
        .then((value) => {
          peakCache.set(id, value)
          pending.delete(id)
          return value
        })
        .catch(() => {
          pending.delete(id)
          return [] as number[]
        })
      pending.set(id, promise)
    }
    promise.then((value) => {
      if (active) setPeaks(value)
    })
    return () => {
      active = false
    }
  }, [asset])

  return peaks
}
