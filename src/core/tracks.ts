// ============================================================
// Track helpers — pure factory & compatibility logic for tracks/clips
// ============================================================

import type { Clip, MediaAsset, MediaType, Track, TrackType } from './types'
import { v4 as uuidv4 } from '../store/utils'

/** Default on-timeline duration (seconds) for still images. */
export const DEFAULT_IMAGE_DURATION = 5

/**
 * Which track types accept each media type. Extend this registry (e.g. via
 * {@link setMediaTrackCompatibility}) to support new pairings without editing
 * call sites — Open/Closed.
 */
const COMPATIBILITY: Record<MediaType, TrackType[]> = {
  video: ['video'],
  image: ['video', 'overlay'],
  audio: ['audio'],
}

/** Register or override the track types a media type can be placed on. */
export function setMediaTrackCompatibility(media: MediaType, trackTypes: TrackType[]): void {
  COMPATIBILITY[media] = [...trackTypes]
}

/** Track types that accept the given media type. */
export function compatibleTrackTypes(media: MediaType): TrackType[] {
  return COMPATIBILITY[media] ? [...COMPATIBILITY[media]] : []
}

/** Whether an asset of `media` type can be placed on a `trackType` track. */
export function isAssetCompatibleWithTrack(media: MediaType, trackType: TrackType): boolean {
  return compatibleTrackTypes(media).includes(trackType)
}

const TRACK_DEFAULT_NAME: Record<TrackType, string> = {
  video: 'Video',
  audio: 'Audio',
  overlay: 'Overlay',
}

/** Create a new empty, unlocked, visible track of the given type. */
export function createTrack(type: TrackType, name?: string): Track {
  return {
    id: uuidv4(),
    type,
    name: name ?? TRACK_DEFAULT_NAME[type],
    clips: [],
    muted: false,
    locked: false,
    visible: true,
  }
}

/** On-timeline duration to use for an asset (images get a default length). */
export function clipDurationForAsset(asset: MediaAsset): number {
  if (asset.type === 'image' || asset.duration <= 0) return DEFAULT_IMAGE_DURATION
  return asset.duration
}

/** Create a clip from an asset, placed on a track at a (non-negative) start time. */
export function createClipFromAsset(
  asset: MediaAsset,
  trackId: string,
  startTime: number
): Clip {
  return {
    id: uuidv4(),
    assetId: asset.id,
    trackId,
    startTime: Math.max(0, startTime),
    duration: clipDurationForAsset(asset),
    trimStart: 0,
    trimEnd: 0,
    transform: {
      x: 0,
      y: 0,
      width: asset.width ?? 0,
      height: asset.height ?? 0,
      rotation: 0,
      opacity: 1,
    },
    volume: 1,
  }
}
