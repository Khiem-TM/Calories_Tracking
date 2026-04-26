import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, Dumbbell, BarChart3, User } from 'lucide-react'

const items = [
  { label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Food', icon: UtensilsCrossed, href: '/food-log' },
  { label: 'Workout', icon: Dumbbell, href: '/workout' },
  { label: 'Reports', icon: BarChart3, href: '/reports' },
  { label: 'Profile', icon: User, href: '/profile' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t"
      style={{ backgroundColor: '#1a3829', borderColor: 'rgba(255,255,255,0.1)', height: '60px' }}
    >
      {items.map(({ label, icon: Icon, href }) => {
        const active = location.pathname === href || location.pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            to={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors"
            style={{ color: active ? '#3a8f67' : 'rgba(255,255,255,0.5)' }}
          >
            <Icon size={20} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
