import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { DRINK_PRESETS } from '../lib/drinkPresets'
import { lastSafeIntakeTime, safeBedtimeRange } from '../lib/safeBedtime'
import { nextOccurrenceOfHour } from '../lib/timeOfDay'
import { useAppStore } from '../store/useAppStore'

export function SafeBedtimeCard() {
  const profile = useAppStore((state) => state.profile)
  const [presetId, setPresetId] = useState(DRINK_PRESETS[4].id) // espresso single, by default

  const preset = DRINK_PRESETS.find((p) => p.id === presetId) ?? DRINK_PRESETS[0]

  const { lastSafeTime, range } = useMemo(() => {
    const bedtimeMs = nextOccurrenceOfHour(profile.bedtimeHour)
    const intakeMs = lastSafeIntakeTime(
      preset.defaultMg,
      { halfLifeHours: profile.halfLifeHours, weightKg: profile.weightKg },
      bedtimeMs,
      profile.residualThreshold,
    )
    const populationRange = safeBedtimeRange(
      preset.defaultMg,
      profile.weightKg,
      bedtimeMs,
      profile.residualThreshold,
    )
    return { lastSafeTime: intakeMs, range: populationRange }
  }, [preset.defaultMg, profile.bedtimeHour, profile.halfLifeHours, profile.weightKg, profile.residualThreshold])

  const isInPast = lastSafeTime < Date.now()

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-espresso-800 bg-espresso-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-espresso-500">
          Safe-bedtime calculator
        </span>
        <p className="text-sm text-espresso-300">
          Last safe{' '}
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            className="max-w-[9rem] rounded border border-espresso-700 bg-espresso-950 px-1.5 py-0.5 text-espresso-100 sm:max-w-none"
          >
            {DRINK_PRESETS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          :
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-semibold text-espresso-50">
          {format(new Date(lastSafeTime), 'h:mm a')}
        </p>
        <p className="text-xs text-espresso-500">
          based on your half-life setting; typical range{' '}
          {format(new Date(range.p10), 'h:mm a')}-{format(new Date(range.p90), 'h:mm a')}
        </p>
        {isInPast && (
          <p className="text-xs text-amber-400">
            already past, decay to threshold takes longer than remaining time
          </p>
        )}
      </div>
    </div>
  )
}
