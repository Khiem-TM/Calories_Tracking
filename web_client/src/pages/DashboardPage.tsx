import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '@/services/dashboardService'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/utils/queryKeys'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { NutritionSummaryCard } from '@/features/nutrition/components/NutritionSummaryCard'
import { ActivitySummaryCard } from '@/features/activity/components/ActivitySummaryCard'
import { WorkoutHistoryCard } from '@/features/training/components/WorkoutHistoryCard'
import { QuickAddModal } from '@/features/dashboard/components/QuickAddModal'
import { Spinner } from '@/components/ui/Spinner'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function DashboardPage() {
  const date = useUIStore((s) => s.selectedDate)
  const healthProfile = useUserStore((s) => s.healthProfile)
  const user = useAuthStore((s) => s.user)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.dashboard(date),
    queryFn: () => getDashboard(date),
    staleTime: 30_000,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="bg-surface-low rounded-2xl p-10 text-center">
        <p className="text-on-surface-variant text-sm font-manrope">No data for this date yet.</p>
        <p className="text-on-surface-variant/60 text-xs mt-1 font-manrope">Start logging your meals and activities!</p>
      </div>
    )
  }

  const { nutrition, activity, streaks, recent_workouts } = data
  const caloriesGoal = healthProfile?.caloriesGoal ?? 2000

  const streak = Array.isArray(streaks)
    ? (streaks as { streakType: string; currentCount: number }[]).find(
        (s) => s.streakType === 'daily_logs',
      )
    : streaks

  return (
    <div className="flex flex-col gap-5 pb-20 md:pb-4">
      {/* Greeting header */}
      <div>
        <h1 className="text-2xl font-semibold text-on-surface font-newsreader">
          {getGreeting()}, {user?.display_name ?? 'there'} 👋
        </h1>
        <p className="text-sm text-on-surface-variant font-manrope mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Streak banner */}
      {streak && streak.currentCount > 0 && (
        <div className="flex items-center gap-3 bg-tertiary-container/15 text-tertiary px-4 py-3 rounded-xl w-fit">
          <span className="text-xl">🔥</span>
          <div>
            <p className="text-sm font-semibold font-manrope">{streak.currentCount} day streak!</p>
            <p className="text-xs opacity-75 font-manrope">Keep it up — you're on a roll.</p>
          </div>
        </div>
      )}

      {/* Nutrition summary */}
      <NutritionSummaryCard
        caloriesIn={nutrition.total_calories}
        caloriesGoal={caloriesGoal}
        caloriesOut={activity.calories_burned}
        protein={nutrition.total_protein}
        fat={nutrition.total_fat}
        carbs={nutrition.total_carbs}
        fiber={nutrition.total_fiber}
      />

      {/* Activity */}
      <ActivitySummaryCard
        steps={activity.steps}
        caloriesBurned={activity.calories_burned}
        activeMinutes={activity.active_minutes}
        waterMl={activity.water_ml}
      />

      {/* Recent workouts */}
      {recent_workouts && recent_workouts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-on-surface font-newsreader mb-3">Recent Workouts</h2>
          <div className="flex flex-col gap-2">
            {recent_workouts.slice(0, 3).map((session) => (
              <WorkoutHistoryCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Floating Quick Add Button */}
      <button
        onClick={() => setQuickAddOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-6 z-30 h-14 w-14 rounded-full bg-gradient-primary text-white shadow-ambient hover:opacity-90 transition-all hover:scale-105 flex items-center justify-center"
        aria-label="Quick Add"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  )
}
