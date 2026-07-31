import { describe, expect, it } from 'vitest'
import { buildCurveWindow } from '../curveWindow'
import type { Dose } from '../doseStack'

const PROFILE = { halfLifeHours: 5, weightKg: 70 }

function makeDose(timestampMs: number, doseMg: number): Dose {
  return {
    id: 'dose',
    timestampMs,
    doseMg,
    lowMg: doseMg,
    highMg: doseMg,
    isExact: true,
    label: 'test dose',
  }
}

describe('buildCurveWindow', () => {
  it('spans from lookback hours before now to lookahead hours after', () => {
    const now = Date.now()
    const points = buildCurveWindow([], PROFILE, 23, 7, now, 24, 12, 60)
    expect(points[0].timestampMs).toBe(now - 24 * 3_600_000)
    expect(points[points.length - 1].timestampMs).toBeLessThanOrEqual(now + 12 * 3_600_000)
  })

  it('reflects logged doses in the mg series', () => {
    const now = Date.now()
    const doses = [makeDose(now - 30 * 60_000, 100)]
    const points = buildCurveWindow(doses, PROFILE, 23, 7, now, 24, 12, 10)
    const atNow = points.find((p) => p.timestampMs >= now)
    expect(atNow?.mg).toBeGreaterThan(0)
  })

  it('includes a melatonin level for every sample point', () => {
    const now = Date.now()
    const points = buildCurveWindow([], PROFILE, 23, 7, now, 24, 12, 60)
    for (const point of points) {
      expect(point.melatoninLevel).toBeGreaterThanOrEqual(0)
      expect(point.melatoninLevel).toBeLessThanOrEqual(1)
    }
  })
})
