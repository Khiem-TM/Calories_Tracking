import api from './axios'
import type { ApiResponse, HealthProfile, UpdateHealthProfileDto, UpdateProfileDto, User } from '@/types'

export async function getMe(): Promise<User> {
  const resp = await api.get<ApiResponse<User>>('/users/me')
  return resp.data.data
}

export async function updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
  const resp = await api.patch<ApiResponse<User>>(`/users/${id}`, dto)
  return resp.data.data
}

export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData()
  formData.append('file', file)
  const resp = await api.post<ApiResponse<User>>('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return resp.data.data
}

export async function getHealthProfile(): Promise<HealthProfile> {
  const resp = await api.get<ApiResponse<HealthProfile>>('/users/me/health-profile')
  return resp.data.data
}

export async function updateHealthProfile(dto: UpdateHealthProfileDto): Promise<HealthProfile> {
  const resp = await api.put<ApiResponse<HealthProfile>>('/users/me/health-profile', dto)
  return resp.data.data
}
