import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '../services/authService'
import { useAuthStore } from '@/stores/authStore'

export function useLogin() {
  const { setTokens, setUser } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: async (res) => {
      const d = (res.data?.data ?? res.data) as any
      const acc = d.accessToken ?? d.access_token
      const ref = d.refreshToken ?? d.refresh_token
      setTokens(acc, ref)
      const meRes = await authService.getMe()
      setUser(meRes.data?.data ?? meRes.data)
      navigate(from, { replace: true })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Login failed')
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: ({ email, password, displayName }: { email: string; password: string; displayName: string }) =>
      authService.register(email, password, displayName),
    onSuccess: () => {
      toast.success('Account created! Please verify your email.')
      navigate('/login')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Registration failed')
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => toast.success('Reset email sent! Check your inbox.'),
    onError: () => toast.error('Failed to send reset email'),
  })
}

export function useResetPassword() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Password reset successfully!')
      navigate('/login')
    },
    onError: () => toast.error('Reset failed. Link may have expired.'),
  })
}
