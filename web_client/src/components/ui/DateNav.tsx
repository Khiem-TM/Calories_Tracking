import { useUIStore } from '@/stores/uiStore'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = todayISO()
  const yesterday = new Date(Date.now() - 86400_000).toISOString().split('T')[0]

  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function DateNav() {
  const { selectedDate, goToPrevDay, goToNextDay } = useUIStore()
  const isToday = selectedDate >= todayISO()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goToPrevDay}
        className="p-1.5 rounded-lg text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container transition-colors"
        aria-label="Previous day"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <span className="text-sm font-medium text-on-surface font-manrope min-w-[90px] text-center">
        {formatDisplayDate(selectedDate)}
      </span>

      <button
        onClick={goToNextDay}
        disabled={isToday}
        className="p-1.5 rounded-lg text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next day"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
