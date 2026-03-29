import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCreateGoal } from '../hooks/useCreateGoal'
import type { GoalType } from '@/types'

const schema = z.object({
  goalType: z.enum(['lose_weight', 'gain_muscle', 'improve_endurance', 'maintain'] as const),
  targetValue: z.coerce.number().min(1, 'Target value is required'),
  startDate: z.string().min(1, 'Start date is required'),
  deadline: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const GOAL_TYPES: { value: GoalType; label: string; hint: string }[] = [
  { value: 'lose_weight', label: 'Lose Weight', hint: 'Target weight in kg' },
  { value: 'gain_muscle', label: 'Gain Muscle', hint: 'Target weight in kg' },
  { value: 'improve_endurance', label: 'Improve Endurance', hint: 'Target (e.g. run distance in km)' },
  { value: 'maintain', label: 'Maintain', hint: 'Target weight in kg' },
]

interface CreateGoalModalProps {
  open: boolean
  onClose: () => void
}

export function CreateGoalModal({ open, onClose }: CreateGoalModalProps) {
  const { mutate: createGoal, isPending } = useCreateGoal()
  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { goalType: 'lose_weight', startDate: today },
  })

  const selectedType = watch('goalType')
  const hint = GOAL_TYPES.find((g) => g.value === selectedType)?.hint ?? 'Target value'

  const onSubmit = (data: FormData) => {
    createGoal(
      { goalType: data.goalType, targetValue: data.targetValue, startDate: data.startDate, deadline: data.deadline ?? null },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      },
    )
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create Training Goal" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Goal Type</label>
          <select
            {...register('goalType')}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          >
            {GOAL_TYPES.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
          {errors.goalType && <p className="text-xs text-red-500 mt-1">{errors.goalType.message}</p>}
        </div>

        <Input
          label={hint}
          type="number"
          min={0}
          step={0.1}
          error={errors.targetValue?.message}
          {...register('targetValue')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label="Deadline (optional)"
            type="date"
            {...register('deadline')}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={isPending} className="flex-1">
            Create Goal
          </Button>
        </div>
      </form>
    </Modal>
  )
}
