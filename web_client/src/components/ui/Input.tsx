import { clsx } from 'clsx'
import { forwardRef } from 'react'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, prefix, suffix, className, id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-on-surface font-manrope">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-on-surface-variant text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-lg bg-surface-lowest px-3 py-2.5 text-sm text-on-surface font-manrope',
            'placeholder:text-on-surface-variant/50 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:bg-surface-lowest',
            error
              ? 'bg-error/5 ring-1 ring-error/40 focus:ring-error/30'
              : 'ring-1 ring-outline-variant/60',
            prefix && 'pl-8',
            suffix && 'pr-8',
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-on-surface-variant text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-error font-manrope">{error}</p>}
      {hint && !error && <p className="text-xs text-on-surface-variant font-manrope">{hint}</p>}
    </div>
  )
})
