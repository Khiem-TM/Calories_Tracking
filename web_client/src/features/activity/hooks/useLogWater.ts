import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logWater } from '@/services/activityService'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/utils/queryKeys'
import { toast } from '@/components/ui/Toast'

export function useLogWater() {
  const queryClient = useQueryClient()
  const date = useUIStore((s) => s.selectedDate)

  return useMutation({
    mutationFn: (waterMl: number) => logWater({ logDate: date, waterMl }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activityLog(date) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(date) })
    },
    onError: () => {
      toast.error('Failed to update water intake')
    },
  })
}
