import { describe, expect, it } from 'vitest'
import { nextOccurrenceOfHour } from '../timeOfDay'

describe('nextOccurrenceOfHour', () => {
  it('returns today if the hour has not passed yet', () => {
    const now = new Date(2026, 0, 5, 10, 0, 0).getTime() // 10:00am
    const result = nextOccurrenceOfHour(23, now) // 11:00pm same day
    const resultDate = new Date(result)
    expect(resultDate.getDate()).toBe(5)
    expect(resultDate.getHours()).toBe(23)
  })

  it('rolls over to tomorrow if the hour has already passed', () => {
    const now = new Date(2026, 0, 5, 23, 30, 0).getTime() // 11:30pm
    const result = nextOccurrenceOfHour(23, now) // 11:00pm has passed
    const resultDate = new Date(result)
    expect(resultDate.getDate()).toBe(6)
    expect(resultDate.getHours()).toBe(23)
  })

  it('handles fractional hours', () => {
    const now = new Date(2026, 0, 5, 10, 0, 0).getTime()
    const result = nextOccurrenceOfHour(23.5, now)
    const resultDate = new Date(result)
    expect(resultDate.getHours()).toBe(23)
    expect(resultDate.getMinutes()).toBe(30)
  })
})
