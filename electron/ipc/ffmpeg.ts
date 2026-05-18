import { ipcMain } from 'electron'
import ffmpeg from 'fluent-ffmpeg'
import path from 'node:path'

// Set ffmpeg path from installer
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
ffmpeg.setFfmpegPath(ffmpegPath)

/** Metadata returned from probing a media file */
export interface ProbeResult {
  duration: number
  width?: number
  height?: number
  codec?: string
  sampleRate?: number
  channels?: number
  fileSize: number
}

/** Register all FFmpeg-related IPC handlers */
export function registerFfmpegHandlers() {
  // Probe a media file for metadata
  ipcMain.handle('ffmpeg:probe', async (_event, filePath: string): Promise<ProbeResult> => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err.message)
          return
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video')
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio')

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream?.width,
          height: videoStream?.height,
          codec: videoStream?.codec_name || audioStream?.codec_name,
          sampleRate: audioStream?.sample_rate ? Number(audioStream.sample_rate) : undefined,
          channels: audioStream?.channels,
          fileSize: metadata.format.size || 0,
        })
      })
    })
  })

  // Generate a thumbnail for a video file
  ipcMain.handle('ffmpeg:thumbnail', async (_event, filePath: string, outputDir: string, timestamp: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const filename = `thumb_${Date.now()}.png`
      ffmpeg(filePath)
        .screenshots({
          timestamps: [timestamp || '00:00:01'],
          filename,
          folder: outputDir,
          size: '320x?',
        })
        .on('end', () => {
          resolve(path.join(outputDir, filename))
        })
        .on('error', (err) => {
          reject(err.message)
        })
    })
  })

  // Export/render — placeholder for Phase 8
  ipcMain.handle('ffmpeg:export', async (_event, _options: unknown): Promise<string> => {
    // Will be implemented in Phase 8
    return 'not-implemented'
  })
}
