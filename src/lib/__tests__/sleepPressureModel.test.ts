import { describe, expect, it } from 'vitest'
import { buildSleepPressureCurve, processCAt, sleepPressureAt } from '../sleepPressureModel'

const BEDTIME_HOUR = 23
const WAKE_HOUR = 7

function atHour(hour: number): number {
  const base = new Date(2026, 0, 5).getTime() // local midnight, a Monday
  return base + hour * 3_600_000
}

describe('processCAt', () => {
  it('stays within [-1, 1]', () => {
    for (let h = 0; h < 48; h += 0.5) {
      const c = processCAt(atHour(h), WAKE_HOUR)
      expect(c).toBeGreaterThanOrEqual(-1)
      expect(c).toBeLessThanOrEqual(1)
    }
  })

  it('is periodic with a 24-hour cycle', () => {
    const a = processCAt(atHour(10), WAKE_HOUR)
    const b = processCAt(atHour(34), WAKE_HOUR)
    expect(a).toBeCloseTo(b, 6)
  })
})

describe('sleepPressureAt', () => {
  it('stays within [0, 1] across a full two-day span', () => {
    for (let h = 0; h < 48; h += 0.5) {
      const level = sleepPressureAt(atHour(h), BEDTIME_HOUR, WAKE_HOUR)
      expect(level).toBeGreaterThanOrEqual(0)
      expect(level).toBeLessThanOrEqual(1)
    }
  })

  it('is lower right after habitual wake time than right before habitual bedtime', () => {
    // Use day 2+ so Process S has passed the warmup transient.
    const justAfterWake = sleepPressureAt(atHour(24 + 7.5), BEDTIME_HOUR, WAKE_HOUR)
    const justBeforeBed = sleepPressureAt(atHour(24 + 22.5), BEDTIME_HOUR, WAKE_HOUR)
    expect(justAfterWake).toBeLessThan(justBeforeBed)
  })

  it('decreases while asleep (Process S dissipates overnight)', () => {
    const atBedtime = sleepPressureAt(atHour(24 + 23), BEDTIME_HOUR, WAKE_HOUR)
    const laterInNight = sleepPressureAt(atHour(24 + 30), BEDTIME_HOUR, WAKE_HOUR) // 6am next day, still asleep
    expect(laterInNight).toBeLessThan(atBedtime)
  })
})

describe('buildSleepPressureCurve', () => {
  it('spans the requested window with the requested step', () => {
    const start = atHour(24)
    const end = atHour(36)
    const points = buildSleepPressureCurve(start, end, 30, BEDTIME_HOUR, WAKE_HOUR)
    expect(points[0].timestampMs).toBe(start)
    expect(points[points.length - 1].timestampMs).toBeLessThanOrEqual(end)
    for (const point of points) {
      expect(point.level).toBeGreaterThanOrEqual(0)
      expect(point.level).toBeLessThanOrEqual(1)
    }
  })
})
