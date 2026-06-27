// ============================================================
// Track helpers — pure factory & compatibility logic for tracks/clips
// ============================================================

import type { Clip, MediaAsset, MediaType, Track, TrackType, Viewport } from './types'
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

/**
 * Fit content of the given native size inside `viewport`, preserving aspect
 * ratio and centering it (letterbox/pillarbox). Falls back to filling the
 * viewport when the content has no usable dimensions.
 */
export function containRect(
  contentWidth: number,
  contentHeight: number,
  viewport: Viewport
): { x: number; y: number; width: number; height: number } {
  if (contentWidth <= 0 || contentHeight <= 0) {
    return { x: 0, y: 0, width: viewport.width, height: viewport.height }
  }
  const scale = Math.min(viewport.width / contentWidth, viewport.height / contentHeight)
  const width = contentWidth * scale
  const height = contentHeight * scale
  return {
    x: (viewport.width - width) / 2,
    y: (viewport.height - height) / 2,
    width,
    height,
  }
}

/**
 * Create a clip from an asset, placed on a track at a (non-negative) start time.
 * When `viewport` is provided and the asset has native dimensions, the clip's
 * transform is fit into the viewport preserving the source aspect ratio.
 */
export function createClipFromAsset(
  asset: MediaAsset,
  trackId: string,
  startTime: number,
  viewport?: Viewport
): Clip {
  const placement =
    viewport && asset.width && asset.height
      ? containRect(asset.width, asset.height, viewport)
      : { x: 0, y: 0, width: asset.width ?? 0, height: asset.height ?? 0 }
  return {
    id: uuidv4(),
    assetId: asset.id,
    trackId,
    startTime: Math.max(0, startTime),
    duration: clipDurationForAsset(asset),
    trimStart: 0,
    trimEnd: 0,
    transform: {
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
      rotation: 0,
      opacity: 1,
    },
    volume: 1,
  }
}
