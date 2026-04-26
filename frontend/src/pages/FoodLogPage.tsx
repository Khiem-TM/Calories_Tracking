import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { ListSkeleton } from '@/components/common/LoadingSkeleton'
import { useDailyMealLogs } from '@/features/meal-logs/hooks/useMealLogs'
import type { MealLog } from '@/types/api'
import '@/assets/foodlog.css'

const MEAL_TYPES = [
  { id: 'breakfast', name: 'Bữa sáng', emoji: '🌅', goal: 550 },
  { id: 'lunch', name: 'Bữa trưa', emoji: '☀️', goal: 700 },
  { id: 'snack', name: 'Bữa phụ', emoji: '🍊', goal: 200 },
  { id: 'dinner', name: 'Bữa tối', emoji: '🌙', goal: 750 },
]

function formatDate(d: Date) { return d.toISOString().split('T')[0] }

// Helper function to extract emoji or use default
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

export default function FoodLogPage() {
  const [date, setDate] = useState(new Date())
  const navigate = useNavigate()
  
  const dateStr = formatDate(date)
  const isToday = dateStr === formatDate(new Date())

  const { data: meals, isLoading } = useDailyMealLogs(dateStr)

  const mealList: MealLog[] = Array.isArray(meals) ? meals : (meals?.meals ?? [])

  const prevDay = () => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d) }
  const nextDay = () => { if (!isToday) { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d) } }

  const groupedMeals = MEAL_TYPES.map(type => {
    const mealLogs = mealList.filter(m => m.mealType === type.id)
    // Flatten items from all meal logs of this type (if there are multiple)
    const items = mealLogs.flatMap(m => m.items || [])
    const totalCals = items.reduce((sum, item) => sum + (item.calories ?? 0), 0)
    return {
      ...type,
      logs: mealLogs,
      items,
      totalCals
    }
  })

  // Summary calculations
  const totalCalories = groupedMeals.reduce((sum, m) => sum + m.totalCals, 0)
  const goalCalories = 2200
  const remainingCals = Math.max(goalCalories - totalCalories, 0)
  
  const allItems = groupedMeals.flatMap(m => m.items)
  const totalCarbs = allItems.reduce((sum, item) => sum + (item.carbs ?? 0), 0)
  const totalProtein = allItems.reduce((sum, item) => sum + (item.protein ?? 0), 0)
  const totalFat = allItems.reduce((sum, item) => sum + (item.fat ?? 0), 0)

  // Donut chart calculations
  const percent = Math.min((totalCalories / goalCalories) * 100, 100)
  const strokeDash = (percent / 100) * 301
  const displayDateText = isToday ? 'Hôm nay' : date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Nhật ký ăn uống</h1>
          <p>Theo dõi toàn bộ bữa ăn trong ngày</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost2 btn-sm" onClick={prevDay}>← Hôm qua</button>
          <div className="date-badge" id="date-display">{displayDateText}</div>
          <button className="btn btn-ghost2 btn-sm" disabled={isToday} style={{ opacity: isToday ? 0.3 : 1 }} onClick={nextDay}>Ngày mai →</button>
          <Link to={`/search-food?date=${dateStr}`} className="btn btn-ghost2 btn-sm">+ Nhập bữa ăn</Link>
          <Link to="/ai-scan" className="btn btn-ghost2 btn-sm" style={{ gap: 5 }}><Camera size={14}/> AI Scan</Link>
          <Link to="/create-food" className="btn btn-primary btn-sm">+ Thêm thực phẩm</Link>
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
          {/* LEFT: Meal log */}
          <div>
            {groupedMeals.map((mealGroup, idx) => (
              <div key={mealGroup.id} className="meal-section fade-up" style={{ animationDelay: `${idx * 0.04}s` }}>
                <div className="meal-section-header">
                  <div className="meal-section-title">{mealGroup.emoji} {mealGroup.name}</div>
                  <div className="meal-section-kcal">{mealGroup.totalCals} / {mealGroup.goal} kcal</div>
                </div>
                <div className="meal-section-body">
                  {mealGroup.items.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      Chưa có thực phẩm nào được ghi.
                    </div>
                  ) : (
                    mealGroup.items.map(item => (
                      <div className="food-row" key={item.id}>
                        <div className="food-emoji">{getFoodEmoji(item.food?.name ?? '')}</div>
                        <div className="food-info">
                          <div className="food-name">{item.food?.name}</div>
                          <div className="food-detail">{item.quantity}g</div>
                        </div>
                        <div className="food-macros">
                          <div className="macro-chip"><div className="val">{item.carbs}g</div><div className="lbl">Carbs</div></div>
                          <div className="macro-chip"><div className="val">{item.protein}g</div><div className="lbl">Protein</div></div>
                          <div className="macro-chip"><div className="val">{item.fat}g</div><div className="lbl">Fat</div></div>
                        </div>
                        <div className="food-kcal-big">{item.calories} kcal</div>
                        <button className="delete-btn" title="Xoá thực phẩm này">✕</button>
                      </div>
                    ))
                  )}
                  <button 
                    className="add-food-btn" 
                    onClick={() => navigate(`/search-food?mealType=${mealGroup.id}&date=${dateStr}`)}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    Thêm thực phẩm vào {mealGroup.name.toLowerCase()}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Summary */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card fade-up" style={{ marginBottom: 16 }}>
              <div className="card-header"><span className="card-title">Tổng ngày hôm nay</span></div>
              <div className="card-pad">
                <div style={{ textAlign: 'center', marginBottom: 16, position: 'relative', display: 'inline-block', left: '50%', transform: 'translateX(-50%)' }}>
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r="48" fill="none" stroke="#eef8f2" strokeWidth="12"/>
                    <circle cx="60" cy="60" r="48" fill="none" stroke="#3a8f67" strokeWidth="12"
                      strokeDasharray={`${strokeDash} 301`} strokeLinecap="round"/>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: 'var(--green-dark)', lineHeight: 1 }}>{totalCalories}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ {goalCalories} kcal</span>
                  </div>
                </div>
                <div className="summary-row"><span className="summary-label">Còn lại</span><span className="summary-val" style={{ color: 'var(--green-accent)' }}>{remainingCals} kcal</span></div>
                <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }}></div>
                <div className="summary-row"><span className="summary-label">Carbs</span><span className="summary-val">{totalCarbs.toFixed(0)} / 260g</span></div>
                <div className="summary-row"><span className="summary-label">Protein</span><span className="summary-val">{totalProtein.toFixed(0)} / 125g</span></div>
                <div className="summary-row"><span className="summary-label">Fat</span><span className="summary-val">{totalFat.toFixed(0)} / 70g</span></div>
                <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }}></div>
                <div className="summary-row"><span className="summary-label">Calories đốt</span><span className="summary-val" style={{ color: 'var(--green-accent)' }}>- 540 kcal</span></div>
                <div className="summary-row"><span className="summary-label">Calories thực</span><span className="summary-val">{Math.max(totalCalories - 540, 0)} kcal</span></div>
              </div>
            </div>

            <div className="card fade-up" style={{ animationDelay: '.1s' }}>
              <div className="card-header"><span className="card-title">Vi chất nổi bật</span></div>
              <div className="card-pad">
                <div className="summary-row"><span className="summary-label">Vitamin C</span><span className="summary-val">82 / 90mg</span></div>
                <div style={{ margin: '4px 0 10px' }}><div className="prog-bar"><div className="prog-fill" style={{ width: '91%' }}></div></div></div>
                <div className="summary-row"><span className="summary-label">Canxi</span><span className="summary-val">620 / 1000mg</span></div>
                <div style={{ margin: '4px 0 10px' }}><div className="prog-bar"><div className="prog-fill orange" style={{ width: '62%' }}></div></div></div>
                <div className="summary-row"><span className="summary-label">Sắt</span><span className="summary-val">11 / 18mg</span></div>
                <div style={{ margin: '4px 0 10px' }}><div className="prog-bar"><div className="prog-fill red" style={{ width: '61%' }}></div></div></div>
                <div className="summary-row"><span className="summary-label">Chất xơ</span><span className="summary-val">18 / 30g</span></div>
                <div style={{ margin: '4px 0 0' }}><div className="prog-bar"><div className="prog-fill blue" style={{ width: '60%' }}></div></div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
