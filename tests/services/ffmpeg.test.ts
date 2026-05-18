import { describe, it, expect, vi, beforeEach } from 'vitest'
import { probeFile, generateThumbnail, exportProject } from '../../src/services/ffmpeg'

// Mock window.ipcRenderer
const mockInvoke = vi.fn()

beforeEach(() => {
  vi.stubGlobal('window', {
    ipcRenderer: {
      invoke: mockInvoke,
    },
  })
  mockInvoke.mockReset()
})

describe('FFmpeg Service', () => {
  describe('probeFile', () => {
    it('should call ipcRenderer.invoke with correct channel and args', async () => {
      const mockResult = {
        duration: 120,
        width: 1920,
        height: 1080,
        codec: 'h264',
        fileSize: 50000000,
      }
      mockInvoke.mockResolvedValue(mockResult)

      const result = await probeFile('/path/to/video.mp4')
      expect(mockInvoke).toHaveBeenCalledWith('ffmpeg:probe', '/path/to/video.mp4')
      expect(result).toEqual(mockResult)
    })

    it('should propagate errors', async () => {
      mockInvoke.mockRejectedValue(new Error('File not found'))
      await expect(probeFile('/invalid/path')).rejects.toThrow('File not found')
    })
  })

  describe('generateThumbnail', () => {
    it('should call with correct arguments', async () => {
      mockInvoke.mockResolvedValue('/tmp/thumb_123.png')

      const result = await generateThumbnail('/video.mp4', '/tmp', '00:00:05')
      expect(mockInvoke).toHaveBeenCalledWith('ffmpeg:thumbnail', '/video.mp4', '/tmp', '00:00:05')
      expect(result).toBe('/tmp/thumb_123.png')
    })

    it('should use default timestamp when not provided', async () => {
      mockInvoke.mockResolvedValue('/tmp/thumb.png')

      await generateThumbnail('/video.mp4', '/tmp')
      expect(mockInvoke).toHaveBeenCalledWith('ffmpeg:thumbnail', '/video.mp4', '/tmp', '00:00:01')
    })
  })

  describe('exportProject', () => {
    it('should call with export options', async () => {
      mockInvoke.mockResolvedValue('/output/video.mp4')
      const options = { format: 'mp4', quality: 'high' }

      const result = await exportProject(options)
      expect(mockInvoke).toHaveBeenCalledWith('ffmpeg:export', options)
      expect(result).toBe('/output/video.mp4')
    })
  })
})
