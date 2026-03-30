import { useState } from 'react'
import { clsx } from 'clsx'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useFoodSearch } from '../hooks/useFoodSearch'
import { useAddMealItem } from '../hooks/useAddMealItem'
import { useFoodFavorites } from '../hooks/useFoodFavorites'
import { useToggleFavorite } from '../hooks/useToggleFavorite'
import { CreateFoodModal } from './CreateFoodModal'
import type { Food, MealType } from '@/types'

interface FoodSearchModalProps {
  open: boolean
  onClose: () => void
  mealType: MealType
  existingLogId?: string
}

function HeartButton({ food, isFavorite }: { food: Food; isFavorite: boolean }) {
  const { mutate: toggle, isPending } = useToggleFavorite(isFavorite)
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); toggle(food.id) }}
      disabled={isPending}
      className={clsx(
        'p-1.5 rounded-full transition-colors',
        isFavorite ? 'text-red-500 hover:text-red-600' : 'text-slate-300 hover:text-red-400',
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  )
}

function FoodResultRow({
  food,
  onSelect,
  favoriteIds,
}: {
  food: Food
  onSelect: (food: Food) => void
  favoriteIds: Set<string>
}) {
  const isFavorite = favoriteIds.has(food.id)
  return (
    <div className="flex items-center gap-1 group">
      <button
        onClick={() => onSelect(food)}
        className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
      >
        <div>
          <p className="text-sm font-medium text-slate-700">{food.name}</p>
          <p className="text-xs text-slate-400">
            {food.brand ? `${food.brand} · ` : ''}per 100g
          </p>
        </div>
        <span className="text-sm text-slate-500 ml-3 shrink-0">
          {food.calories_per_100g} kcal
        </span>
      </button>
      <HeartButton food={food} isFavorite={isFavorite} />
    </div>
  )
}

function FoodDetail({
  food,
  mealType,
  existingLogId,
  onSuccess,
}: {
  food: Food
  mealType: MealType
  existingLogId?: string
  onSuccess: () => void
}) {
  const [grams, setGrams] = useState(Math.max(1, Number(food.serving_size_g) || 100))
  const { mutate: addItem, isPending } = useAddMealItem()

  const safeGrams = isNaN(grams) || grams < 1 ? 1 : grams
  const scale = safeGrams / 100
  const preview = {
    calories: Math.round((food.calories_per_100g ?? 0) * scale),
    protein: Math.round((food.protein_per_100g ?? 0) * scale),
    carbs: Math.round((food.carbs_per_100g ?? 0) * scale),
    fat: Math.round((food.fat_per_100g ?? 0) * scale),
    fiber: Math.round((food.fiber_per_100g ?? 0) * scale),
  }

  const handleAdd = () => {
    const quantity = isNaN(grams) || grams < 1 ? 1 : grams
    addItem(
      {
        mealType,
        existingLogId,
        item: { food_id: food.id, quantity, serving_unit: 'g', source: 'manual' },
      },
      { onSuccess },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-slate-800">{food.name}</h3>
        {food.brand && <p className="text-sm text-slate-400">{food.brand}</p>}
      </div>

      <Input
        label="Amount (grams)"
        type="number"
        min={1}
        max={9999}
        value={isNaN(grams) ? '' : grams}
        onChange={(e) => {
          const val = Number(e.target.value)
          setGrams(isNaN(val) ? 1 : Math.max(1, val))
        }}
      />

      <div className="grid grid-cols-5 gap-2 text-center text-xs">
        {Object.entries(preview).map(([key, val]) => (
          <div key={key} className="bg-slate-50 rounded-lg p-2">
            <div className="font-semibold text-slate-700">{val}</div>
            <div className="text-slate-400 capitalize">{key === 'calories' ? 'kcal' : `${key}g`}</div>
          </div>
        ))}
      </div>

      <Button onClick={handleAdd} loading={isPending} className="w-full">
        Add to {mealType.charAt(0) + mealType.slice(1).toLowerCase()}
      </Button>
    </div>
  )
}

type SearchTab = 'search' | 'favorites'

export function FoodSearchModal({ open, onClose, mealType, existingLogId }: FoodSearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [activeTab, setActiveTab] = useState<SearchTab>('search')
  const [createFoodOpen, setCreateFoodOpen] = useState(false)

  const { data: searchData, isLoading: searching } = useFoodSearch(query)
  const { data: favorites = [], isLoading: loadingFavs } = useFoodFavorites()

  const favoriteIds = new Set(favorites.map((f) => f.id))

  const displayItems = activeTab === 'favorites' ? favorites : (searchData?.items ?? [])
  const isLoading = activeTab === 'favorites' ? loadingFavs : searching

  const handleClose = () => {
    setQuery('')
    setSelectedFood(null)
    setActiveTab('search')
    onClose()
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title={selectedFood ? 'Add Food' : 'Search Food'}
        size="md"
      >
        {selectedFood ? (
          <div>
            <button
              onClick={() => setSelectedFood(null)}
              className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to search
            </button>
            <FoodDetail
              food={selectedFood}
              mealType={mealType}
              existingLogId={existingLogId}
              onSuccess={handleClose}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Tab switcher */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('search')}
                className={clsx(
                  'flex-1 py-1.5 text-sm font-medium rounded-md transition-colors',
                  activeTab === 'search' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700',
                )}
              >
                Search
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={clsx(
                  'flex-1 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1',
                  activeTab === 'favorites' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700',
                )}
              >
                <svg className="h-3.5 w-3.5" fill={activeTab === 'favorites' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favorites
              </button>
            </div>

            {activeTab === 'search' && (
              <Input
                placeholder="Search foods..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                prefix={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            )}

            <div className="max-h-72 overflow-y-auto -mx-2 px-2">
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              )}
              {!isLoading && displayItems.map((food) => (
                <FoodResultRow
                  key={food.id}
                  food={food}
                  onSelect={setSelectedFood}
                  favoriteIds={favoriteIds}
                />
              ))}
              {!isLoading && activeTab === 'search' && query.length >= 1 && !displayItems.length && (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400 mb-3">No foods found for "{query}"</p>
                  <button
                    onClick={() => setCreateFoodOpen(true)}
                    className="text-sm text-brand font-medium hover:underline"
                  >
                    + Create custom food
                  </button>
                </div>
              )}
              {!isLoading && activeTab === 'favorites' && !displayItems.length && (
                <p className="text-center text-sm text-slate-400 py-8">No favorites yet — heart a food to save it here</p>
              )}
              {activeTab === 'search' && !query && (
                <p className="text-center text-sm text-slate-400 py-8">Type to search for foods</p>
              )}
            </div>

            {activeTab === 'search' && (
              <div className="border-t border-slate-100 pt-2 -mx-1">
                <button
                  onClick={() => setCreateFoodOpen(true)}
                  className="w-full text-center text-xs text-slate-400 hover:text-brand transition-colors py-1"
                >
                  Can't find what you're looking for? + Create custom food
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <CreateFoodModal open={createFoodOpen} onClose={() => setCreateFoodOpen(false)} />
    </>
  )
}
