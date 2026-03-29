import api from './axios'
import type { ApiResponse, BodyMetric, BodyProgressPhoto, PaginatedResponse, UpsertBodyMetricDto } from '@/types'

export interface BodyMetricsQuery {
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface BodyMetricSummary {
  currentWeight: number | null
  weightChange: number | null
  weightChangePercent: number | null
  startWeight: number | null
  targetWeight: number | null
  progressPercent: number | null
}

export async function getHistory(query: BodyMetricsQuery): Promise<PaginatedResponse<BodyMetric>> {
  const resp = await api.get<ApiResponse<PaginatedResponse<BodyMetric>>>('/body-metrics', {
    params: query,
  })
  return resp.data.data
}

export async function upsertMetric(dto: UpsertBodyMetricDto): Promise<BodyMetric> {
  const resp = await api.post<ApiResponse<BodyMetric>>('/body-metrics', dto)
  return resp.data.data
}

export async function getLatest(): Promise<BodyMetric | null> {
  try {
    const resp = await api.get<ApiResponse<BodyMetric>>('/body-metrics/latest')
    return resp.data.data
  } catch {
    return null
  }
}

export async function getSummary(): Promise<BodyMetricSummary> {
  const resp = await api.get<ApiResponse<BodyMetricSummary>>('/body-metrics/summary')
  return resp.data.data
}

export async function getPhotos(limit = 10): Promise<BodyProgressPhoto[]> {
  const resp = await api.get<ApiResponse<BodyProgressPhoto[]>>('/body-metrics/photos', {
    params: { limit },
  })
  return resp.data.data
}

export async function uploadPhoto(formData: FormData): Promise<BodyProgressPhoto> {
  const resp = await api.post<ApiResponse<BodyProgressPhoto>>('/body-metrics/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return resp.data.data
}

export async function deletePhoto(id: string): Promise<void> {
  await api.delete(`/body-metrics/photos/${id}`)
}
