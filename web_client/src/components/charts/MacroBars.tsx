import { MacroBar } from './MacroBar'

interface MacroTargets {
  protein?: number
  fat?: number
  carbs?: number
  fiber?: number
}

interface MacroBarsProps {
  protein: number
  fat: number
  carbs: number
  fiber: number
  targets?: MacroTargets
}

export function MacroBars({ protein, fat, carbs, fiber, targets = {} }: MacroBarsProps) {
  return (
    <div className="flex flex-col gap-3">
      <MacroBar
        label="Protein"
        current={protein}
        target={targets.protein ?? 0}
        color="#3b82f6"
      />
      <MacroBar
        label="Carbs"
        current={carbs}
        target={targets.carbs ?? 0}
        color="#22c55e"
      />
      <MacroBar
        label="Fat"
        current={fat}
        target={targets.fat ?? 0}
        color="#eab308"
      />
      <MacroBar
        label="Fiber"
        current={fiber}
        target={targets.fiber ?? 0}
        color="#f97316"
      />
    </div>
  )
}
