import { useQuery } from '@tanstack/react-query'
import { DateNav } from '@/components/ui/DateNav'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { getStreaks } from '@/services/streakService'
import { getUnreadCount } from '@/services/notificationService'
import { queryKeys } from '@/utils/queryKeys'
import { useUIStore } from '@/stores/uiStore'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001'

export function Topbar() {
  const user = useAuthStore((s) => s.user)
  const { mutate: logout } = useLogout()
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

  const { data: streaks } = useQuery({
    queryKey: queryKeys.streaks(),
    queryFn: getStreaks,
    staleTime: 5 * 60_000,
  })

  const { data: unreadCount } = useQuery({
    queryKey: queryKeys.notifications({ unread: true }),
    queryFn: getUnreadCount,
    staleTime: 60_000,
  })

  const dailyStreak = streaks?.find((s) => s.streakType === 'daily_logs')

  return (
    <header
      className={`fixed top-0 right-0 z-10 h-14 glass flex items-center px-4 gap-4 transition-all duration-200 ${
        sidebarCollapsed ? 'left-0 md:left-16' : 'left-0 md:left-56'
      }`}
    >
      <DateNav />

      <div className="ml-auto flex items-center gap-3">
        {/* Streak badge */}
        {dailyStreak && dailyStreak.currentCount > 0 && (
          <div className="flex items-center gap-1 bg-tertiary-container/20 text-tertiary px-2.5 py-1 rounded-full text-xs font-semibold font-manrope">
            <span>🔥</span>
            <span>{dailyStreak.currentCount}</span>
          </div>
        )}

        {/* Notification bell */}
        <button className="relative p-1.5 rounded-full text-on-surface-variant hover:bg-surface-highest hover:text-on-surface transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount != null && unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-error text-on-error text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar + dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 rounded-full hover:bg-surface-highest p-1 transition-colors">
            {user?.avatar_url ? (
              <img
                src={`${BASE_URL}${user.avatar_url}`}
                alt={user.display_name}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-primary-container/30 text-primary flex items-center justify-center text-xs font-bold font-manrope">
                {user?.display_name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-on-surface font-manrope max-w-28 truncate">
              {user?.display_name}
            </span>
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-10 w-44 glass rounded-xl shadow-ambient py-1 opacity-0 group-focus-within:opacity-100 pointer-events-none group-focus-within:pointer-events-auto transition-opacity">
            <button
              onClick={() => logout()}
              className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors font-manrope"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
