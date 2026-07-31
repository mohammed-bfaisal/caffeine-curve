import { motion } from 'framer-motion'
import { Logo } from './Logo'

interface EmptyStateProps {
  onLogDrink: () => void
}

export function EmptyState({ onLogDrink }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-espresso-700 bg-espresso-900/40 px-6 py-12 text-center"
    >
      <Logo className="h-12 w-12" />
      <div>
        <h2 className="text-lg font-semibold text-espresso-50">No drinks logged yet</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-espresso-400">
          Log your first coffee, tea, or energy drink to see how caffeine builds up in
          your system and whether it'll still be active at bedtime.
        </p>
      </div>
      <button
        type="button"
        onClick={onLogDrink}
        className="rounded-lg bg-espresso-400 px-5 py-2.5 font-semibold text-espresso-950 transition-transform active:scale-[0.98]"
      >
        Log a drink
      </button>
    </motion.div>
  )
}
