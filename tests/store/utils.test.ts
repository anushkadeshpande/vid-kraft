import { describe, it, expect } from 'vitest'
import { v4 } from '../../src/store/utils'

describe('Utils', () => {
  describe('v4 (UUID generator)', () => {
    it('should return a string', () => {
      expect(typeof v4()).toBe('string')
    })

    it('should return a valid UUID v4 format', () => {
      const uuid = v4()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      expect(uuid).toMatch(uuidRegex)
    })

    it('should generate unique values', () => {
      const uuids = new Set(Array.from({ length: 100 }, () => v4()))
      expect(uuids.size).toBe(100)
    })

    it('should always have version 4 character', () => {
      for (let i = 0; i < 50; i++) {
        const uuid = v4()
        expect(uuid[14]).toBe('4')
      }
    })

    it('should always have variant bits (8, 9, a, or b) at position 19', () => {
      for (let i = 0; i < 50; i++) {
        const uuid = v4()
        expect(['8', '9', 'a', 'b']).toContain(uuid[19])
      }
    })

    it('should have correct length (36 chars with hyphens)', () => {
      expect(v4().length).toBe(36)
    })
  })
})
