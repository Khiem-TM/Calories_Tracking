import { BodyMetricForm } from '@/features/progress/components/BodyMetricForm'
import { ProgressPhotoSection } from '@/features/progress/components/ProgressPhotoSection'
import { MetricStatCard } from '@/features/progress/components/MetricStatCard'
import { useLatestMetric } from '@/features/progress/hooks/useLatestMetric'
import { Spinner } from '@/components/ui/Spinner'

export default function MetricUpdatePage() {
  const { data: latest, isLoading } = useLatestMetric()

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-on-surface font-newsreader">Body Metrics</h1>
        <p className="text-sm text-on-surface-variant font-manrope mt-0.5">
          Log your measurements and track progress photos.
        </p>
      </div>

      {/* Current stats — surface-low container */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : latest ? (
        <div className="bg-surface-low rounded-2xl p-5">
          <p className="text-xs text-on-surface-variant font-manrope uppercase tracking-wider mb-4">Latest Measurements</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {latest.weightKg != null && (
              <MetricStatCard label="Weight" value={latest.weightKg} unit="kg" />
            )}
            {latest.bodyFatPct != null && (
              <MetricStatCard label="Body Fat" value={latest.bodyFatPct} unit="%" />
            )}
            {latest.bmi != null && (
              <MetricStatCard label="BMI" value={latest.bmi} unit="" />
            )}
            {latest.waistCm != null && (
              <MetricStatCard label="Waist" value={latest.waistCm} unit="cm" />
            )}
          </div>
        </div>
      ) : (
        <div className="bg-surface-low rounded-2xl p-6 text-center">
          <p className="text-on-surface-variant text-sm font-manrope">No measurements logged yet.</p>
        </div>
      )}

      {/* Update form */}
      <div className="bg-surface-lowest rounded-2xl shadow-card p-6">
        <h2 className="text-base font-semibold text-on-surface font-newsreader mb-4">Log Today's Measurements</h2>
        <BodyMetricForm />
      </div>

      {/* Progress photos */}
      <div className="bg-surface-low rounded-2xl p-5">
        <h2 className="text-base font-semibold text-on-surface font-newsreader mb-4">Progress Photos</h2>
        <ProgressPhotoSection />
      </div>
    </div>
  )
}
