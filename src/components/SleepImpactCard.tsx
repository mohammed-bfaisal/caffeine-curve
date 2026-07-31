import { useMemo } from 'react'
import { nextOccurrenceOfHour } from '../lib/timeOfDay'
import { totalEstimatedMinutesLost } from '../lib/sleepImpactEstimate'
import { useAppStore } from '../store/useAppStore'

export function SleepImpactCard() {
  const doses = useAppStore((state) => state.doses)
  const profile = useAppStore((state) => state.profile)

  const minutesLost = useMemo(() => {
    const bedtimeMs = nextOccurrenceOfHour(profile.bedtimeHour)
    return totalEstimatedMinutesLost(doses, bedtimeMs)
  }, [doses, profile.bedtimeHour])

  if (minutesLost < 1) return null

  return (
    <div className="rounded-2xl border border-espresso-800 bg-espresso-900/60 p-4">
      <span className="text-xs uppercase tracking-wide text-espresso-500">
        Tonight's estimated sleep impact
      </span>
      <p className="mt-1 text-2xl font-semibold text-espresso-50">
        ~{Math.round(minutesLost)} fewer minutes of sleep
      </p>
      <p className="mt-1 text-xs text-espresso-500">
        A rough extrapolation from published dose/timing trial coefficients, not a
        personalized prediction. See the README for the source study.
      </p>
    </div>
  )
}
