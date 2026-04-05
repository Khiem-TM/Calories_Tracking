import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { adminLogin } from '../../services/adminService'
import { useAdminAuthStore } from '../../stores/adminAuthStore'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const login = useAdminAuthStore((s) => s.login)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@gmail.com', password: '' },
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ email, password }: FormData) => adminLogin(email, password),
    onSuccess: (data) => {
      login(data.access_token)
      navigate('/admin/dashboard')
    },
  })

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-card">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface font-newsreader">Admin Panel</h1>
          <p className="text-sm text-on-surface-variant mt-1">Sign in to manage your platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-highest bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-highest bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <p className="text-xs text-error bg-error/10 rounded-xl px-3 py-2">
                Invalid credentials. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {isPending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
