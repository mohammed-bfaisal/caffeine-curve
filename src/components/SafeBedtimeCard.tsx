import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { DRINK_PRESETS } from '../lib/drinkPresets'
import { lastSafeIntakeTime } from '../lib/safeBedtime'
import { useAppStore } from '../store/useAppStore'

function nextBedtimeMs(bedtimeHour: number, nowMs: number): number {
  const now = new Date(nowMs)
  const bedtime = new Date(now)
  bedtime.setHours(Math.floor(bedtimeHour), Math.round((bedtimeHour % 1) * 60), 0, 0)
  if (bedtime.getTime() <= nowMs) bedtime.setDate(bedtime.getDate() + 1)
  return bedtime.getTime()
}

export function SafeBedtimeCard() {
  const profile = useAppStore((state) => state.profile)
  const [presetId, setPresetId] = useState(DRINK_PRESETS[4].id) // espresso single, by default

  const preset = DRINK_PRESETS.find((p) => p.id === presetId) ?? DRINK_PRESETS[0]

  const lastSafeTime = useMemo(() => {
    const bedtimeMs = nextBedtimeMs(profile.bedtimeHour, Date.now())
    const intakeMs = lastSafeIntakeTime(
      preset.defaultMg,
      { halfLifeHours: profile.halfLifeHours, weightKg: profile.weightKg },
      bedtimeMs,
      profile.residualThreshold,
    )
    return intakeMs
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
        {isInPast && (
          <p className="text-xs text-amber-400">already past — decay to threshold takes longer than remaining time</p>
        )}
      </div>
    </div>
  )
}
