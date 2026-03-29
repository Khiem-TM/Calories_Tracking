import { Card } from '@/components/ui/Card'
import type { WorkoutSession } from '@/types'

interface WorkoutHistoryCardProps {
  session: WorkoutSession
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const muscleGroupColors: Record<string, string> = {
  chest: 'bg-red-100 text-red-700',
  back: 'bg-blue-100 text-blue-700',
  legs: 'bg-green-100 text-green-700',
  shoulders: 'bg-purple-100 text-purple-700',
  arms: 'bg-orange-100 text-orange-700',
  core: 'bg-yellow-100 text-yellow-700',
  cardio: 'bg-indigo-100 text-indigo-700',
  full_body: 'bg-slate-100 text-slate-700',
}

export function WorkoutHistoryCard({ session }: WorkoutHistoryCardProps) {
  const colorClass = muscleGroupColors[session.exercise.primaryMuscleGroup] ?? 'bg-slate-100 text-slate-700'

  return (
    <Card padding="sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-700">{session.exercise.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
              {session.exercise.primaryMuscleGroup.replace('_', ' ')}
            </span>
          </div>
          <div className="flex gap-3 mt-1 text-xs text-slate-400">
            {session.durationMinutes > 0 && <span>{session.durationMinutes} min</span>}
            {session.sets && session.repsPerSet && (
              <span>{session.sets} × {session.repsPerSet} reps</span>
            )}
            {session.weightKg && <span>{session.weightKg} kg</span>}
            <span>{formatDate(session.sessionDate)}</span>
          </div>
        </div>
        {session.caloriesBurnedSnapshot > 0 && (
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-slate-700">
              {Math.round(session.caloriesBurnedSnapshot)}
            </p>
            <p className="text-xs text-slate-400">kcal</p>
          </div>
        )}
      </div>
    </Card>
  )
}
