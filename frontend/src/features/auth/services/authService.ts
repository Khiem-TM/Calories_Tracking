import { api } from '@/lib/axios'
import type { AuthResponse } from '@/types/api'

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ data: AuthResponse }>('/auth/login', { email, password }),

  register: (email: string, password: string, displayName: string) =>
    api.post('/auth/register', { email, password, displayName }),

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (resetToken: string, newPassword: string) =>
    api.post('/auth/reset-password', { reset_token: resetToken, new_password: newPassword }),

  sendVerification: (email: string) =>
    api.post('/auth/send-verification', { email }),

  verifyEmail: (email: string, code: string) =>
    api.post('/auth/verify-email', { email, verification_code: code }),

  getMe: () => api.get('/users/me'),
}
