import { useQuery } from '@tanstack/react-query'
import { getLatest } from '@/services/bodyMetricService'
import { queryKeys } from '@/utils/queryKeys'

export function useLatestMetric() {
  return useQuery({
    queryKey: queryKeys.bodyMetricsLatest(),
    queryFn: getLatest,
    staleTime: 60_000,
  })
}
