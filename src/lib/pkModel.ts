/**
 * One-compartment oral-absorption pharmacokinetic model for caffeine.
 *
 * C(t) = (F * Dose * ka) / (Vd * (ka - ke)) * (e^(-ke*t) - e^(-ka*t))
 *
 * This is the standard first-order absorption / first-order elimination
 * one-compartment model used throughout the pharmacokinetics literature.
 * All internal time units are minutes; concentration is mg/L.
 *
 * Reference constants (illustrative averages, not individualized medical
 * values):
 *  - Bioavailability (F): ~1.0 (caffeine is nearly 100% orally bioavailable)
 *  - Absorption rate constant (ka): ~0.1 /min, chosen so peak plasma
 *    concentration (Tmax) falls in the commonly cited 30-75 minute window
 *    for typical coffee doses.
 *  - Elimination half-life: ~5 hours for an average adult (commonly cited
 *    range is 5-6 hours; varies significantly with CYP1A2 genetics,
 *    smoking, pregnancy, and hormonal contraceptives).
 *  - Volume of distribution (Vd): ~0.6 L/kg body weight.
 */

export interface PkProfile {
  /** Elimination half-life in hours (default range 1.5-9.5). */
  halfLifeHours: number
  /** Body weight in kilograms, used to scale volume of distribution. */
  weightKg: number
  /** Oral bioavailability fraction, 0-1. Defaults to 1.0 for caffeine. */
  bioavailability?: number
  /** Volume of distribution per kg of body weight, in L/kg. Defaults to 0.6. */
  vdLPerKg?: number
  /** Absorption rate constant, per minute. Defaults to 0.1. */
  kaPerMin?: number
}

export const DEFAULT_KA_PER_MIN = 0.1
export const DEFAULT_VD_L_PER_KG = 0.6
export const DEFAULT_BIOAVAILABILITY = 1.0
export const DEFAULT_HALF_LIFE_HOURS = 5

export const HALF_LIFE_MIN_HOURS = 1.5
export const HALF_LIFE_MAX_HOURS = 9.5

/** Named half-life presets surfaced in the UI as "metabolizer speed". */
export const METABOLIZER_PRESETS = {
  fast: 3,
  average: 5,
  slow: 7.5,
} as const

/** Elimination rate constant ke = ln(2) / half-life. */
export function keFromHalfLife(halfLifeHours: number): number {
  return Math.LN2 / (halfLifeHours * 60)
}

function resolveProfile(profile: PkProfile) {
  const ka = profile.kaPerMin ?? DEFAULT_KA_PER_MIN
  const ke = keFromHalfLife(profile.halfLifeHours)
  const vd = (profile.vdLPerKg ?? DEFAULT_VD_L_PER_KG) * profile.weightKg
  const f = profile.bioavailability ?? DEFAULT_BIOAVAILABILITY
  return { ka, ke, vd, f }
}

/**
 * Plasma concentration (mg/L) contributed by a single dose, `minutesSince`
 * minutes after intake. Returns 0 for t < 0 (dose not yet taken).
 */
export function concentrationAt(
  doseMg: number,
  minutesSince: number,
  profile: PkProfile,
): number {
  if (minutesSince < 0) return 0
  const { ka, ke, vd, f } = resolveProfile(profile)

  // Guard the ka === ke singularity (division by zero) with the analytic
  // limit of the expression, which reduces to a standard Bateman-function
  // special case.
  if (Math.abs(ka - ke) < 1e-9) {
    return ((f * doseMg * ka) / vd) * minutesSince * Math.exp(-ke * minutesSince)
  }

  const coefficient = (f * doseMg * ka) / (vd * (ka - ke))
  return coefficient * (Math.exp(-ke * minutesSince) - Math.exp(-ka * minutesSince))
}

/** Time (minutes after intake) at which a single dose reaches peak concentration. */
export function timeToPeakMinutes(profile: PkProfile): number {
  const { ka, ke } = resolveProfile(profile)
  if (Math.abs(ka - ke) < 1e-9) return 1 / ke
  return Math.log(ka / ke) / (ka - ke)
}

/** Peak plasma concentration (mg/L) reached by a single dose. */
export function peakConcentration(doseMg: number, profile: PkProfile): number {
  const tmax = timeToPeakMinutes(profile)
  return concentrationAt(doseMg, tmax, profile)
}
