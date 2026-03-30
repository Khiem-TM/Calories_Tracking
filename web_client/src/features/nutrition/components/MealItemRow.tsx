import { useDeleteMealItem } from '../hooks/useDeleteMealItem'
import type { MealLogItem } from '@/types'

interface MealItemRowProps {
  item: MealLogItem
  logId: string
}

export function MealItemRow({ item, logId }: MealItemRowProps) {
  const { mutate: deleteItem, isPending } = useDeleteMealItem()

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{item.food.name}</p>
        <div className="flex gap-1 mt-0.5 flex-wrap items-center">
          <span className="text-xs text-slate-400">{item.quantity_in_grams}g</span>
          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-manrope">
            P {Math.round(item.protein_snapshot)}g
          </span>
          <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-manrope">
            C {Math.round(item.carbs_snapshot)}g
          </span>
          <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded font-manrope">
            F {Math.round(item.fat_snapshot)}g
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-3">
        <span className="text-sm font-semibold text-slate-600">
          {Math.round(item.calories_snapshot)} kcal
        </span>
        <button
          onClick={() => deleteItem({ logId, itemId: item.id })}
          disabled={isPending}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
          aria-label="Remove item"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
