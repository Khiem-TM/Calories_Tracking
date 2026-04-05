import axios, { type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Token getter — lazy so authStore initializes before we read it ────────────
// We read from localStorage directly to avoid a circular ESM import.
// authStore persists to localStorage key 'auth-storage' via zustand/middleware.
function getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return { accessToken: null, refreshToken: null }
    const parsed = JSON.parse(raw) as {
      state?: { accessToken?: string | null; refreshToken?: string | null }
    }
    return {
      accessToken: parsed?.state?.accessToken ?? null,
      refreshToken: parsed?.state?.refreshToken ?? null,
    }
  } catch {
    return { accessToken: null, refreshToken: null }
  }
}

function clearStoredAuth() {
  try {
    localStorage.removeItem('auth-storage')
  } catch {
    // ignore
  }
}

function updateStoredAccessToken(accessToken: string) {
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return
    const parsed = JSON.parse(raw) as {
      state?: { accessToken?: string; [k: string]: unknown }
    }
    if (parsed.state) {
      parsed.state.accessToken = accessToken
      localStorage.setItem('auth-storage', JSON.stringify(parsed))
    }
  } catch {
    // ignore
  }
}

// ── Request interceptor — attach Bearer token + fix FormData Content-Type ────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = getStoredTokens()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  // For FormData, remove Content-Type so the browser XHR sets it automatically
  // with the correct multipart/form-data; boundary=... value
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// ── Refresh queue — prevents multiple concurrent 401s each triggering refresh ──
let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

// ── Response interceptor — handle 401 with token refresh ──────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    const isUnauthorized = error.response?.status === 401
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    const alreadyRetried = originalRequest._retry

    if (!isUnauthorized || isAuthEndpoint || alreadyRetried) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const { refreshToken } = getStoredTokens()

    try {
      const resp = await axios.post<{
        success: boolean
        data: { access_token: string; refresh_token?: string }
      }>(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken })

      const newAccessToken = resp.data.data.access_token
      updateStoredAccessToken(newAccessToken)
      processQueue(null, newAccessToken)

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearStoredAuth()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
