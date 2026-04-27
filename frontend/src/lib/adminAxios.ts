import axios from 'axios'
import { useAdminAuthStore } from '@/stores/adminAuthStore'

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

adminApi.interceptors.request.use((config) => {
  const token = useAdminAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAdminAuthStore.getState().logout()
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  },
)
