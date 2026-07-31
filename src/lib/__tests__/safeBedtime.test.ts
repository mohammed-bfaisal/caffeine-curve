import { describe, expect, it } from 'vitest'
import { concentrationAt, peakConcentration } from '../pkModel'
import { lastSafeIntakeTime, minutesToResidualFraction, safeBedtimeRange } from '../safeBedtime'

const PROFILE = { halfLifeHours: 5, weightKg: 70 }

describe('minutesToResidualFraction', () => {
  it('finds the time at which concentration drops to the threshold of peak', () => {
    const minutes = minutesToResidualFraction(100, PROFILE, 0.2)
    const peak = peakConcentration(100, PROFILE)
    const atThreshold = concentrationAt(100, minutes, PROFILE)
    expect(atThreshold).toBeCloseTo(0.2 * peak, 3)
  })

  it('takes longer to reach a stricter (lower) threshold', () => {
    const strict = minutesToResidualFraction(100, PROFILE, 0.05)
    const lenient = minutesToResidualFraction(100, PROFILE, 0.5)
    expect(strict).toBeGreaterThan(lenient)
  })
})

describe('lastSafeIntakeTime', () => {
  it('returns an intake time strictly before bedtime', () => {
    const bedtimeMs = Date.now()
    const intakeMs = lastSafeIntakeTime(100, PROFILE, bedtimeMs, 0.2)
    expect(intakeMs).toBeLessThan(bedtimeMs)
  })

  it('produces a dose at bedtime that has decayed to the threshold', () => {
    const bedtimeMs = Date.now()
    const intakeMs = lastSafeIntakeTime(100, PROFILE, bedtimeMs, 0.2)
    const minutesSince = (bedtimeMs - intakeMs) / 60_000
    const residual = concentrationAt(100, minutesSince, PROFILE)
    const peak = peakConcentration(100, PROFILE)
    expect(residual).toBeCloseTo(0.2 * peak, 3)
  })

  it('allows a later intake time for a shorter half-life', () => {
    const bedtimeMs = Date.now()
    const fast = lastSafeIntakeTime(100, { halfLifeHours: 3, weightKg: 70 }, bedtimeMs, 0.2)
    const slow = lastSafeIntakeTime(100, { halfLifeHours: 7.5, weightKg: 70 }, bedtimeMs, 0.2)
    expect(fast).toBeGreaterThan(slow)
  })
})

describe('safeBedtimeRange', () => {
  it('orders percentiles ascending (p10 earliest/safest, p90 latest/riskiest)', () => {
    const bedtimeMs = Date.now()
    const range = safeBedtimeRange(100, 70, bedtimeMs, 0.2)
    expect(range.p10).toBeLessThanOrEqual(range.p50)
    expect(range.p50).toBeLessThanOrEqual(range.p90)
  })

  it('is deterministic for identical inputs', () => {
    const bedtimeMs = Date.now()
    const a = safeBedtimeRange(100, 70, bedtimeMs, 0.2)
    const b = safeBedtimeRange(100, 70, bedtimeMs, 0.2)
    expect(a).toEqual(b)
  })

  it('brackets the single-half-life estimate for a mid-range half-life', () => {
    const bedtimeMs = Date.now()
    const range = safeBedtimeRange(100, 70, bedtimeMs, 0.2)
    const midEstimate = lastSafeIntakeTime(100, { halfLifeHours: 5.5, weightKg: 70 }, bedtimeMs, 0.2)
    expect(midEstimate).toBeGreaterThanOrEqual(range.p10)
    expect(midEstimate).toBeLessThanOrEqual(range.p90)
  })

  it('varies with different inputs', () => {
    const bedtimeMs = Date.now()
    const a = safeBedtimeRange(100, 70, bedtimeMs, 0.2)
    const b = safeBedtimeRange(200, 70, bedtimeMs, 0.2)
    expect(a).not.toEqual(b)
  })
})
