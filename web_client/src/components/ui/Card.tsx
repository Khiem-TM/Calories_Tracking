import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({ children, className, header, footer, padding = 'md' }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-surface-lowest rounded-lg shadow-card',
        className,
      )}
    >
      {header && (
        <div className="px-4 py-3 font-medium text-on-surface font-manrope">
          {header}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
      {footer && (
        <div className="px-4 py-3 text-sm text-on-surface-variant font-manrope">
          {footer}
        </div>
      )}
    </div>
  )
}
