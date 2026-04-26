import { useParams, useNavigate } from 'react-router-dom'
import { Heart, ArrowLeft } from 'lucide-react'
import { AnimatedPage } from '@/components/common/AnimatedPage'
import { CardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFoodDetail, useFoodIngredients, useFoodRecipe, useToggleFavorite } from '@/features/food/hooks/useFood'

export default function FoodDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: food, isLoading, error, refetch } = useFoodDetail(id!)
  const { data: ingredients } = useFoodIngredients(id!)
  const { data: recipe } = useFoodRecipe(id!)
  const { mutate: toggleFav } = useToggleFavorite()

  if (isLoading) return <CardSkeleton />
  if (error) return <ErrorState onRetry={() => refetch()} />
  if (!food) return null

  const macros = [
    { label: 'Calories', value: `${food.calories} kcal`, color: '#1e4d35' },
    { label: 'Protein', value: `${food.protein}g`, color: '#3a8f67' },
    { label: 'Carbs', value: `${food.carbs}g`, color: '#f4a62a' },
    { label: 'Fat', value: `${food.fat}g`, color: '#e05c5c' },
  ]

  return (
    <AnimatedPage>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Back + favorite */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium hover:underline"
            style={{ color: '#3a8f67' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={() => toggleFav({ id: food.id, isFav: false })}
            className="p-2 rounded-xl hover:bg-green-light transition-colors"
            style={{ color: '#7a9080' }}
          >
            <Heart size={18} />
          </button>
        </div>

        {/* Food header */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 16px rgba(30,77,53,0.07)' }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: '#d4eddf' }}>
              🍎
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1a3829' }}>
                {food.name}
              </h2>
              {food.category && (
                <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{ backgroundColor: '#d4eddf', color: '#1e4d35' }}>
                  {food.category}
                </span>
              )}
              <p className="text-sm mt-1" style={{ color: '#7a9080' }}>
                Per {food.servingSize ?? 100}{food.servingUnit ?? 'g'}
              </p>
            </div>
          </div>

          {/* Macro grid */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {macros.map((m) => (
              <div key={m.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: '#f8faf9' }}>
                <p className="text-base font-bold" style={{ color: m.color, fontFamily: 'Playfair Display, serif' }}>
                  {m.value}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: '#7a9080' }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">Nutrition</TabsTrigger>
            {ingredients && <TabsTrigger value="ingredients" className="flex-1">Ingredients</TabsTrigger>}
            {recipe && <TabsTrigger value="recipe" className="flex-1">Recipe</TabsTrigger>}
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: '0 2px 16px rgba(30,77,53,0.07)' }}>
              {[
                { label: 'Calories', value: `${food.calories} kcal` },
                { label: 'Protein', value: `${food.protein}g` },
                { label: 'Carbohydrates', value: `${food.carbs}g` },
                { label: 'Fat', value: `${food.fat}g` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: '#f0f4f2' }}>
                  <span className="text-sm" style={{ color: '#7a9080' }}>{row.label}</span>
                  <span className="text-sm font-semibold" style={{ color: '#3d4d44' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          {ingredients && (
            <TabsContent value="ingredients" className="mt-4">
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 16px rgba(30,77,53,0.07)' }}>
                <p className="text-sm" style={{ color: '#3d4d44' }}>{JSON.stringify(ingredients)}</p>
              </div>
            </TabsContent>
          )}

          {recipe && (
            <TabsContent value="recipe" className="mt-4">
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 16px rgba(30,77,53,0.07)' }}>
                <p className="text-sm" style={{ color: '#3d4d44' }}>{JSON.stringify(recipe)}</p>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <Button
          className="w-full rounded-full text-white font-semibold h-11"
          style={{ backgroundColor: '#1e4d35' }}
          onClick={() => navigate('/food-log')}
        >
          Add to Meal Log
        </Button>
      </div>
    </AnimatedPage>
  )
}
