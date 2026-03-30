import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { clsx } from 'clsx'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { Topbar } from './Topbar'

export default function AppLayout() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const setDate = useUIStore((s) => s.setDate)
  const location = useLocation()

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0])
  }, [location.pathname, setDate])

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Topbar />

      <main
        className={clsx(
          'pt-14 pb-20 md:pb-6 transition-all duration-200',
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-56',
        )}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
