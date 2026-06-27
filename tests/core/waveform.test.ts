import { describe, it, expect } from 'vitest'
import { bucketPeaks, slicePeaks } from '../../src/core/waveform'

describe('bucketPeaks', () => {
  it('returns an empty array for non-positive bucket counts', () => {
    expect(bucketPeaks([0.1, 0.2], 0)).toEqual([])
    expect(bucketPeaks([0.1, 0.2], -3)).toEqual([])
  })

  it('returns zeros when there are no peaks', () => {
    expect(bucketPeaks([], 3)).toEqual([0, 0, 0])
  })

  it('takes the max absolute amplitude per bucket', () => {
    // 4 source peaks into 2 buckets -> max of each half.
    expect(bucketPeaks([0.1, 0.4, 0.2, 0.9], 2)).toEqual([0.4, 0.9])
  })

  it('uses absolute values', () => {
    expect(bucketPeaks([-0.8, 0.3], 1)).toEqual([0.8])
  })

  it('upsamples to more buckets than peaks without dropping data', () => {
    const result = bucketPeaks([0.5, 1], 4)
    expect(result).toHaveLength(4)
    expect(Math.max(...result)).toBe(1)
  })
})

describe('slicePeaks', () => {
  it('returns an empty slice for invalid inputs', () => {
    expect(slicePeaks([], 10, 0, 5)).toEqual([])
    expect(slicePeaks([0.1], 0, 0, 5)).toEqual([])
    expect(slicePeaks([0.1], 10, 0, 0)).toEqual([])
  })

  it('slices the portion of the source the clip shows', () => {
    // 10 peaks over 10s -> 1 peak/sec. Take seconds [2, 6).
    const peaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    expect(slicePeaks(peaks, 10, 2, 4)).toEqual([2, 3, 4, 5])
  })

  it('clamps the slice to the available peaks', () => {
    const peaks = [0, 1, 2, 3]
    expect(slicePeaks(peaks, 4, 3, 10)).toEqual([3])
  })
})
