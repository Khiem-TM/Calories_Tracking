import { Navigate, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getHealthProfile } from '@/services/userService'
import { useUserStore } from '@/stores/userStore'
import { Spinner } from '@/components/ui/Spinner'
import { queryKeys } from '@/utils/queryKeys'

export function OnboardingGuard() {
  const setHealthProfile = useUserStore((s) => s.setHealthProfile)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.healthProfile(),
    queryFn: getHealthProfile,
    retry: false,
    staleTime: 5 * 60_000,
  })

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // 404 means no health profile yet → go to onboarding
  const is404 =
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 404

  if (is404) {
    setHealthProfile(null)
    return <Navigate to="/onboarding" replace />
  }

  if (data) {
    setHealthProfile(data)
  }

  return <Outlet />
}
