import { concentrationAt, type PkProfile } from './pkModel'

/**
 * A single logged intake. `lowMg`/`highMg` describe the uncertainty band
 * around `doseMg` when the amount came from a preset range rather than an
 * exact user-entered mg value (in which case low === high === doseMg).
 */
export interface Dose {
  id: string
  /** Intake time as a unix timestamp (ms). */
  timestampMs: number
  doseMg: number
  lowMg: number
  highMg: number
  /** True when the user typed an exact mg amount rather than a preset. */
  isExact: boolean
  label: string
}

export interface StackedPoint {
  timestampMs: number
  mg: number
  lowMg: number
  highMg: number
}

/** Total concentration (mg/L) from all doses active at `atMs`. */
export function totalConcentrationAt(
  doses: Dose[],
  atMs: number,
  profile: PkProfile,
): StackedPoint {
  let mg = 0
  let lowMg = 0
  let highMg = 0

  for (const dose of doses) {
    const minutesSince = (atMs - dose.timestampMs) / 60_000
    mg += concentrationAt(dose.doseMg, minutesSince, profile)
    lowMg += concentrationAt(dose.lowMg, minutesSince, profile)
    highMg += concentrationAt(dose.highMg, minutesSince, profile)
  }

  return { timestampMs: atMs, mg, lowMg, highMg }
}

/**
 * Builds the combined concentration curve by summing every active dose's
 * contribution at each sample point between `startMs` and `endMs`.
 */
export function buildStackedCurve(
  doses: Dose[],
  profile: PkProfile,
  startMs: number,
  endMs: number,
  stepMinutes: number,
): StackedPoint[] {
  const points: StackedPoint[] = []
  const stepMs = stepMinutes * 60_000
  for (let t = startMs; t <= endMs; t += stepMs) {
    points.push(totalConcentrationAt(doses, t, profile))
  }
  return points
}
