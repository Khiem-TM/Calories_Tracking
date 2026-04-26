import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResetPassword } from '@/features/auth/hooks/useAuth'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const { mutate, isPending } = useResetPassword()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm"
    >
      <div className="bg-white rounded-2xl p-8 shadow-md" style={{ boxShadow: '0 8px 32px rgba(30,77,53,0.11)' }}>
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: '#1a3829' }}>
          New password
        </h2>
        <p className="text-sm mb-6" style={{ color: '#7a9080' }}>Choose a strong password</p>

        <form onSubmit={handleSubmit((v) => mutate({ token, password: v.password }))} className="space-y-4">
          <div>
            <Label style={{ color: '#3d4d44' }}>New Password</Label>
            <Input
              type="password"
              placeholder="Min. 8 characters"
              className="mt-1"
              style={{ borderColor: errors.password ? '#e05c5c' : '#c9e4d4' }}
              {...register('password')}
            />
            {errors.password && <p className="text-xs mt-1" style={{ color: '#e05c5c' }}>{errors.password.message}</p>}
          </div>
          <div>
            <Label style={{ color: '#3d4d44' }}>Confirm Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              className="mt-1"
              style={{ borderColor: errors.confirmPassword ? '#e05c5c' : '#c9e4d4' }}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: '#e05c5c' }}>{errors.confirmPassword.message}</p>}
          </div>
          <Button
            type="submit"
            disabled={isPending || !token}
            className="w-full text-white font-semibold rounded-full h-11"
            style={{ backgroundColor: '#1e4d35' }}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
