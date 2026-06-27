import { ipcMain } from 'electron'
import ffmpeg from 'fluent-ffmpeg'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

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

/** A trimmed source segment to feed into a concat render. */
export interface ConcatSegment {
  path: string
  trimStart: number
  duration: number
}

/** Metadata for a file rendered by FFmpeg. */
export interface RenderedAsset {
  path: string
  duration: number
  width?: number
  height?: number
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

  // Concatenate trimmed source segments into one rendered file
  ipcMain.handle(
    'ffmpeg:concat',
    async (_event, segments: ConcatSegment[], outputDir: string): Promise<RenderedAsset> => {
      if (!segments || segments.length === 0) throw new Error('No segments to concat')

      const stamp = Date.now()
      const tempFiles: string[] = []

      // 1. Render each trimmed segment to a temp file.
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]
        const out = path.join(outputDir, `concat_${stamp}_${i}.mp4`)
        tempFiles.push(out)
        await runFfmpeg(
          ffmpeg(seg.path)
            .setStartTime(seg.trimStart)
            .setDuration(seg.duration)
            .outputOptions(['-preset', 'veryfast'])
            .output(out)
        )
      }

      // 2. Concat the temp files via the concat demuxer.
      const listFile = path.join(outputDir, `concat_${stamp}.txt`)
      fs.writeFileSync(
        listFile,
        tempFiles.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n')
      )
      const outputPath = path.join(outputDir, `merged_${stamp}.mp4`)
      await runFfmpeg(
        ffmpeg(listFile)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .outputOptions(['-c', 'copy'])
          .output(outputPath)
      )

      // 3. Clean up temp files.
      for (const f of [...tempFiles, listFile]) {
        try {
          fs.unlinkSync(f)
        } catch {
          /* ignore */
        }
      }

      return probeRendered(outputPath)
    }
  )

  // Demux a source file into separate video-only and audio-only files
  ipcMain.handle(
    'ffmpeg:split',
    async (
      _event,
      inputPath: string,
      outputDir: string
    ): Promise<{ video: RenderedAsset; audio: RenderedAsset }> => {
      const stamp = Date.now()
      const videoPath = path.join(outputDir, `video_${stamp}.mp4`)
      const audioPath = path.join(outputDir, `audio_${stamp}.m4a`)

      await runFfmpeg(
        ffmpeg(inputPath).noAudio().outputOptions(['-c:v', 'copy']).output(videoPath)
      )
      await runFfmpeg(
        ffmpeg(inputPath).noVideo().outputOptions(['-c:a', 'copy']).output(audioPath)
      )

      const [video, audio] = await Promise.all([
        probeRendered(videoPath),
        probeRendered(audioPath),
      ])
      return { video, audio }
    }
  )

  // Extract normalized audio peaks (0..1) at a fixed time resolution for waveforms
  ipcMain.handle(
    'ffmpeg:peaks',
    async (_event, filePath: string, samplesPerSecond = 50): Promise<number[]> => {
      const decodeRate = 8000
      const tmp = path.join(
        os.tmpdir(),
        `peaks_${Date.now()}_${Math.random().toString(36).slice(2)}.raw`
      )
      try {
        await runFfmpeg(
          ffmpeg(filePath)
            .noVideo()
            .audioChannels(1)
            .audioFrequency(decodeRate)
            .outputOptions(['-f', 's16le', '-acodec', 'pcm_s16le'])
            .output(tmp)
        )
        const buf = fs.readFileSync(tmp)
        const sampleCount = Math.floor(buf.length / 2)
        const samples = new Int16Array(buf.buffer, buf.byteOffset, sampleCount)
        const windowSize = Math.max(1, Math.round(decodeRate / Math.max(1, samplesPerSecond)))
        const peaks: number[] = []
        for (let i = 0; i < samples.length; i += windowSize) {
          const end = Math.min(samples.length, i + windowSize)
          let max = 0
          for (let j = i; j < end; j++) {
            const v = Math.abs(samples[j])
            if (v > max) max = v
          }
          peaks.push(max / 32768)
        }
        return peaks
      } catch {
        // No audio stream or decode failure — return an empty waveform.
        return []
      } finally {
        try {
          fs.unlinkSync(tmp)
        } catch {
          /* ignore */
        }
      }
    }
  )
}

/** Run a configured fluent-ffmpeg command to completion. */
function runFfmpeg(command: ffmpeg.FfmpegCommand): Promise<void> {
  return new Promise((resolve, reject) => {
    command
      .on('end', () => resolve())
      .on('error', (err) => reject(err.message))
      .run()
  })
}

/** Probe a rendered file for the subset of metadata callers need. */
function probeRendered(filePath: string): Promise<RenderedAsset> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err.message)
        return
      }
      const videoStream = metadata.streams.find((s) => s.codec_type === 'video')
      resolve({
        path: filePath,
        duration: metadata.format.duration || 0,
        width: videoStream?.width,
        height: videoStream?.height,
      })
    })
  })
}
