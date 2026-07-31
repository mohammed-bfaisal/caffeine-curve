import type { Dose } from './doseStack'
import { totalConcentrationAt } from './doseStack'
import { buildSleepPressureCurve } from './sleepPressureModel'
import type { PkProfile } from './pkModel'

export interface CurvePoint {
  timestampMs: number
  mg: number
  lowMg: number
  highMg: number
  sleepPressureLevel: number
}

export const DEFAULT_LOOKBACK_HOURS = 24
export const DEFAULT_LOOKAHEAD_HOURS = 12
export const DEFAULT_STEP_MINUTES = 10

/**
 * Builds the combined "today's curve" dataset: caffeine concentration
 * (with uncertainty band) and the illustrative two-process sleep-pressure
 * overlay, sampled on a shared timeline from `lookbackHours` in the past to
 * `lookaheadHours` in the future.
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

  const sleepPressure = buildSleepPressureCurve(startMs, endMs, stepMinutes, bedtimeHour, wakeHour)

  const points: CurvePoint[] = []
  const stepMs = stepMinutes * 60_000
  let sleepPressureIndex = 0
  for (let t = startMs; t <= endMs; t += stepMs) {
    const { mg, lowMg, highMg } = totalConcentrationAt(doses, t, profile)
    while (
      sleepPressureIndex < sleepPressure.length - 1 &&
      sleepPressure[sleepPressureIndex].timestampMs < t
    ) {
      sleepPressureIndex++
    }
    points.push({
      timestampMs: t,
      mg,
      lowMg,
      highMg,
      sleepPressureLevel: sleepPressure[sleepPressureIndex]?.level ?? 0,
    })
  }
  return points
}
