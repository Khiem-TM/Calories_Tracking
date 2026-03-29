import { useState } from 'react'
import { clsx } from 'clsx'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useFoodSearch } from '@/features/nutrition/hooks/useFoodSearch'
import { useAddMealItem } from '@/features/nutrition/hooks/useAddMealItem'
import { useExercises } from '@/features/training/hooks/useExercises'
import { useLogWorkout } from '@/features/training/hooks/useLogWorkout'
import { useLogSteps } from '@/features/activity/hooks/useLogSteps'
import { useLogWater } from '@/features/activity/hooks/useLogWater'
import { useUIStore } from '@/stores/uiStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from '@/components/ui/Toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logCaloriesBurned } from '@/services/activityService'
import { queryKeys } from '@/utils/queryKeys'
import type { Exercise, Food, MealType, MuscleGroup } from '@/types'

// ── Meal Tab ─────────────────────────────────────────────────────────────────

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']

function MealTab({ onClose }: { onClose: () => void }) {
  const [selectedMealType, setSelectedMealType] = useState<MealType>('LUNCH')
  const [query, setQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [grams, setGrams] = useState(100)

  const { data, isLoading } = useFoodSearch(query)
  const { mutate: addItem, isPending } = useAddMealItem()

  const scale = grams / 100
  const preview = selectedFood
    ? {
        calories: Math.round(selectedFood.calories_per_100g * scale),
        protein: Math.round(selectedFood.protein_per_100g * scale),
        carbs: Math.round(selectedFood.carbs_per_100g * scale),
        fat: Math.round(selectedFood.fat_per_100g * scale),
      }
    : null

  const handleAdd = () => {
    if (!selectedFood) return
    addItem(
      {
        mealType: selectedMealType,
        item: { food_id: selectedFood.id, quantity: grams, serving_unit: 'g', source: 'manual' },
      },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Meal type chips */}
      <div className="flex gap-1.5 flex-wrap">
        {MEAL_TYPES.map((mt) => (
          <button
            key={mt}
            onClick={() => setSelectedMealType(mt)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize',
              selectedMealType === mt
                ? 'bg-brand text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {mt.charAt(0) + mt.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {selectedFood ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setSelectedFood(null)}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <p className="font-semibold text-slate-800">{selectedFood.name}</p>
            {selectedFood.brand && <p className="text-xs text-slate-400">{selectedFood.brand}</p>}
          </div>
          <Input
            label="Amount (grams)"
            type="number"
            min={1}
            max={9999}
            value={grams}
            onChange={(e) => setGrams(Number(e.target.value))}
          />
          {preview && (
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {Object.entries(preview).map(([key, val]) => (
                <div key={key} className="bg-slate-50 rounded-lg p-2">
                  <div className="font-semibold text-slate-700">{val}</div>
                  <div className="text-slate-400 capitalize">{key === 'calories' ? 'kcal' : `${key}g`}</div>
                </div>
              ))}
            </div>
          )}
          <Button onClick={handleAdd} loading={isPending} className="w-full">
            Add to {selectedMealType.charAt(0) + selectedMealType.slice(1).toLowerCase()}
          </Button>
        </div>
      ) : (
        <>
          <Input
            placeholder="Search foods..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="max-h-52 overflow-y-auto -mx-2 px-2">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            )}
            {!isLoading && data?.items?.map((food) => (
              <button
                key={food.id}
                onClick={() => { setSelectedFood(food); setGrams(food.serving_size_g ?? 100) }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{food.name}</p>
                  <p className="text-xs text-slate-400">{food.brand ? `${food.brand} · ` : ''}per 100g</p>
                </div>
                <span className="text-sm text-slate-500 ml-3 shrink-0">{food.calories_per_100g} kcal</span>
              </button>
            ))}
            {!isLoading && !data?.items?.length && query.length >= 1 && (
              <p className="text-center text-sm text-slate-400 py-6">No foods found</p>
            )}
            {!query && (
              <p className="text-center text-sm text-slate-400 py-6">Type to search for foods</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Workout Tab ───────────────────────────────────────────────────────────────

const MUSCLE_GROUPS: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full_body']

const workoutSchema = z.object({
  sessionDate: z.string().min(1),
  durationMinutes: z.coerce.number().min(1),
  sets: z.coerce.number().optional(),
  repsPerSet: z.coerce.number().optional(),
  weightKg: z.coerce.number().optional(),
})

function WorkoutTab({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | undefined>()
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const selectedDate = useUIStore((s) => s.selectedDate)
  const { mutate: logWorkout, isPending } = useLogWorkout()

  const { data: exercises = [], isLoading } = useExercises({
    name: search || undefined,
    muscleGroup: selectedGroup,
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(workoutSchema),
    defaultValues: { sessionDate: selectedDate, durationMinutes: 30 },
  })

  const onSubmit = (data: z.infer<typeof workoutSchema>) => {
    if (!selectedExercise) return
    logWorkout({ exerciseId: selectedExercise.id, ...data })
    onClose()
  }

  if (selectedExercise) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setSelectedExercise(null)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-700">{selectedExercise.name}</p>
          <p className="text-xs text-slate-400 capitalize">{selectedExercise.primaryMuscleGroup.replace('_', ' ')} · {selectedExercise.intensity}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" error={errors.sessionDate?.message} {...register('sessionDate')} />
          <Input label="Duration (min)" type="number" min={1} error={errors.durationMinutes?.message} {...register('durationMinutes')} />
        </div>
        {selectedExercise.primaryMuscleGroup !== 'cardio' && (
          <div className="grid grid-cols-3 gap-2">
            <Input label="Sets" type="number" min={1} {...register('sets')} />
            <Input label="Reps" type="number" min={1} {...register('repsPerSet')} />
            <Input label="Weight (kg)" type="number" min={0} step={0.5} {...register('weightKg')} />
          </div>
        )}
        <Button type="submit" loading={isPending} className="w-full">
          Log Workout
        </Button>
      </form>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder="Search exercises..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      <div className="flex flex-wrap gap-1.5">
        {MUSCLE_GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setSelectedGroup(selectedGroup === g ? undefined : g)}
            className={clsx(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors capitalize',
              selectedGroup === g ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {g.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="max-h-52 overflow-y-auto -mx-2 px-2">
        {isLoading && <div className="flex justify-center py-6"><Spinner /></div>}
        {!isLoading && exercises.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setSelectedExercise(ex)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-slate-700">{ex.name}</p>
              <p className="text-xs text-slate-400 capitalize">{ex.primaryMuscleGroup.replace('_', ' ')} · {ex.intensity}</p>
            </div>
            <span className="text-xs text-slate-400 ml-2 shrink-0">MET {ex.metValue}</span>
          </button>
        ))}
        {!isLoading && exercises.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-6">No exercises found</p>
        )}
      </div>
    </div>
  )
}

// ── Activity Tab ──────────────────────────────────────────────────────────────

const activitySchema = z.object({
  steps: z.coerce.number().int().min(0).max(100000).optional(),
  waterMl: z.coerce.number().min(0).optional(),
  caloriesBurned: z.coerce.number().min(0).optional(),
})

function ActivityTab({ onClose }: { onClose: () => void }) {
  const date = useUIStore((s) => s.selectedDate)
  const queryClient = useQueryClient()
  const { mutate: logSteps, isPending: loggingSteps } = useLogSteps()
  const { mutate: logWater, isPending: loggingWater } = useLogWater()

  const { mutate: logCals, isPending: loggingCals } = useMutation({
    mutationFn: (caloriesBurned: number) => logCaloriesBurned({ logDate: date, caloriesBurned }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activityLog(date) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(date) })
    },
    onError: () => toast.error('Failed to log calories'),
  })

  const { register, handleSubmit } = useForm({ resolver: zodResolver(activitySchema) })

  const isPending = loggingSteps || loggingWater || loggingCals

  const onSubmit = async (data: z.infer<typeof activitySchema>) => {
    const promises: Promise<void>[] = []
    if (data.steps != null && data.steps > 0) {
      promises.push(new Promise<void>((res) => logSteps(data.steps!, { onSuccess: () => res(), onError: () => res() })))
    }
    if (data.waterMl != null && data.waterMl > 0) {
      promises.push(new Promise<void>((res) => logWater(data.waterMl!, { onSuccess: () => res(), onError: () => res() })))
    }
    if (data.caloriesBurned != null && data.caloriesBurned > 0) {
      promises.push(new Promise<void>((res) => logCals(data.caloriesBurned!, { onSuccess: () => res(), onError: () => res() })))
    }
    await Promise.all(promises)
    toast.success('Activity logged!')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Steps" type="number" min={0} max={100000} placeholder="0" {...register('steps')} />
      <Input label="Water (ml)" type="number" min={0} placeholder="0" {...register('waterMl')} />
      <Input label="Calories Burned" type="number" min={0} placeholder="0" {...register('caloriesBurned')} />
      <Button type="submit" loading={isPending} className="w-full">
        Save Activity
      </Button>
    </form>
  )
}

// ── QuickAddModal ─────────────────────────────────────────────────────────────

type Tab = 'Meal' | 'Workout' | 'Activity'
const TABS: Tab[] = ['Meal', 'Workout', 'Activity']

interface QuickAddModalProps {
  open: boolean
  onClose: () => void
}

export function QuickAddModal({ open, onClose }: QuickAddModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Meal')

  const handleClose = () => {
    setActiveTab('Meal')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Quick Add" size="md">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'flex-1 py-1.5 text-sm font-medium rounded-md transition-colors',
              activeTab === tab
                ? 'bg-white text-brand shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Meal' && <MealTab onClose={handleClose} />}
      {activeTab === 'Workout' && <WorkoutTab onClose={handleClose} />}
      {activeTab === 'Activity' && <ActivityTab onClose={handleClose} />}
    </Modal>
  )
}
