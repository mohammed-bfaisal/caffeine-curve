import { useDeferredValue, useMemo, useState } from 'react'
import { MotionConfig, motion, type Variants } from 'framer-motion'
import { CaffeineChart } from './components/CaffeineChart'
import { DisclaimerFooter } from './components/DisclaimerFooter'
import { DrinkLogList } from './components/DrinkLogList'
import { DrinkPickerDrawer } from './components/DrinkPickerDrawer'
import { EmptyState } from './components/EmptyState'
import { Header } from './components/Header'
import { SafeBedtimeCard } from './components/SafeBedtimeCard'
import { SettingsPanel } from './components/SettingsPanel'
import { SleepImpactCard } from './components/SleepImpactCard'
import { buildCurveWindow } from './lib/curveWindow'
import { useAppStore } from './store/useAppStore'

const sectionListVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const sectionItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function App() {
  const doses = useAppStore((state) => state.doses)
  const profile = useAppStore((state) => state.profile)
  const [drinkPickerOpen, setDrinkPickerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const nowMs = Date.now()

  // Slider drags in Settings update `profile` on every tick; deferring the
  // value fed into the (comparatively expensive) curve rebuild keeps the
  // slider itself responsive on low-end devices instead of blocking on
  // every intermediate value.
  const deferredProfile = useDeferredValue(profile)

  const curveData = useMemo(
    () =>
      buildCurveWindow(
        doses,
        deferredProfile,
        deferredProfile.bedtimeHour,
        deferredProfile.wakeHour,
        nowMs,
      ),
    [doses, deferredProfile, nowMs],
  )

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-svh flex-col bg-espresso-950 text-espresso-100">
        <Header
          onOpenSettings={() => setSettingsOpen(true)}
          onLogDrink={() => setDrinkPickerOpen(true)}
        />

        <motion.main
          variants={sectionListVariants}
          initial="hidden"
          animate="show"
          className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 pb-24 sm:px-8"
        >
          <CaffeineChart data={curveData} nowMs={nowMs} />

          <motion.div variants={sectionItemVariants}>
            <SafeBedtimeCard />
          </motion.div>
          <motion.div variants={sectionItemVariants}>
            <SleepImpactCard />
          </motion.div>

          <motion.div variants={sectionItemVariants}>
            {doses.length === 0 ? (
              <EmptyState onLogDrink={() => setDrinkPickerOpen(true)} />
            ) : (
              <DrinkLogList />
            )}
          </motion.div>
        </motion.main>

        <motion.button
          type="button"
          onClick={() => setDrinkPickerOpen(true)}
          aria-label="Log a drink"
          whileTap={{ scale: 0.92 }}
          className="fixed right-5 bottom-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-espresso-400 text-2xl text-espresso-950 shadow-lg sm:hidden"
        >
          +
        </motion.button>

        <DisclaimerFooter />

        <DrinkPickerDrawer open={drinkPickerOpen} onClose={() => setDrinkPickerOpen(false)} />
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </MotionConfig>
  )
}

export default App
