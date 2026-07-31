import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CurvePoint } from '../lib/curveWindow'

interface CaffeineChartProps {
  data: CurvePoint[]
  nowMs: number
}

function formatTick(timestampMs: number): string {
  return format(new Date(timestampMs), 'ha').toLowerCase()
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { payload: CurvePoint }[]
  label?: number
}) {
  if (!active || !payload?.length || label === undefined) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-espresso-700 bg-espresso-900/95 px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-espresso-100">
        {format(new Date(label), 'EEE h:mm a')}
      </p>
      <p className="text-espresso-300">
        Caffeine: <span className="text-espresso-100">{point.mg.toFixed(1)} mg/L</span>
        {point.highMg > point.lowMg + 0.001 && (
          <span className="text-espresso-400">
            {' '}
            ({point.lowMg.toFixed(1)}-{point.highMg.toFixed(1)})
          </span>
        )}
      </p>
      <p className="text-night-300">
        Sleep pressure: {(point.sleepPressureLevel * 100).toFixed(0)}%
      </p>
    </div>
  )
}

export function CaffeineChart({ data, nowMs }: CaffeineChartProps) {
  const chartData = useMemo(() => {
    const peak = maxMg(data)
    return data.map((point) => ({
      ...point,
      bandWidth: Math.max(0, point.highMg - point.lowMg),
      sleepPressureDisplay: point.sleepPressureLevel * peak,
    }))
  }, [data])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative h-72 w-full rounded-2xl border border-espresso-800 bg-espresso-900/60 p-4 sm:h-96"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-espresso-800)" />
          <XAxis
            dataKey="timestampMs"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatTick}
            stroke="var(--color-espresso-400)"
            fontSize={12}
            minTickGap={40}
          />
          <YAxis
            yAxisId="caffeine"
            stroke="var(--color-espresso-400)"
            fontSize={12}
            width={40}
            label={{
              value: 'mg/L',
              angle: -90,
              position: 'insideLeft',
              fill: 'var(--color-espresso-400)',
              fontSize: 11,
            }}
          />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine
            x={nowMs}
            yAxisId="caffeine"
            stroke="var(--color-espresso-300)"
            strokeDasharray="4 4"
            label={{ value: 'now', position: 'top', fill: 'var(--color-espresso-300)', fontSize: 11 }}
          />
          <Area
            yAxisId="caffeine"
            dataKey="lowMg"
            stackId="band"
            stroke="none"
            fill="transparent"
            isAnimationActive={false}
          />
          <Area
            yAxisId="caffeine"
            dataKey="bandWidth"
            stackId="band"
            stroke="none"
            fill="var(--color-espresso-500)"
            fillOpacity={0.18}
            animationDuration={1200}
          />
          <Area
            yAxisId="caffeine"
            dataKey="sleepPressureDisplay"
            stroke="var(--color-night-300)"
            strokeDasharray="5 3"
            fill="var(--color-night-700)"
            fillOpacity={0.25}
            animationDuration={1200}
          />
          <Line
            yAxisId="caffeine"
            dataKey="mg"
            stroke="var(--color-espresso-200)"
            strokeWidth={2.5}
            dot={false}
            animationDuration={1200}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="pointer-events-none absolute right-4 bottom-2 text-[10px] tracking-wide text-night-300/80">
        Sleep-pressure band: illustrative estimate, not measured
      </p>
    </motion.div>
  )
}

function maxMg(data: CurvePoint[]): number {
  return data.reduce((max, point) => Math.max(max, point.highMg), 1)
}
