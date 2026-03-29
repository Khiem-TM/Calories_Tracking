import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { WorkoutSessionForm } from './WorkoutSessionForm'
import { useExercises } from '../hooks/useExercises'
import type { Exercise, MuscleGroup } from '@/types'
import { clsx } from 'clsx'

interface ExerciseSearchModalProps {
  open: boolean
  onClose: () => void
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full_body',
]

export function ExerciseSearchModal({ open, onClose }: ExerciseSearchModalProps) {
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | undefined>()
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const { data: exercises = [], isLoading } = useExercises({
    name: search || undefined,
    muscleGroup: selectedGroup,
  })

  const handleClose = () => {
    setSearch('')
    setSelectedGroup(undefined)
    setSelectedExercise(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={selectedExercise ? 'Log Workout' : 'Choose Exercise'}
      size="lg"
    >
      {selectedExercise ? (
        <WorkoutSessionForm
          exercise={selectedExercise}
          onBack={() => setSelectedExercise(null)}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          {/* Muscle group filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {MUSCLE_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(selectedGroup === g ? undefined : g)}
                className={clsx(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-colors capitalize',
                  selectedGroup === g
                    ? 'bg-brand text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {g.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="max-h-64 overflow-y-auto -mx-2 px-2">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            )}
            {!isLoading && exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setSelectedExercise(ex)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{ex.name}</p>
                  <p className="text-xs text-slate-400 capitalize">
                    {ex.primaryMuscleGroup.replace('_', ' ')} · {ex.intensity}
                  </p>
                </div>
                <span className="text-xs text-slate-400 ml-2 shrink-0">
                  MET {ex.metValue}
                </span>
              </button>
            ))}
            {!isLoading && exercises.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-6">No exercises found</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
