import { useMemo, useState } from 'react'
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

function App() {
  const doses = useAppStore((state) => state.doses)
  const profile = useAppStore((state) => state.profile)
  const [drinkPickerOpen, setDrinkPickerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const nowMs = Date.now()

  const curveData = useMemo(
    () => buildCurveWindow(doses, profile, profile.bedtimeHour, profile.wakeHour, nowMs),
    [doses, profile, nowMs],
  )

  return (
    <div className="flex min-h-svh flex-col bg-espresso-950 text-espresso-100">
      <Header
        onOpenSettings={() => setSettingsOpen(true)}
        onLogDrink={() => setDrinkPickerOpen(true)}
      />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 pb-24 sm:px-8">
        <CaffeineChart data={curveData} nowMs={nowMs} />

        <SafeBedtimeCard />
        <SleepImpactCard />

        {doses.length === 0 ? (
          <EmptyState onLogDrink={() => setDrinkPickerOpen(true)} />
        ) : (
          <DrinkLogList />
        )}
      </main>

      <button
        type="button"
        onClick={() => setDrinkPickerOpen(true)}
        aria-label="Log a drink"
        className="fixed right-5 bottom-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-espresso-400 text-2xl text-espresso-950 shadow-lg transition-transform active:scale-95 sm:hidden"
      >
        +
      </button>

      <DisclaimerFooter />

      <DrinkPickerDrawer open={drinkPickerOpen} onClose={() => setDrinkPickerOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default App
