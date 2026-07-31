import { describe, expect, it } from 'vitest'
import { melatoninLevelAt } from '../melatoninOverlay'

// Reference night: bedtime 23:00, wake 07:00 -> sleep midpoint at 03:00.
const BEDTIME_HOUR = 23
const WAKE_HOUR = 7

function atHour(hour: number): number {
  const base = new Date(2026, 0, 1).getTime() // local midnight, Jan 1 2026
  return base + hour * 3_600_000
}

describe('melatoninLevelAt', () => {
  it('peaks near the midpoint of the sleep window', () => {
    const atMidpoint = melatoninLevelAt(atHour(27), BEDTIME_HOUR, WAKE_HOUR) // 03:00 next day
    expect(atMidpoint).toBeCloseTo(1, 2)
  })

  it('is low in the middle of the day', () => {
    const atNoon = melatoninLevelAt(atHour(12), BEDTIME_HOUR, WAKE_HOUR)
    expect(atNoon).toBeLessThan(0.01)
  })

  it('is near the ~5% edge threshold 2 hours before bedtime', () => {
    const atRiseStart = melatoninLevelAt(atHour(21), BEDTIME_HOUR, WAKE_HOUR)
    expect(atRiseStart).toBeGreaterThan(0.02)
    expect(atRiseStart).toBeLessThan(0.15)
  })

  it('is low well before the rise starts', () => {
    const atEarlyEvening = melatoninLevelAt(atHour(18), BEDTIME_HOUR, WAKE_HOUR)
    expect(atEarlyEvening).toBeLessThan(0.02)
  })

  it('always stays within [0, 1]', () => {
    for (let h = 0; h < 48; h += 0.5) {
      const level = melatoninLevelAt(atHour(h), BEDTIME_HOUR, WAKE_HOUR)
      expect(level).toBeGreaterThanOrEqual(0)
      expect(level).toBeLessThanOrEqual(1)
    }
  })
})
