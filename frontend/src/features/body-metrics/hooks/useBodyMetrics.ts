import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bodyMetricsService, type UpsertBodyMetricPayload } from '../services/bodyMetricsService'

export function useBodyMetricsHistory(period: 'week' | 'month' | '3months' | '6months' | 'year' = 'month') {
  return useQuery({
    queryKey: ['body-metrics-history', period],
    queryFn: () => bodyMetricsService.getHistory(period).then((res: any) => res.data?.data ?? res.data ?? []),
  })
}

export function useBodyMetricsSummary() {
  return useQuery({
    queryKey: ['body-metrics-summary'],
    queryFn: () => bodyMetricsService.getSummary().then((res: any) => res.data?.data ?? res.data),
  })
}

export function useLatestBodyMetrics() {
  return useQuery({
    queryKey: ['body-metrics-latest'],
    queryFn: () => bodyMetricsService.getLatest().then((res: any) => res.data?.data ?? res.data ?? null),
  })
}

export function useBodyMetricsPhotos(limit = 10) {
  return useQuery({
    queryKey: ['body-metrics-photos'],
    queryFn: () => bodyMetricsService.getPhotos(limit).then((res: any) => res.data?.data ?? res.data ?? []),
  })
}

export function useAddBodyMetrics() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpsertBodyMetricPayload) => bodyMetricsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['body-metrics-latest'] })
      qc.invalidateQueries({ queryKey: ['body-metrics-summary'] })
      qc.invalidateQueries({ queryKey: ['body-metrics-history'] })
    },
  })
}

export function useUploadPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bodyMetricsService.uploadPhoto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['body-metrics-photos'] })
    },
  })
}

export function useDeletePhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bodyMetricsService.deletePhoto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['body-metrics-photos'] })
    },
  })
}
