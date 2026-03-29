import { Link } from 'react-router-dom'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-white font-newsreader">Cronometer</span>
        </div>

        <div className="bg-surface-lowest rounded-2xl shadow-ambient p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-on-surface font-newsreader">Forgot password?</h1>
            <p className="text-sm text-on-surface-variant font-manrope mt-1">
              We'll send a reset link to your email.
            </p>
          </div>

          <ForgotPasswordForm />

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline font-manrope">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
