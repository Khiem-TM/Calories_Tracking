import { useMutation, useQueryClient } from '@tanstack/react-query'
import { upsertMetric } from '@/services/bodyMetricService'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/utils/queryKeys'
import { toast } from '@/components/ui/Toast'
import type { UpsertBodyMetricDto } from '@/types'

export function useUpsertMetric() {
  const queryClient = useQueryClient()
  const date = useUIStore((s) => s.selectedDate)
  const closeModal = useUIStore((s) => s.closeModal)

  return useMutation({
    mutationFn: (dto: UpsertBodyMetricDto) => upsertMetric(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bodyMetrics'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(date) })
      closeModal()
      toast.success('Metrics saved!')
    },
    onError: () => {
      toast.error('Failed to save metrics')
    },
  })
}
