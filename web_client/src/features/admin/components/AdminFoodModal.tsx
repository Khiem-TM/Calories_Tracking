import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../../components/ui/Modal'
import { createAdminFood, updateAdminFood } from '../../../services/adminService'
import type { AdminFood } from '../../../types/admin'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameEn: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  foodType: z.enum(['ingredient', 'dish', 'product']).optional(),
  servingSizeG: z.coerce.number().min(0).optional(),
  caloriesPer100g: z.coerce.number().min(0, 'Required'),
  proteinPer100g: z.coerce.number().min(0).optional(),
  fatPer100g: z.coerce.number().min(0).optional(),
  carbsPer100g: z.coerce.number().min(0).optional(),
  isVerified: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  food?: AdminFood
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-surface-highest bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'
const labelCls = 'block text-xs font-medium text-on-surface mb-1'
const errorCls = 'text-xs text-error mt-0.5'

export function AdminFoodModal({ open, onClose, food }: Props) {
  const qc = useQueryClient()
  const isEdit = !!food

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      if (food) {
        reset({
          name: food.name,
          nameEn: food.name_en ?? '',
          brand: food.brand ?? '',
          category: food.category ?? '',
          foodType: food.food_type as 'ingredient' | 'dish' | 'product',
          servingSizeG: Number(food.serving_size_g),
          caloriesPer100g: Number(food.calories_per_100g),
          proteinPer100g: Number(food.protein_per_100g),
          fatPer100g: Number(food.fat_per_100g),
          carbsPer100g: Number(food.carbs_per_100g),
          isVerified: food.is_verified,
        })
      } else {
        reset({ foodType: 'ingredient', servingSizeG: 100, isVerified: true })
      }
    }
  }, [open, food, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? updateAdminFood(food!.id, data) : createAdminFood(data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'foods'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Food' : 'Add New Food'} size="lg">
      <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Name *</label>
            <input {...register('name')} className={inputCls} placeholder="e.g. Brown Rice" />
            {errors.name && <p className={errorCls}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelCls}>English Name</label>
            <input {...register('nameEn')} className={inputCls} placeholder="Optional" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Brand</label>
            <input {...register('brand')} className={inputCls} placeholder="Optional" />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <input {...register('category')} className={inputCls} placeholder="e.g. Grains" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Food Type</label>
            <select {...register('foodType')} className={inputCls}>
              <option value="ingredient">Ingredient</option>
              <option value="dish">Dish</option>
              <option value="product">Product</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Serving Size (g)</label>
            <input {...register('servingSizeG')} type="number" step="0.1" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className={labelCls}>Calories *</label>
            <input {...register('caloriesPer100g')} type="number" step="0.1" className={inputCls} placeholder="per 100g" />
            {errors.caloriesPer100g && <p className={errorCls}>{errors.caloriesPer100g.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Protein (g)</label>
            <input {...register('proteinPer100g')} type="number" step="0.1" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Fat (g)</label>
            <input {...register('fatPer100g')} type="number" step="0.1" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Carbs (g)</label>
            <input {...register('carbsPer100g')} type="number" step="0.1" className={inputCls} />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input {...register('isVerified')} type="checkbox" className="w-4 h-4 rounded accent-primary" />
          <span className="text-sm text-on-surface">Mark as verified</span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Food'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
