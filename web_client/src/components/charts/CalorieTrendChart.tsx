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
import type { WeeklyReport } from '@/services/dashboardService'

interface CalorieTrendChartProps {
  data: WeeklyReport
  caloriesGoal?: number
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function CalorieTrendChart({ data, caloriesGoal }: CalorieTrendChartProps) {
  const chartData = data.days.map((day) => ({
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
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="calorieGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#006d3a" stopOpacity={0.20} />
            <stop offset="95%" stopColor="#006d3a" stopOpacity={0.02} />
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
      </AreaChart>
    </ResponsiveContainer>
  )
}
