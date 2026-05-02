import { api } from '@/lib/axios'
import type { AuthResponse } from '@/types/api'

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ data: AuthResponse }>('/auth/login', { email, password }),

  register: (email: string, password: string, displayName: string) =>
    api.post('/auth/register', { email, password, display_name: displayName }),

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),

  sendVerification: (email: string) =>
    api.post('/auth/send-verification', { email }),

  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),

  getMe: () => api.get('/users/me'),
}
