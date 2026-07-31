/**
 * Illustrative melatonin / sleep-pressure overlay.
 *
 * This is explicitly NOT measured or modeled biology — it is a smooth bell
 * curve (asymmetric Gaussian) that:
 *  - starts rising ~2 hours before the user's stated bedtime
 *  - peaks at the midpoint of the user's stated sleep window
 *  - falls off approaching the user's stated wake time
 *
 * The returned "level" is a unitless value in [0, 1] for display purposes
 * only (rendered on its own scale, never mixed with mg/L caffeine units).
 */

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS
const RISE_LEAD_HOURS = 2
// exp(-0.5 * z^2) = 0.05  =>  z = sqrt(-2 * ln(0.05)) ~= 2.448
const EDGE_Z_SCORE = Math.sqrt(-2 * Math.log(0.05))

export interface MelatoninPoint {
  timestampMs: number
  level: number
}

function nightAnchors(localMidnightMs: number, bedtimeHour: number, wakeHour: number) {
  const bedtimeMs = localMidnightMs + bedtimeHour * HOUR_MS
  let wakeMs = localMidnightMs + wakeHour * HOUR_MS
  if (wakeMs <= bedtimeMs) wakeMs += DAY_MS
  return { bedtimeMs, wakeMs }
}

/**
 * Illustrative sleep-pressure level at a single instant, in [0, 1].
 * `bedtimeHour`/`wakeHour` are fractional hours-of-day (e.g. 23.5 = 11:30pm).
 */
export function melatoninLevelAt(
  atMs: number,
  bedtimeHour: number,
  wakeHour: number,
): number {
  const atDate = new Date(atMs)
  const localMidnightMs = new Date(
    atDate.getFullYear(),
    atDate.getMonth(),
    atDate.getDate(),
  ).getTime()

  let best = 0
  // Check the sleep window anchored to the previous, current, and next day,
  // since a window near midnight can be closest to any of the three.
  for (const dayOffset of [-1, 0, 1]) {
    const { bedtimeMs, wakeMs } = nightAnchors(
      localMidnightMs + dayOffset * DAY_MS,
      bedtimeHour,
      wakeHour,
    )
    const center = (bedtimeMs + wakeMs) / 2
    const riseStart = bedtimeMs - RISE_LEAD_HOURS * HOUR_MS
    const halfWidthRise = center - riseStart
    const halfWidthFall = wakeMs - center
    const sigma = atMs <= center ? halfWidthRise / EDGE_Z_SCORE : halfWidthFall / EDGE_Z_SCORE
    const z = (atMs - center) / sigma
    const value = Math.exp(-0.5 * z * z)
    if (value > best) best = value
  }
  return best
}

export function buildMelatoninCurve(
  startMs: number,
  endMs: number,
  stepMinutes: number,
  bedtimeHour: number,
  wakeHour: number,
): MelatoninPoint[] {
  const points: MelatoninPoint[] = []
  const stepMs = stepMinutes * 60_000
  for (let t = startMs; t <= endMs; t += stepMs) {
    points.push({ timestampMs: t, level: melatoninLevelAt(t, bedtimeHour, wakeHour) })
  }
  return points
}
