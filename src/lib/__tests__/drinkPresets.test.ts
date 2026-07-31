import { describe, expect, it } from 'vitest'
import { DRINK_PRESETS, getDrinkPreset } from '../drinkPresets'

describe('drinkPresets', () => {
  it('has a default mg value within its own low/high range for every preset', () => {
    for (const preset of DRINK_PRESETS) {
      expect(preset.defaultMg).toBeGreaterThanOrEqual(preset.minMg)
      expect(preset.defaultMg).toBeLessThanOrEqual(preset.maxMg)
    }
  })

  it('looks up a known preset by id', () => {
    expect(getDrinkPreset('espresso-double')?.label).toBe('Espresso')
  })

  it('returns undefined for an unknown id', () => {
    expect(getDrinkPreset('not-a-real-drink')).toBeUndefined()
  })
})
