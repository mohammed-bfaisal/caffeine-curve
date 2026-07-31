interface HeaderProps {
  onOpenSettings: () => void
  onLogDrink: () => void
}

export function Header({ onOpenSettings, onLogDrink }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-4 py-5 sm:px-8">
      <div className="flex items-center gap-2">
        <span className="text-2xl">☕</span>
        <div>
          <h1 className="text-lg font-semibold text-espresso-50 sm:text-xl">
            Caffeine Curve
          </h1>
          <p className="truncate text-xs text-espresso-500">
            A personal caffeine &amp; sleep tracker
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onLogDrink}
          className="hidden rounded-lg bg-espresso-400 px-4 py-2 text-sm font-semibold text-espresso-950 transition-transform active:scale-[0.98] sm:block"
        >
          Log a drink
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="rounded-lg border border-espresso-700 px-3 py-2 text-espresso-300 transition-colors hover:bg-espresso-800"
        >
          ⚙︎
        </button>
      </div>
    </header>
  )
}
