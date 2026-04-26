import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import '@/assets/auth.css'

export function AuthLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isLogin = location.pathname.includes('/login')

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px' }}>
        <Link to="/" style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: 20, color: 'var(--green-dark)', fontWeight: 400, textDecoration: 'none' }}>Calories Tracking</Link>
        <button 
          onClick={() => navigate(isLogin ? '/register' : '/login')}
          style={{ fontSize: 14, fontWeight: 500, color: '#1a2e22', textDecoration: 'none', cursor: 'pointer', background: 'none', border: 'none' }}
        >
          {isLogin ? 'Sign Up' : 'Log In'}
        </button>
      </nav>

      <div className="card-wrap">
        <div className="auth-card">
          {/* LEFT PANEL */}
          <div className="left-panel">
            <div className="illustration"></div>
            <div className="orbs">
              <div className="orb orb-1"></div>
              <div className="orb orb-2"></div>
              <div className="orb orb-3"></div>
              <div className="orb orb-4"></div>
            </div>

            <div className="left-top">
              {!isLogin ? (
                <div>
                  <h1 className="left-heading">
                    <em>The smarter way</em><br />
                    <strong>to track calories.</strong>
                  </h1>
                  <p className="left-body">Join thousands who've transformed their nutrition habits with precise, personalized calorie and macro tracking.</p>
                </div>
              ) : (
                <div>
                  <h1 className="left-heading">
                    <em>Welcome</em><br />
                    <strong>back.</strong>
                  </h1>
                  <p className="left-body">Your nutrition journey continues here. Pick up right where you left off.</p>
                </div>
              )}
            </div>

            <div className="testimonial">
              <div className="testimonial-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Nutrition Insight
              </div>
              <p className="testimonial-quote">"Tracking calories finally made sense — I lost 8kg in 3 months just by understanding my daily intake."</p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel">
            <AnimatePresence mode="wait">
              <Outlet key={location.pathname} />
            </AnimatePresence>
          </div>
        </div>
      </div>
      <footer style={{ textAlign: 'center', padding: 18, fontSize: 11.5, color: '#7a9585', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>
        © 2026 Calories Tracking &bull; Smart Nutrition Engineering
      </footer>
    </div>
  )
}
