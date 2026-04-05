import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuthStore } from '../stores/adminAuthStore'

export function AdminProtectedRoute() {
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated)
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />
  return <Outlet />
}
