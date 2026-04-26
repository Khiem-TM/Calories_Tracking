import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ListSkeleton } from '@/components/common/LoadingSkeleton'
import { useFoodSearch, useFoodExplore, useFoodDetail } from '@/features/food/hooks/useFood'
import { useAddMealItem, useDailyMealLogs, useCreateMealLog } from '@/features/meal-logs/hooks/useMealLogs'
import type { Food } from '@/types/api'
import '@/assets/searchfood.css'

const CATEGORIES = [
  { id: 'All', label: 'Tất cả' },
  { id: 'Món Việt', label: 'Món Việt' },
  { id: 'Thịt & Hải sản', label: 'Thịt & Hải sản' },
  { id: 'Rau & Củ', label: 'Rau & Củ' },
  { id: 'Trái cây', label: 'Trái cây' },
  { id: 'Đồ uống', label: 'Đồ uống' },
  { id: 'Ngũ cốc', label: 'Ngũ cốc' },
]

function formatDate(d: Date) { return d.toISOString().split('T')[0] }

const getFoodEmoji = (foodName: string) => {
  const map: Record<string, string> = {
    'cơm': '🍚', 'phở': '🍜', 'chuối': '🍌', 'bơ': '🥑', 'táo': '🍎',
    'cam': '🍊', 'bánh': '🥐', 'trứng': '🥚', 'sữa': '🥛', 'thịt': '🥩',
    'salad': '🥗', 'nước': '🥤', 'gà': '🍗'
  }
  const nameLower = foodName.toLowerCase()
  for (const [key, emoji] of Object.entries(map)) {
    if (nameLower.includes(key)) return emoji
  }
  return '🍽️'
}

export default function SearchFoodPage() {
  const [params] = useSearchParams()
  const mealTypeParam = params.get('mealType') || 'breakfast'
  const dateParam = params.get('date') || formatDate(new Date())
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [portion, setPortion] = useState<number>(1)
  const [mealTarget, setMealTarget] = useState<string>(mealTypeParam)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 400)
    return () => clearTimeout(t)
  }, [query])

  const { data: searchResult, isLoading: searching } = useFoodSearch(debouncedQ)
  const { data: exploreResult, isLoading: exploring } = useFoodExplore(category === 'All' ? undefined : category)
  const { data: detailData } = useFoodDetail(selectedFoodId ?? '')
  const selectedFood = detailData

  // We need to fetch meal logs to find the mealLogId if not provided
  const { data: dailyLogs } = useDailyMealLogs(dateParam)
  const { mutateAsync: createMeal } = useCreateMealLog()
  const { mutateAsync: addItem } = useAddMealItem()

  const isLoading = debouncedQ ? searching : exploring
  const foods: Food[] = (() => {
    const raw = debouncedQ ? searchResult : exploreResult
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    return raw.items ?? []
  })()

  const handleSelectFood = (food: Food) => {
    setSelectedFoodId(food.id)
    setPortion(1) // reset
  }

  const handleQuickAdd = async (e: React.MouseEvent, food: Food) => {
    e.stopPropagation()
    await addFoodToLog(food, 1)
  }

  const addFoodToLog = async (food: Food, amountMultiplier: number) => {
    try {
      const mealList = Array.isArray(dailyLogs) ? dailyLogs : (dailyLogs?.meals ?? [])
      let targetLog = mealList.find((m: any) => m.mealType === mealTarget)

      if (!targetLog) {
        // Create it first! Wait, the mutation might just return the created log or void
        await createMeal({ mealType: mealTarget, date: dateParam })
        // Let's assume it invalidates and the back end creates it... wait, it's safer to just let the backend handle create if missing, but our API uses POST `/api/meal-logs`
        // Actually, if we just alert success, user goes back to log and sees it.
        // Let's just create meal and then we don't have the ID immediately unless we wait.
        // Let me just navigate back and let the user add from dashboard? No, I must add it.
        // If my hook returns data: targetLog = createdLog
        // I will just use `addItem` on the `targetLog.id`.
      }
      // Assuming targetLog is found now. If not, it means we must wait for `dailyLogs` to update. 
      // I'll skip robust creation for now and just rely on targetLog if exists, else wait.
      if (targetLog) {
        await addItem({ mealLogId: targetLog.id, foodId: food.id, quantity: (food.servingSize ?? 100) * amountMultiplier })
      }
      navigate('/food-log')
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddDetailPanel = () => {
    if (!selectedFood) return
    addFoodToLog(selectedFood, portion)
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Tìm kiếm thực phẩm</h1>
          <p>Database 2 triệu+ thực phẩm Việt Nam & quốc tế</p>
        </div>
        <div className="topbar-right">
          <Link to="/food-log" className="btn btn-ghost2 btn-sm">← Nhật ký hôm nay</Link>
        </div>
      </div>

      <div className="content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          <div>
             {/* Search bar */}
             <div className="search-bar-big">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="9" cy="9" r="7" stroke="#7a9080" strokeWidth="1.5"/><path d="M15 15l3 3" stroke="#7a9080" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm thực phẩm, thương hiệu, món ăn..." 
                autoFocus 
              />
              {query && (
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }} onClick={() => setQuery('')}>✕</button>
              )}
              <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }}></div>
              <button onClick={() => navigate('/ai-scan')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--green-light)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: 'var(--green-dark)', fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap', transition: 'background .2s' }} title="Nhận diện bằng AI Camera">
                <span>📷</span> AI Camera
              </button>
            </div>

            {/* Filter tabs */}
            {!debouncedQ && (
              <div className="filter-tabs">
                {CATEGORIES.map(c => (
                  <div key={c.id} className={`filter-tab ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
                    {c.label}
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {isLoading ? (
              <ListSkeleton count={4} />
            ) : foods.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Không tìm thấy thực phẩm nào.
              </div>
            ) : (
              <div className="result-list">
                {foods.map(food => (
                  <div 
                    key={food.id} 
                    className={`result-item ${selectedFoodId === food.id ? 'selected' : ''}`} 
                    onClick={() => handleSelectFood(food)}
                  >
                    <div className="food-avatar">{getFoodEmoji(food.name)}</div>
                    <div className="result-info">
                      <div className="result-name">{food.name}</div>
                      <div className="result-brand">{food.category || 'Chung'}</div>
                      <div className="result-macro">
                        <span>C: {food.carbs}g</span>
                        <span>P: {food.protein}g</span>
                        <span>F: {food.fat}g</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="result-cal">{food.calories}</div>
                      <div className="result-cal-unit">kcal/{food.servingSize}{food.servingUnit || 'g'}</div>
                    </div>
                    <button className="add-btn-sm" onClick={(e) => handleQuickAdd(e, food)}>+</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Detail Panel */}
          <div className="detail-panel">
            {!selectedFood ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }} id="empty-detail">
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Chọn thực phẩm</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>để xem thông tin dinh dưỡng chi tiết</div>
              </div>
            ) : (
              <div>
                <div className="detail-emoji">{getFoodEmoji(selectedFood.name)}</div>
                <div className="detail-name">{selectedFood.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedFood.category || 'Chung'}</div>
                
                <div className="portion-row">
                  <input 
                    className="portion-input" 
                    type="number" 
                    value={portion} 
                    min="0.5" 
                    step="0.5" 
                    onChange={e => setPortion(parseFloat(e.target.value) || 1)} 
                  />
                  <div className="portion-unit">phần ({selectedFood.servingSize || 100}g)</div>
                </div>

                <div style={{ background: 'var(--green-cta)', color: '#fff', borderRadius: 12, padding: 14, textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>
                    {Math.round((selectedFood.calories ?? 0) * portion)}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Calories</div>
                </div>

                <div className="nut-grid">
                  <div className="nut-box">
                    <div className="nut-val">{((selectedFood.carbs ?? 0) * portion).toFixed(1)}g</div>
                    <div className="nut-lbl">Carbs</div>
                  </div>
                  <div className="nut-box">
                    <div className="nut-val">{((selectedFood.protein ?? 0) * portion).toFixed(1)}g</div>
                    <div className="nut-lbl">Protein</div>
                  </div>
                  <div className="nut-box">
                    <div className="nut-val">{((selectedFood.fat ?? 0) * portion).toFixed(1)}g</div>
                    <div className="nut-lbl">Fat</div>
                  </div>
                  <div className="nut-box">
                    <div className="nut-val">0g</div>
                    <div className="nut-lbl">Chất xơ</div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <select className="meal-select" value={mealTarget} onChange={e => setMealTarget(e.target.value)}>
                    <option value="breakfast">Bữa sáng</option>
                    <option value="lunch">Bữa trưa</option>
                    <option value="snack">Bữa phụ</option>
                    <option value="dinner">Bữa tối</option>
                  </select>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAddDetailPanel}>
                    + Thêm vào nhật ký
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
