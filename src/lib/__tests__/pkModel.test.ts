import { describe, expect, it } from 'vitest'
import {
  concentrationAt,
  keFromHalfLife,
  peakConcentration,
  timeToPeakMinutes,
} from '../pkModel'

const AVERAGE_PROFILE = { halfLifeHours: 5, weightKg: 70 }

describe('keFromHalfLife', () => {
  it('derives the elimination constant from half-life', () => {
    // ke = ln(2) / t_half; for a 5hr half-life that is ln(2)/300min
    expect(keFromHalfLife(5)).toBeCloseTo(Math.log(2) / 300, 6)
  })
})

describe('concentrationAt', () => {
  it('is zero before intake', () => {
    expect(concentrationAt(100, -5, AVERAGE_PROFILE)).toBe(0)
  })

  it('is zero exactly at intake', () => {
    expect(concentrationAt(100, 0, AVERAGE_PROFILE)).toBeCloseTo(0, 6)
  })

  it('rises then falls (unimodal) over 24 hours', () => {
    const samples = Array.from({ length: 24 * 60 }, (_, m) =>
      concentrationAt(100, m, AVERAGE_PROFILE),
    )
    const peakIndex = samples.indexOf(Math.max(...samples))
    expect(peakIndex).toBeGreaterThan(0)
    // strictly increasing up to the peak
    for (let i = 1; i <= peakIndex; i++) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1])
    }
    // strictly decreasing after the peak
    for (let i = peakIndex + 1; i < samples.length; i++) {
      expect(samples[i]).toBeLessThanOrEqual(samples[i - 1])
    }
  })

  it('is always non-negative', () => {
    for (let m = 0; m < 24 * 60; m += 10) {
      expect(concentrationAt(100, m, AVERAGE_PROFILE)).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('timeToPeakMinutes', () => {
  it('lands within the ~30-75 minute Tmax window for a typical dose', () => {
    const tmax = timeToPeakMinutes(AVERAGE_PROFILE)
    expect(tmax).toBeGreaterThanOrEqual(30)
    expect(tmax).toBeLessThanOrEqual(75)
  })

  it('shifts later for a slower metabolizer (longer half-life)', () => {
    const fast = timeToPeakMinutes({ halfLifeHours: 3, weightKg: 70 })
    const slow = timeToPeakMinutes({ halfLifeHours: 7.5, weightKg: 70 })
    expect(slow).toBeGreaterThan(fast)
  })
})

describe('peakConcentration', () => {
  it('scales linearly with dose', () => {
    const c1 = peakConcentration(100, AVERAGE_PROFILE)
    const c2 = peakConcentration(200, AVERAGE_PROFILE)
    expect(c2).toBeCloseTo(c1 * 2, 6)
  })

  it('scales inversely with body weight (higher Vd dilutes concentration)', () => {
    const light = peakConcentration(100, { halfLifeHours: 5, weightKg: 50 })
    const heavy = peakConcentration(100, { halfLifeHours: 5, weightKg: 100 })
    expect(light).toBeGreaterThan(heavy)
  })
})
