import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/features/auth/services/authService'

const schema = z.object({ code: z.string().min(4, 'Enter the verification code') })
type FormValues = z.infer<typeof schema>

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (code: string) => authService.verifyEmail(email, code),
    onSuccess: () => toast.success('Email verified! You can now log in.'),
    onError: () => toast.error('Invalid or expired code'),
  })
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
          Verify email
        </h2>
        <p className="text-sm mb-6" style={{ color: '#7a9080' }}>
          Enter the code sent to <strong>{email}</strong>
        </p>

        {isSuccess ? (
          <div className="text-center py-4">
            <p className="font-medium mb-4" style={{ color: '#1a3829' }}>Email verified! ✓</p>
            <Link to="/login">
              <Button className="w-full rounded-full" style={{ backgroundColor: '#1e4d35', color: '#fff' }}>
                Go to login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit((v) => mutate(v.code))} className="space-y-4">
            <div>
              <Label style={{ color: '#3d4d44' }}>Verification Code</Label>
              <Input
                placeholder="Enter code"
                className="mt-1"
                style={{ borderColor: errors.code ? '#e05c5c' : '#c9e4d4' }}
                {...register('code')}
              />
              {errors.code && <p className="text-xs mt-1" style={{ color: '#e05c5c' }}>{errors.code.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full text-white font-semibold rounded-full h-11"
              style={{ backgroundColor: '#1e4d35' }}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
            </Button>
          </form>
        )}
      </div>
    </motion.div>
  )
}
