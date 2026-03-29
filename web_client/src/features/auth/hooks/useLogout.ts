import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { logout } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'

export function useLogout() {
  const authLogout = useAuthStore((s) => s.logout)
  const clearUser = useUserStore((s) => s.clearUser)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      authLogout()
      clearUser()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
