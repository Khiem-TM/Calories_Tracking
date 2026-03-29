import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCustomFood } from '@/services/foodService'
import { queryKeys } from '@/utils/queryKeys'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import type { FoodType } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  brand: z.string().optional(),
  food_type: z.enum(['ingredient', 'dish', 'product'] as const).default('ingredient'),
  serving_size_g: z.coerce.number().positive('Must be positive').default(100),
  calories_per_100g: z.coerce.number().min(0, 'Must be 0 or more'),
  protein_per_100g: z.coerce.number().min(0).default(0),
  fat_per_100g: z.coerce.number().min(0).default(0),
  carbs_per_100g: z.coerce.number().min(0).default(0),
  fiber_per_100g: z.coerce.number().min(0).default(0),
})

type FormData = z.infer<typeof schema>

const FOOD_TYPES: { value: FoodType; label: string }[] = [
  { value: 'ingredient', label: 'Ingredient' },
  { value: 'dish', label: 'Dish' },
  { value: 'product', label: 'Product' },
]

interface CreateFoodModalProps {
  open: boolean
  onClose: () => void
}

export function CreateFoodModal({ open, onClose }: CreateFoodModalProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      food_type: 'ingredient',
      serving_size_g: 100,
      calories_per_100g: 0,
      protein_per_100g: 0,
      fat_per_100g: 0,
      carbs_per_100g: 0,
      fiber_per_100g: 0,
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => createCustomFood(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.foods({}) })
      toast.success('Custom food created!')
      reset()
      onClose()
    },
    onError: () => toast.error('Failed to create food'),
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create Custom Food" size="md">
      <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input
              label="Food Name"
              placeholder="e.g. Homemade Salad"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <Input label="Brand (optional)" placeholder="e.g. Generic" {...register('brand')} />
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Type</label>
            <select
              {...register('food_type')}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              {FOOD_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>{ft.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Serving Size (g)"
            type="number"
            min={0}
            step={0.1}
            error={errors.serving_size_g?.message}
            {...register('serving_size_g')}
          />
          <Input
            label="Calories / 100g"
            type="number"
            min={0}
            step={0.1}
            error={errors.calories_per_100g?.message}
            {...register('calories_per_100g')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Protein / 100g" type="number" min={0} step={0.1} {...register('protein_per_100g')} />
          <Input label="Fat / 100g" type="number" min={0} step={0.1} {...register('fat_per_100g')} />
          <Input label="Carbs / 100g" type="number" min={0} step={0.1} {...register('carbs_per_100g')} />
          <Input label="Fiber / 100g" type="number" min={0} step={0.1} {...register('fiber_per_100g')} />
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={isPending} className="flex-1">
            Create Food
          </Button>
        </div>
      </form>
    </Modal>
  )
}
