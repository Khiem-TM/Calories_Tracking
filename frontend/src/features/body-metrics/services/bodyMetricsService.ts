import { api } from '@/lib/axios'

export interface UpsertBodyMetricPayload {
  weightKg?: number
  bodyFatPct?: number
  waistCm?: number
  hipCm?: number
  chestCm?: number
  neckCm?: number
  recordedAt?: string
}

export const bodyMetricsService = {
  create: (data: UpsertBodyMetricPayload) =>
    api.post('/body-metrics', data),

  getHistory: (period: 'week' | 'month' | '3months' | '6months' | 'year' = 'month') =>
    api.get(`/body-metrics/period/${period}`),

  getSummary: () => api.get('/body-metrics/summary'),

  getLatest: () => api.get('/body-metrics/latest'),

  getPhotos: (limit = 10) => api.get(`/body-metrics/photos?limit=${limit}`),

  uploadPhoto: (data: FormData) =>
    api.post('/body-metrics/photos', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deletePhoto: (id: string) => api.delete(`/body-metrics/photos/${id}`),
}
