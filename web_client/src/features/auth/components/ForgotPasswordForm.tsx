import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { forgotPassword } from '@/services/authService'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => forgotPassword(data.email),
    onSuccess: () => setSubmitted(true),
    onError: () => toast.error('Failed to send reset email. Please try again.'),
  })

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="h-12 w-12 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-on-surface font-newsreader mb-2">Check your email</h2>
        <p className="text-sm text-on-surface-variant font-manrope mb-4">
          We've sent a password reset link. Check your inbox and follow the instructions.
        </p>
        <Link to="/login" className="text-sm text-primary font-medium hover:underline font-manrope">
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-4">
      <p className="text-sm text-on-surface-variant font-manrope">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        autoFocus
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit" loading={isPending} className="w-full">
        Send Reset Link
      </Button>
      <Link to="/login" className="text-center text-sm text-on-surface-variant hover:text-on-surface font-manrope">
        Back to Sign In
      </Link>
    </form>
  )
}
