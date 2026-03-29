import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteMealItem } from '@/services/mealLogService'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/utils/queryKeys'
import { toast } from '@/components/ui/Toast'
import type { MealLog } from '@/types'

export function useDeleteMealItem() {
  const queryClient = useQueryClient()
  const date = useUIStore((s) => s.selectedDate)

  return useMutation({
    mutationFn: ({ logId, itemId }: { logId: string; itemId: string }) =>
      deleteMealItem(logId, itemId),

    onMutate: async ({ logId, itemId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.mealLogs(date) })
      const previous = queryClient.getQueryData<MealLog[]>(queryKeys.mealLogs(date))
      queryClient.setQueryData<MealLog[]>(queryKeys.mealLogs(date), (old) =>
        (old ?? []).map((log) =>
          log.id === logId
            ? { ...log, items: log.items.filter((item) => item.id !== itemId) }
            : log,
        ),
      )
      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.mealLogs(date), context.previous)
      }
      toast.error('Failed to remove item')
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mealLogs(date) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(date) })
    },
  })
}
