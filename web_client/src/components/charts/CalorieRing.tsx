import { clsx } from 'clsx'

interface CalorieRingProps {
  caloriesIn: number
  caloriesGoal: number
  caloriesOut?: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function CalorieRing({
  caloriesIn,
  caloriesGoal,
  caloriesOut = 0,
  size = 200,
  strokeWidth = 16,
  className,
}: CalorieRingProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  const pct = caloriesGoal > 0 ? Math.min(caloriesIn / caloriesGoal, 1) : 0
  const dashOffset = circumference * (1 - pct)

  const remaining = caloriesGoal - caloriesIn + caloriesOut
  const isOver = remaining < 0

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#d3e8d7"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc — gradient via linearGradient */}
          <defs>
            <linearGradient id="calorie-ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#006d3a" />
              <stop offset="100%" stopColor="#3dae6b" />
            </linearGradient>
          </defs>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={isOver ? '#ba1a1a' : 'url(#calorie-ring-gradient)'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="calorie-ring-transition"
          />
        </svg>

        {/* Center label — Newsreader for display value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={clsx('text-3xl font-light font-newsreader', isOver ? 'text-error' : 'text-on-surface')}>
            {Math.abs(Math.round(remaining))}
          </span>
          <span className="text-xs text-on-surface-variant mt-0.5 font-manrope">
            {isOver ? 'over' : 'remaining'}
          </span>
          <span className="text-xs text-on-surface-variant font-manrope">kcal</span>
        </div>
      </div>

      {/* Legend row */}
      <div className="flex gap-4 mt-3 text-xs text-on-surface-variant font-manrope">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-on-surface data-value">{Math.round(caloriesIn)}</span>
          <span>eaten</span>
        </div>
        <div className="h-8 w-px bg-outline-variant/40" />
        <div className="flex flex-col items-center">
          <span className="font-semibold text-on-surface data-value">{caloriesGoal}</span>
          <span>goal</span>
        </div>
        {caloriesOut > 0 && (
          <>
            <div className="h-8 w-px bg-outline-variant/40" />
            <div className="flex flex-col items-center">
              <span className="font-semibold text-on-surface data-value">{Math.round(caloriesOut)}</span>
              <span>burned</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
