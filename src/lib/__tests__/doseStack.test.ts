import { describe, expect, it } from 'vitest'
import { concentrationAt } from '../pkModel'
import { totalConcentrationAt, type Dose } from '../doseStack'

const PROFILE = { halfLifeHours: 5, weightKg: 70 }

function makeDose(id: string, timestampMs: number, doseMg: number): Dose {
  return {
    id,
    timestampMs,
    doseMg,
    lowMg: doseMg,
    highMg: doseMg,
    isExact: true,
    label: 'test dose',
  }
}

describe('totalConcentrationAt', () => {
  it('sums independent contributions from multiple doses', () => {
    const t0 = Date.now()
    const doses = [makeDose('a', t0, 100), makeDose('b', t0 + 60 * 60_000, 100)]

    const atMs = t0 + 90 * 60_000
    const expected =
      concentrationAt(100, 90, PROFILE) + concentrationAt(100, 30, PROFILE)

    expect(totalConcentrationAt(doses, atMs, PROFILE).mg).toBeCloseTo(expected, 9)
  })

  it('ignores doses that have not started yet', () => {
    const t0 = Date.now()
    const doses = [makeDose('future', t0 + 60 * 60_000, 100)]
    expect(totalConcentrationAt(doses, t0, PROFILE).mg).toBe(0)
  })

  it('carries the low/high uncertainty band through the sum', () => {
    const t0 = Date.now()
    const doses: Dose[] = [
      {
        id: 'range',
        timestampMs: t0,
        doseMg: 96,
        lowMg: 80,
        highMg: 100,
        isExact: false,
        label: 'drip coffee',
      },
    ]
    const point = totalConcentrationAt(doses, t0 + 45 * 60_000, PROFILE)
    expect(point.lowMg).toBeLessThan(point.mg)
    expect(point.mg).toBeLessThan(point.highMg)
  })
})
