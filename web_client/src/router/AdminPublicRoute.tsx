import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuthStore } from '../stores/adminAuthStore'

export function AdminPublicRoute() {
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated)
  if (isAdminAuthenticated) return <Navigate to="/admin/dashboard" replace />
  return <Outlet />
}
