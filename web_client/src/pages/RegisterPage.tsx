import { Link } from 'react-router-dom'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary flex-col justify-between p-12">
        <div>
          <span className="text-2xl font-bold text-white font-newsreader tracking-tight">Cronometer</span>
        </div>
        <div>
          <h2 className="text-4xl font-light text-white font-newsreader leading-snug mb-4">
            Begin your<br />
            <em>wellness journey</em><br />
            today.
          </h2>
          <p className="text-white/70 font-manrope text-sm leading-relaxed max-w-xs">
            Join thousands who track their health with precision and insight. Your data, your goals, your progress.
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
            <h1 className="text-2xl font-semibold text-on-surface font-newsreader">Create account</h1>
            <p className="text-sm text-on-surface-variant font-manrope mt-1">Start tracking your fitness journey</p>
          </div>

          <div className="bg-surface-lowest rounded-2xl shadow-card p-6">
            <RegisterForm />
          </div>

          <p className="text-center text-sm text-on-surface-variant font-manrope mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
