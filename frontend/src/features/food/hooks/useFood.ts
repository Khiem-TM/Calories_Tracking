import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foodService } from '../services/foodService'
import { toast } from 'sonner'
import type { Food, PaginatedResponse } from '@/types/api'

export function useFoodSearch(search: string, page = 1) {
  return useQuery({
    queryKey: ['foods', 'search', search, page],
    queryFn: () => foodService.search({ search, page, limit: 20 }).then((r) => (r.data?.data ?? r.data) as PaginatedResponse<Food>),
    enabled: search.length > 0,
  })
}

export function useFoodExplore(category?: string, page = 1) {
  return useQuery({
    queryKey: ['foods', 'explore', category, page],
    queryFn: () => foodService.explore({ category, page, limit: 20 }).then((r) => (r.data?.data ?? r.data) as PaginatedResponse<Food>),
  })
}

export function useFoodDetail(id: string) {
  return useQuery({
    queryKey: ['foods', id],
    queryFn: () => foodService.getById(id).then((r) => (r.data?.data ?? r.data) as Food),
    enabled: !!id,
  })
}

export function useFoodIngredients(id: string) {
  return useQuery({
    queryKey: ['foods', id, 'ingredients'],
    queryFn: () => foodService.getIngredients(id).then((r) => r.data?.data ?? r.data),
    enabled: !!id,
  })
}

export function useFoodRecipe(id: string) {
  return useQuery({
    queryKey: ['foods', id, 'recipe'],
    queryFn: () => foodService.getRecipe(id).then((r) => r.data?.data ?? r.data),
    enabled: !!id,
  })
}

export function useCustomFoods(page = 1) {
  return useQuery({
    queryKey: ['foods', 'custom', page],
    queryFn: () => foodService.getCustom({ page, limit: 20 }).then((r) => r.data?.data ?? r.data),
  })
}

export function useFavoriteFoods() {
  return useQuery({
    queryKey: ['foods', 'favorites'],
    queryFn: () => foodService.getFavorites().then((r) => r.data?.data ?? r.data),
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isFav }: { id: string; isFav: boolean }) =>
      isFav ? foodService.removeFavorite(id) : foodService.addFavorite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foods', 'favorites'] }),
    onError: () => toast.error('Failed to update favorite'),
  })
}

export function useCreateFood() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: foodService.create,
    onSuccess: () => {
      toast.success('Food created!')
      qc.invalidateQueries({ queryKey: ['foods', 'custom'] })
    },
    onError: () => toast.error('Failed to create food'),
  })
}
