import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { adminLogin } from '@/features/admin/services/adminService'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import '@/assets/admin.css'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const setToken = useAdminAuthStore((s) => s.setToken)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { access_token } = await adminLogin(email, password)
      setToken(access_token)
      navigate('/admin/dashboard')
    } catch {
      toast.error('Email hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="admin-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F7F2',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 16px' }}>
        {/* Card */}
        <div
          className="admin-card"
          style={{ padding: '40px', borderRadius: '16px', boxShadow: '0 8px 40px rgba(74,101,73,0.09)' }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '32px' }}>
            <span className="admin-logo-text">
              Tracker<span className="admin-logo-dot">.</span>
            </span>
            <p className="admin-logo-sub">Admin Panel</p>
          </div>

          <h2
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '22px',
              fontWeight: 700,
              color: '#1a1c1a',
              marginBottom: '4px',
            }}
          >
            Chào mừng trở lại
          </h2>
          <p style={{ fontSize: '13px', color: '#737970', marginBottom: '28px' }}>
            Đăng nhập vào trang quản trị
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label className="admin-label">Email</label>
              <input
                className="admin-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@gmail.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label className="admin-label">Mật khẩu</label>
              <input
                className="admin-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#737970', marginTop: '20px' }}>
          © 2024 Tracker Admin — Organic Wellness Platform
        </p>
      </div>
    </div>
  )
}
