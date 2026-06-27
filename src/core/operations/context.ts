// ============================================================
// Editing context — the state surface that operations depend on
// ============================================================
// Operations are written against this small interface (not the
// zustand store directly) so they stay pure and unit-testable.

import type { Clip, Id, MediaAsset, Track } from '../types'

/** Minimal read + mutation surface used by editing operations. */
export interface EditingContext {
  /** Current tracks (read live each call). */
  getTracks(): Track[]
  /** Current assets (read live each call). */
  getAssets(): MediaAsset[]
  addTrack(track: Track): void
  removeTrack(trackId: Id): void
  addClip(trackId: Id, clip: Clip): void
  removeClip(trackId: Id, clipId: Id): void
  updateClip(trackId: Id, clipId: Id, updates: Partial<Clip>): void
  addAsset(asset: MediaAsset): void
  removeAsset(assetId: Id): void
}

/** Locate a clip (and its track) by id within a list of tracks. */
export function findClip(
  tracks: Track[],
  clipId: Id
): { track: Track; clip: Clip } | null {
  for (const track of tracks) {
    const clip = track.clips.find((c) => c.id === clipId)
    if (clip) return { track, clip }
  }
  return null
}
