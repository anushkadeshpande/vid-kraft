import type { MediaAsset, Transform, Viewport } from '../../core/types'
import { toFileUrl } from '../MediaBin/format'

/** A canvas-drawable source for a visual asset. */
export type DrawableElement = HTMLVideoElement | HTMLImageElement

/**
 * Create a hidden, decoded element for a visual asset (video or image).
 * Audio assets have no visual representation and return null.
 */
export function createElementForAsset(asset: MediaAsset): DrawableElement | null {
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
  return null
}

/** Whether an element has enough data to be drawn this frame. */
export function isDrawable(el: DrawableElement): boolean {
  if (el instanceof HTMLVideoElement) return el.readyState >= 2 // HAVE_CURRENT_DATA
  return el.complete && el.naturalWidth > 0
}

/**
 * Draw a single layer into the viewport coordinate space, applying the clip's
 * transform (position, scale, rotation, opacity). Falls back to the full
 * viewport when the transform has no explicit size.
 */
export function drawLayer(
  ctx: CanvasRenderingContext2D,
  el: DrawableElement,
  transform: Transform,
  viewport: Viewport
): void {
  if (!isDrawable(el)) return
  const w = transform.width || viewport.width
  const h = transform.height || viewport.height
  const cx = transform.x + w / 2
  const cy = transform.y + h / 2

  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(1, transform.opacity))
  ctx.translate(cx, cy)
  ctx.rotate((transform.rotation * Math.PI) / 180)
  ctx.translate(-cx, -cy)
  ctx.drawImage(el, transform.x, transform.y, w, h)
  ctx.restore()
}
