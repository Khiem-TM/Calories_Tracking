import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="p-4 rounded-full bg-red-50">
        <AlertCircle className="w-8 h-8 text-red-accent" style={{ color: '#e05c5c' }} />
      </div>
      <div>
        <p className="font-medium text-text-body" style={{ color: '#3d4d44' }}>{message}</p>
        <p className="text-sm mt-1" style={{ color: '#7a9080' }}>Please try again</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="border-green-accent text-green-accent">
          Retry
        </Button>
      )}
    </div>
  )
}
