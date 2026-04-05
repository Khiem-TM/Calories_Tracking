import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { Spinner } from '@/components/ui/Spinner'
import { useFoodSearch } from '../hooks/useFoodSearch'
import { useAddMealItem } from '../hooks/useAddMealItem'
import { useFoodFavorites } from '../hooks/useFoodFavorites'
import { useToggleFavorite } from '../hooks/useToggleFavorite'
import { CreateFoodModal } from './CreateFoodModal'
import type { Food, MealType } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type EntryMode = 'barcode' | 'photo' | 'search'

interface FoodSearchModalProps {
  open: boolean
  onClose: () => void
  mealType: MealType
  existingLogId?: string
}

const UNIT_OPTIONS = ['grams (g)', 'oz', 'serving', 'bowl', 'cup', 'tbsp', 'tsp', 'piece']

const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
}

// ─── Left panel — entry mode cards ───────────────────────────────────────────

function ModeCard({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
        active
          ? 'border-[#15803d] bg-white shadow-sm'
          : 'border-transparent bg-white/50 hover:bg-white hover:shadow-sm',
      )}
    >
      <span
        className={clsx(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
          active ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-gray-100 text-gray-400',
        )}
      >
        {icon}
      </span>
      <div>
        <p className={clsx('text-sm font-semibold font-manrope', active ? 'text-[#15803d]' : 'text-gray-700')}>
          {title}
        </p>
        <p className="text-xs text-gray-400 font-manrope">{subtitle}</p>
      </div>
    </button>
  )
}

// ─── Left panel — barcode / photo area ───────────────────────────────────────

function UploadArea({ mode, onImageSelect }: { mode: EntryMode; onImageSelect: (f: File) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div
      onClick={() => fileRef.current?.click()}
      className="flex-1 border-2 border-dashed border-[#bbf7d0] rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#86efac] hover:bg-[#f0fdf4]/70 transition-colors p-4"
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onImageSelect(f)
        }}
      />
      <div className="w-14 h-14 rounded-2xl bg-[#dcfce7] flex items-center justify-center">
        {mode === 'barcode' ? (
          <svg className="w-7 h-7 text-[#15803d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 4v1m0 14v1M4 12h1m14 0h1M6.343 6.343l.707.707M16.95 16.95l.707.707M6.343 17.657l.707-.707M16.95 7.05l.707-.707" />
            <rect x="7" y="7" width="10" height="10" rx="1" strokeWidth={1.5} />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-[#15803d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </div>
      <p className="text-xs text-center text-gray-400 font-manrope leading-relaxed px-2">
        {mode === 'barcode'
          ? 'Place barcode within frame or upload image for analysis'
          : 'Upload a food photo for AI nutrient estimation'}
      </p>
    </div>
  )
}

// ─── Left panel — manual search ──────────────────────────────────────────────

function ManualSearchPanel({
  query,
  setQuery,
  foods,
  loading,
  onSelect,
  favoriteIds,
  onCreateFood,
}: {
  query: string
  setQuery: (q: string) => void
  foods: Food[]
  loading: boolean
  onSelect: (f: Food) => void
  favoriteIds: Set<string>
  onCreateFood: () => void
}) {
  const { mutate: toggle } = useToggleFavorite(false)

  return (
    <div className="flex-1 flex flex-col gap-2 min-h-0">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the clinical database..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-manrope text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15803d]/30 focus:border-[#15803d]"
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0 max-h-64">
        {loading && (
          <div className="flex justify-center py-8"><Spinner /></div>
        )}
        {!loading && foods.map((food) => (
          <button
            key={food.id}
            onClick={() => onSelect(food)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#f0fdf4] transition-colors text-left group"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{food.name}</p>
              <p className="text-xs text-gray-400">
                {food.brand ? `${food.brand} · ` : ''}per 100g
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className="text-xs font-mono text-gray-500">{food.calories_per_100g} kcal</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggle(food.id) }}
                className={clsx(
                  'p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all',
                  favoriteIds.has(food.id) ? 'text-red-400' : 'text-gray-300 hover:text-red-400',
                )}
              >
                <svg className="h-3.5 w-3.5" fill={favoriteIds.has(food.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </button>
        ))}
        {!loading && query.length >= 1 && !foods.length && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 mb-2">No results for "{query}"</p>
            <button onClick={onCreateFood} className="text-xs text-[#15803d] font-medium font-manrope hover:underline">
              + Create custom food
            </button>
          </div>
        )}
        {!query && (
          <p className="text-center text-xs text-gray-400 py-6 font-manrope">Type to search for foods</p>
        )}
      </div>

      <button
        onClick={onCreateFood}
        className="text-center text-xs text-gray-400 hover:text-[#15803d] transition-colors py-1 font-manrope"
      >
        Can't find it? + Create custom food
      </button>
    </div>
  )
}

// ─── Right panel — food detail + nutrient profile ────────────────────────────

function NutrientDetail({ food, mealType, existingLogId, onSuccess }: {
  food: Food
  mealType: MealType
  existingLogId?: string
  onSuccess: () => void
}) {
  const [amount, setAmount] = useState(Math.max(1, Number(food.serving_size_g) || 100))
  const [unit, setUnit] = useState('grams (g)')
  const { mutate: addItem, isPending } = useAddMealItem()

  const scale = amount / 100
  const cal = Math.round((food.calories_per_100g ?? 0) * scale)
  const protein = +((food.protein_per_100g ?? 0) * scale).toFixed(1)
  const fat = +((food.fat_per_100g ?? 0) * scale).toFixed(1)
  const carbs = +((food.carbs_per_100g ?? 0) * scale).toFixed(1)
  const fiber = +((food.fiber_per_100g ?? 0) * scale).toFixed(1)
  const sugar = +((food.sugar_per_100g ?? 0) * scale).toFixed(1)
  const sodium = +((food.sodium_per_100g ?? 0) * scale).toFixed(1)

  const caloriesGoal = 2000
  const calPct = Math.min((cal / caloriesGoal) * 100, 100)

  const handleLog = () => {
    addItem(
      { mealType, existingLogId, item: { food_id: food.id, quantity: amount, serving_unit: 'g', source: 'manual' } },
      { onSuccess },
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Food header */}
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-gray-900 font-newsreader leading-tight">{food.name}</h3>
        {food.brand && (
          <p className="text-sm text-gray-400 font-manrope mt-0.5">{food.brand}</p>
        )}
      </div>

      {/* Amount + Unit */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1">
          <label className="block text-[10px] font-semibold tracking-widest text-gray-400 uppercase font-manrope mb-1.5">
            Amount
          </label>
          <input
            type="number"
            min={1}
            max={9999}
            value={isNaN(amount) ? '' : amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
            className="w-full px-4 py-2.5 rounded-xl bg-[#f0fdf4] border border-[#dcfce7] text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#15803d]/30 focus:border-[#15803d]"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-semibold tracking-widest text-gray-400 uppercase font-manrope mb-1.5">
            Unit
          </label>
          <div className="relative">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#f0fdf4] border border-[#dcfce7] text-gray-800 font-manrope text-sm focus:outline-none focus:ring-2 focus:ring-[#15803d]/30 focus:border-[#15803d] appearance-none pr-8 cursor-pointer"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Nutrient Profile */}
      <div className="flex-1">
        <p className="text-[10px] font-semibold tracking-widest text-[#15803d] uppercase font-manrope mb-3">
          Nutrient Profile
        </p>

        {/* Calories row + progress bar */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm text-gray-500 font-manrope">Calories</span>
            <span className="text-lg font-mono font-semibold text-gray-900">
              {cal} <span className="text-xs font-normal text-gray-400">kcal</span>
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#15803d] transition-all duration-300"
              style={{ width: `${calPct}%` }}
            />
          </div>
        </div>

        {/* Macros 3-column */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'PROTEIN', value: protein, color: 'text-blue-600' },
            { label: 'FAT', value: fat, color: 'text-red-400' },
            { label: 'CARBS', value: carbs, color: 'text-gray-600' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className={clsx('text-[10px] font-semibold tracking-widest font-manrope mb-0.5', color)}>
                {label}
              </p>
              <p className="text-xl font-mono font-semibold text-gray-900 leading-none">
                {value}<span className="text-xs font-normal text-gray-400 ml-0.5">g</span>
              </p>
            </div>
          ))}
        </div>

        {/* Micronutrients 2-column table */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-gray-100 pt-3">
          {[
            { label: 'Fiber', value: `${fiber}g` },
            { label: 'Sugar', value: `${sugar}g` },
            { label: 'Sodium', value: `${sodium}mg` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-baseline">
              <span className="text-xs text-gray-400 font-manrope">{label}</span>
              <span className="text-xs font-mono font-medium text-gray-700">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
        <button
          onClick={handleLog}
          disabled={isPending}
          className="flex-[3] py-3 rounded-full bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold font-manrope transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isPending ? (
            <Spinner size="sm" />
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Log to {MEAL_LABELS[mealType]}
            </>
          )}
        </button>
        <button
          onClick={onSuccess}
          className="flex-1 py-3 rounded-full bg-[#f0fdf4] border border-[#dcfce7] text-[#15803d] text-sm font-semibold font-manrope hover:bg-[#dcfce7] transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )
}

// ─── Right panel — empty state ────────────────────────────────────────────────

function EmptyRightPanel({ mode }: { mode: EntryMode }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-[#f0fdf4] flex items-center justify-center">
        {mode === 'search' ? (
          <svg className="w-8 h-8 text-[#86efac]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-[#86efac]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )}
      </div>
      <p className="text-sm text-gray-400 font-manrope">
        {mode === 'search'
          ? 'Search and select a food to view its nutrient profile'
          : 'Upload or scan to identify your food automatically'}
      </p>
    </div>
  )
}

// ─── Root modal ───────────────────────────────────────────────────────────────

export function FoodSearchModal({ open, onClose, mealType, existingLogId }: FoodSearchModalProps) {
  const [mode, setMode] = useState<EntryMode>('search')
  const [query, setQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [createFoodOpen, setCreateFoodOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const { data: searchData, isLoading: searching } = useFoodSearch(query)
  const { data: favorites = [] } = useFoodFavorites()
  const favoriteIds = new Set(favorites.map((f) => f.id))

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  const handleClose = () => {
    setQuery('')
    setSelectedFood(null)
    setMode('search')
    onClose()
  }

  if (!open) return null

  return createPortal(
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === overlayRef.current) handleClose() }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

        {/* Modal panel */}
        <div
          role="dialog"
          aria-modal="true"
          className="relative z-10 w-full max-w-3xl flex rounded-3xl overflow-hidden shadow-2xl"
          style={{ maxHeight: '90vh' }}
        >
          {/* ── LEFT COLUMN ────────────────────────────────────── */}
          <div className="w-[44%] bg-[#f0fdf4] flex flex-col gap-4 p-6">
            {/* Title */}
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#15803d] uppercase font-manrope mb-1">
                Clinical Entry
              </p>
              <h2 className="text-2xl font-semibold text-gray-900 font-newsreader leading-tight">
                Add to Diary
              </h2>
            </div>

            {/* Mode cards */}
            <div className="flex flex-col gap-2">
              <ModeCard
                active={mode === 'barcode'}
                onClick={() => { setMode('barcode'); setSelectedFood(null) }}
                title="Scan Barcode"
                subtitle="Instant recognition via vision engine"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 6h2v12H4V6zm3 0h1v12H7V6zm2 0h2v12H9V6zm3 0h1v12h-1V6zm2 0h1v12h-1V6zm2 0h2v12h-2V6z" />
                  </svg>
                }
              />
              <ModeCard
                active={mode === 'photo'}
                onClick={() => { setMode('photo'); setSelectedFood(null) }}
                title="Photo Upload"
                subtitle="AI vision nutrient estimation"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
              <ModeCard
                active={mode === 'search'}
                onClick={() => setMode('search')}
                title="Manual Search"
                subtitle="Search the clinical database"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>

            {/* Bottom area */}
            {mode === 'search' ? (
              <ManualSearchPanel
                query={query}
                setQuery={setQuery}
                foods={searchData?.items ?? []}
                loading={searching}
                onSelect={setSelectedFood}
                favoriteIds={favoriteIds}
                onCreateFood={() => setCreateFoodOpen(true)}
              />
            ) : (
              <UploadArea mode={mode} onImageSelect={() => {}} />
            )}
          </div>

          {/* ── RIGHT COLUMN ───────────────────────────────────── */}
          <div className="flex-1 bg-white flex flex-col p-6 overflow-y-auto">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {selectedFood ? (
              <NutrientDetail
                food={selectedFood}
                mealType={mealType}
                existingLogId={existingLogId}
                onSuccess={handleClose}
              />
            ) : (
              <EmptyRightPanel mode={mode} />
            )}
          </div>
        </div>
      </div>

      <CreateFoodModal open={createFoodOpen} onClose={() => setCreateFoodOpen(false)} />
    </>,
    document.body,
  )
}
