import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useLogSteps } from '../hooks/useLogSteps'

interface StepsInputProps {
  currentSteps: number
  goalSteps?: number
}

export function StepsInput({ currentSteps, goalSteps = 10_000 }: StepsInputProps) {
  const [value, setValue] = useState(currentSteps.toString())
  const { mutate: logSteps, isPending } = useLogSteps()

  const pct = Math.min((currentSteps / goalSteps) * 100, 100)

  const handleSave = () => {
    const steps = parseInt(value, 10)
    if (!isNaN(steps) && steps >= 0) logSteps(steps)
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">👟</span>
        <div>
          <h3 className="text-sm font-semibold text-on-surface font-manrope">Steps</h3>
          <p className="text-xs text-on-surface-variant/60 font-manrope">Goal: {goalSteps.toLocaleString()} steps</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xl font-bold text-on-surface data-value">{currentSteps.toLocaleString()}</p>
          <p className="text-xs text-on-surface-variant/60 font-manrope">{Math.round(pct)}% of goal</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-surface-container rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          type="number"
          min={0}
          max={100_000}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSave} loading={isPending} size="sm">
          Save
        </Button>
      </div>
    </Card>
  )
}
