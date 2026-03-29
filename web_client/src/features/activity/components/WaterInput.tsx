import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useLogWater } from '../hooks/useLogWater'

interface WaterInputProps {
  currentMl: number
  goalMl?: number
}

export function WaterInput({ currentMl, goalMl = 2000 }: WaterInputProps) {
  const { mutate: logWater, isPending } = useLogWater()
  const pct = Math.min((currentMl / goalMl) * 100, 100)

  const INCREMENTS = [200, 250, 330, 500]

  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">💧</span>
        <div>
          <h3 className="text-sm font-semibold text-on-surface font-manrope">Water</h3>
          <p className="text-xs text-on-surface-variant/60 font-manrope">Goal: {(goalMl / 1000).toFixed(1)}L</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xl font-bold text-primary data-value">
            {currentMl >= 1000 ? `${(currentMl / 1000).toFixed(1)}L` : `${currentMl}ml`}
          </p>
          <p className="text-xs text-on-surface-variant/60 font-manrope">{Math.round(pct)}% of goal</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-surface-container rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-blue-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Quick add buttons */}
      <div className="flex gap-2">
        {INCREMENTS.map((ml) => (
          <Button
            key={ml}
            variant="secondary"
            size="sm"
            loading={isPending}
            onClick={() => logWater(currentMl + ml)}
            className="flex-1"
          >
            +{ml}ml
          </Button>
        ))}
        {currentMl > 0 && (
          <Button
            variant="ghost"
            size="sm"
            loading={isPending}
            onClick={() => logWater(Math.max(0, currentMl - 250))}
          >
            -250
          </Button>
        )}
      </div>
    </Card>
  )
}
