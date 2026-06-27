// ============================================================
// Audio mix model — how unmuted audio tracks combine for export
// ============================================================

import type { Id, MediaAsset, Track } from './types'

/** A single audio contribution to the export mix. */
export interface AudioMixSource {
  clipId: Id
  assetId: Id
  path: string
  /** When the clip starts on the timeline (seconds). */
  timelineStart: number
  /** Offset into the source where playback begins (seconds). */
  sourceIn: number
  /** How long the clip plays (seconds). */
  duration: number
  /** Gain applied to this source (0..1). */
  volume: number
}

/** Clamp a volume value to the valid 0..1 gain range. */
export function clampVolume(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(1, value))
}

/**
 * Build the export audio mix plan: every clip on an unmuted audio track,
 * carrying its per-clip volume. Muted tracks and non-audio tracks are excluded,
 * and clips whose asset is missing are skipped. Phase 8 renders this plan with
 * FFmpeg (delay + volume + amix).
 */
export function buildAudioMixPlan(tracks: Track[], assets: MediaAsset[]): AudioMixSource[] {
  const byId = new Map<Id, MediaAsset>(assets.map((a) => [a.id, a]))
  const sources: AudioMixSource[] = []
  for (const track of tracks) {
    if (track.type !== 'audio' || track.muted) continue
    for (const clip of track.clips) {
      const asset = byId.get(clip.assetId)
      if (!asset) continue
      sources.push({
        clipId: clip.id,
        assetId: clip.assetId,
        path: asset.path,
        timelineStart: clip.startTime,
        sourceIn: clip.trimStart,
        duration: clip.duration,
        volume: clampVolume(clip.volume),
      })
    }
  }
  return sources
}

/** Apply a clip's volume gain to a single audio sample. */
export function applyVolume(sample: number, volume: number): number {
  return sample * clampVolume(volume)
}

/**
 * Sum overlapping samples into a single mixed sample, hard-limited to [-1, 1]
 * so combined tracks never clip past full scale.
 */
export function mixSamples(samples: number[]): number {
  let sum = 0
  for (const s of samples) sum += s
  return Math.max(-1, Math.min(1, sum))
}
