import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mealLogService } from '../services/mealLogService'
import { useAuthStore } from '@/stores/authStore'
import type { MealLog } from '@/types/api'

export function useDailyMealLogs(date?: string) {
  const token = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['meal-logs', 'daily', date],
    queryFn: () => mealLogService.getDaily(date).then((r) => (r.data?.data ?? r.data) as MealLog[]),
    enabled: !!token,
  })
}

export function useMealLogSummary(date?: string) {
  const token = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['meal-logs', 'summary', date],
    queryFn: () => mealLogService.getSummary(date).then((r) => r.data?.data ?? r.data),
    enabled: !!token,
  })
}

export function useCreateMealLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { mealType: string; date: string; notes?: string }) =>
      mealLogService.create(data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meal-logs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => toast.error('Không thể tạo nhật ký bữa ăn'),
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
