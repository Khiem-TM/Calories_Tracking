import { api } from '@/lib/axios'

export const bodyMetricsService = {
  getLatest: () => api.get('/body-metrics/latest'),
  getSummary: () => api.get('/body-metrics/summary'),
  getHistory: (fromDate?: string, toDate?: string) =>
    api.get('/body-metrics/history', { params: { fromDate, toDate } }),
  log: (data: { weight?: number; chest?: number; waist?: number; hips?: number; date?: string }) =>
    api.post('/body-metrics', data),
  getPhotos: (limit = 20) => api.get('/body-metrics/photos', { params: { limit } }),
  uploadPhoto: (formData: FormData) =>
    api.post('/body-metrics/photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePhoto: (id: string) => api.delete(`/body-metrics/photos/${id}`),
}
