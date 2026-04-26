import { api } from '@/lib/axios'

export const activityLogsService = {
  getByDate: (date?: string) => api.get('/activity-logs', { params: { date } }),
  logSteps: (data: { date?: string; steps: number }) =>
    api.patch('/activity-logs/steps', data),
  logCaloriesBurned: (data: { date?: string; caloriesBurned: number }) =>
    api.patch('/activity-logs/calories-burned', data),
  logWater: (data: { date?: string; glasses: number }) =>
    api.patch('/activity-logs/water', data),
}
