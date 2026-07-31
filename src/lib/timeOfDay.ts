/** Next occurrence (unix ms) of a fractional hour-of-day at or after `nowMs`. */
export function nextOccurrenceOfHour(hour: number, nowMs: number = Date.now()): number {
  const now = new Date(nowMs)
  const occurrence = new Date(now)
  occurrence.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0)
  if (occurrence.getTime() <= nowMs) occurrence.setDate(occurrence.getDate() + 1)
  return occurrence.getTime()
}
