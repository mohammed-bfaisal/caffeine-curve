# Caffeine Curve

A personal caffeine pharmacokinetics tracker. Log the coffee, tea, or energy
drinks you've had today and see, on one chart, how much caffeine is
estimated to still be in your system, and whether it'll still be active
around your bedtime.

This is a hobby/educational project, **not a medical device**. All
sleep-pressure visuals and impact estimates are explicitly illustrative,
not measured biological data or a personalized prediction.

## Why I built this

This started from noticing a pattern in my own life. I was chronically low
on sleep, and at work I'd reach for caffeine in fits and starts, sometimes
back-to-back cups with barely a gap, sometimes spaced hours apart depending
on the day. After a while I started noticing my sleep quality wasn't
consistent either; some nights were fine, some were rough, and it felt like
it tracked *when* I'd had caffeine relative to bedtime more than *how much*
I'd had overall.

The problem was I couldn't actually see it. I had a vague sense of "that
second coffee was probably too late" but no way to check it against
anything real. I wanted something that would take a rough pharmacokinetic
model of caffeine and just show me, visually, whether a given drink would
realistically still be in my system by the time I wanted to sleep, instead
of guessing after the fact.

## What it does

- Log drinks (presets or an exact mg amount) with a timestamp.
- See a single stacked curve of estimated blood caffeine concentration,
  built by summing the contribution of every drink you've logged.
- See an illustrative sleep-pressure band modeling the interaction of your
  homeostatic sleep drive and circadian rhythm (the two-process model), based
  on your stated bedtime and wake time.
- Get a reactive "last safe [drink]" readout, plus a population-level
  confidence range reflecting how much caffeine half-life genuinely varies
  between people, not just your own dialed-in setting.
- See a quantified estimate of tonight's sleep impact, in minutes, based on
  published dose/timing trial coefficients.
- Tune body weight, caffeine half-life (metabolizer speed), bedtime, wake
  time, and residual threshold in Settings.
- Everything is stored locally in your browser (`localStorage`); there is
  no backend and no data leaves your device.

## The science (and its limits)

### Caffeine pharmacokinetics

Caffeine concentration over time is modeled with the standard
**one-compartment model with first-order oral absorption**:

```
C(t) = (F * Dose * ka) / (Vd * (ka - ke)) * (e^(-ke*t) - e^(-ka*t))
```

- `F` (bioavailability) ≈ 1.0: caffeine is nearly 100% orally bioavailable.
- `ka` (absorption rate constant) is fixed at a value chosen so that peak
  concentration (Tmax) falls in the commonly cited **30-75 minute** window
  after a typical coffee-sized dose.
- `ke` (elimination rate constant) is derived from the half-life you set:
  `ke = ln(2) / halfLife`. The default is **5 hours**, the commonly cited
  average adult value, but this varies hugely between individuals:
  CYP1A2 genetics, smoking status, pregnancy, and hormonal birth control can
  all shift it significantly. A half-life slider (1.5-9.5 hr) with
  fast/average/slow metabolizer presets lets you approximate your own.
- `Vd` (volume of distribution) is `0.6 L/kg` scaled by your body weight.

When you log multiple drinks, the total curve at any instant is the **sum**
of every active dose's individual contribution; each dose is modeled
independently from its own intake time and then stacked.

Drink presets that come from a range (rather than an exact mg entry) are
rendered with a shaded uncertainty band between the low and high estimate,
not a single hard line.

### The safe-bedtime calculator, and its confidence range

Given your bedtime and an "acceptable residual %" threshold (default 20% of
a dose's own peak concentration), the app solves numerically for the latest
intake time such that, by bedtime, the modeled concentration has decayed to
at or below that threshold, using your currently dialed-in half-life.

Because real caffeine half-life varies enormously between people
(roughly 1.5-9.5 hours, driven by CYP1A2 genetics, smoking status,
pregnancy, and hormonal birth control), a single point estimate overstates
how precisely anyone can know their own number. Alongside your personal
setting, the app runs a small Monte Carlo simulation (deterministically
seeded, so it doesn't flicker between renders) across that entire clinical
half-life range and reports the 10th-90th percentile spread as a "typical
range." Treat the point estimate as your best guess and the range as how
wrong that guess could reasonably be.

### The sleep-pressure overlay: a real two-process model, still illustrative

The dashed band on the chart is **not measured or individually modeled
biology** (it isn't EEG or actigraphy data), but it now implements the
mechanism, not just a hand-drawn shape. It's an implementation of the
classic Borbély two-process model of sleep regulation:

- **Process S**, the homeostatic sleep drive, rises while you're awake and
  decays while you're asleep, each following an exponential approach to an
  asymptote.
- **Process C**, a circadian oscillator, modulates that drive on a 24-hour
  cycle, with its trough anchored a couple of hours before your stated wake
  time (approximating the core-body-temperature minimum commonly used as a
  circadian phase reference).

The two combined reproduce recognizable real-world shapes, like the
early-afternoon dip, rather than a single symmetric bump. The illustrative
time constants used are commonly cited approximations, not a fitted or
personalized model; see [Sources](#sources) below.

### The sleep-impact estimate

Rather than only a threshold crossing, the app also surfaces a plain-language
number: an estimate of how many minutes of total sleep tonight's caffeine
intake might cost you. This is a coarse linear extrapolation from
published dose/timing regression coefficients (roughly 0.2 minutes of sleep
lost per mg of caffeine, offset by roughly 2.8 minutes recovered per hour of
gap before bedtime), not a mechanistic or personalized model, floored at
zero. It's meant as a directional, plain-English translation of the same
trial data the safe-bedtime calculator is built on, not a separate claim.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

### Tests

Unit tests cover the PK math (concentration curve shape, Tmax window, and
dose stacking), the two-process sleep-pressure model, the sleep-impact
estimate, and the safe-bedtime solver (including its confidence range):

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

## Sources

The pharmacokinetic model uses standard, widely cited one-compartment
formulas and parameter ranges. The newer sleep-modeling features are built
directly on these papers:

- Borbély A. "The two-process model of sleep regulation: a reappraisal."
  *J Sleep Res* (2016).
  [onlinelibrary.wiley.com/doi/abs/10.1111/jsr.12371](https://onlinelibrary.wiley.com/doi/abs/10.1111/jsr.12371)
- Borbély A, Daan S, Wirz-Justice A, Deboer T. "The two-process model of
  sleep regulation: a reappraisal." *J Sleep Res* / PMC.
  [ncbi.nlm.nih.gov/pmc/articles/PMC9540767](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9540767/)
- Reichert C, et al. "Adenosine, caffeine, and sleep-wake regulation: state
  of the science and perspectives." *J Sleep Res* (2022).
  [onlinelibrary.wiley.com/doi/full/10.1111/jsr.13597](https://onlinelibrary.wiley.com/doi/full/10.1111/jsr.13597)
- "Dose and timing effects of caffeine on subsequent sleep: a randomized
  clinical crossover trial." *SLEEP* (2025), Oxford Academic. Source of the
  sleep-impact-estimate coefficients.
  [academic.oup.com/sleep/article/48/4/zsae230/7815486](https://academic.oup.com/sleep/article/48/4/zsae230/7815486)
- "The effect of caffeine on subsequent sleep: A systematic review and
  meta-analysis." *Sleep Medicine Reviews*.
  [sciencedirect.com/science/article/pii/S1087079223000205](https://www.sciencedirect.com/science/article/pii/S1087079223000205)
- "Role of adenosine receptors in caffeine tolerance." *PubMed*.
  [pubmed.ncbi.nlm.nih.gov/1846425](https://pubmed.ncbi.nlm.nih.gov/1846425/)
- "Caffeine Withdrawal." StatPearls, NIH.
  [ncbi.nlm.nih.gov/books/NBK430790](https://www.ncbi.nlm.nih.gov/books/NBK430790/)

## Disclaimer

Educational estimates only, not medical advice. Individual caffeine
metabolism varies significantly.
