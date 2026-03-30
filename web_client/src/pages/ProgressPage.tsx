import { useState } from 'react'
import { useBodyMetrics } from '@/features/progress/hooks/useBodyMetrics'
import { useLatestMetric } from '@/features/progress/hooks/useLatestMetric'
import { useTrendDays } from '@/features/progress/hooks/useTrendDays'
import { MetricStatCard } from '@/features/progress/components/MetricStatCard'
import { TimeRangeFilter, getDateRange, type TimeRange } from '@/features/progress/components/TimeRangeFilter'
import { BodyMetricForm } from '@/features/progress/components/BodyMetricForm'
import { ProgressPhotoSection } from '@/features/progress/components/ProgressPhotoSection'
import { WeightChart } from '@/components/charts/WeightChart'
import { CalorieTrendChart } from '@/components/charts/CalorieTrendChart'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useUserStore } from '@/stores/userStore'

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [formOpen, setFormOpen] = useState(false)
  const healthProfile = useUserStore((s) => s.healthProfile)

  const { startDate, endDate } = getDateRange(timeRange)
  const { data: metricsPage, isLoading } = useBodyMetrics(startDate, endDate)
  const { data: latest } = useLatestMetric()
  const { days: trendDays, isLoading: trendLoading } = useTrendDays('7d')

  const metrics = metricsPage?.items ?? []

  // Compute trend vs previous entry
  const prev = metrics.length >= 2 ? metrics[metrics.length - 2] : null
  const weightTrend =
    latest?.weightKg != null && prev?.weightKg != null
      ? latest.weightKg > prev.weightKg
        ? 'up'
        : latest.weightKg < prev.weightKg
          ? 'down'
          : 'neutral'
      : undefined
  const weightTrendValue =
    latest?.weightKg != null && prev?.weightKg != null
      ? latest.weightKg - prev.weightKg
      : undefined

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-bold text-on-surface font-newsreader">Progress</h1>
        <Button
          size="sm"
          onClick={() => setFormOpen(true)}
          leftIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Log Metrics
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricStatCard
          label="Weight"
          value={latest?.weightKg}
          unit="kg"
          precision={1}
          trend={weightTrend as 'up' | 'down' | 'neutral' | undefined}
          trendValue={weightTrendValue ?? undefined}
        />
        <MetricStatCard label="BMI" value={latest?.bmi} precision={1} />
        <MetricStatCard label="Body Fat" value={latest?.bodyFatPct} unit="%" precision={1} />
        <MetricStatCard label="BMR" value={latest?.bmr} unit="kcal" precision={0} />
      </div>

      {/* Weight history chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-on-surface font-newsreader">Weight History</h2>
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <WeightChart data={metrics} />
        )}
      </Card>

      {/* Calorie trend chart */}
      <Card header="Calorie Trend (This Week)">
        {trendLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : trendDays.length > 0 ? (
          <CalorieTrendChart days={trendDays} caloriesGoal={healthProfile?.caloriesGoal} />
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-on-surface-variant/60">
            No calorie data yet
          </div>
        )}
      </Card>

      {/* Measurements */}
      {latest && (
        <Card header="Latest Measurements">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
            <MetricStatCard label="Waist" value={latest.waistCm} unit="cm" precision={1} />
            <MetricStatCard label="Hip" value={latest.hipCm} unit="cm" precision={1} />
            <MetricStatCard label="Chest" value={latest.chestCm} unit="cm" precision={1} />
            <MetricStatCard label="Neck" value={latest.neckCm} unit="cm" precision={1} />
          </div>
        </Card>
      )}

      {/* Progress Photos */}
      <ProgressPhotoSection />

      {/* Log Metrics Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Log Body Metrics" size="md">
        <BodyMetricForm onClose={() => setFormOpen(false)} />
      </Modal>
    </div>
  )
}
