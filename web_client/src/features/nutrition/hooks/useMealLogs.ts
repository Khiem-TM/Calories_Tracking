import { useQuery } from '@tanstack/react-query'
import { getMealLogs } from '@/services/mealLogService'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/utils/queryKeys'
import type { MealLog, MealType } from '@/types'

export function useMealLogs() {
  const date = useUIStore((s) => s.selectedDate)

  const query = useQuery({
    queryKey: queryKeys.mealLogs(date),
    queryFn: () => getMealLogs(date),
    staleTime: 30_000,
  })

  const grouped = (query.data ?? []).reduce<Partial<Record<MealType, MealLog>>>((acc, log) => {
    acc[log.meal_type] = log
    return acc
  }, {})

  return { ...query, grouped }
}
