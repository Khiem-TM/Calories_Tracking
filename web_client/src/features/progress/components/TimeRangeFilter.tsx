import { clsx } from 'clsx'

export type TimeRange = '7d' | '30d' | '3m' | '6m' | 'all'

interface TimeRangeFilterProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

const OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: 'All', value: 'all' },
]

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  return (
    <div className="flex gap-1 bg-surface-container p-1 rounded-lg w-fit">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'px-3 py-1 rounded-md text-xs font-medium font-manrope transition-colors',
            value === opt.value
              ? 'bg-surface-lowest text-on-surface shadow-card'
              : 'text-on-surface-variant hover:text-on-surface',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function getDateRange(range: TimeRange): { startDate?: string; endDate?: string } {
  const today = new Date()
  const end = today.toISOString().split('T')[0]

  if (range === 'all') return {}

  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '3m' ? 90 : 180
  const start = new Date(today.getTime() - days * 86400_000).toISOString().split('T')[0]

  return { startDate: start, endDate: end }
}
