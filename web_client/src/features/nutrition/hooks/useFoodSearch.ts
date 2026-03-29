import { useQuery } from '@tanstack/react-query'
import { searchFoods } from '@/services/foodService'
import { queryKeys } from '@/utils/queryKeys'

export function useFoodSearch(search: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.foods({ search, page }),
    queryFn: () => searchFoods({ search, page, limit: 20 }),
    enabled: search.trim().length >= 1,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}
