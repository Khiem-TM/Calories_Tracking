import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {Icon && (
        <div className="p-4 rounded-full" style={{ backgroundColor: '#d4eddf' }}>
          <Icon className="w-8 h-8" style={{ color: '#3a8f67' }} />
        </div>
      )}
      <div>
        <p className="font-semibold text-lg" style={{ color: '#3d4d44' }}>{title}</p>
        {description && (
          <p className="text-sm mt-1" style={{ color: '#7a9080' }}>{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
