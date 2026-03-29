import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useUpsertMetric } from '../hooks/useUpsertMetric'
import type { UpsertBodyMetricDto } from '@/types'

const schema = z.object({
  recordedDate: z.string().min(1),
  weightKg: z.coerce.number().positive().optional(),
  bodyFatPct: z.coerce.number().min(1).max(70).optional(),
  waistCm: z.coerce.number().positive().optional(),
  hipCm: z.coerce.number().positive().optional(),
  chestCm: z.coerce.number().positive().optional(),
  neckCm: z.coerce.number().positive().optional(),
  notes: z.string().optional(),
})

interface BodyMetricFormProps {
  onClose?: () => void
  defaultDate?: string
}

export function BodyMetricForm({ onClose, defaultDate }: BodyMetricFormProps) {
  const { mutate: save, isPending } = useUpsertMetric()

  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { recordedDate: defaultDate ?? today },
  })

  const onSubmit = (data: UpsertBodyMetricDto) => {
    save(data, { onSuccess: onClose })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Date"
        type="date"
        error={errors.recordedDate?.message}
        {...register('recordedDate')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Weight (kg)" type="number" step={0.1} min={20} max={300} {...register('weightKg')} />
        <Input label="Body Fat %" type="number" step={0.1} min={1} max={70} {...register('bodyFatPct')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Waist (cm)" type="number" step={0.1} {...register('waistCm')} />
        <Input label="Hip (cm)" type="number" step={0.1} {...register('hipCm')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Chest (cm)" type="number" step={0.1} {...register('chestCm')} />
        <Input label="Neck (cm)" type="number" step={0.1} {...register('neckCm')} />
      </div>

      <Input label="Notes" type="text" placeholder="Any notes..." {...register('notes')} />

      <div className="flex gap-2">
        {onClose && (
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isPending} className="flex-1">
          Save Metrics
        </Button>
      </div>
    </form>
  )
}
