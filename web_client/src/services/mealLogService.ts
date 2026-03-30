import api from './axios'
import type {
  ApiResponse,
  CreateMealLogDto,
  CreateMealLogItemDto,
  MealLog,
  MealLogItem,
  MealLogSummary,
  UpdateMealLogItemDto,
} from '@/types'

export async function getMealLogs(date?: string): Promise<MealLog[]> {
  const params = date ? { date } : {}
  const resp = await api.get<ApiResponse<MealLog[]>>('/meal-logs', { params })
  return resp.data.data
}

export async function getMealSummary(date: string): Promise<MealLogSummary> {
  const resp = await api.get<ApiResponse<MealLogSummary>>('/meal-logs/summary', {
    params: { date },
  })
  return resp.data.data
}

export async function getMealLogById(id: string): Promise<MealLog> {
  const resp = await api.get<ApiResponse<MealLog>>(`/meal-logs/${id}`)
  return resp.data.data
}

export async function createMealLog(dto: CreateMealLogDto): Promise<MealLog> {
  const resp = await api.post<ApiResponse<MealLog>>('/meal-logs', dto)
  return resp.data.data
}

export async function deleteMealLog(id: string): Promise<void> {
  await api.delete(`/meal-logs/${id}`)
}

export async function addMealItem(logId: string, dto: CreateMealLogItemDto): Promise<MealLogItem> {
  const resp = await api.post<ApiResponse<MealLogItem>>(`/meal-logs/${logId}/items`, dto)
  return resp.data.data
}

export async function updateMealItem(
  logId: string,
  itemId: string,
  dto: UpdateMealLogItemDto,
): Promise<MealLogItem> {
  const resp = await api.patch<ApiResponse<MealLogItem>>(
    `/meal-logs/${logId}/items/${itemId}`,
    dto,
  )
  return resp.data.data
}

export async function deleteMealItem(logId: string, itemId: string): Promise<void> {
  await api.delete(`/meal-logs/${logId}/items/${itemId}`)
}

export async function uploadMealImage(logId: string, file: File): Promise<MealLog> {
  const formData = new FormData()
  formData.append('file', file)
  const resp = await api.post<ApiResponse<MealLog>>(`/meal-logs/${logId}/image`, formData)
  return resp.data.data
}
