import type { Dose } from './doseStack'
import { totalConcentrationAt } from './doseStack'
import { buildMelatoninCurve } from './melatoninOverlay'
import type { PkProfile } from './pkModel'

export interface CurvePoint {
  timestampMs: number
  mg: number
  lowMg: number
  highMg: number
  melatoninLevel: number
}

export const DEFAULT_LOOKBACK_HOURS = 24
export const DEFAULT_LOOKAHEAD_HOURS = 12
export const DEFAULT_STEP_MINUTES = 10

/**
 * Builds the combined "today's curve" dataset: caffeine concentration
 * (with uncertainty band) and the illustrative melatonin overlay, sampled
 * on a shared timeline from `lookbackHours` in the past to `lookaheadHours`
 * in the future.
 */
export function buildCurveWindow(
  doses: Dose[],
  profile: PkProfile,
  bedtimeHour: number,
  wakeHour: number,
  nowMs: number = Date.now(),
  lookbackHours: number = DEFAULT_LOOKBACK_HOURS,
  lookaheadHours: number = DEFAULT_LOOKAHEAD_HOURS,
  stepMinutes: number = DEFAULT_STEP_MINUTES,
): CurvePoint[] {
  const startMs = nowMs - lookbackHours * 3_600_000
  const endMs = nowMs + lookaheadHours * 3_600_000

  const melatonin = buildMelatoninCurve(startMs, endMs, stepMinutes, bedtimeHour, wakeHour)

  const points: CurvePoint[] = []
  const stepMs = stepMinutes * 60_000
  let melatoninIndex = 0
  for (let t = startMs; t <= endMs; t += stepMs) {
    const { mg, lowMg, highMg } = totalConcentrationAt(doses, t, profile)
    while (
      melatoninIndex < melatonin.length - 1 &&
      melatonin[melatoninIndex].timestampMs < t
    ) {
      melatoninIndex++
    }
    points.push({
      timestampMs: t,
      mg,
      lowMg,
      highMg,
      melatoninLevel: melatonin[melatoninIndex]?.level ?? 0,
    })
  }
  return points
}
