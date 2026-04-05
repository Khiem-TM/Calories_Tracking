import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../../components/ui/Modal'
import { createAdminExercise, updateAdminExercise } from '../../../services/adminService'
import type { AdminExercise } from '../../../types/admin'

const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full_body']
const INTENSITIES = ['light', 'moderate', 'heavy']

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  primaryMuscleGroup: z.string().min(1, 'Muscle group is required'),
  intensity: z.string().min(1, 'Intensity is required'),
  metValue: z.coerce.number().min(0).optional(),
  instructions: z.string().optional(),
  videoUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  exercise?: AdminExercise
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-surface-highest bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'
const labelCls = 'block text-xs font-medium text-on-surface mb-1'
const errorCls = 'text-xs text-error mt-0.5'

export function AdminExerciseModal({ open, onClose, exercise }: Props) {
  const qc = useQueryClient()
  const isEdit = !!exercise

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      if (exercise) {
        reset({
          name: exercise.name,
          description: exercise.description ?? '',
          primaryMuscleGroup: exercise.primaryMuscleGroup,
          intensity: exercise.intensity,
          metValue: Number(exercise.metValue),
          instructions: exercise.instructions ?? '',
          videoUrl: exercise.videoUrl ?? '',
        })
      } else {
        reset({ primaryMuscleGroup: 'chest', intensity: 'moderate', metValue: 0 })
      }
    }
  }, [open, exercise, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, videoUrl: data.videoUrl || undefined }
      return isEdit
        ? updateAdminExercise(exercise!.id, payload)
        : createAdminExercise(payload as any)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'exercises'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Exercise' : 'Add Exercise'} size="lg">
      <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
        <div>
          <label className={labelCls}>Name *</label>
          <input {...register('name')} className={inputCls} placeholder="e.g. Barbell Squat" />
          {errors.name && <p className={errorCls}>{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Muscle Group *</label>
            <select {...register('primaryMuscleGroup')} className={inputCls}>
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g}>{g.replace('_', ' ')}</option>
              ))}
            </select>
            {errors.primaryMuscleGroup && <p className={errorCls}>{errors.primaryMuscleGroup.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Intensity *</label>
            <select {...register('intensity')} className={inputCls}>
              {INTENSITIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            {errors.intensity && <p className={errorCls}>{errors.intensity.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>MET Value</label>
            <input {...register('metValue')} type="number" step="0.1" className={inputCls} placeholder="e.g. 5.0" />
          </div>
          <div>
            <label className={labelCls}>Video URL</label>
            <input {...register('videoUrl')} className={inputCls} placeholder="https://youtube.com/…" />
            {errors.videoUrl && <p className={errorCls}>{errors.videoUrl.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea {...register('description')} rows={3} className={`${inputCls} resize-none`} placeholder="Brief description of the exercise…" />
        </div>

        <div>
          <label className={labelCls}>Instructions</label>
          <textarea {...register('instructions')} rows={4} className={`${inputCls} resize-none`} placeholder="Step-by-step instructions…" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Exercise'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
