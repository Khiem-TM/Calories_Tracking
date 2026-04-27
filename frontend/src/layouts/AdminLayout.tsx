import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import '@/assets/admin.css'

const navItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/users', icon: 'group', label: 'User Management' },
  { to: '/admin/foods', icon: 'restaurant', label: 'Food Management' },
  { to: '/admin/exercises', icon: 'fitness_center', label: 'Exercise Management' },
  { to: '/admin/blogs', icon: 'article', label: 'Blog Management' },
  { to: '/admin/sport-tips', icon: 'lightbulb', label: 'Sport Tips' },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const logout = useAdminAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-root">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #E2E8DE', marginBottom: '8px' }}>
          <span className="admin-logo-text">
            Tracker<span className="admin-logo-dot">.</span>
          </span>
          <p className="admin-logo-sub">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-sidebar-link${isActive ? ' active' : ''}`
              }
              style={{ display: 'flex', marginBottom: '2px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom — logout */}
        <div style={{ padding: '12px', borderTop: '1px solid #E2E8DE' }}>
          <button
            onClick={handleLogout}
            className="admin-sidebar-link"
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ba1a1a',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = '#ffdad6')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              logout
            </span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#737970',
                pointerEvents: 'none',
              }}
            >
              search
            </span>
            <input className="admin-search" placeholder="Tìm kiếm..." />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
            <button className="admin-icon-btn" title="Thông báo">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                notifications
              </span>
            </button>
            <button className="admin-icon-btn" title="Cài đặt">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                settings
              </span>
            </button>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#8ba888',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                marginLeft: '4px',
                flexShrink: 0,
              }}
            >
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content">
          <div className="admin-viewport">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
