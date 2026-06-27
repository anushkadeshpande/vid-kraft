import { describe, it, expect } from 'vitest'
import {
  timeToPixels,
  pixelsToTime,
  snap,
  snapClipStart,
  rulerTickInterval,
} from '../../src/core/timeline'

describe('timeline math', () => {
  describe('timeToPixels', () => {
    it('multiplies seconds by pixels-per-second', () => {
      expect(timeToPixels(10, 50)).toBe(500)
    })

    it('returns 0 at time 0', () => {
      expect(timeToPixels(0, 50)).toBe(0)
    })
  })

  describe('pixelsToTime', () => {
    it('divides pixels by pixels-per-second', () => {
      expect(pixelsToTime(500, 50)).toBe(10)
    })

    it('round-trips with timeToPixels', () => {
      const px = timeToPixels(7.5, 64)
      expect(pixelsToTime(px, 64)).toBeCloseTo(7.5, 6)
    })

    it('returns 0 for a non-positive zoom', () => {
      expect(pixelsToTime(500, 0)).toBe(0)
      expect(pixelsToTime(500, -10)).toBe(0)
    })
  })

  describe('snap', () => {
    it('snaps to the nearest candidate within threshold', () => {
      expect(snap(10.2, [0, 5, 10, 15], 0.5)).toBe(10)
    })

    it('leaves the value unchanged when no candidate is within threshold', () => {
      expect(snap(12, [0, 5, 10], 0.5)).toBe(12)
    })

    it('chooses the closest of multiple in-range candidates', () => {
      expect(snap(9.6, [9, 10], 1)).toBe(10)
    })

    it('only snaps to exact matches when threshold is 0', () => {
      expect(snap(10, [10], 0)).toBe(10)
      expect(snap(10.01, [10], 0)).toBe(10.01)
    })

    it('returns the value when there are no candidates', () => {
      expect(snap(10, [], 1)).toBe(10)
    })
  })

  describe('snapClipStart', () => {
    it('snaps the leading edge to a candidate', () => {
      expect(snapClipStart(4.9, 3, [5, 20], 0.25)).toBe(5)
    })

    it('snaps the trailing edge by adjusting the start', () => {
      // end = 9.9 -> snaps to 10 -> start becomes 10 - 3 = 7
      expect(snapClipStart(7.1, 3, [10], 0.25)).toBeCloseTo(7, 6)
    })

    it('prefers the edge that moves the least', () => {
      // start 5.1 (delta .1 to 5) vs end 8.1 -> 8 (delta .1) tie -> leading wins
      expect(snapClipStart(5.1, 3, [5, 8], 0.25)).toBe(5)
    })

    it('returns the original start when nothing is in range', () => {
      expect(snapClipStart(5.1, 3, [0, 20], 0.05)).toBe(5.1)
    })
  })

  describe('rulerTickInterval', () => {
    it('picks a larger interval when zoomed out', () => {
      const interval = rulerTickInterval(5, 60)
      expect(interval * 5).toBeGreaterThanOrEqual(60)
    })

    it('picks 1 second when zoomed in', () => {
      expect(rulerTickInterval(100, 60)).toBe(1)
    })
  })
})
