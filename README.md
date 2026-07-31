# Caffeine Curve

A personal caffeine pharmacokinetics tracker. Log the coffee, tea, or energy
drinks you've had today and see, on one chart, how much caffeine is
estimated to still be in your system — and whether it'll still be active
around your bedtime.

This is a hobby/educational project, **not a medical device**. All
melatonin/sleep-pressure visuals are explicitly illustrative estimates, not
measured biological data.

## What it does

- Log drinks (presets or an exact mg amount) with a timestamp.
- See a single stacked curve of estimated blood caffeine concentration,
  built by summing the contribution of every drink you've logged.
- See an illustrative "sleep pressure" band showing roughly when your body
  is winding down for sleep, based on your stated bedtime and wake time.
- Get a reactive "last safe [drink]" readout: the latest time you could have
  a given drink so that, by your bedtime, its modeled concentration has
  decayed to your chosen acceptable-residual threshold.
- Tune body weight, caffeine half-life (metabolizer speed), bedtime, wake
  time, and residual threshold in Settings.
- Everything is stored locally in your browser (`localStorage`) — there is
  no backend and no data leaves your device.

## The science (and its limits)

### Caffeine pharmacokinetics

Caffeine concentration over time is modeled with the standard
**one-compartment model with first-order oral absorption**:

```
C(t) = (F * Dose * ka) / (Vd * (ka - ke)) * (e^(-ke*t) - e^(-ka*t))
```

- `F` (bioavailability) ≈ 1.0 — caffeine is nearly 100% orally bioavailable.
- `ka` (absorption rate constant) is fixed at a value chosen so that peak
  concentration (Tmax) falls in the commonly cited **30-75 minute** window
  after a typical coffee-sized dose.
- `ke` (elimination rate constant) is derived from the half-life you set:
  `ke = ln(2) / halfLife`. The default is **5 hours**, the commonly cited
  average adult value, but this varies hugely between individuals —
  CYP1A2 genetics, smoking status, pregnancy, and hormonal birth control can
  all shift it significantly. A half-life slider (1.5-9.5 hr) with
  fast/average/slow metabolizer presets lets you approximate your own.
- `Vd` (volume of distribution) is `0.6 L/kg` scaled by your body weight.

When you log multiple drinks, the total curve at any instant is the **sum**
of every active dose's individual contribution — each dose is modeled
independently from its own intake time and then stacked.

Drink presets that come from a range (rather than an exact mg entry) are
rendered with a shaded uncertainty band between the low and high estimate,
not a single hard line.

### The safe-bedtime calculator

Given your bedtime and an "acceptable residual %" threshold (default 20% of
a dose's own peak concentration), the app solves numerically for the latest
intake time such that, by bedtime, the modeled concentration has decayed to
at or below that threshold.

### The melatonin / sleep-pressure overlay — illustrative only

The dashed band on the chart is **not measured or individually modeled
biology**. It's a simple smooth bell curve that starts rising ~2 hours
before your stated bedtime, peaks at the midpoint of your stated sleep
window, and falls off approaching your stated wake time. It exists purely
to give a visual sense of "is this caffeine still around when I'm trying to
wind down" — treat it as a sketch, not a measurement.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

### Tests

Unit tests cover the PK math (concentration curve shape, Tmax window,
dose stacking, the melatonin overlay's shape, and the safe-bedtime solver):

```bash
npm run test
```

### Build

```bash
npm run build
```

Outputs a static site to `dist/`.

## Tech stack

Vite, React 18, TypeScript, Tailwind CSS v4, Framer Motion, Recharts,
Zustand, date-fns, Vitest.

## Disclaimer

Educational estimates only, not medical advice. Individual caffeine
metabolism varies significantly.
