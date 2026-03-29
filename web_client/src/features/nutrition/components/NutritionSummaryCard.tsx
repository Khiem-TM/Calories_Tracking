import { Card } from '@/components/ui/Card'
import { CalorieRing } from '@/components/charts/CalorieRing'
import { MacroBars } from '@/components/charts/MacroBars'

interface NutritionSummaryCardProps {
  caloriesIn: number
  caloriesGoal: number
  caloriesOut?: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  proteinTarget?: number
  fatTarget?: number
  carbsTarget?: number
  fiberTarget?: number
}

export function NutritionSummaryCard({
  caloriesIn,
  caloriesGoal,
  caloriesOut = 0,
  protein,
  fat,
  carbs,
  fiber,
  proteinTarget = 0,
  fatTarget = 0,
  carbsTarget = 0,
  fiberTarget = 0,
}: NutritionSummaryCardProps) {
  return (
    <Card>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <CalorieRing
          caloriesIn={caloriesIn}
          caloriesGoal={caloriesGoal}
          caloriesOut={caloriesOut}
          size={180}
        />
        <div className="flex-1 w-full">
          <MacroBars
            protein={protein}
            fat={fat}
            carbs={carbs}
            fiber={fiber}
            targets={{
              protein: proteinTarget,
              fat: fatTarget,
              carbs: carbsTarget,
              fiber: fiberTarget,
            }}
          />
        </div>
      </div>
    </Card>
  )
}
