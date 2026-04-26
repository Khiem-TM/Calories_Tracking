import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mealLogService } from '../services/mealLogService'

export function useDailyMealLogs(date?: string) {
  return useQuery({
    queryKey: ['meal-logs', 'daily', date],
    queryFn: () => mealLogService.getDaily(date).then((r) => r.data?.data ?? r.data),
  })
}

export function useMealLogSummary(date?: string) {
  return useQuery({
    queryKey: ['meal-logs', 'summary', date],
    queryFn: () => mealLogService.getSummary(date).then((r) => r.data?.data ?? r.data),
  })
}

export function useCreateMealLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: mealLogService.create,
    onSuccess: () => {
      toast.success('Meal logged!')
      qc.invalidateQueries({ queryKey: ['meal-logs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => toast.error('Failed to log meal'),
  })
}

export function useDeleteMealLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: mealLogService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meal-logs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => toast.error('Failed to delete meal'),
  })
}

export function useAddMealItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ mealLogId, foodId, quantity }: { mealLogId: string; foodId: string; quantity: number }) =>
      mealLogService.addItem(mealLogId, { foodId, quantity }),
    onSuccess: () => {
      toast.success('Food added!')
      qc.invalidateQueries({ queryKey: ['meal-logs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => toast.error('Failed to add food'),
  })
}

export function useDeleteMealItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ mealLogId, itemId }: { mealLogId: string; itemId: string }) =>
      mealLogService.deleteItem(mealLogId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meal-logs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => toast.error('Failed to remove item'),
  })
}
