import { useState } from 'react'
import { WeightChart } from '@/components/charts/WeightChart'
import { CalorieTrendChart } from '@/components/charts/CalorieTrendChart'
import { TimeRangeFilter, getDateRange } from '@/features/progress/components/TimeRangeFilter'
import type { TimeRange } from '@/features/progress/components/TimeRangeFilter'
import { useTrendDays } from '@/features/progress/hooks/useTrendDays'
import { useBodyMetrics } from '@/features/progress/hooks/useBodyMetrics'
import { Spinner } from '@/components/ui/Spinner'

export default function HealthTrendPage() {
  const [range, setRange] = useState<TimeRange>('7d')
  const { startDate, endDate } = getDateRange(range)

  const { days, isLoading: trendLoading } = useTrendDays(range)
  const { data: metricsPage, isLoading: metricsLoading } = useBodyMetrics(startDate, endDate)

  const isLoading = trendLoading || metricsLoading
  const metrics = metricsPage?.items ?? []

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface font-newsreader">Health Trends</h1>
          <p className="text-sm text-on-surface-variant font-manrope mt-0.5">
            Visualize your progress over time.
          </p>
        </div>
        <TimeRangeFilter value={range} onChange={setRange} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Calorie trend */}
          <div className="bg-surface-lowest rounded-2xl shadow-card p-6">
            <h2 className="text-base font-semibold text-on-surface font-newsreader mb-4">Calories</h2>
            {days.length > 0 ? (
              <CalorieTrendChart days={days} />
            ) : (
              <div className="py-10 text-center text-sm text-on-surface-variant font-manrope">
                No calorie data available yet.
              </div>
            )}
          </div>

          {/* Weight trend */}
          <div className="bg-surface-low rounded-2xl p-6">
            <h2 className="text-base font-semibold text-on-surface font-newsreader mb-4">Weight</h2>
            {metrics.length > 0 ? (
              <WeightChart data={metrics} />
            ) : (
              <div className="py-10 text-center text-sm text-on-surface-variant font-manrope">
                No weight data available yet. Log your first measurement in Body Metrics.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
