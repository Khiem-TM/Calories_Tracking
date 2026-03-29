import { clsx } from 'clsx'

interface MetricStatCardProps {
  label: string
  value: number | null | undefined
  unit?: string
  precision?: number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: number
}

export function MetricStatCard({
  label,
  value,
  unit = '',
  precision = 1,
  trend,
  trendValue,
}: MetricStatCardProps) {
  const displayValue =
    value != null
      ? `${value.toFixed(precision)}${unit ? ' ' + unit : ''}`
      : '—'

  const trendColor =
    trend === 'down' ? 'text-green-500' : trend === 'up' ? 'text-red-500' : 'text-on-surface-variant/60'

  const trendIcon = trend === 'down' ? '↓' : trend === 'up' ? '↑' : '→'

  return (
    <div className="bg-surface-lowest rounded-xl p-4 shadow-card">
      <p className="text-xs text-on-surface-variant/60 font-medium uppercase tracking-wide mb-1 font-manrope">{label}</p>
      <p className="text-2xl font-bold text-on-surface data-value">{displayValue}</p>
      {trend && trendValue != null && (
        <p className={clsx('text-xs mt-1', trendColor)}>
          {trendIcon} {Math.abs(trendValue).toFixed(1)}{unit} from last
        </p>
      )}
    </div>
  )
}
