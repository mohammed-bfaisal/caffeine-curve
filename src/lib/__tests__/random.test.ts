import { describe, expect, it } from 'vitest'
import { hashSeed, mulberry32 } from '../random'

describe('hashSeed', () => {
  it('is deterministic for the same input', () => {
    expect(hashSeed('abc')).toBe(hashSeed('abc'))
  })

  it('differs for different inputs', () => {
    expect(hashSeed('abc')).not.toBe(hashSeed('abd'))
  })
})

describe('mulberry32', () => {
  it('produces the same sequence for the same seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const seqA = [a(), a(), a()]
    const seqB = [b(), b(), b()]
    expect(seqA).toEqual(seqB)
  })

  it('produces values in [0, 1)', () => {
    const rand = mulberry32(1)
    for (let i = 0; i < 100; i++) {
      const v = rand()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1)()
    const b = mulberry32(2)()
    expect(a).not.toBe(b)
  })
})
