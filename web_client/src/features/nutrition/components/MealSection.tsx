import { useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { MealItemRow } from './MealItemRow'
import { FoodSearchModal } from './FoodSearchModal'
import { uploadMealImage } from '@/services/mealLogService'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/utils/queryKeys'
import { toast } from '@/components/ui/Toast'
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
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const date = useUIStore((s) => s.selectedDate)

  const items = mealLog?.items ?? []
  const totalCal = items.reduce((sum, i) => sum + i.calories_snapshot, 0)

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !mealLog) return
    setUploading(true)
    try {
      await uploadMealImage(mealLog.id, file)
      void queryClient.invalidateQueries({ queryKey: queryKeys.mealLogs(date) })
      toast.success('Meal photo uploaded!')
    } catch {
      toast.error('Failed to upload photo')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

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
          <div className="flex items-center gap-1">
            {/* Camera button — only active when a meal log exists */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <Button
              variant="ghost"
              size="sm"
              disabled={uploading || !mealLog}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Add meal photo"
            >
              {uploading ? (
                <Spinner size="sm" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </Button>
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
