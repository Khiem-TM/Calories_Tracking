import { Navigate } from 'react-router-dom'
import { useAdminAuthStore } from '@/stores/adminAuthStore'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
