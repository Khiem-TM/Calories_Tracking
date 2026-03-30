import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useLogWorkout } from '../hooks/useLogWorkout'
import { useUIStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
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
  onSuccess?: () => void
}

export function WorkoutSessionForm({ exercise, onBack, onSuccess }: WorkoutSessionFormProps) {
  const { mutate: logWorkout, isPending } = useLogWorkout()
  const selectedDate = useUIStore((s) => s.selectedDate)
  const healthProfile = useUserStore((s) => s.healthProfile)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { sessionDate: selectedDate, durationMinutes: 30 },
  })

  const isCardio = exercise.primaryMuscleGroup === 'cardio'
  const durationValue = watch('durationMinutes') || 0
  const bodyWeightKg = healthProfile?.initialWeightKg ?? 70
  const estimatedCal = Math.round((exercise.metValue * bodyWeightKg * durationValue) / 60)

  const onSubmit = (data: Omit<LogWorkoutDto, 'exerciseId'>) => {
    logWorkout(
      { exerciseId: exercise.id, ...data },
      { onSuccess: () => onSuccess?.() },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Exercise info panel */}
      <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
        {exercise.imageUrl && (
          <img
            src={exercise.imageUrl}
            alt={exercise.name}
            className="w-16 h-16 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 font-manrope">{exercise.name}</p>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full capitalize font-manrope">
              {exercise.primaryMuscleGroup.replace('_', ' ')}
            </span>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full capitalize font-manrope">
              {exercise.intensity} intensity
            </span>
          </div>
          {exercise.description && (
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2 font-manrope">
              {exercise.description}
            </p>
          )}
          {durationValue > 0 && (
            <p className="text-xs text-primary font-medium mt-1.5 font-manrope">
              ~{estimatedCal} kcal estimated
            </p>
          )}
        </div>
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
