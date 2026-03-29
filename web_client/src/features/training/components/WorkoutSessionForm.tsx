import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useLogWorkout } from '../hooks/useLogWorkout'
import { useUIStore } from '@/stores/uiStore'
import type { Exercise, LogWorkoutDto } from '@/types'

const schema = z.object({
  sessionDate: z.string().min(1),
  durationMinutes: z.coerce.number().min(1, 'Enter duration in minutes'),
  sets: z.coerce.number().optional(),
  repsPerSet: z.coerce.number().optional(),
  weightKg: z.coerce.number().optional(),
  notes: z.string().optional(),
})

interface WorkoutSessionFormProps {
  exercise: Exercise
  onBack: () => void
}

export function WorkoutSessionForm({ exercise, onBack }: WorkoutSessionFormProps) {
  const { mutate: logWorkout, isPending } = useLogWorkout()
  const selectedDate = useUIStore((s) => s.selectedDate)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { sessionDate: selectedDate, durationMinutes: 30 },
  })

  const isCardio = exercise.primaryMuscleGroup === 'cardio'

  const onSubmit = (data: Omit<LogWorkoutDto, 'exerciseId'>) => {
    logWorkout({ exerciseId: exercise.id, ...data })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-700">{exercise.name}</p>
        <p className="text-xs text-slate-400 capitalize">{exercise.primaryMuscleGroup.replace('_', ' ')} · {exercise.intensity} intensity</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Date"
          type="date"
          error={errors.sessionDate?.message}
          {...register('sessionDate')}
        />
        <Input
          label="Duration (min)"
          type="number"
          min={1}
          error={errors.durationMinutes?.message}
          {...register('durationMinutes')}
        />
      </div>

      {!isCardio && (
        <div className="grid grid-cols-3 gap-3">
          <Input label="Sets" type="number" min={1} {...register('sets')} />
          <Input label="Reps" type="number" min={1} {...register('repsPerSet')} />
          <Input label="Weight (kg)" type="number" min={0} step={0.5} {...register('weightKg')} />
        </div>
      )}

      <Input
        label="Notes (optional)"
        type="text"
        placeholder="How did it feel?"
        {...register('notes')}
      />

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" loading={isPending} className="flex-1">
          Log Workout
        </Button>
      </div>
    </form>
  )
}
