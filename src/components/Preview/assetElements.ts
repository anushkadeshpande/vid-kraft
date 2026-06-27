import type { MediaAsset, Transform, Viewport } from '../../core/types'
import { toFileUrl } from '../MediaBin/format'

/** A canvas-drawable source for a visual asset. */
export type DrawableElement = HTMLVideoElement | HTMLImageElement

/** Any pooled preview element: drawable (video/image) or audio-only. */
export type PreviewElement = DrawableElement | HTMLAudioElement

/**
 * Create a hidden, decoded element for an asset. Video and image assets return
 * a drawable element; audio assets return an `<audio>` element (played but not
 * drawn). Unknown types return null.
 */
export function createElementForAsset(asset: MediaAsset): PreviewElement | null {
  if (asset.type === 'video') {
    const video = document.createElement('video')
    video.src = toFileUrl(asset.path)
    video.muted = true
    video.preload = 'auto'
    video.playsInline = true
    return video
  }
  if (asset.type === 'image') {
    const img = new Image()
    img.src = toFileUrl(asset.path)
    return img
  }
  if (asset.type === 'audio') {
    const audio = document.createElement('audio')
    audio.src = toFileUrl(asset.path)
    audio.preload = 'auto'
    return audio
  }
  return null
}

/** Whether an element has enough data to be drawn this frame. */
export function isDrawable(el: DrawableElement): boolean {
  if (el instanceof HTMLVideoElement) return el.readyState >= 2 // HAVE_CURRENT_DATA
  return el.complete && el.naturalWidth > 0
}

/** Intrinsic pixel size of a drawable source, or null when not yet known. */
function intrinsicSize(el: DrawableElement): { width: number; height: number } | null {
  if (el instanceof HTMLVideoElement) {
    return el.videoWidth > 0 && el.videoHeight > 0
      ? { width: el.videoWidth, height: el.videoHeight }
      : null
  }
  return el.naturalWidth > 0 && el.naturalHeight > 0
    ? { width: el.naturalWidth, height: el.naturalHeight }
    : null
}

/**
 * Draw a single layer into the viewport coordinate space, applying the clip's
 * transform (position, scale, rotation, opacity). The source is always fit
 * inside the transform's box preserving its intrinsic aspect ratio (centered
 * letterbox/pillarbox) so video and images are never stretched. Falls back to
 * the full viewport when the transform has no explicit size.
 */
export function drawLayer(
  ctx: CanvasRenderingContext2D,
  el: DrawableElement,
  transform: Transform,
  viewport: Viewport
): void {
  if (!isDrawable(el)) return
  const boxW = transform.width || viewport.width
  const boxH = transform.height || viewport.height

  // Fit the source's intrinsic aspect ratio inside the box, centered.
  const intrinsic = intrinsicSize(el)
  let dx = transform.x
  let dy = transform.y
  let dw = boxW
  let dh = boxH
  if (intrinsic) {
    const scale = Math.min(boxW / intrinsic.width, boxH / intrinsic.height)
    dw = intrinsic.width * scale
    dh = intrinsic.height * scale
    dx = transform.x + (boxW - dw) / 2
    dy = transform.y + (boxH - dh) / 2
  }

  const cx = transform.x + boxW / 2
  const cy = transform.y + boxH / 2

  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(1, transform.opacity))
  ctx.translate(cx, cy)
  ctx.rotate((transform.rotation * Math.PI) / 180)
  ctx.translate(-cx, -cy)
  ctx.drawImage(el, dx, dy, dw, dh)
  ctx.restore()
}
