// ============================================================
// Preview compositing — pure helpers for resolving clips, z-order,
// viewport fitting, and project duration. UI-free and unit-testable.
// ============================================================

import type { Clip, Track, Viewport } from './types'

export interface ResolvedClip {
  clip: Clip
  /** Source media time = trimStart + elapsed time into the clip. */
  sourceTime: number
}

/**
 * Resolve which clip on a track is visible at `time` (start inclusive, end
 * exclusive) and the corresponding source-media time. Returns null on a gap.
 */
export function resolveClipAtTime(track: Track, time: number): ResolvedClip | null {
  for (const clip of track.clips) {
    const end = clip.startTime + clip.duration
    if (time >= clip.startTime && time < end) {
      return { clip, sourceTime: clip.trimStart + (time - clip.startTime) }
    }
  }
  return null
}

/**
 * Tracks in draw order (z-order): base tracks first in array order, overlay
 * tracks last (drawn on top). Stable for tracks of the same precedence.
 */
export function orderTracksForDraw(tracks: Track[]): Track[] {
  const precedence = (t: Track) => (t.type === 'overlay' ? 1 : 0)
  return tracks
    .map((track, index) => ({ track, index }))
    .sort((a, b) => precedence(a.track) - precedence(b.track) || a.index - b.index)
    .map((entry) => entry.track)
}

export interface VisibleLayer {
  track: Track
  clip: Clip
  sourceTime: number
}

/**
 * The visible clip on each visible track at `time`, in z-order
 * (index 0 is the bottom layer, last is the top).
 */
export function resolveVisibleLayers(tracks: Track[], time: number): VisibleLayer[] {
  const layers: VisibleLayer[] = []
  for (const track of orderTracksForDraw(tracks)) {
    if (!track.visible) continue
    const resolved = resolveClipAtTime(track, time)
    if (resolved) {
      layers.push({ track, clip: resolved.clip, sourceTime: resolved.sourceTime })
    }
  }
  return layers
}

/**
 * The active clip on each unmuted track at `time`. Drives preview audio:
 * visibility controls drawing, muting controls sound, so audio uses a separate
 * resolution from {@link resolveVisibleLayers}.
 */
export function resolveAudibleLayers(tracks: Track[], time: number): VisibleLayer[] {
  const layers: VisibleLayer[] = []
  for (const track of tracks) {
    if (track.muted) continue
    const resolved = resolveClipAtTime(track, time)
    if (resolved) {
      layers.push({ track, clip: resolved.clip, sourceTime: resolved.sourceTime })
    }
  }
  return layers
}

export interface Fit {
  scale: number
  width: number
  height: number
  offsetX: number
  offsetY: number
}

/**
 * Uniformly scale `viewport` to fit `available`, preserving aspect ratio and
 * centering (letterbox/pillarbox). Returns zeroes for non-positive inputs.
 */
export function fitToViewport(
  viewport: Viewport,
  available: { width: number; height: number }
): Fit {
  if (
    viewport.width <= 0 ||
    viewport.height <= 0 ||
    available.width <= 0 ||
    available.height <= 0
  ) {
    return { scale: 0, width: 0, height: 0, offsetX: 0, offsetY: 0 }
  }
  const scale = Math.min(available.width / viewport.width, available.height / viewport.height)
  const width = viewport.width * scale
  const height = viewport.height * scale
  return {
    scale,
    width,
    height,
    offsetX: (available.width - width) / 2,
    offsetY: (available.height - height) / 2,
  }
}

/** Total project duration (seconds): the latest clip end across all tracks. */
export function projectDuration(tracks: Track[]): number {
  let max = 0
  for (const track of tracks) {
    for (const clip of track.clips) {
      max = Math.max(max, clip.startTime + clip.duration)
    }
  }
  return max
}

export interface ViewportPreset {
  id: string
  label: string
  width: number
  height: number
}

/** Output viewport presets offered in the UI. */
export const VIEWPORT_PRESETS: ViewportPreset[] = [
  { id: '1080p', label: '1080p · 16:9', width: 1920, height: 1080 },
  { id: '720p', label: '720p · 16:9', width: 1280, height: 720 },
  { id: '9:16', label: 'Mobile · 9:16', width: 1080, height: 1920 },
  { id: '1:1', label: 'Square · 1:1', width: 1080, height: 1080 },
]

/** Find the preset matching the given dimensions, if any. */
export function matchViewportPreset(viewport: Viewport): ViewportPreset | undefined {
  return VIEWPORT_PRESETS.find(
    (p) => p.width === viewport.width && p.height === viewport.height
  )
}
