import {
  HALF_LIFE_MAX_HOURS,
  HALF_LIFE_MIN_HOURS,
  concentrationAt,
  peakConcentration,
  timeToPeakMinutes,
  type PkProfile,
} from './pkModel'
import { hashSeed, mulberry32 } from './random'

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

export interface SafeBedtimeRange {
  /** 10th percentile intake time (earlier/safer end of the population range). */
  p10: number
  /** Median intake time. */
  p50: number
  /** 90th percentile intake time (later/riskier end of the population range). */
  p90: number
}

/**
 * Monte Carlo estimate of the last-safe-intake-time across the real
 * population range of caffeine half-lives (~1.5-9.5 hours), rather than a
 * single dialed-in value. This reflects genuine inter-individual variation
 * (CYP1A2 genetics, smoking, pregnancy, hormonal contraceptives), not
 * uncertainty in the model itself.
 *
 * Deterministically seeded from its inputs so the displayed range is stable
 * across re-renders for the same dose/profile/threshold, instead of
 * flickering on every recompute.
 */
export function safeBedtimeRange(
  doseMg: number,
  weightKg: number,
  bedtimeMs: number,
  thresholdFraction: number,
  sampleCount = 500,
  halfLifeMinHours = HALF_LIFE_MIN_HOURS,
  halfLifeMaxHours = HALF_LIFE_MAX_HOURS,
): SafeBedtimeRange {
  const seed = hashSeed(`${doseMg}|${weightKg}|${bedtimeMs}|${thresholdFraction}`)
  const random = mulberry32(seed)

  const samples: number[] = []
  for (let i = 0; i < sampleCount; i++) {
    const halfLifeHours = halfLifeMinHours + random() * (halfLifeMaxHours - halfLifeMinHours)
    samples.push(lastSafeIntakeTime(doseMg, { halfLifeHours, weightKg }, bedtimeMs, thresholdFraction))
  }
  samples.sort((a, b) => a - b)

  const percentile = (p: number) => samples[Math.floor(p * (samples.length - 1))]
  return { p10: percentile(0.1), p50: percentile(0.5), p90: percentile(0.9) }
}
