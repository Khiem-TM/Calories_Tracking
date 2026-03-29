import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addFavorite, removeFavorite } from '@/services/foodService'
import { queryKeys } from '@/utils/queryKeys'
import { toast } from '@/components/ui/Toast'

export function useToggleFavorite(isFavorite: boolean) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (foodId: string) => isFavorite ? removeFavorite(foodId) : addFavorite(foodId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.foodFavorites() })
    },
    onError: () => toast.error('Failed to update favorites'),
  })
}
