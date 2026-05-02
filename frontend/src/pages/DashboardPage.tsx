import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDailyDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useActivityLogs, useLogWater } from '@/features/activity-logs/hooks/useActivityLogs'
import { useLatestBodyMetrics } from '@/features/body-metrics/hooks/useBodyMetrics'
import { CardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import '@/assets/dashboard.css'

function formatDate(d: Date) { return d.toISOString().split('T')[0] }

function getViDate(d: Date) {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  return `${days[d.getDay()]}, ${d.getDate()} Tháng ${d.getMonth() + 1}`
}

export default function DashboardPage() {
  const [date] = useState(new Date())
  const dateStr = formatDate(date)

  const { data, isLoading, error, refetch } = useDailyDashboard(dateStr)
  const { data: activityData } = useActivityLogs(dateStr)
  const { mutate: logWater } = useLogWater()

  const { data: metricsData } = useLatestBodyMetrics()
  const currentWeight = (metricsData as any)?.weight ?? null

  if (isLoading) return <div className="content"><CardSkeleton /></div>
  if (error) return <div className="content"><ErrorState onRetry={() => refetch()} /></div>

  const d = data ?? {}
  const goal = d.calorieGoal ?? 2000
  const total = Math.round(d.totalCalories ?? 0)
  const carbGoal = d.carbsGoal ?? Math.round((goal * 0.5) / 4)
  const proGoal = d.proteinGoal ?? Math.round((goal * 0.2) / 4)
  const fatGoal = d.fatGoal ?? Math.round((goal * 0.3) / 9)
  const carbTotal = Math.round(d.totalCarbs ?? 0)
  const proTotal = Math.round(d.totalProtein ?? 0)
  const fatTotal = Math.round(d.totalFat ?? 0)
  const calsBurned = activityData?.caloriesBurned ?? 0
  const waterMl = activityData?.waterMl ?? 0
  const waterGlasses = Math.floor(waterMl / 250)
  const waterGoal = d.waterGoal ?? 8

  const calPercent = goal > 0 ? Math.min((total / goal) * 100, 100) : 0
  const proPercent = proGoal > 0 ? Math.min((proTotal / proGoal) * 100, 100) : 0

  // Donut chart (SVG, 140px, r=56)
  const C = 2 * Math.PI * 56
  const carbFill = carbGoal > 0 ? Math.min((carbTotal / (carbGoal + proGoal + fatGoal)) * C, C) : 0
  const proFill = proGoal > 0 ? Math.min((proTotal / (carbGoal + proGoal + fatGoal)) * C, C) : 0
  const fatFill = fatGoal > 0 ? Math.min((fatTotal / (carbGoal + proGoal + fatGoal)) * C, C) : 0
  const proOffset = carbFill
  const fatOffset = carbFill + proFill

  const meals = d.meals ?? []
  const mealEmojis: Record<string, string> = {
    BREAKFAST: '🌅', breakfast: '🌅',
    LUNCH: '☀️', lunch: '☀️',
    DINNER: '🌙', dinner: '🌙',
    SNACK: '🍊', snack: '🍊',
  }
  const mealBg: Record<string, string> = {
    BREAKFAST: '#fff7ed', LUNCH: '#fffbeb', DINNER: '#f0f4ff', SNACK: '#f0fbf5',
    breakfast: '#fff7ed', lunch: '#fffbeb', dinner: '#f0f4ff', snack: '#f0fbf5',
  }
  const mealNames: Record<string, string> = {
    BREAKFAST: 'Bữa sáng', LUNCH: 'Bữa trưa', DINNER: 'Bữa tối', SNACK: 'Bữa phụ',
    breakfast: 'Bữa sáng', lunch: 'Bữa trưa', dinner: 'Bữa tối', snack: 'Bữa phụ',
  }

  const cups = Array.from({ length: waterGoal })
  const userInitial = 'A'

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="db-header">
        <div className="db-header-left">
          <h1>Tổng quan hôm nay</h1>
          <div className="db-date">{getViDate(date)}</div>
        </div>
        <div className="db-header-right">
          <button className="db-icon-btn" title="Lịch">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <rect x="1" y="2" width="14" height="13" rx="3" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5 1v2M11 1v2M1 6h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="db-user-pill">
            <div className="ava">{userInitial}</div>
            Nguyễn A.
            <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="db-stats-row">
        {/* Nạp vào */}
        <div className="db-stat-card fade-up" style={{ animationDelay: '.04s' }}>
          <div className="db-stat-badge green">↑ {calPercent.toFixed(0)}%</div>
          <div className="db-stat-icon" style={{ background: '#fff3ed' }}>🔥</div>
          <div className="db-stat-label">Nạp vào</div>
          <div className="db-stat-value">{total.toLocaleString()} <small>/ {goal.toLocaleString()} kcal</small></div>
          <div className="db-stat-bar">
            <div className="db-stat-bar-fill" style={{ width: `${calPercent}%`, background: '#f97316' }} />
          </div>
        </div>

        {/* Protein */}
        <div className="db-stat-card fade-up" style={{ animationDelay: '.08s' }}>
          <div className="db-stat-badge green">✓ Đạt</div>
          <div className="db-stat-icon" style={{ background: '#eefbf3' }}>💪</div>
          <div className="db-stat-label">Protein</div>
          <div className="db-stat-value">{proTotal} <small>/ {proGoal} g</small></div>
          <div className="db-stat-bar">
            <div className="db-stat-bar-fill" style={{ width: `${proPercent}%`, background: '#3a8f67' }} />
          </div>
        </div>

        {/* Tiêu hao */}
        <div className="db-stat-card fade-up" style={{ animationDelay: '.12s' }}>
          <div className="db-stat-badge grey">Hôm nay</div>
          <div className="db-stat-icon" style={{ background: '#eef4ff' }}>🏃</div>
          <div className="db-stat-label">Tiêu hao</div>
          <div className="db-stat-value">{calsBurned.toLocaleString()} <small>kcal</small></div>
          <div className="db-stat-bar" style={{ marginTop: 12 }}>
            <div className="db-stat-bar-fill" style={{ width: `${Math.min((calsBurned / 600) * 100, 100)}%`, background: '#6366f1' }} />
          </div>
        </div>

        {/* Cân nặng */}
        <div className="db-stat-card fade-up" style={{ animationDelay: '.16s' }}>
          <div className="db-stat-badge grey">Tuần này</div>
          <div className="db-stat-icon" style={{ background: '#fdf4ff' }}>⚖️</div>
          <div className="db-stat-label">Cân nặng</div>
          <div className="db-stat-value">
            {currentWeight ? <>{currentWeight} <small>kg</small></> : <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>—</span>}
          </div>
          {currentWeight && (
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>Cập nhật từ hồ sơ</div>
          )}
        </div>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="db-grid">
        {/* LEFT COLUMN */}
        <div>
          {/* Nutrition card */}
          <div className="db-nutrition-card fade-up" style={{ animationDelay: '.2s' }}>
            <div className="db-section-title">
              Dinh dưỡng hôm nay
              <Link to="/food-log" className="db-section-link">Xem chi tiết</Link>
            </div>
            <div className="db-donut-row">
              {/* Donut */}
              <div className="db-donut-wrap">
                <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="70" cy="70" r="56" fill="none" stroke="#f0f7f4" strokeWidth="14"/>
                  {/* Carbs – blue */}
                  <circle cx="70" cy="70" r="56" fill="none" stroke="#4a90e2" strokeWidth="14"
                    strokeDasharray={`${carbFill} ${C}`} strokeLinecap="round" />
                  {/* Protein – green */}
                  <circle cx="70" cy="70" r="56" fill="none" stroke="#3a8f67" strokeWidth="14"
                    strokeDasharray={`${proFill} ${C}`} strokeDashoffset={-proOffset} strokeLinecap="round" />
                  {/* Fat – yellow */}
                  <circle cx="70" cy="70" r="56" fill="none" stroke="#f4c542" strokeWidth="14"
                    strokeDasharray={`${fatFill} ${C}`} strokeDashoffset={-fatOffset} strokeLinecap="round" />
                </svg>
                <div className="db-donut-center">
                  <div className="db-donut-kcal">{total.toLocaleString()}</div>
                  <div className="db-donut-goal">/{goal.toLocaleString()} kcal</div>
                </div>
              </div>

              {/* Macro bars */}
              <div className="db-macro-list">
                <div className="db-macro-row">
                  <div className="db-macro-dot" style={{ background: '#4a90e2' }} />
                  <div className="db-macro-name">Carbs</div>
                  <div className="db-macro-bar-wrap">
                    <div className="db-macro-bar-fill" style={{ width: `${carbGoal > 0 ? Math.min((carbTotal/carbGoal)*100,100) : 0}%`, background: '#4a90e2' }} />
                  </div>
                  <div className="db-macro-val">{carbTotal} / {carbGoal}g</div>
                </div>
                <div className="db-macro-row">
                  <div className="db-macro-dot" style={{ background: '#3a8f67' }} />
                  <div className="db-macro-name">Protein</div>
                  <div className="db-macro-bar-wrap">
                    <div className="db-macro-bar-fill" style={{ width: `${proGoal > 0 ? Math.min((proTotal/proGoal)*100,100) : 0}%`, background: '#3a8f67' }} />
                  </div>
                  <div className="db-macro-val">{proTotal} / {proGoal}g</div>
                </div>
                <div className="db-macro-row">
                  <div className="db-macro-dot" style={{ background: '#f4c542' }} />
                  <div className="db-macro-name">Chất béo</div>
                  <div className="db-macro-bar-wrap">
                    <div className="db-macro-bar-fill" style={{ width: `${fatGoal > 0 ? Math.min((fatTotal/fatGoal)*100,100) : 0}%`, background: '#f4c542' }} />
                  </div>
                  <div className="db-macro-val">{fatTotal} / {fatGoal}g</div>
                </div>
              </div>
            </div>
          </div>

          {/* Meals saved card */}
          <div className="db-meals-card fade-up" style={{ animationDelay: '.26s' }}>
            <div className="db-meals-header">
              <span className="db-section-title" style={{ marginBottom: 0 }}>Bữa ăn đã lưu</span>
              <Link to="/search-food">
                <button className="db-meals-add-btn">+</button>
              </Link>
            </div>

            {meals.length === 0 ? (
              <div style={{ padding: '20px 22px', fontSize: 13, color: 'var(--text-muted)' }}>
                Chưa có bữa ăn nào hôm nay.
              </div>
            ) : meals.map((meal: any) => {
              const mealType = meal.mealType ?? meal.meal_type ?? ''
              const items: any[] = meal.items ?? []
              const itemNames = items.slice(0, 3).map((i: any) => i.food?.name ?? '').filter(Boolean).join(', ')
              const totalCals = Math.round(items.reduce((s: number, i: any) => s + (i.calories ?? i.calories_snapshot ?? 0), 0))
              return (
                <div className="db-meal-row" key={meal.id}>
                  <div className="db-meal-icon" style={{ background: mealBg[mealType] ?? '#f8faf9' }}>
                    {mealEmojis[mealType] ?? '🍽️'}
                  </div>
                  <div className="db-meal-info">
                    <div className="db-meal-type">{mealNames[mealType] ?? mealType}</div>
                    {itemNames && <div className="db-meal-items">{itemNames}{items.length > 3 ? '...' : ''}</div>}
                  </div>
                  <div className="db-meal-kcal">{totalCals} kcal</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="db-right-col">
          {/* Water */}
          <div className="db-small-card fade-up" style={{ animationDelay: '.22s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>💧</span>
              <div>
                <div className="db-water-label">Nước đã uống</div>
                <div className="db-water-value">{waterGlasses} <small>/ {waterGoal} ly</small></div>
              </div>
            </div>
            <div className="db-water-cups">
              {cups.map((_, i) => (
                <div key={i} className={`db-water-cup ${i < waterGlasses ? 'filled' : ''}`} />
              ))}
            </div>
            <button
              className="db-add-250-btn"
              onClick={() => logWater({ logDate: dateStr, waterMl: waterMl + 250 })}
            >
              + Thêm 250ml
            </button>
          </div>

          {/* Workout */}
          <div className="db-small-card fade-up" style={{ animationDelay: '.28s' }}>
            <div className="db-workout-header">
              <div className="db-workout-title">Tập luyện</div>
              <button className="db-more-btn">···</button>
            </div>
            {calsBurned > 0 ? (
              <div className="db-workout-item">
                <div className="db-workout-icon">🏃</div>
                <div style={{ flex: 1 }}>
                  <div className="db-workout-name">Hoạt động hôm nay</div>
                  <div className="db-workout-meta">Đã ghi nhận</div>
                </div>
                <div>
                  <div className="db-workout-kcal">{calsBurned}</div>
                  <div className="db-workout-kcal-unit">kcal</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                Chưa có hoạt động nào hôm nay
              </div>
            )}
            <Link to="/workout">
              <button className="db-log-activity-btn">Ghi lại hoạt động</button>
            </Link>
          </div>

          {/* AI Insights */}
          <div className="db-ai-card fade-up" style={{ animationDelay: '.34s' }}>
            <div className="db-ai-title">💡 AI Insights</div>
            <div className="db-ai-text">
              {proTotal < proGoal
                ? `Bạn đang thiếu khoảng ${proGoal - proTotal}g Protein so với mục tiêu hôm nay. Một ly sữa chua Hy Lạp hoặc 1 quả trứng luộc sẽ giúp bạn hoàn thành mục tiêu.`
                : 'Bạn đã đạt mục tiêu Protein hôm nay! Tiếp tục duy trì chế độ ăn uống cân bằng.'}
            </div>
            <Link to="/search-food" className="db-ai-link">
              Xem gợi ý món ăn →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
