import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDailyMealLogs, useDeleteMealItem } from '@/features/meal-logs/hooks/useMealLogs'
import { useDailyDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useActivityLogs, useLogWater } from '@/features/activity-logs/hooks/useActivityLogs'
import { ListSkeleton } from '@/components/common/LoadingSkeleton'
import type { MealLog } from '@/types/api'
import '@/assets/foodlog.css'

function formatDate(d: Date) { return d.toISOString().split('T')[0] }
function getViDateFull(d: Date) {
  return `Hôm nay, ${d.getDate()} Th${d.getMonth() + 1 < 10 ? 'g ' + (d.getMonth() + 1) : 'g ' + (d.getMonth() + 1)}`
}
function formatDateHeader(d: Date) {
  const isToday = formatDate(d) === formatDate(new Date())
  if (isToday) return `Hôm nay, ${d.getDate()} Th${d.getMonth() + 1}`
  return `${d.getDate()} Tháng ${d.getMonth() + 1}`
}

const MEAL_TYPES = [
  { id: 'BREAKFAST', name: 'Bữa sáng', emoji: '🌅', bg: '#fff7ed', targetMin: 400, targetMax: 500 },
  { id: 'LUNCH', name: 'Bữa trưa', emoji: '☀️', bg: '#fffbeb', targetMin: 500, targetMax: 700 },
  { id: 'SNACK', name: 'Bữa phụ', emoji: '🌿', bg: '#f0fbf5', targetMin: 100, targetMax: 200 },
  { id: 'DINNER', name: 'Bữa tối', emoji: '🌙', bg: '#f0f4ff', targetMin: 400, targetMax: 600 },
]

export default function FoodLogPage() {
  const [date, setDate] = useState(new Date())
  const navigate = useNavigate()
  const dateStr = formatDate(date)
  const isToday = dateStr === formatDate(new Date())

  const { data: meals, isLoading } = useDailyMealLogs(dateStr)
  const { data: dashboardData } = useDailyDashboard(dateStr)
  const { data: activityData } = useActivityLogs(dateStr)
  const { mutate: deleteItem } = useDeleteMealItem()

  const mealList: MealLog[] = Array.isArray(meals) ? meals : ((meals as any)?.meals ?? [])

  const prevDay = () => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d) }
  const nextDay = () => { if (!isToday) { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d) } }

  // Group by meal type
  const groupedMeals = MEAL_TYPES.map(type => {
    const logs = mealList.filter(m => {
      const mt = (m.mealType ?? (m as any).meal_type ?? '').toUpperCase()
      return mt === type.id
    })
    const items = logs.flatMap(m => m.items ?? [])
    const totalCals = Math.round(items.reduce((s, i) => s + ((i as any).calories ?? (i as any).calories_snapshot ?? 0), 0))
    return { ...type, logs, items, totalCals }
  })

  // Summary data
  const d: any = dashboardData ?? {}
  const goalCalories = d.calorieGoal ?? 2000
  const totalEaten = Math.round(d.totalCalories ?? 0)
  const calsBurned = activityData?.caloriesBurned ?? 0
  const remaining = Math.max(goalCalories - totalEaten, 0)
  const carbGoal = d.carbsGoal ?? Math.round((goalCalories * 0.5) / 4)
  const proGoal = d.proteinGoal ?? Math.round((goalCalories * 0.2) / 4)
  const fatGoal = d.fatGoal ?? Math.round((goalCalories * 0.3) / 9)
  const carbTotal = Math.round(d.totalCarbs ?? 0)
  const proTotal = Math.round(d.totalProtein ?? 0)
  const fatTotal = Math.round(d.totalFat ?? 0)

  const waterMl = activityData?.waterMl ?? 0
  const waterGlasses = Math.floor(waterMl / 250)
  const waterGoal = d.waterGoal ?? 8

  // Donut for energy overview (green ring)
  const R = 66
  const C2 = 2 * Math.PI * R
  const eaten_pct = goalCalories > 0 ? Math.min(totalEaten / goalCalories, 1) : 0
  const eatenStroke = eaten_pct * C2
  const { mutate: logWater } = useLogWater()

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div className="fl-topbar">
        <div className="fl-topbar-left">
          <button className="fl-nav-btn" onClick={prevDay}>‹</button>
          <div className="fl-date-info">
            <div className="fl-date-main">{formatDateHeader(date)}</div>
            <div className="fl-date-sub">Nhật ký ăn uống</div>
          </div>
          <button className="fl-nav-btn" onClick={nextDay} disabled={isToday} style={{ opacity: isToday ? 0.3 : 1 }}>›</button>
          <button className="fl-calendar-btn" title="Chọn ngày">
            <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
              <rect x=".75" y="1.75" width="13.5" height="12.5" rx="2.25" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M5 .75v2M10 .75v2M.75 5.75h13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="fl-topbar-right">
          <button className="fl-btn-add" onClick={() => navigate(`/search-food?date=${dateStr}`)}>
            + Thêm bữa ăn
          </button>
          <button className="fl-btn-scan" onClick={() => navigate('/ai-scan')}>
            📷 Quét AI
          </button>
        </div>
      </div>

      {/* ===== BODY ===== */}
      {isLoading ? (
        <div style={{ padding: '20px 28px' }}><ListSkeleton count={4} /></div>
      ) : (
        <div className="fl-body">
          {/* LEFT: Meal cards */}
          <div>
            {groupedMeals.map((mg, idx) => (
              <div key={mg.id} className="fl-meal-card fade-up" style={{ animationDelay: `${idx * 0.06}s` }}>
                <div className="fl-meal-header">
                  <div className="fl-meal-header-left">
                    <div className="fl-meal-emoji" style={{ background: mg.bg }}>
                      {mg.emoji}
                    </div>
                    <div>
                      <div className="fl-meal-type-name">{mg.name}</div>
                      <div className="fl-meal-target">Mục tiêu: {mg.targetMin} - {mg.targetMax} kcal</div>
                    </div>
                  </div>
                  <div className="fl-meal-header-right">
                    <div className="fl-meal-total-kcal">{mg.totalCals} kcal</div>
                    <Link
                      to={`/search-food?mealType=${mg.id.toLowerCase()}&date=${dateStr}`}
                      className="fl-add-food-link"
                    >
                      Thêm thực phẩm
                    </Link>
                  </div>
                </div>

                {mg.items.length > 0 && (
                  <div className="fl-food-items">
                    {mg.items.map((item: any) => {
                      const food = item.food ?? {}
                      const qty = item.quantity ?? item.quantity_in_grams ?? 0
                      const unit = item.serving_unit ?? 'g'
                      const cals = Math.round(item.calories ?? item.calories_snapshot ?? 0)
                      const carbG = Math.round(item.carbs ?? item.carbs_snapshot ?? 0)
                      const fatG = Math.round(item.fat ?? item.fat_snapshot ?? 0)
                      const proG = Math.round(item.protein ?? item.protein_snapshot ?? 0)
                      const imgUrl = food.image_urls?.[0] ?? food.imageUrl ?? null

                      return (
                        <div className="fl-food-item" key={item.id}>
                          <div className="fl-food-img">
                            {imgUrl
                              ? <img src={imgUrl} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ fontSize: 20 }}>🍽️</span>
                            }
                          </div>
                          <div className="fl-food-name-col">
                            <div className="fl-food-name">{food.name ?? 'Thực phẩm'}</div>
                            <div className="fl-food-portion">
                              {qty}{unit} • {cals} kcal
                            </div>
                          </div>
                          <div className="fl-food-macros-col">
                            <div className="fl-macro-label">Macros</div>
                            <div className="fl-macro-values">
                              <span>{carbG}C</span> • <span>{fatG}F</span> • <span>{proG}P</span>
                            </div>
                          </div>
                          <button
                            className="fl-remove-btn"
                            onClick={() => deleteItem({ mealLogId: mg.logs[0]?.id ?? '', itemId: item.id })}
                            title="Xóa"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT: Sidebar */}
          <div className="fl-sidebar">
            {/* Energy overview */}
            <div className="fl-sidebar-card fade-up" style={{ animationDelay: '.08s' }}>
              <div className="fl-sb-title">Tổng quan năng lượng</div>
              <div className="fl-energy-donut-wrap">
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="80" cy="80" r={R} fill="none" stroke="#e8f3ed" strokeWidth="14" />
                  <circle cx="80" cy="80" r={R} fill="none" stroke="#1a3829" strokeWidth="14"
                    strokeDasharray={`${eatenStroke} ${C2}`} strokeLinecap="round" />
                </svg>
                <div className="fl-donut-center">
                  <div className="fl-donut-remain">{remaining.toLocaleString()}</div>
                  <div className="fl-donut-remain-label">Còn lại</div>
                </div>
              </div>
              <div className="fl-energy-row">
                <div className="fl-energy-col">
                  <div className="fl-energy-col-label">Mục tiêu</div>
                  <div className="fl-energy-col-val">{goalCalories.toLocaleString()}</div>
                </div>
                <div className="fl-energy-col">
                  <div className="fl-energy-col-label">Đã ăn</div>
                  <div className="fl-energy-col-val green">{totalEaten.toLocaleString()}</div>
                </div>
                <div className="fl-energy-col">
                  <div className="fl-energy-col-label">Đốt cháy</div>
                  <div className="fl-energy-col-val orange">{calsBurned}</div>
                </div>
              </div>
            </div>

            {/* Macros */}
            <div className="fl-sidebar-card fade-up" style={{ animationDelay: '.14s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div className="fl-sb-title" style={{ margin: 0 }}>Đa lượng</div>
                <button className="fl-macro-more-btn">···</button>
              </div>
              <div className="fl-macro-sb-row">
                <div className="fl-macro-sb-name">Carbs</div>
                <div className="fl-macro-sb-bar">
                  <div className="fl-macro-sb-fill" style={{ width: `${carbGoal > 0 ? Math.min((carbTotal/carbGoal)*100,100) : 0}%`, background: '#f97316' }} />
                </div>
                <div className="fl-macro-sb-vals">{carbTotal}g / {carbGoal}g</div>
              </div>
              <div className="fl-macro-sb-row">
                <div className="fl-macro-sb-name">Protein</div>
                <div className="fl-macro-sb-bar">
                  <div className="fl-macro-sb-fill" style={{ width: `${proGoal > 0 ? Math.min((proTotal/proGoal)*100,100) : 0}%`, background: '#1a8a4a' }} />
                </div>
                <div className="fl-macro-sb-vals">{proTotal}g / {proGoal}g</div>
              </div>
              <div className="fl-macro-sb-row">
                <div className="fl-macro-sb-name">Fat</div>
                <div className="fl-macro-sb-bar">
                  <div className="fl-macro-sb-fill" style={{ width: `${fatGoal > 0 ? Math.min((fatTotal/fatGoal)*100,100) : 0}%`, background: '#f4c542' }} />
                </div>
                <div className="fl-macro-sb-vals">{fatTotal}g / {fatGoal}g</div>
              </div>
            </div>

            {/* Water */}
            <div className="fl-sidebar-card fade-up" style={{ animationDelay: '.2s' }}>
              <div className="fl-water-row">
                <div className="fl-water-icon">💧</div>
                <div className="fl-water-text-col">
                  <div className="fl-water-text-label">Nước</div>
                  <div className="fl-water-text-val">{waterGlasses} / {waterGoal} ly ({waterMl}ml)</div>
                </div>
                <button
                  className="fl-water-add-btn"
                  onClick={() => logWater({ logDate: dateStr, waterMl: waterMl + 250 })}
                  title="Thêm 1 ly"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
