import { useQuery } from '@tanstack/react-query'
import { getWeeklyReport } from '@/services/dashboardService'

export function useWeeklyTrend(weekStart: string) {
  return useQuery({
    queryKey: ['dashboard', 'weekly', weekStart],
    queryFn: () => getWeeklyReport(weekStart),
    staleTime: 60_000,
    enabled: !!weekStart,
  })
}
