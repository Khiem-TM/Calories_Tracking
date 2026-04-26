import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuthStore()

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-logo">Tracker<span>.</span></Link>
      <div className="sidebar-section">Menu chính</div>
      <ul className="sidebar-nav">
        <li>
          <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
            <svg className="nav-icon" fill="none" viewBox="0 0 18 18"><rect x="1" y="1" width="7" height="7" rx="2" fill="currentColor"/><rect x="10" y="1" width="7" height="7" rx="2" fill="currentColor" opacity=".5"/><rect x="1" y="10" width="7" height="7" rx="2" fill="currentColor" opacity=".5"/><rect x="10" y="10" width="7" height="7" rx="2" fill="currentColor" opacity=".5"/></svg>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/food-log" className={isActive('/food-log') ? 'active' : ''}>
            <svg className="nav-icon" fill="none" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M6 9h6M9 6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Nhật ký ăn uống
          </Link>
        </li>
        <li>
          <Link to="/search-food" className={isActive('/search-food') ? 'active' : ''}>
            <svg className="nav-icon" fill="none" viewBox="0 0 18 18"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Tìm thực phẩm
          </Link>
        </li>
        <li>
          <Link to="/workout" className={isActive('/workout') ? 'active' : ''}>
            <svg className="nav-icon" fill="none" viewBox="0 0 18 18"><path d="M2 9h2m10 0h2M4 9a5 5 0 0110 0M4 9a5 5 0 0010 0M6 7v4M12 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Tập luyện
          </Link>
        </li>
        <li>
          <Link to="/body-metrics" className={isActive('/body-metrics') ? 'active' : ''}>
            <svg className="nav-icon" fill="none" viewBox="0 0 18 18"><path d="M9 2a4 4 0 100 8 4 4 0 000-8zM3 16c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Body Metrics
          </Link>
        </li>
        <li>
          <Link to="/reports" className={isActive('/reports') ? 'active' : ''}>
            <svg className="nav-icon" fill="none" viewBox="0 0 18 18"><path d="M3 14l4-5 3 3 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Báo cáo
          </Link>
        </li>
        <li>
          <Link to="/chatbot" className={isActive('/chatbot') ? 'active' : ''}>
            <svg className="nav-icon" fill="none" viewBox="0 0 18 18"><path d="M3 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H7l-4 3V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Trợ lý AI
          </Link>
        </li>
        <li>
          <Link to="/blog" className={isActive('/blog') ? 'active' : ''}>
            <svg className="nav-icon" fill="none" viewBox="0 0 18 18"><rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7h8M5 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Blog
          </Link>
        </li>
      </ul>
      <div className="sidebar-bottom">
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <div className="user-pill">
            <div className="user-avatar">{getInitials(user?.displayName)}</div>
            <div>
              <div className="user-name">{user?.displayName || 'User'}</div>
              <div className="user-plan">Pro Plan</div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  )
}
