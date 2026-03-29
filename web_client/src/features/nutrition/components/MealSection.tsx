import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MealItemRow } from './MealItemRow'
import { FoodSearchModal } from './FoodSearchModal'
import type { MealLog, MealType } from '@/types'

interface MealSectionProps {
  mealType: MealType
  mealLog?: MealLog
}

const mealLabels: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
}

const mealEmoji: Record<MealType, string> = {
  BREAKFAST: '☀️',
  LUNCH: '🥗',
  DINNER: '🌙',
  SNACK: '🍎',
}

export function MealSection({ mealType, mealLog }: MealSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const items = mealLog?.items ?? []
  const totalCal = items.reduce((sum, i) => sum + i.calories_snapshot, 0)

  return (
    <>
      <Card padding="none" className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="text-base">{mealEmoji[mealType]}</span>
            <span className="font-medium text-on-surface font-manrope">{mealLabels[mealType]}</span>
            {items.length > 0 && (
              <span className="text-xs text-on-surface-variant/60 font-manrope ml-1">
                {Math.round(totalCal)} kcal
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setModalOpen(true)}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add food
          </Button>
        </div>

        {/* Items */}
        {items.length > 0 ? (
          <div className="px-2 py-1">
            {items.map((item) => (
              <MealItemRow key={item.id} item={item} logId={mealLog!.id} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-5 text-center text-sm text-on-surface-variant/40 font-manrope">
            Nothing logged yet
          </div>
        )}
      </Card>

      <FoodSearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mealType={mealType}
        existingLogId={mealLog?.id}
      />
    </>
  )
}
