import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'

export function DrinkLogList() {
  const doses = useAppStore((state) => state.doses)
  const removeDose = useAppStore((state) => state.removeDose)

  if (doses.length === 0) return null

  const sorted = [...doses].sort((a, b) => b.timestampMs - a.timestampMs)

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs uppercase tracking-wide text-espresso-500">Today's drinks</h3>
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {sorted.map((dose) => (
            <motion.li
              key={dose.id}
              layout
              initial={{ opacity: 0, x: -16, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 16, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-between overflow-hidden rounded-xl border border-espresso-800 bg-espresso-900/50 px-3 py-2 text-sm"
            >
              <div>
                <p className="text-espresso-100">{dose.label}</p>
                <p className="text-xs text-espresso-500">
                  {format(new Date(dose.timestampMs), 'h:mm a')}
                  {' · '}
                  {dose.isExact ? `${dose.doseMg} mg` : `~${dose.doseMg} mg`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeDose(dose.id)}
                className="rounded-full px-2 py-1 text-espresso-500 hover:bg-espresso-800 hover:text-espresso-200"
                aria-label={`Remove ${dose.label}`}
              >
                ✕
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
