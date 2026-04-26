import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForgotPassword } from '@/features/auth/hooks/useAuth'

const schema = z.object({ email: z.string().email('Invalid email') })
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { mutate, isPending, isSuccess } = useForgotPassword()
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
          Reset password
        </h2>
        <p className="text-sm mb-6" style={{ color: '#7a9080' }}>
          Enter your email and we&apos;ll send you a reset link
        </p>

        {isSuccess ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: '#d4eddf' }}>
              <span className="text-2xl">✉️</span>
            </div>
            <p className="font-medium" style={{ color: '#1a3829' }}>Email sent!</p>
            <p className="text-sm mt-1" style={{ color: '#7a9080' }}>Check your inbox for the reset link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit((v) => mutate(v.email))} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#3d4d44' }}>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="mt-1"
                style={{ borderColor: errors.email ? '#e05c5c' : '#c9e4d4' }}
                {...register('email')}
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#e05c5c' }}>{errors.email.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full text-white font-semibold rounded-full h-11"
              style={{ backgroundColor: '#1e4d35' }}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
            </Button>
          </form>
        )}

        <Link
          to="/login"
          className="flex items-center gap-1.5 text-sm mt-6 justify-center hover:underline"
          style={{ color: '#7a9080' }}
        >
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </motion.div>
  )
}
