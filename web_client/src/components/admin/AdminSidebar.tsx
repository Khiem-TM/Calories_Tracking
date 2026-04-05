import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  FileText,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { clsx } from 'clsx'

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/foods', icon: UtensilsCrossed, label: 'Foods' },
  { to: '/admin/blogs', icon: FileText, label: 'Blogs' },
  { to: '/admin/exercises', icon: Dumbbell, label: 'Exercises' },
]

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full z-30 flex flex-col bg-white border-r border-surface-highest transition-all duration-200',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-surface-highest">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-on-surface text-sm truncate font-newsreader">
              Admin Panel
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface',
              )
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Toggle */}
      <div className="p-2 border-t border-surface-highest">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-xl text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}
