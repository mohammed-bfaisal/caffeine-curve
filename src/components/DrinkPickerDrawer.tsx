import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { DRINK_PRESETS, getDrinkPreset } from '../lib/drinkPresets'
import { useAppStore } from '../store/useAppStore'

interface DrinkPickerDrawerProps {
  open: boolean
  onClose: () => void
}

function toLocalDateTimeInputValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function DrinkPickerDrawer({ open, onClose }: DrinkPickerDrawerProps) {
  const addDose = useAppStore((state) => state.addDose)
  const [presetId, setPresetId] = useState<string>(DRINK_PRESETS[0].id)
  const [useManualMg, setUseManualMg] = useState(false)
  const [manualMg, setManualMg] = useState('100')
  const [timeValue, setTimeValue] = useState(() => toLocalDateTimeInputValue(new Date()))

  const preset = getDrinkPreset(presetId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const timestampMs = new Date(timeValue).getTime()

    if (useManualMg) {
      const mg = Number(manualMg)
      if (!Number.isFinite(mg) || mg < 0) return
      addDose({
        timestampMs,
        doseMg: mg,
        lowMg: mg,
        highMg: mg,
        isExact: true,
        label: `${mg} mg (manual)`,
      })
    } else if (preset) {
      addDose({
        timestampMs,
        doseMg: preset.defaultMg,
        lowMg: preset.minMg,
        highMg: preset.maxMg,
        isExact: false,
        label: `${preset.label} (${preset.size})`,
      })
    }
    onClose()
  }

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
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-espresso-700 bg-espresso-900 p-6 sm:mx-auto sm:max-w-lg"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-espresso-700" />
            <h2 className="mb-4 text-lg font-semibold text-espresso-50">Log a drink</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUseManualMg(false)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    !useManualMg
                      ? 'bg-espresso-500 text-espresso-50'
                      : 'bg-espresso-800 text-espresso-300'
                  }`}
                >
                  Pick a drink
                </button>
                <button
                  type="button"
                  onClick={() => setUseManualMg(true)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    useManualMg
                      ? 'bg-espresso-500 text-espresso-50'
                      : 'bg-espresso-800 text-espresso-300'
                  }`}
                >
                  I know the exact mg
                </button>
              </div>

              {useManualMg ? (
                <label className="flex flex-col gap-1 text-sm text-espresso-300">
                  Caffeine amount (mg)
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={manualMg}
                    onChange={(e) => setManualMg(e.target.value)}
                    className="rounded-lg border border-espresso-700 bg-espresso-950 px-3 py-2 text-espresso-50 outline-none focus:border-espresso-400"
                  />
                </label>
              ) : (
                <label className="flex flex-col gap-1 text-sm text-espresso-300">
                  Drink
                  <select
                    value={presetId}
                    onChange={(e) => setPresetId(e.target.value)}
                    className="rounded-lg border border-espresso-700 bg-espresso-950 px-3 py-2 text-espresso-50 outline-none focus:border-espresso-400"
                  >
                    {DRINK_PRESETS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label} — {option.size} (~{option.defaultMg} mg)
                      </option>
                    ))}
                  </select>
                  {preset && (
                    <span className="mt-1 text-xs text-espresso-400">
                      Estimated range: {preset.minMg}-{preset.maxMg} mg
                    </span>
                  )}
                </label>
              )}

              <label className="flex flex-col gap-1 text-sm text-espresso-300">
                Time
                <input
                  type="datetime-local"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  className="rounded-lg border border-espresso-700 bg-espresso-950 px-3 py-2 text-espresso-50 outline-none focus:border-espresso-400"
                />
              </label>

              <button
                type="submit"
                className="mt-2 rounded-lg bg-espresso-400 px-4 py-3 font-semibold text-espresso-950 transition-transform active:scale-[0.98]"
              >
                Add to curve
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
