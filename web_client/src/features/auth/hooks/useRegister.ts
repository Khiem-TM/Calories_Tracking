import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { register } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/components/ui/Toast'
import type { RegisterDto } from '@/types'

export function useRegister() {
  const authLogin = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (dto: RegisterDto) => register(dto),
    onSuccess: (data) => {
      authLogin(data.user, data.access_token, data.refresh_token)
      navigate('/onboarding', { replace: true })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.'
      toast.error(msg)
    },
  })
}
