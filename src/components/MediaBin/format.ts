import type { MediaAsset } from '../../core/types'

/** Format seconds as m:ss (or h:mm:ss for long media). */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—'
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

/** Human-readable file size. */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(value < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`
}

/** Resolution string like 1920×1080, or '—' when unknown. */
export function formatResolution(asset: Pick<MediaAsset, 'width' | 'height'>): string {
  if (!asset.width || !asset.height) return '—'
  return `${asset.width}×${asset.height}`
}

/** Convert a local file path to a file:// URL usable in <img src>. */
export function toFileUrl(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`
  return `file://${encodeURI(withSlash)}`
}
