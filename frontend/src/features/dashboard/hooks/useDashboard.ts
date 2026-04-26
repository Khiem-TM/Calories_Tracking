import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

export function useDailyDashboard(date?: string) {
  return useQuery({
    queryKey: ['dashboard', 'daily', date],
    queryFn: () => dashboardService.getDaily(date).then((r) => r.data?.data ?? r.data),
  })
}

export function useWeeklyDashboard(weekStart?: string) {
  return useQuery({
    queryKey: ['dashboard', 'weekly', weekStart],
    queryFn: () => dashboardService.getWeekly(weekStart).then((r) => r.data?.data ?? r.data),
  })
}

export function useMonthlyDashboard(year: number, month: number) {
  return useQuery({
    queryKey: ['dashboard', 'monthly', year, month],
    queryFn: () => dashboardService.getMonthly(year, month).then((r) => r.data?.data ?? r.data),
  })
}
