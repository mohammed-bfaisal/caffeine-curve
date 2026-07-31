import { describe, expect, it } from 'vitest'
import type { Dose } from '../doseStack'
import { estimatedMinutesLost, totalEstimatedMinutesLost } from '../sleepImpactEstimate'

function makeDose(id: string, timestampMs: number, doseMg: number): Dose {
  return { id, timestampMs, doseMg, lowMg: doseMg, highMg: doseMg, isExact: true, label: 'test' }
}

describe('estimatedMinutesLost', () => {
  it('is zero for a large gap before bedtime', () => {
    expect(estimatedMinutesLost(100, 20)).toBe(0)
  })

  it('increases with dose size', () => {
    const small = estimatedMinutesLost(50, 0)
    const large = estimatedMinutesLost(400, 0)
    expect(large).toBeGreaterThan(small)
  })

  it('decreases as the gap before bedtime grows', () => {
    const closeToBed = estimatedMinutesLost(200, 1)
    const farFromBed = estimatedMinutesLost(200, 8)
    expect(closeToBed).toBeGreaterThan(farFromBed)
  })

  it('never goes negative', () => {
    expect(estimatedMinutesLost(10, 24)).toBeGreaterThanOrEqual(0)
  })

  it('treats a dose taken after bedtime as a zero gap (maximal impact)', () => {
    const afterBedtime = estimatedMinutesLost(200, -2)
    const atBedtime = estimatedMinutesLost(200, 0)
    expect(afterBedtime).toBe(atBedtime)
  })
})

describe('totalEstimatedMinutesLost', () => {
  it('sums impact across multiple doses', () => {
    const bedtimeMs = Date.now()
    const doses = [
      makeDose('a', bedtimeMs - 1 * 3_600_000, 100),
      makeDose('b', bedtimeMs - 6 * 3_600_000, 100),
    ]
    const total = totalEstimatedMinutesLost(doses, bedtimeMs)
    const expected = estimatedMinutesLost(100, 1) + estimatedMinutesLost(100, 6)
    expect(total).toBeCloseTo(expected, 6)
  })

  it('is zero with no doses', () => {
    expect(totalEstimatedMinutesLost([], Date.now())).toBe(0)
  })
})
