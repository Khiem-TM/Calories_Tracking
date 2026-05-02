import { api } from '@/lib/axios'

export const activityLogsService = {
  getByDate: (date?: string) => api.get('/activity-logs', { params: { date } }),
  logSteps: (data: { logDate: string; steps: number }) =>
    api.patch('/activity-logs/steps', data),
  logCaloriesBurned: (data: { logDate: string; caloriesBurned: number; activeMinutes: number; exerciseNotes?: string }) =>
    api.patch('/activity-logs/calories-burned', data),
  logWater: (data: { logDate: string; waterMl: number }) =>
    api.patch('/activity-logs/water', data),
}
