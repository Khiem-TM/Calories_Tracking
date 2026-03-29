import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/components/ui/Toast'
import type { LoginDto } from '@/types'

export function useLogin() {
  const authLogin = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (dto: LoginDto) => login(dto),
    onSuccess: (data) => {
      authLogin(data.user, data.access_token, data.refresh_token)
      navigate('/dashboard', { replace: true })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Please check your credentials.'
      toast.error(msg)
    },
  })
}
