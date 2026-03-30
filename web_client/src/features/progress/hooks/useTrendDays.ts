import { useQuery } from '@tanstack/react-query'
import { getWeeklyReport, getMonthlyReport } from '@/services/dashboardService'
import type { TimeRange } from '../components/TimeRangeFilter'
import type { DashboardData } from '@/types'

function getMonthParams(count: number): { year: number; month: number }[] {
  const result: { year: number; month: number }[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }
  return result
}

export function useTrendDays(range: TimeRange): {
  days: DashboardData[]
  isLoading: boolean
} {
  const now = new Date()
  const weekStart = new Date(now.getTime() - 6 * 86_400_000).toISOString().split('T')[0]

  const monthCount = range === '30d' ? 1 : range === '3m' ? 3 : range === '6m' ? 6 : 0
  const monthParams = monthCount > 0 ? getMonthParams(monthCount) : []

  const weekQuery = useQuery({
    queryKey: ['dashboard', 'weekly', weekStart],
    queryFn: () => getWeeklyReport(weekStart),
    enabled: range === '7d',
    staleTime: 60_000,
  })

  const monthQuery = useQuery({
    queryKey: ['dashboard', 'multimonth', range],
    queryFn: async () => {
      const reports = await Promise.all(
        monthParams.map((p) => getMonthlyReport(p.year, p.month)),
      )
      return reports.flatMap((r) => r.days)
    },
    enabled: monthParams.length > 0,
    staleTime: 60_000,
  })

  if (range === '7d') {
    return { days: weekQuery.data?.days ?? [], isLoading: weekQuery.isLoading }
  }
  if (range === 'all') {
    return { days: [], isLoading: false }
  }
  return { days: monthQuery.data ?? [], isLoading: monthQuery.isLoading }
}
