import axios, { type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001'

function getAdminToken(): string | null {
  try {
    const raw = localStorage.getItem('admin-auth-storage')
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: { adminToken?: string | null } }
    return parsed?.state?.adminToken ?? null
  } catch {
    return null
  }
}

function clearAdminAuth() {
  try {
    localStorage.removeItem('admin-auth-storage')
  } catch {
    // ignore
  }
}

export const adminApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

adminApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAdminToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    // 401 = token expired/invalid, 403 = token has wrong role (stale user token)
    // Both require re-login as admin
    if (err.response?.status === 401 || err.response?.status === 403) {
      clearAdminAuth()
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  },
)
