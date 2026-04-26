import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { useDailyDashboard, useWeeklyDashboard } from '@/features/dashboard/hooks/useDashboard'

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

export default function DashboardPage() {
  const [date] = useState(new Date())
  const dateStr = formatDate(date)

  const { data, isLoading, error, refetch } = useDailyDashboard(dateStr)
  const { data: weeklyData } = useWeeklyDashboard()

  if (isLoading) {
    return (
      <div className="grid-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />
  }

  const d = data ?? {}
  const goal = d.calorieGoal ?? 2200
  const total = d.totalCalories ?? 0
  const percent = Math.min((total / goal) * 100, 100).toFixed(0)

  const carbGoal = 260
  const carbTotal = d.totalCarbs ?? 0
  const carbPercent = Math.min((carbTotal / carbGoal) * 100, 100)

  const proGoal = 125
  const proTotal = d.totalProtein ?? 0
  const proPercent = Math.min((proTotal / proGoal) * 100, 100)

  const fatGoal = 70
  const fatTotal = d.totalFat ?? 0
  const fatPercent = Math.min((fatTotal / fatGoal) * 100, 100)

  const waterTotal = d.waterIntake ?? 6
  const waterGoal = d.waterGoal ?? 8
  const cups = Array.from({ length: waterGoal })

  const calsBurned = d.caloriesBurned ?? 540
  const calsBurnedGoal = 800
  const calsBurnedPercent = Math.min((calsBurned / calsBurnedGoal) * 100, 100).toFixed(0)

  // Donut chart calculations
  const totalMacros = carbGoal + proGoal + fatGoal || 1
  const carbStroke = (carbTotal / totalMacros) * 346
  const proStroke = (proTotal / totalMacros) * 346
  const fatStroke = (fatTotal / totalMacros) * 346
  const proOffset = 289 - carbStroke
  const fatOffset = proOffset - proStroke

  return (
    <>
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card fade-up" style={{ animationDelay: '.05s' }}>
          <div className="icon-wrap">🔥</div>
          <div className="stat-val">{total}</div>
          <div className="stat-label">Calories hôm nay</div>
          <div style={{ marginTop: 10 }}><div className="prog-bar"><div className="prog-fill" style={{ width: `${percent}%` }}></div></div></div>
          <div className="stat-change up" style={{ marginTop: 6 }}>{percent}% mục tiêu ({goal})</div>
        </div>
        <div className="stat-card fade-up" style={{ animationDelay: '.1s' }}>
          <div className="icon-wrap">🥩</div>
          <div className="stat-val">{proTotal}g</div>
          <div className="stat-label">Protein hôm nay</div>
          <div style={{ marginTop: 10 }}><div className="prog-bar"><div className="prog-fill orange" style={{ width: `${proPercent}%` }}></div></div></div>
          <div className="stat-change up" style={{ marginTop: 6 }}>{proPercent.toFixed(0)}% mục tiêu ({proGoal}g)</div>
        </div>
        <div className="stat-card fade-up" style={{ animationDelay: '.15s' }}>
          <div className="icon-wrap">🏃</div>
          <div className="stat-val">{calsBurned}</div>
          <div className="stat-label">Calories đốt cháy</div>
          <div style={{ marginTop: 10 }}><div className="prog-bar"><div className="prog-fill blue" style={{ width: `${calsBurnedPercent}%` }}></div></div></div>
          <div className="stat-change up" style={{ marginTop: 6 }}>{calsBurnedPercent}% mục tiêu ({calsBurnedGoal})</div>
        </div>
        <div className="stat-card fade-up" style={{ animationDelay: '.2s' }}>
          <div className="icon-wrap">⚖️</div>
          <div className="stat-val">68.4<span style={{ fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 400, color: "var(--text-muted)" }}>kg</span></div>
          <div className="stat-label">Cân nặng hiện tại</div>
          <div className="stat-change up" style={{ marginTop: 16 }}>↓ 1.6kg từ tháng trước</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card fade-up" style={{ animationDelay: '.22s' }}>
          <div className="card-header">
            <span className="card-title">Tổng quan dinh dưỡng hôm nay</span>
            <Link to="/food-log" className="card-action">Xem chi tiết →</Link>
          </div>
          <div className="card-pad" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div className="donut-wrap">
              <svg width="140" height="140" viewBox="0 0 140 140" className="donut-svg">
                <circle cx="70" cy="70" r="55" fill="none" stroke="#eef8f2" strokeWidth="16"/>
                <circle cx="70" cy="70" r="55" fill="none" stroke="#3a8f67" strokeWidth="16"
                  strokeDasharray={`${carbStroke} 346`} strokeLinecap="round"/>
                <circle cx="70" cy="70" r="55" fill="none" stroke="#f4a62a" strokeWidth="16"
                  strokeDasharray={`${proStroke} 346`} strokeDashoffset={-proOffset} strokeLinecap="round" opacity=".8"/>
                <circle cx="70" cy="70" r="55" fill="none" stroke="#e05c5c" strokeWidth="16"
                  strokeDasharray={`${fatStroke} 346`} strokeDashoffset={-fatOffset} strokeLinecap="round" opacity=".7"/>
              </svg>
              <div className="donut-center">
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: "var(--green-dark)", lineHeight: 1 }}>{total}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>kcal</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Còn lại</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--green-accent)" }}>{Math.max(goal - total, 0)} kcal</div>
              </div>
              <div className="macro-row">
                <div className="macro-dot" style={{ background: '#3a8f67' }}></div>
                <div className="macro-label">Carbs</div>
                <div style={{ flex: 1 }}><div className="prog-bar"><div className="prog-fill" style={{ width: `${carbPercent}%` }}></div></div></div>
                <div className="macro-val2">{carbTotal} / {carbGoal}g</div>
              </div>
              <div className="macro-row">
                <div className="macro-dot" style={{ background: '#f4a62a' }}></div>
                <div className="macro-label">Protein</div>
                <div style={{ flex: 1 }}><div className="prog-bar"><div className="prog-fill orange" style={{ width: `${proPercent}%` }}></div></div></div>
                <div className="macro-val2">{proTotal} / {proGoal}g</div>
              </div>
              <div className="macro-row">
                <div className="macro-dot" style={{ background: '#e05c5c' }}></div>
                <div className="macro-label">Fat</div>
                <div style={{ flex: 1 }}><div className="prog-bar"><div className="prog-fill red" style={{ width: `${fatPercent}%` }}></div></div></div>
                <div className="macro-val2">{fatTotal} / {fatGoal}g</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card fade-up" style={{ animationDelay: '.26s' }}>
          <div className="card-header">
            <span className="card-title">Bữa ăn hôm nay</span>
            <Link to="/food-log" className="card-action">Thêm bữa →</Link>
          </div>
          <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 8 }}>
            {d.meals && d.meals.length > 0 ? (
              d.meals.map((meal: any) => (
                <div className="meal-row" key={meal.id}>
                  <div className="meal-emoji-sm">{meal.mealType === 'breakfast' ? '🥣' : meal.mealType === 'lunch' ? '🍱' : meal.mealType === 'dinner' ? '🍜' : '🍌'}</div>
                  <div>
                    <div className="meal-name-sm capitalize">{meal.mealType}</div>
                    <div className="meal-meta">{(meal.items as any[])?.length || 0} items</div>
                  </div>
                  <div className="meal-kcal">{meal.totalCalories} kcal</div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>Chưa có bữa ăn nào hôm nay</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Weekly Chart Placeholder as per design */}
        <div className="card fade-up" style={{ animationDelay: '.3s' }}>
          <div className="card-header">
            <span className="card-title">Calories 7 ngày qua</span>
            <Link to="/reports" className="card-action">Báo cáo đầy đủ →</Link>
          </div>
          <div className="card-pad" style={{ paddingTop: 16 }}>
            <div className="week-bars" style={{ height: 100 }}>
              {weeklyData?.days ? weeklyData.days.map((day: any, i: number) => {
                const h = Math.min((day.calories / goal) * 100, 100)
                const isToday = i === 6
                return (
                  <div className="week-bar-wrap" key={day.date}>
                    <div style={{ fontSize: 10, color: isToday ? 'var(--green-cta)' : 'var(--text-muted)', textAlign: 'center', fontWeight: isToday ? 700 : 400 }}>{day.calories}</div>
                    <div className="week-bar-bg" style={{ flex: 1, width: '100%' }}>
                      <div className={`week-bar-fill ${isToday ? 'today' : ''}`} style={{ height: `${h}%` }}></div>
                    </div>
                    <div className="week-day" style={isToday ? { color: 'var(--green-cta)', fontWeight: 700 } : {}}>{new Date(day.date).toLocaleString('vi', { weekday: 'short' })}</div>
                  </div>
                )
              }) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No data</div>
              )}
            </div>
          </div>
        </div>

        <div className="card fade-up" style={{ animationDelay: '.33s' }}>
          <div className="card-header"><span className="card-title">Nước uống</span></div>
          <div className="card-pad">
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: 'var(--green-dark)' }}>{waterTotal}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}> / {waterGoal} ly</span>
            </div>
            <div className="prog-bar" style={{ height: 8, marginBottom: 16 }}><div className="prog-fill blue" style={{ width: `${(waterTotal/waterGoal)*100}%` }}></div></div>
            <div className="water-cups" id="cups">
              {cups.map((_, i) => (
                <div key={i} className={`cup ${i < waterTotal ? 'filled' : ''}`}>💧</div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>Click để cập nhật</div>
          </div>
        </div>

        <div className="card fade-up" style={{ animationDelay: '.36s' }}>
          <div className="card-header">
            <span className="card-title">Buổi tập hôm nay</span>
            <Link to="/workout" className="card-action">Xem →</Link>
          </div>
          <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 8 }}>
            <div className="ex-row">
              <div className="ex-icon-sm">🏃</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>Chạy bộ</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>5km · 28 phút</div></div>
              <div className="badge badge-green">Xong</div>
            </div>
            <div className="ex-row">
              <div className="ex-icon-sm">💪</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>Bench Press</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>4×10 reps</div></div>
              <div className="badge badge-green">Xong</div>
            </div>
            <div className="ex-row">
              <div className="ex-icon-sm">🦵</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>Squat</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>3×12 reps</div></div>
              <div className="badge badge-orange">Còn lại</div>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Đã đốt</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-dark)' }}>{calsBurned} kcal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card fade-up" style={{ animationDelay: '.4s' }}>
        <div className="card-header"><span className="card-title">Gợi ý & Nhận xét từ AI</span><span className="badge badge-dark" style={{ fontSize: 10 }}>AI Pro</span></div>
        <div className="card-pad" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
          <div className="insight-row" style={{ paddingRight: 20 }}>
            <div className="insight-icon">💡</div>
            <div className="insight-text">Bạn đang thiếu <strong>{Math.max(proGoal - proTotal, 0)}g protein</strong> so với mục tiêu. Hãy thêm một bữa phụ giàu protein buổi tối.</div>
          </div>
          <div className="insight-row" style={{ padding: '0 20px', borderLeft: '1px solid var(--border)' }}>
            <div className="insight-icon">📈</div>
            <div className="insight-text">Intake calories tuần này <strong>ổn định</strong>. Tiếp tục duy trì để đạt mục tiêu!</div>
          </div>
          <div className="insight-row" style={{ paddingLeft: 20, borderLeft: '1px solid var(--border)' }}>
            <div className="insight-icon">🌙</div>
            <div className="insight-text">Bạn thường ăn muộn sau 20h. Hãy thử ăn tối trước <strong>19:30</strong> để cải thiện chất lượng giấc ngủ.</div>
          </div>
        </div>
      </div>
    </>
  )
}
