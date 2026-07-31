import { AnimatePresence, motion } from 'framer-motion'
import {
  HALF_LIFE_MAX_HOURS,
  HALF_LIFE_MIN_HOURS,
  METABOLIZER_PRESETS,
} from '../lib/pkModel'
import { useAppStore } from '../store/useAppStore'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

function hourToTimeInput(hour: number): string {
  const h = Math.floor(hour) % 24
  const m = Math.round((hour - Math.floor(hour)) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function timeInputToHour(value: string): number {
  const [h, m] = value.split(':').map(Number)
  return h + m / 60
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const profile = useAppStore((state) => state.profile)
  const updateProfile = useAppStore((state) => state.updateProfile)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-espresso-700 bg-espresso-900 p-6"
          >
            <h2 className="mb-6 text-lg font-semibold text-espresso-50">Settings</h2>

            <div className="flex flex-col gap-6">
              <label className="flex flex-col gap-1 text-sm text-espresso-300">
                Body weight (kg)
                <input
                  type="number"
                  min={30}
                  max={250}
                  value={profile.weightKg}
                  onChange={(e) => updateProfile({ weightKg: Number(e.target.value) })}
                  className="rounded-lg border border-espresso-700 bg-espresso-950 px-3 py-2 text-espresso-50 outline-none focus:border-espresso-400"
                />
              </label>

              <div className="flex flex-col gap-2 text-sm text-espresso-300">
                <div className="flex items-center justify-between">
                  <span>Caffeine half-life</span>
                  <span className="text-espresso-100">
                    {profile.halfLifeHours.toFixed(1)} hr
                  </span>
                </div>
                <input
                  type="range"
                  min={HALF_LIFE_MIN_HOURS}
                  max={HALF_LIFE_MAX_HOURS}
                  step={0.1}
                  value={profile.halfLifeHours}
                  onChange={(e) => updateProfile({ halfLifeHours: Number(e.target.value) })}
                  className="accent-espresso-400"
                />
                <div className="flex gap-2">
                  {Object.entries(METABOLIZER_PRESETS).map(([name, hours]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => updateProfile({ halfLifeHours: hours })}
                      className="rounded-full bg-espresso-800 px-3 py-1 text-xs capitalize text-espresso-200 hover:bg-espresso-700"
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-espresso-500">
                  Real half-life varies a lot person to person — CYP1A2 genetics, smoking
                  status, pregnancy, and hormonal birth control can all shift this
                  significantly. Adjust to roughly match your own experience.
                </p>
              </div>

              <label className="flex flex-col gap-1 text-sm text-espresso-300">
                Bedtime
                <input
                  type="time"
                  value={hourToTimeInput(profile.bedtimeHour)}
                  onChange={(e) => updateProfile({ bedtimeHour: timeInputToHour(e.target.value) })}
                  className="rounded-lg border border-espresso-700 bg-espresso-950 px-3 py-2 text-espresso-50 outline-none focus:border-espresso-400"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-espresso-300">
                Wake time
                <input
                  type="time"
                  value={hourToTimeInput(profile.wakeHour)}
                  onChange={(e) => updateProfile({ wakeHour: timeInputToHour(e.target.value) })}
                  className="rounded-lg border border-espresso-700 bg-espresso-950 px-3 py-2 text-espresso-50 outline-none focus:border-espresso-400"
                />
              </label>

              <div className="flex flex-col gap-2 text-sm text-espresso-300">
                <div className="flex items-center justify-between">
                  <span>Acceptable residual caffeine</span>
                  <span className="text-espresso-100">
                    {Math.round(profile.residualThreshold * 100)}% of peak
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.6}
                  step={0.05}
                  value={profile.residualThreshold}
                  onChange={(e) =>
                    updateProfile({ residualThreshold: Number(e.target.value) })
                  }
                  className="accent-espresso-400"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
