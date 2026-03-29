import api from './axios'
import type { ApiResponse, AuthResponse, LoginDto, RegisterDto } from '@/types'

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const resp = await api.post<ApiResponse<AuthResponse>>('/auth/login', dto)
  return resp.data.data
}

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const resp = await api.post<ApiResponse<AuthResponse>>('/auth/register', dto)
  return resp.data.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function sendEmailVerification(): Promise<void> {
  await api.post('/auth/send-verification')
}

export async function verifyEmail(token: string): Promise<void> {
  await api.post('/auth/verify-email', { token })
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email })
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post('/auth/reset-password', { token, password })
}
