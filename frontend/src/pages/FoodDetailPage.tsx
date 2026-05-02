import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useFoodDetail } from '@/features/food/hooks/useFood'
import { useAddMealItem, useDailyMealLogs, useCreateMealLog } from '@/features/meal-logs/hooks/useMealLogs'
import { CardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import type { Food } from '@/types/api'
import { toast } from 'sonner'
import '@/assets/food-detail.css'

export default function FoodDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: food, isLoading, error, refetch } = useFoodDetail(id || '')
  
  const [portion, setPortion] = useState(1)
  const [mealType, setMealType] = useState('breakfast')

  const { data: dailyLogs } = useDailyMealLogs()
  const { mutateAsync: createMeal } = useCreateMealLog()
  const { mutateAsync: addItem } = useAddMealItem()

  if (isLoading) return <div className="content"><CardSkeleton /></div>
  if (error || !food) return <div className="content"><ErrorState onRetry={() => refetch()} /></div>

  const handleAdd = async () => {
    try {
      const mealList = Array.isArray(dailyLogs) ? dailyLogs : (dailyLogs?.meals ?? [])
      const mealTypeUpper = mealType.toUpperCase()
      let targetLog = mealList.find((m: any) =>
        (m.mealType ?? m.meal_type ?? '').toUpperCase() === mealTypeUpper
      )

      if (!targetLog) {
        const res: any = await createMeal({ mealType, date: new Date().toISOString().split('T')[0] })
        targetLog = res?.data?.data ?? res?.data ?? res
      }

      if (targetLog?.id) {
        const qty = food.servingSizeG * portion
        await addItem({ mealLogId: targetLog.id, foodId: food.id, quantity: qty })
        toast.success('Đã thêm vào nhật ký!')
        navigate('/food-log')
      }
    } catch (err) {
      console.error(err)
      toast.error('Lỗi khi thêm thực phẩm')
    }
  }

  const images = food.imageUrls ?? []
  const mainImage = images[0] ?? '/images/foods/placeholder.png'

  return (
    <div className="food-detail-container">
      <div className="detail-breadcrumb">
        <Link to="/search-food">DIARY</Link> <span>&gt;</span> <Link to="/search-food">FOODS</Link> <span>&gt;</span> DETAIL
      </div>

      <div className="detail-main-grid">
        {/* LEFT: IMAGE GALLERY */}
        <div className="detail-gallery">
          <div className="main-image-wrap">
            <img src={mainImage} alt={food.name} className="main-image" />
            <div className="image-badges">
              {food.isVerified && <span className="badge-verified">✓ Verified</span>}
              <span className="badge-premium">Vitalis Premium</span>
            </div>
          </div>
          <div className="image-thumbs">
            {images.slice(0, 2).map((img, i) => (
              <div key={i} className="thumb-wrap">
                <img src={img} alt="" />
              </div>
            ))}
            <div className="thumb-more">+{images.length > 2 ? images.length - 2 : 4} View</div>
            <div className="thumb-video">
               <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </div>

        {/* RIGHT: CORE INFO */}
        <div className="detail-core-info">
          <h1 className="food-title">{food.name}</h1>
          <p className="food-scientific">{food.nameEn || 'Standard Nutrition'}</p>

          <div className="info-stats-row">
            <div className="info-stat">
              <label>CATEGORY</label>
              <span>{food.category || 'General'}</span>
            </div>
            <div className="info-stat">
              <label>SERVING UNIT</label>
              <span>{food.servingSizeG}{food.servingUnit} per unit</span>
            </div>
            <div className="info-stat">
              <label>FAVORITES</label>
              <span>♡ {food.favoritesCount || '1.2k'}</span>
            </div>
          </div>

          <div className="food-description">
             {food.description || 'Harvested from local farms, this product represents the pinnacle of nutritional density. Sourced with care to ensure high concentration of essential macros and micronutrients, supporting overall well-being and peak physical function.'}
          </div>

          <div className="serving-selector-box">
             <div className="serving-label">
                <label>STANDARD SERVING</label>
                <span>{food.servingSizeG}g Reference</span>
             </div>
             <div className="counter-wrap">
                <button onClick={() => setPortion(p => Math.max(0.5, p - 0.5))}>−</button>
                <input type="number" value={portion} readOnly />
                <button onClick={() => setPortion(p => p + 0.5)}>+</button>
             </div>
          </div>

          <div className="action-row">
             <button className="btn-add-diary" onClick={handleAdd}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                Add to Diary
             </button>
             <button className="btn-share">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                Share Bio-data
             </button>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="metrics-section">
        <h2 className="section-title">Vital Metrics <span>PER {food.servingSizeG}G</span></h2>
        <div className="metrics-grid">
           <div className="metric-card">
              <div className="metric-icon cals">⚡</div>
              <div className="metric-info">
                 <label>CALORIES</label>
                 <div className="metric-val">{Math.round(food.caloriesPer100g * portion)} <span>kcal</span></div>
              </div>
              <div className="metric-progress-wrap">
                 <div className="metric-progress" style={{ width: '70%', background: '#3a8f67' }}></div>
              </div>
           </div>
           <div className="metric-card">
              <div className="metric-icon protein">⚖️</div>
              <div className="metric-info">
                 <label>PROTEIN</label>
                 <div className="metric-val">{(food.proteinPer100g * portion).toFixed(1)} <span>g</span></div>
              </div>
              <div className="metric-progress-wrap">
                 <div className="metric-progress" style={{ width: '85%', background: '#f97316' }}></div>
              </div>
           </div>
           <div className="metric-card">
              <div className="metric-icon fat">💧</div>
              <div className="metric-info">
                 <label>TOTAL FAT</label>
                 <div className="metric-val">{(food.fatPer100g * portion).toFixed(1)} <span>g</span></div>
              </div>
              <div className="metric-progress-wrap">
                 <div className="metric-progress" style={{ width: '40%', background: '#3a8f67' }}></div>
              </div>
           </div>
        </div>
      </div>

      {/* CLINICAL PROFILE */}
      <div className="clinical-section">
         <div className="clinical-header">
            <h3>Clinical Nutritional Profile</h3>
            <span className="clinical-badge">BIOLOGICAL STANDARDS COMPLIANCE</span>
         </div>
         <div className="clinical-grid">
            <div className="clinical-item">
               <label>Carbohydrates</label>
               <span>{(food.carbsPer100g * portion).toFixed(1)}g</span>
            </div>
            <div className="clinical-item">
               <label>Sodium</label>
               <span>{((food.sodiumPer100g || 0) * portion).toFixed(0)}mg</span>
            </div>
            <div className="clinical-item">
               <label>Fiber</label>
               <span>{((food.fiberPer100g || 0) * portion).toFixed(1)}g</span>
            </div>
            <div className="clinical-item">
               <label>Cholesterol</label>
               <span>{((food.cholesterolPer100g || 0) * portion).toFixed(0)}mg</span>
            </div>
            <div className="clinical-item">
               <label>Sugar</label>
               <span>{((food.sugarPer100g || 0) * portion).toFixed(1)}g</span>
            </div>
            <div className="clinical-item">
               <label>Potassium</label>
               <span>363mg</span>
            </div>
            <div className="clinical-item">
               <label>Trans Fat</label>
               <span>0.0g</span>
            </div>
            <div className="clinical-item">
               <label>Magnesium</label>
               <span>27mg</span>
            </div>
         </div>
         <div className="clinical-footer">
            <div className="footer-meta">📅 CREATED: 2024-05-12</div>
            <div className="footer-meta">⌘ TYPE: {food.foodType?.toUpperCase() || 'PRODUCT'}</div>
            <div className="footer-meta status-verified">✓ ACTIVE STATUS: VERIFIED</div>
            <div className="footer-meta">🔒 CUSTOM STATUS: FALSE</div>
         </div>
      </div>
    </div>
  )
}
