/**
 * Illustrative two-process sleep-pressure model.
 *
 * This models the mechanism, not measured biology: it is still NOT EEG,
 * actigraphy, or individually calibrated data. It implements the classic
 * Borbély two-process framework (Process S, the homeostatic sleep drive,
 * gated by Process C, a circadian oscillator) using commonly cited
 * illustrative time constants, rather than an arbitrary bell curve.
 *
 * Process S rises during wake and decays during sleep, each following an
 * exponential approach to an asymptote:
 *   awake:  S(t) = 1 - (1 - S0) * e^(-t / tauRise)
 *   asleep: S(t) = S0 * e^(-t / tauDecay)
 *
 * Process C is a circadian oscillator (24h cosine) whose trough (weakest
 * wake-promoting drive) is anchored a couple of hours before habitual wake
 * time, approximating the core-body-temperature minimum commonly used as a
 * circadian phase reference point.
 *
 * References:
 *  - Borbély, "The two-process model of sleep regulation: a reappraisal",
 *    J Sleep Res (2016).
 *  - Daan, Beersma & Borbély, "Timing of human sleep: recovery process gated
 *    by a circadian pacemaker", Am J Physiol (1984).
 */

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS

/** Time constant for Process S rising toward its ceiling while awake. */
export const TAU_RISE_HOURS = 18.2
/** Time constant for Process S decaying toward its floor while asleep. */
export const TAU_DECAY_HOURS = 4.2
/** Relative weight of the circadian process against the homeostatic one. */
export const CIRCADIAN_AMPLITUDE = 0.5
/** Hours before habitual wake time the circadian nadir (CBTmin) is anchored. */
export const CBT_MIN_LEAD_HOURS = 2
/** Cycles simulated before the visible window so Process S reaches steady state. */
const WARMUP_DAYS = 3

export interface SleepPressurePoint {
  timestampMs: number
  level: number
}

interface Segment {
  startMs: number
  endMs: number
  asleep: boolean
  sAtStart: number
}

function nightAnchors(localMidnightMs: number, bedtimeHour: number, wakeHour: number) {
  const bedtimeMs = localMidnightMs + bedtimeHour * HOUR_MS
  let wakeMs = localMidnightMs + wakeHour * HOUR_MS
  if (wakeMs <= bedtimeMs) wakeMs += DAY_MS
  return { bedtimeMs, wakeMs }
}

/** Builds alternating wake/sleep segments covering [fromMs, toMs], carrying Process S continuity. */
function buildSegments(fromMs: number, toMs: number, bedtimeHour: number, wakeHour: number): Segment[] {
  const fromDate = new Date(fromMs)
  let cursorMidnight = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()).getTime()

  // Find the first night anchor at or before fromMs by scanning backward a day if needed.
  let { bedtimeMs, wakeMs } = nightAnchors(cursorMidnight, bedtimeHour, wakeHour)
  while (bedtimeMs > fromMs) {
    cursorMidnight -= DAY_MS
    ;({ bedtimeMs, wakeMs } = nightAnchors(cursorMidnight, bedtimeHour, wakeHour))
  }

  const tauRiseMs = TAU_RISE_HOURS * HOUR_MS
  const tauDecayMs = TAU_DECAY_HOURS * HOUR_MS

  const segments: Segment[] = []
  let cursorMs = fromMs
  let s = 0.5 // arbitrary seed; washes out after WARMUP_DAYS of simulation
  let nextBedtimeMs = bedtimeMs
  let nextWakeMs = wakeMs

  // Advance anchors until we're at/after fromMs.
  while (nextWakeMs < fromMs) {
    nextBedtimeMs += DAY_MS
    nextWakeMs += DAY_MS
  }

  while (cursorMs < toMs) {
    const asleep = cursorMs >= nextBedtimeMs && cursorMs < nextWakeMs
    const segmentEndMs = asleep
      ? Math.min(nextWakeMs, toMs)
      : Math.min(nextBedtimeMs > cursorMs ? nextBedtimeMs : nextBedtimeMs + DAY_MS, toMs)

    segments.push({ startMs: cursorMs, endMs: segmentEndMs, asleep, sAtStart: s })

    const durationMs = segmentEndMs - cursorMs
    s = asleep
      ? s * Math.exp(-durationMs / tauDecayMs)
      : 1 - (1 - s) * Math.exp(-durationMs / tauRiseMs)

    cursorMs = segmentEndMs
    if (cursorMs >= nextWakeMs) {
      nextBedtimeMs += DAY_MS
      nextWakeMs += DAY_MS
    }
  }

  return segments
}

function processSAt(tMs: number, segments: Segment[]): number {
  // Segments are contiguous and chronological; a linear scan is fine given
  // the small segment count per query window (a handful per day).
  for (const segment of segments) {
    if (tMs >= segment.startMs && tMs <= segment.endMs) {
      const elapsedMs = tMs - segment.startMs
      const tauMs = segment.asleep ? TAU_DECAY_HOURS * HOUR_MS : TAU_RISE_HOURS * HOUR_MS
      return segment.asleep
        ? segment.sAtStart * Math.exp(-elapsedMs / tauMs)
        : 1 - (1 - segment.sAtStart) * Math.exp(-elapsedMs / tauMs)
    }
  }
  return segments.length > 0 ? segments[segments.length - 1].sAtStart : 0.5
}

/** Circadian process C at a single instant, in [-1, 1]. Trough sits before habitual wake time. */
export function processCAt(tMs: number, wakeHour: number): number {
  const nadirHour = wakeHour - CBT_MIN_LEAD_HOURS
  const date = new Date(tMs)
  const hourOfDay = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  return -Math.cos((2 * Math.PI * (hourOfDay - nadirHour)) / 24)
}

/**
 * Illustrative combined sleep-pressure level at a single instant, in [0, 1].
 * Higher values indicate greater modeled sleep propensity.
 */
export function sleepPressureAt(atMs: number, bedtimeHour: number, wakeHour: number): number {
  const fromMs = atMs - WARMUP_DAYS * DAY_MS
  const segments = buildSegments(fromMs, atMs + HOUR_MS, bedtimeHour, wakeHour)
  const s = processSAt(atMs, segments)
  const c = processCAt(atMs, wakeHour)

  const combined = s - CIRCADIAN_AMPLITUDE * c
  const min = 0 - CIRCADIAN_AMPLITUDE * 1
  const max = 1 + CIRCADIAN_AMPLITUDE * 1
  return Math.min(1, Math.max(0, (combined - min) / (max - min)))
}

export function buildSleepPressureCurve(
  startMs: number,
  endMs: number,
  stepMinutes: number,
  bedtimeHour: number,
  wakeHour: number,
): SleepPressurePoint[] {
  const fromMs = startMs - WARMUP_DAYS * DAY_MS
  const segments = buildSegments(fromMs, endMs + HOUR_MS, bedtimeHour, wakeHour)

  const points: SleepPressurePoint[] = []
  const stepMs = stepMinutes * 60_000
  for (let t = startMs; t <= endMs; t += stepMs) {
    const s = processSAt(t, segments)
    const c = processCAt(t, wakeHour)
    const combined = s - CIRCADIAN_AMPLITUDE * c
    const min = 0 - CIRCADIAN_AMPLITUDE * 1
    const max = 1 + CIRCADIAN_AMPLITUDE * 1
    const level = Math.min(1, Math.max(0, (combined - min) / (max - min)))
    points.push({ timestampMs: t, level })
  }
  return points
}
