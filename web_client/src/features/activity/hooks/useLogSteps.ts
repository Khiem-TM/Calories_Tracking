import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logSteps } from '@/services/activityService'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/utils/queryKeys'
import { toast } from '@/components/ui/Toast'

export function useLogSteps() {
  const queryClient = useQueryClient()
  const date = useUIStore((s) => s.selectedDate)

  return useMutation({
    mutationFn: (steps: number) => logSteps({ logDate: date, steps }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activityLog(date) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(date) })
      toast.success('Steps updated')
    },
    onError: () => {
      toast.error('Failed to update steps')
    },
  })
}
