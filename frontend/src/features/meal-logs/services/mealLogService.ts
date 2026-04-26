import { api } from '@/lib/axios'

export const mealLogService = {
  getDaily: (date?: string) => api.get('/meal-logs', { params: date ? { date } : undefined }),
  getSummary: (date?: string) => api.get('/meal-logs/summary', { params: date ? { date } : undefined }),
  getHistory: (fromDate?: string, toDate?: string) =>
    api.get('/meal-logs/history', { params: { fromDate, toDate } }),
  getById: (id: string) => api.get(`/meal-logs/${id}`),
  create: (data: { mealType: string; date: string; notes?: string }) =>
    api.post('/meal-logs', data),
  update: (id: string, data: Partial<{ mealType: string; notes: string }>) =>
    api.patch(`/meal-logs/${id}`, data),
  delete: (id: string) => api.delete(`/meal-logs/${id}`),
  addItem: (mealLogId: string, data: { foodId: string; quantity: number }) =>
    api.post(`/meal-logs/${mealLogId}/items`, data),
  updateItem: (mealLogId: string, itemId: string, quantity: number) =>
    api.patch(`/meal-logs/${mealLogId}/items/${itemId}`, { quantity }),
  deleteItem: (mealLogId: string, itemId: string) =>
    api.delete(`/meal-logs/${mealLogId}/items/${itemId}`),
}
