import { Link } from 'react-router-dom'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary flex-col justify-between p-12">
        <div>
          <span className="text-2xl font-bold text-white font-newsreader tracking-tight">Cronometer</span>
        </div>
        <div>
          <h2 className="text-4xl font-light text-white font-newsreader leading-snug mb-4">
            Your personal<br />
            <em>health journal,</em><br />
            refined.
          </h2>
          <p className="text-white/70 font-manrope text-sm leading-relaxed max-w-xs">
            Track nutrition, training, and body metrics with medical-grade precision and a calm, editorial experience.
          </p>
        </div>
        <div className="flex gap-6 text-white/50 text-xs font-manrope">
          <span>© 2026 Cronometer</span>
          <Link to="/" className="hover:text-white/80 transition-colors">Home</Link>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-2xl font-bold text-on-surface font-newsreader">Cronometer</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-on-surface font-newsreader">Welcome back</h1>
            <p className="text-sm text-on-surface-variant font-manrope mt-1">Sign in to your account</p>
          </div>

          <div className="bg-surface-lowest rounded-2xl shadow-card p-6">
            <LoginForm />
          </div>

          <p className="text-center text-sm text-on-surface-variant font-manrope mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
