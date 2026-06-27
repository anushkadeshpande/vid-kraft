import { protocol } from 'electron'
import { createReadStream, statSync } from 'node:fs'
import { extname } from 'node:path'
import { Readable } from 'node:stream'

/** Custom privileged scheme used to serve local media files to the renderer. */
export const MEDIA_SCHEME = 'media'

/** Renderer-facing prefix for media URLs: media://local/<encoded absolute path>. */
const MEDIA_PREFIX = `${MEDIA_SCHEME}://local/`

const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.flac': 'audio/flac',
  '.aac': 'audio/aac',
  '.m4a': 'audio/mp4',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
}

function mimeFor(filePath: string): string {
  return MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
}

/** Decode a media:// URL back to an absolute filesystem path. */
function pathFromUrl(url: string): string {
  const encoded = url.startsWith(MEDIA_PREFIX)
    ? url.slice(MEDIA_PREFIX.length)
    : url.slice(`${MEDIA_SCHEME}://`.length)
  return decodeURIComponent(encoded)
}

/**
 * Register the privileged media scheme. MUST be called before the app
 * `ready` event so the renderer is allowed to fetch/stream from it.
 */
export function registerMediaScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: MEDIA_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
        bypassCSP: true,
      },
    },
  ])
}

/**
 * Register the media protocol handler. MUST be called after the app is ready.
 * Streams local files with HTTP range support so seeking works for video.
 */
export function registerMediaProtocol(): void {
  protocol.handle(MEDIA_SCHEME, (request) => {
    const filePath = pathFromUrl(request.url)

    let size: number
    try {
      size = statSync(filePath).size
    } catch {
      return new Response('Not found', { status: 404 })
    }

    const mime = mimeFor(filePath)
    const range = request.headers.get('range')
    const rangeMatch = range ? /bytes=(\d*)-(\d*)/.exec(range) : null

    if (rangeMatch) {
      const start = rangeMatch[1] ? parseInt(rangeMatch[1], 10) : 0
      const requestedEnd = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : size - 1
      const end = Math.min(requestedEnd, size - 1)
      const stream = createReadStream(filePath, { start, end })
      return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
        status: 206,
        headers: {
          'Content-Type': mime,
          'Content-Length': String(end - start + 1),
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
        },
      })
    }

    const stream = createReadStream(filePath)
    return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Length': String(size),
        'Accept-Ranges': 'bytes',
      },
    })
  })
}
