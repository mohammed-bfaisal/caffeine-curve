import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Dose } from '../lib/doseStack'
import { DEFAULT_HALF_LIFE_HOURS } from '../lib/pkModel'

export interface UserProfile {
  weightKg: number
  halfLifeHours: number
  /** Fractional hour-of-day, e.g. 23.5 = 11:30pm. */
  bedtimeHour: number
  /** Fractional hour-of-day, e.g. 7 = 7:00am. */
  wakeHour: number
  /** Acceptable residual caffeine, as a fraction of a dose's peak (0-1). */
  residualThreshold: number
}

export const DEFAULT_PROFILE: UserProfile = {
  weightKg: 70,
  halfLifeHours: DEFAULT_HALF_LIFE_HOURS,
  bedtimeHour: 23,
  wakeHour: 7,
  residualThreshold: 0.2,
}

export interface NewDoseInput {
  timestampMs: number
  doseMg: number
  lowMg: number
  highMg: number
  isExact: boolean
  label: string
}

interface AppState {
  profile: UserProfile
  doses: Dose[]
  updateProfile: (patch: Partial<UserProfile>) => void
  addDose: (input: NewDoseInput) => void
  removeDose: (id: string) => void
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      doses: [],
      updateProfile: (patch) =>
        set((state) => ({ profile: { ...state.profile, ...patch } })),
      addDose: (input) =>
        set((state) => ({
          doses: [...state.doses, { id: makeId(), ...input }].sort(
            (a, b) => a.timestampMs - b.timestampMs,
          ),
        })),
      removeDose: (id) =>
        set((state) => ({ doses: state.doses.filter((dose) => dose.id !== id) })),
    }),
    { name: 'caffeine-curve-store' },
  ),
)
