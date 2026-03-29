import { useState } from 'react'
import { useWorkoutHistory } from '@/features/training/hooks/useWorkoutHistory'
import { WorkoutHistoryCard } from '@/features/training/components/WorkoutHistoryCard'
import { ExerciseSearchModal } from '@/features/training/components/ExerciseSearchModal'
import { TrainingGoalsSection } from '@/features/training/components/TrainingGoalsSection'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

export default function TrainingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { data: sessions = [], isLoading } = useWorkoutHistory()

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-on-surface font-newsreader">Workout Log</h1>
        <Button
          onClick={() => setModalOpen(true)}
          leftIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Log Workout
        </Button>
      </div>

      {/* Training Goals */}
      <div className="bg-surface-low rounded-2xl p-4">
        <TrainingGoalsSection />
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold text-on-surface font-newsreader mb-3">Workout History</h2>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-surface-low rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">🏋️</p>
            <p className="text-on-surface font-medium font-manrope">No workouts logged yet</p>
            <p className="text-sm text-on-surface-variant mt-1 font-manrope">Hit the Log Workout button to start!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((session) => (
              <WorkoutHistoryCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>

      <ExerciseSearchModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
