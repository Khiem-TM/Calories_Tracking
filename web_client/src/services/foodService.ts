import api from './axios'
import type { ApiResponse, CreateFoodDto, Food, PaginatedResponse } from '@/types'

export interface FoodSearchParams {
  search?: string
  page?: number
  limit?: number
}

export async function searchFoods(params: FoodSearchParams): Promise<PaginatedResponse<Food>> {
  const resp = await api.get<ApiResponse<PaginatedResponse<Food>>>('/foods', { params })
  return resp.data.data
}

export async function getFoodById(id: string): Promise<Food> {
  const resp = await api.get<ApiResponse<Food>>(`/foods/${id}`)
  return resp.data.data
}

export async function getFoodByBarcode(barcode: string): Promise<Food> {
  const resp = await api.get<ApiResponse<Food>>(`/foods/barcode/${barcode}`)
  return resp.data.data
}

export async function getFavorites(): Promise<Food[]> {
  const resp = await api.get<ApiResponse<Food[]>>('/foods/favorites')
  return resp.data.data
}

export async function addFavorite(id: string): Promise<void> {
  await api.post(`/foods/${id}/favorite`)
}

export async function removeFavorite(id: string): Promise<void> {
  await api.delete(`/foods/${id}/favorite`)
}

export async function createCustomFood(dto: CreateFoodDto): Promise<Food> {
  const resp = await api.post<ApiResponse<Food>>('/foods', dto)
  return resp.data.data
}
