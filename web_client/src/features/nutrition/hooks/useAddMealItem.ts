import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMealLog, addMealItem } from '@/services/mealLogService'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/utils/queryKeys'
import { toast } from '@/components/ui/Toast'
import type { CreateMealLogItemDto, MealType } from '@/types'

interface AddItemParams {
  mealType: MealType
  existingLogId?: string
  item: CreateMealLogItemDto
}

export function useAddMealItem() {
  const queryClient = useQueryClient()
  const date = useUIStore((s) => s.selectedDate)
  const closeModal = useUIStore((s) => s.closeModal)

  return useMutation({
    mutationFn: async ({ mealType, existingLogId, item }: AddItemParams) => {
      let logId = existingLogId
      if (!logId) {
        const newLog = await createMealLog({ log_date: date, meal_type: mealType })
        logId = newLog.id
      }
      return addMealItem(logId, item)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mealLogs(date) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.mealSummary(date) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(date) })
      closeModal()
      toast.success('Food added successfully')
    },
    onError: () => {
      toast.error('Failed to add food item')
    },
  })
}
