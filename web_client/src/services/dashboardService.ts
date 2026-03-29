import api from './axios'
import type { ApiResponse, DashboardData } from '@/types'

export interface WeeklyReport {
  weekStart: string
  weekEnd: string
  days: DashboardData[]
  averages: {
    avg_calories: number
    avg_protein: number
    avg_steps: number
    avg_water_ml: number
  }
}

export interface MonthlyReport {
  year: number
  month: number
  days: DashboardData[]
  totals: {
    total_calories: number
    total_workouts: number
    avg_weight: number | null
  }
}

export async function getDashboard(date: string): Promise<DashboardData> {
  const resp = await api.get<ApiResponse<DashboardData>>('/dashboard', { params: { date } })
  return resp.data.data
}

export async function getWeeklyReport(weekStart: string): Promise<WeeklyReport> {
  const resp = await api.get<ApiResponse<WeeklyReport>>('/dashboard/weekly', {
    params: { weekStart },
  })
  return resp.data.data
}

export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const resp = await api.get<ApiResponse<MonthlyReport>>('/dashboard/monthly', {
    params: { year, month },
  })
  return resp.data.data
}
