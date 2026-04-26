import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { bodyMetricsService } from '../services/bodyMetricsService'

export function useLatestBodyMetrics() {
  return useQuery({
    queryKey: ['body-metrics', 'latest'],
    queryFn: () => bodyMetricsService.getLatest().then((r) => r.data?.data ?? r.data),
  })
}

export function useBodyMetricsHistory(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: ['body-metrics', 'history', fromDate, toDate],
    queryFn: () => bodyMetricsService.getHistory(fromDate, toDate).then((r) => r.data?.data ?? r.data),
  })
}

export function useBodyPhotos() {
  return useQuery({
    queryKey: ['body-metrics', 'photos'],
    queryFn: () => bodyMetricsService.getPhotos().then((r) => r.data?.data ?? r.data),
  })
}

export function useLogBodyMetrics() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bodyMetricsService.log,
    onSuccess: () => {
      toast.success('Metrics logged!')
      qc.invalidateQueries({ queryKey: ['body-metrics'] })
    },
    onError: () => toast.error('Failed to log metrics'),
  })
}
