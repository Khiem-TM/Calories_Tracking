import { api } from '@/lib/axios'

export const dashboardService = {
  getDaily: (date?: string) =>
    api.get('/dashboard', { params: date ? { date } : undefined }),
  getWeekly: (weekStart?: string) =>
    api.get('/dashboard/weekly', { params: weekStart ? { weekStart } : undefined }),
  getMonthly: (year: number, month: number) =>
    api.get('/dashboard/monthly', { params: { year, month } }),
}
