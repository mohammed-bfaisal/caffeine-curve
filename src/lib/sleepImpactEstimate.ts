import type { Dose } from './doseStack'

/**
 * Illustrative estimate of total sleep time lost tonight, derived from
 * published dose/timing regression coefficients rather than the PK model:
 * roughly 0.2 minutes of total sleep time lost per mg of caffeine, offset
 * by roughly 2.8 minutes recovered per hour of gap before bedtime.
 *
 * This is a coarse linear extrapolation from aggregate randomized-trial
 * data, not a personalized or mechanistic model; it does not account for
 * individual tolerance, and is floored at zero minutes lost.
 *
 * Reference: Dose and timing effects of caffeine on subsequent sleep, a
 * randomized clinical crossover trial, SLEEP (2025),
 * https://academic.oup.com/sleep/article/48/4/zsae230/7815486
 */
const MINUTES_LOST_PER_MG = 0.2
const MINUTES_RECOVERED_PER_HOUR_GAP = 2.8

/**
 * Estimated minutes of total sleep time lost from a single dose, given how
 * many hours before bedtime it was (or will be) consumed.
 */
export function estimatedMinutesLost(doseMg: number, hoursBeforeBedtime: number): number {
  const gapHours = Math.max(0, hoursBeforeBedtime)
  return Math.max(0, MINUTES_LOST_PER_MG * doseMg - MINUTES_RECOVERED_PER_HOUR_GAP * gapHours)
}

/**
 * Sums the estimated sleep-time impact of every dose that falls before
 * `bedtimeMs`, using each dose's own gap to bedtime.
 */
export function totalEstimatedMinutesLost(doses: Dose[], bedtimeMs: number): number {
  let total = 0
  for (const dose of doses) {
    const hoursBeforeBedtime = (bedtimeMs - dose.timestampMs) / 3_600_000
    if (hoursBeforeBedtime < -12 || hoursBeforeBedtime > 24) continue // outside the relevant window
    total += estimatedMinutesLost(dose.doseMg, hoursBeforeBedtime)
  }
  return total
}
