import { useQuery } from '@tanstack/react-query'
import { getHistory } from '@/services/bodyMetricService'
import { queryKeys } from '@/utils/queryKeys'

export function useBodyMetrics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.bodyMetricsHistory({ startDate, endDate }),
    queryFn: () => getHistory({ startDate, endDate, limit: 100 }),
    staleTime: 60_000,
  })
}
