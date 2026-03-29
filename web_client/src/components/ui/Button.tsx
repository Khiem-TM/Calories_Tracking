import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { Spinner } from './Spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
}

const variantClasses = {
  primary:
    'bg-gradient-primary text-white hover:opacity-90 focus:ring-primary/30 disabled:opacity-50 shadow-ambient',
  secondary:
    'bg-surface-high text-primary hover:bg-surface-highest focus:ring-primary/20',
  ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-highest focus:ring-outline/20',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400/40 disabled:bg-red-300',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    children,
    className,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-medium font-manrope',
        'transition-all focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" className="text-current" /> : leftIcon}
      {children}
    </button>
  )
})
