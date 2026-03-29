import { useQuery } from '@tanstack/react-query'
import { getFavorites } from '@/services/foodService'
import { queryKeys } from '@/utils/queryKeys'

export function useFoodFavorites() {
  return useQuery({
    queryKey: queryKeys.foodFavorites(),
    queryFn: getFavorites,
    staleTime: 60_000,
  })
}
