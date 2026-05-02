import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRegister } from '@/features/auth/hooks/useAuth'

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false)
  const navigate = useNavigate()
  const { mutate: register_, isPending } = useRegister()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="view active"
    >
      <h2 className="form-title">Create Account</h2>
      <p className="form-subtitle">Begin your nutrition journey today.</p>

      <button className="btn-google" type="button" onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`}>
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.8 13.3l7.9 6.1C12.5 13 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 6.9-10 6.9-17z" opacity=".9"/><path fill="#FBBC05" d="M10.7 28.6A14.5 14.5 0 019.5 24c0-1.6.3-3.1.7-4.6l-7.9-6.1A24 24 0 000 24c0 3.9.9 7.5 2.6 10.7l8.1-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.2 0-11.5-4.2-13.3-9.9l-8.1 6.1C6.6 42.5 14.7 48 24 48z"/></svg>
        Continue with Google
      </button>

      <div className="divider">or email</div>

      <form onSubmit={handleSubmit((v) => register_(v))}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
          <div className="field">
            <label>Full Name</label>
            <input
              placeholder="Nguyễn Văn An"
              autoComplete="name"
              {...register('displayName')}
              style={errors.displayName ? { borderColor: '#e05c5c' } : {}}
            />
            {errors.displayName && <p className="text-xs mt-1" style={{ color: '#e05c5c' }}>{errors.displayName.message}</p>}
          </div>
          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="an@example.com"
              autoComplete="email"
              {...register('email')}
              style={errors.email ? { borderColor: '#e05c5c' } : {}}
            />
            {errors.email && <p className="text-xs mt-1" style={{ color: '#e05c5c' }}>{errors.email.message}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
          <div className="field">
            <label>Password</label>
            <div className="field-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
                style={errors.password ? { borderColor: '#e05c5c' } : {}}
              />
              <button
                className="eye-btn"
                onClick={() => setShowPw(!showPw)}
                type="button"
              >
                {showPw ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs mt-1" style={{ color: '#e05c5c' }}>{errors.password.message}</p>}
          </div>

          <div className="field">
            <label>Confirm Password</label>
            <div className="field-wrap">
              <input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                style={errors.confirmPassword ? { borderColor: '#e05c5c' } : {}}
              />
            </div>
            {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: '#e05c5c' }}>{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <button className="btn-auth-primary" type="submit" disabled={isPending}>
          {isPending ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <p className="switch-mode">Already have an account? <a onClick={() => navigate('/login')}>Log in here</a></p>
      
      <div className="badges">
        <span className="badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Secure
        </span>
        <span className="badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Privacy Protected
        </span>
      </div>
    </motion.div>
  )
}
