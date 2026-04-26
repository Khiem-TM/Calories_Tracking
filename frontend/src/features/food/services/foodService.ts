import { api } from '@/lib/axios'

export const foodService = {
  search: (params: { search?: string; page?: number; limit?: number }) =>
    api.get('/foods', { params }),
  explore: (params: { page?: number; limit?: number; category?: string }) =>
    api.get('/foods/explore', { params }),
  getById: (id: string) => api.get(`/foods/${id}`),
  getIngredients: (id: string) => api.get(`/foods/${id}/ingredients`),
  getRecipe: (id: string) => api.get(`/foods/${id}/recipe`),
  getCustom: (params?: { page?: number; limit?: number }) =>
    api.get('/foods/custom', { params }),
  getFavorites: () => api.get('/foods/favorites'),
  addFavorite: (id: string) => api.post(`/foods/${id}/favorite`),
  removeFavorite: (id: string) => api.delete(`/foods/${id}/favorite`),
  create: (data: {
    name: string; calories: number; protein: number; carbs: number; fat: number
    category?: string; servingSize?: number; servingUnit?: string
  }) => api.post('/foods', data),
}
