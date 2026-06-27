import { describe, it, expect } from 'vitest'
import { operationRegistry } from '../../../src/core/registry'
import '../../../src/core/operations'

describe('operations registry', () => {
  it('registers every editing operation', () => {
    for (const id of ['cut', 'trim', 'delete', 'merge', 'split-av']) {
      expect(operationRegistry.has(id)).toBe(true)
    }
  })

  it('exposes operations under the edit category', () => {
    const ids = operationRegistry.getByCategory('edit').map((o) => o.id)
    expect(ids).toEqual(expect.arrayContaining(['cut', 'trim', 'delete', 'merge', 'split-av']))
  })
})
