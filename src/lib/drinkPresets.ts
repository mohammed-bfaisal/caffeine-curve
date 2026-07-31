/**
 * Sourced default caffeine content for common drinks. Ranges reflect typical
 * published estimates; the "default" value is used as the midpoint dose when
 * a user picks a preset without entering an exact mg amount.
 */
export interface DrinkPreset {
  id: string
  label: string
  size: string
  minMg: number
  maxMg: number
  defaultMg: number
}

export const DRINK_PRESETS: DrinkPreset[] = [
  {
    id: 'drip-8oz',
    label: 'Drip coffee (home brew)',
    size: '8 oz',
    minMg: 80,
    maxMg: 100,
    defaultMg: 96,
  },
  {
    id: 'drip-12oz',
    label: 'Drip coffee',
    size: '12 oz',
    minMg: 120,
    maxMg: 160,
    defaultMg: 140,
  },
  {
    id: 'french-press-8oz',
    label: 'French press',
    size: '8 oz',
    minMg: 80,
    maxMg: 100,
    defaultMg: 95,
  },
  {
    id: 'cold-brew-concentrate-8oz',
    label: 'Cold brew concentrate',
    size: '8 oz',
    minMg: 200,
    maxMg: 300,
    defaultMg: 200,
  },
  {
    id: 'espresso-single',
    label: 'Espresso',
    size: '1 shot (1 oz)',
    minMg: 47,
    maxMg: 65,
    defaultMg: 63,
  },
  {
    id: 'espresso-double',
    label: 'Espresso',
    size: 'double shot',
    minMg: 94,
    maxMg: 130,
    defaultMg: 120,
  },
  {
    id: 'latte-12oz',
    label: 'Latte / cappuccino',
    size: '12 oz',
    minMg: 60,
    maxMg: 75,
    defaultMg: 68,
  },
  {
    id: 'instant-8oz',
    label: 'Instant coffee',
    size: '8 oz',
    minMg: 30,
    maxMg: 90,
    defaultMg: 62,
  },
  {
    id: 'black-tea-8oz',
    label: 'Black tea',
    size: '8 oz',
    minMg: 40,
    maxMg: 70,
    defaultMg: 47,
  },
  {
    id: 'green-tea-8oz',
    label: 'Green tea',
    size: '8 oz',
    minMg: 25,
    maxMg: 45,
    defaultMg: 28,
  },
  {
    id: 'energy-drink-8oz',
    label: 'Energy drink',
    size: '8 oz can',
    minMg: 70,
    maxMg: 100,
    defaultMg: 80,
  },
  {
    id: 'cola-12oz',
    label: 'Cola',
    size: '12 oz can',
    minMg: 30,
    maxMg: 40,
    defaultMg: 34,
  },
  {
    id: 'decaf-8oz',
    label: 'Decaf coffee',
    size: '8 oz',
    minMg: 2,
    maxMg: 5,
    defaultMg: 3,
  },
]

export function getDrinkPreset(id: string): DrinkPreset | undefined {
  return DRINK_PRESETS.find((preset) => preset.id === id)
}
