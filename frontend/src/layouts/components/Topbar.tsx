import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  const { user } = useAuthStore()
  
  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => api.get('/notifications/unread-count').then((r) => r.data?.data ?? r.data),
    staleTime: 1000 * 30,
  })
  const unreadCount: number = unreadData?.count ?? 0

  const today = new Date()
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  const dayName = daysOfWeek[today.getDay()]
  const day = today.getDate()
  const month = today.getMonth() + 1
  const year = today.getFullYear()

  const fullDateStr = `${dayName}, ${day} tháng ${month} năm ${year}`
  const shortDateStr = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`

  return (
    <div className="topbar">
      <div className="topbar-left">
        {title === 'Dashboard' ? (
          <>
            <h1>Xin chào, {user?.displayName ? user.displayName.split(' ')[user.displayName.split(' ').length - 1] : 'bạn'} 👋</h1>
            <p>Hôm nay là {fullDateStr}</p>
          </>
        ) : (
          <>
            <h1>{title}</h1>
            <p>Hôm nay là {fullDateStr}</p>
          </>
        )}
      </div>
      <div className="topbar-right">
        <div className="date-badge">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M4 1v2M10 1v2M1 6h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          {shortDateStr}
        </div>
        <Link to="/notifications" className={`topbar-icon-btn ${unreadCount > 0 ? 'notif-dot' : ''}`}>
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M8 1a5 5 0 00-5 5v2l-1.5 2.5h13L13 8V6a5 5 0 00-5-5zM6 12.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        </Link>
      </div>
    </div>
  )
}
