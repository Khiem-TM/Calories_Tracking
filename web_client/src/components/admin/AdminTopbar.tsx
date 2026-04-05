import { LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuthStore } from '../../stores/adminAuthStore'

interface AdminTopbarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AdminTopbar({ collapsed, onToggle }: AdminTopbarProps) {
  const navigate = useNavigate()
  const logout = useAdminAuthStore((s) => s.logout)

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <header
      className="fixed top-0 right-0 z-20 h-16 bg-white border-b border-surface-highest flex items-center justify-between px-4 transition-all duration-200"
      style={{ left: collapsed ? '4rem' : '14rem' }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-low transition-colors"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-sm font-semibold text-on-surface font-newsreader">Admin Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-on-surface-variant hidden sm:block">admin@gmail.com</span>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
        >
          <LogOut size={14} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  )
}
