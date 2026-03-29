import api from './axios'
import type { ActivityLog, ApiResponse, LogCaloriesBurnedDto, LogStepsDto, LogWaterDto } from '@/types'

export async function getActivityLog(date: string): Promise<ActivityLog> {
  const resp = await api.get<ApiResponse<ActivityLog>>('/activity-logs', { params: { date } })
  return resp.data.data
}

export async function getActivityRange(fromDate: string, toDate: string): Promise<ActivityLog[]> {
  const resp = await api.get<ApiResponse<ActivityLog[]>>('/activity-logs/range', {
    params: { fromDate, toDate },
  })
  return resp.data.data
}

export async function logSteps(dto: LogStepsDto): Promise<ActivityLog> {
  const resp = await api.patch<ApiResponse<ActivityLog>>('/activity-logs/steps', dto)
  return resp.data.data
}

export async function logWater(dto: LogWaterDto): Promise<ActivityLog> {
  const resp = await api.patch<ApiResponse<ActivityLog>>('/activity-logs/water', dto)
  return resp.data.data
}

export async function logCaloriesBurned(dto: LogCaloriesBurnedDto): Promise<ActivityLog> {
  const resp = await api.patch<ApiResponse<ActivityLog>>('/activity-logs/calories-burned', dto)
  return resp.data.data
}
