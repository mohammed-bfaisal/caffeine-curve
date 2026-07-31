import { concentrationAt, peakConcentration, timeToPeakMinutes, type PkProfile } from './pkModel'

/**
 * Finds how many minutes after intake it takes a single dose to decay down
 * to `thresholdFraction` of its own peak concentration. Searches only the
 * decay branch (after Tmax), since that is where the residual threshold is
 * crossed for any threshold below 1.
 */
export function minutesToResidualFraction(
  doseMg: number,
  profile: PkProfile,
  thresholdFraction: number,
): number {
  const tmax = timeToPeakMinutes(profile)
  const target = thresholdFraction * peakConcentration(doseMg, profile)

  // Expand the search window until concentration at the upper bound has
  // dropped below the target (guaranteed to happen, since decay eventually
  // dominates the model).
  let lo = tmax
  let hi = tmax + 60
  while (concentrationAt(doseMg, hi, profile) > target && hi < 1e6) {
    hi *= 2
  }

  // Binary search on the monotonically-decreasing decay branch.
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    if (concentrationAt(doseMg, mid, profile) > target) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return hi
}

/**
 * Latest recommended intake time (unix ms) so that by `bedtimeMs` the
 * modeled concentration has decayed to at or below `thresholdFraction` of
 * that dose's own peak.
 */
export function lastSafeIntakeTime(
  doseMg: number,
  profile: PkProfile,
  bedtimeMs: number,
  thresholdFraction: number,
): number {
  const minutesToResidual = minutesToResidualFraction(doseMg, profile, thresholdFraction)
  return bedtimeMs - minutesToResidual * 60_000
}
