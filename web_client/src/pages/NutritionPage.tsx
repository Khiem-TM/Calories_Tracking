import { useQuery } from '@tanstack/react-query'
import { getMealSummary } from '@/services/mealLogService'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/utils/queryKeys'
import { useMealLogs } from '@/features/nutrition/hooks/useMealLogs'
import { MealSection } from '@/features/nutrition/components/MealSection'
import type { MealType } from '@/types'

const MEAL_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']

export default function NutritionPage() {
  const date = useUIStore((s) => s.selectedDate)
  const { grouped, isLoading } = useMealLogs()

  const { data: summary } = useQuery({
    queryKey: queryKeys.mealSummary(date),
    queryFn: () => getMealSummary(date),
    staleTime: 30_000,
    retry: false,
  })

  return (
    <div className="flex flex-col gap-5">
      {/* Daily macro summary bar — surface-low container, no borders */}
      {summary && (
        <div className="bg-surface-low rounded-2xl p-4">
          <p className="text-xs text-on-surface-variant font-manrope uppercase tracking-wider mb-3">Daily Totals</p>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-light text-on-surface font-newsreader data-value">
                {Math.round(summary.total_calories)}
              </p>
              <p className="text-xs text-on-surface-variant font-manrope">kcal</p>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-3">
              <div className="bg-surface-lowest rounded-xl p-3 text-center">
                <p className="text-sm font-semibold text-macroProtein data-value">{Math.round(summary.total_protein)}g</p>
                <p className="text-xs text-on-surface-variant font-manrope">protein</p>
              </div>
              <div className="bg-surface-lowest rounded-xl p-3 text-center">
                <p className="text-sm font-semibold text-macroCarbs data-value">{Math.round(summary.total_carbs)}g</p>
                <p className="text-xs text-on-surface-variant font-manrope">carbs</p>
              </div>
              <div className="bg-surface-lowest rounded-xl p-3 text-center">
                <p className="text-sm font-semibold text-macroFat data-value">{Math.round(summary.total_fat)}g</p>
                <p className="text-xs text-on-surface-variant font-manrope">fat</p>
              </div>
              <div className="bg-surface-lowest rounded-xl p-3 text-center">
                <p className="text-sm font-semibold text-macroFiber data-value">{Math.round(summary.total_fiber)}g</p>
                <p className="text-xs text-on-surface-variant font-manrope">fiber</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal sections — alternating surface-low / surface-lowest backgrounds, no dividers */}
      {isLoading ? (
        <div className="text-center py-8 text-sm text-on-surface-variant font-manrope">Loading meals...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {MEAL_ORDER.map((mealType, i) => (
            <div key={mealType} className={i % 2 === 0 ? 'bg-surface-lowest rounded-2xl' : 'bg-surface-low rounded-2xl'}>
              <MealSection mealType={mealType} mealLog={grouped[mealType]} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
