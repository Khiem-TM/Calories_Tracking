interface MacroBarProps {
  label: string
  current: number
  target: number
  color: string
  unit?: string
}

export function MacroBar({ label, current, target, color, unit = 'g' }: MacroBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const isOver = current > target && target > 0

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-xs font-manrope">
        <span className="font-medium text-on-surface-variant">{label}</span>
        <span>
          <span className={isOver ? 'text-error font-semibold data-value' : 'text-on-surface font-semibold data-value'}>
            {Math.round(current)}
          </span>
          {target > 0 && (
            <span className="text-on-surface-variant"> / {Math.round(target)}{unit}</span>
          )}
        </span>
      </div>
      {/* Rounded progress bar — full rounded caps */}
      <div className="h-2 bg-surface-highest rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
