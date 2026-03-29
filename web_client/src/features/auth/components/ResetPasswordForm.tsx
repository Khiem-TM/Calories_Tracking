import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { resetPassword } from '@/services/authService'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'

const schema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => resetPassword(token, data.newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    },
    onError: () => toast.error('Invalid or expired reset link. Please request a new one.'),
  })

  if (!token) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-slate-500 mb-4">
          This reset link is invalid or has expired.
        </p>
        <Link to="/forgot-password" className="text-sm text-brand font-medium hover:underline">
          Request a new link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">Enter your new password below.</p>
      <Input
        label="New Password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        autoFocus
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" loading={isPending} className="w-full">
        Reset Password
      </Button>
      <Link to="/login" className="text-center text-sm text-slate-500 hover:text-slate-700">
        Back to Sign In
      </Link>
    </form>
  )
}
