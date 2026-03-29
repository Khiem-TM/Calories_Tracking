import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { BodyMetric } from '@/types'

interface WeightChartProps {
  data: BodyMetric[]
}

interface ChartPoint {
  date: string
  weight: number | null
}

function formatChartDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function WeightChart({ data }: WeightChartProps) {
  const chartData: ChartPoint[] = data
    .filter((m) => m.weightKg !== null)
    .sort((a, b) => a.recordedDate.localeCompare(b.recordedDate))
    .map((m) => ({
      date: formatChartDate(m.recordedDate),
      weight: m.weightKg,
    }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-on-surface-variant font-manrope">
        No weight data yet
      </div>
    )
  }

  const weights = chartData.map((d) => d.weight).filter((w): w is number => w !== null)
  const minWeight = Math.floor(Math.min(...weights) - 1)
  const maxWeight = Math.ceil(Math.max(...weights) + 1)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#def3e2" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#3e4a40' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[minWeight, maxWeight]}
          tick={{ fontSize: 11, fill: '#3e4a40' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}`}
          width={36}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #bdcabd',
            fontSize: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,.08)',
          }}
          formatter={(value) => [`${value} kg`, 'Weight']}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#006d3a"
          strokeWidth={2}
          dot={{ fill: '#006d3a', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
