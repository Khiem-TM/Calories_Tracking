import { useActivityLog } from '@/features/activity/hooks/useActivityLog'
import { StepsInput } from '@/features/activity/components/StepsInput'
import { WaterInput } from '@/features/activity/components/WaterInput'
import { ActivitySummaryCard } from '@/features/activity/components/ActivitySummaryCard'
import { useUserStore } from '@/stores/userStore'
import { Spinner } from '@/components/ui/Spinner'

export default function ActivityPage() {
  const { data: activityLog, isLoading } = useActivityLog()
  const healthProfile = useUserStore((s) => s.healthProfile)

  const steps = activityLog?.steps ?? 0
  const waterMl = activityLog?.waterMl ?? 0
  const caloriesBurned = activityLog?.caloriesBurned ?? 0
  const activeMinutes = activityLog?.activeMinutes ?? 0

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-on-surface font-newsreader">Activity</h1>

      <ActivitySummaryCard
        steps={steps}
        caloriesBurned={caloriesBurned}
        activeMinutes={activeMinutes}
        waterMl={waterMl}
      />

      <StepsInput currentSteps={steps} goalSteps={10_000} />

      <WaterInput
        currentMl={waterMl}
        goalMl={healthProfile?.waterGoalMl ?? 2000}
      />
    </div>
  )
}
