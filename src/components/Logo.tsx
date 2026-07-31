interface LogoProps {
  className?: string
}

/** Coffee-cup mark with a crescent-moon accent, tying the caffeine/sleep theme together. */
export function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <mask id="logo-moon-mask" maskUnits="userSpaceOnUse">
        <circle cx="52" cy="11" r="6" fill="#fff" />
        <circle cx="55" cy="8" r="6" fill="#000" />
      </mask>

      <ellipse cx="30" cy="55" rx="18" ry="3.5" fill="var(--color-espresso-950)" opacity="0.5" />

      <path
        d="M25 3c-3 3 3 6 0 10"
        fill="none"
        stroke="var(--color-espresso-200)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M35 3c-3 3 3 6 0 10"
        fill="none"
        stroke="var(--color-espresso-200)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.8"
      />

      <rect x="16" y="24" width="28" height="27" rx="7" fill="var(--color-espresso-400)" />
      <path
        d="M42 29a9 9 0 0 1 0 18"
        fill="none"
        stroke="var(--color-espresso-400)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse cx="30" cy="24" rx="14" ry="3" fill="var(--color-espresso-900)" />

      <circle cx="52" cy="11" r="6" fill="var(--color-night-300)" mask="url(#logo-moon-mask)" />
    </svg>
  )
}
