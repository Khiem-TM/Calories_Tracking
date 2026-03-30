import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { DashboardData } from '@/types'

interface CalorieTrendChartProps {
  days: DashboardData[]
  caloriesGoal?: number
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function CalorieTrendChart({ days, caloriesGoal }: CalorieTrendChartProps) {
  const [showMacros, setShowMacros] = useState(false)

  const chartData = days.map((day) => ({
    date: formatDay(day.date),
    calories: day.nutrition.total_calories,
    protein: day.nutrition.total_protein,
    carbs: day.nutrition.total_carbs,
    fat: day.nutrition.total_fat,
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-on-surface-variant font-manrope">
        No data for this period
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowMacros((v) => !v)}
          className="text-xs text-primary font-manrope font-medium hover:underline"
        >
          {showMacros ? 'Hide macros' : 'Show macros'}
        </button>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="calorieGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#006d3a" stopOpacity={0.20} />
              <stop offset="95%" stopColor="#006d3a" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="proteinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="carbsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#eab308" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#def3e2" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v: number) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #bdcabd',
              fontSize: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,.08)',
            }}
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                calories: 'Calories (kcal)',
                protein: 'Protein (g)',
                carbs: 'Carbs (g)',
                fat: 'Fat (g)',
              }
              return [value, labels[name as string] ?? name]
            }}
          />
          <Legend
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                calories: 'Calories',
                protein: 'Protein',
                carbs: 'Carbs',
                fat: 'Fat',
              }
              return labels[value] ?? value
            }}
          />
          {caloriesGoal && (
            <ReferenceLine
              y={caloriesGoal}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: 'Goal', position: 'insideTopRight', fontSize: 10, fill: '#94a3b8' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="calories"
            stroke="#006d3a"
            strokeWidth={2}
            fill="url(#calorieGrad)"
            dot={{ fill: '#006d3a', r: 3 }}
            activeDot={{ r: 5 }}
          />
          {showMacros && (
            <>
              <Area
                type="monotone"
                dataKey="protein"
                stroke="#3b82f6"
                strokeWidth={1.5}
                fill="url(#proteinGrad)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="carbs"
                stroke="#22c55e"
                strokeWidth={1.5}
                fill="url(#carbsGrad)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="fat"
                stroke="#eab308"
                strokeWidth={1.5}
                fill="url(#fatGrad)"
                dot={false}
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
