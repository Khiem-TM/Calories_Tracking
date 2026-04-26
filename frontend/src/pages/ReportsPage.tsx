import { useState } from 'react'
import { useMonthlyDashboard, useWeeklyDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useBodyMetricsHistory } from '@/features/body-metrics/hooks/useBodyMetrics'
import { CardSkeleton } from '@/components/common/LoadingSkeleton'
import '@/assets/reports.css'

export default function ReportsPage() {
  const [period, setPeriod] = useState<'7' | '30' | '90' | '365'>('30')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const { data: monthly, isLoading } = useMonthlyDashboard(year, month)
  const { data: weekly } = useWeeklyDashboard()
  const { data: bodyHistoryRaw } = useBodyMetricsHistory()

  const d = monthly ?? ({} as any)
  const avgCalories = Math.round(d.avgCalories ?? d.avgDailyCalories ?? 0)
  const calorieGoal = d.calorieGoal ?? 2200
  const totalWorkouts = d.totalWorkouts ?? 0
  const totalCalsBurned = d.totalCaloriesBurned ?? d.caloriesBurned ?? 0
  const avgCarbs = Number(d.avgCarbs ?? d.avgDailyCarbs ?? 0)
  const avgProtein = Number(d.avgProtein ?? d.avgDailyProtein ?? 0)
  const avgFat = Number(d.avgFat ?? d.avgDailyFat ?? 0)

  const bodyArr: any[] = Array.isArray(bodyHistoryRaw)
    ? bodyHistoryRaw
    : (bodyHistoryRaw as any)?.items ?? []

  const weightChange = (() => {
    if (bodyArr.length < 2) return null
    const first = bodyArr[0]?.weight
    const last = bodyArr[bodyArr.length - 1]?.weight
    if (!first || !last) return null
    return (last - first).toFixed(1)
  })()

  const weekDays: any[] = Array.isArray(weekly?.days) ? weekly.days : []
  const maxCal = Math.max(...weekDays.map((d: any) => d.calories ?? 0), calorieGoal, 1)

  const totalMacrosAvg = avgCarbs + avgProtein + avgFat || 1
  const carbPct = Math.round((avgCarbs / totalMacrosAvg) * 100)
  const protPct = Math.round((avgProtein / totalMacrosAvg) * 100)
  const fatPct = 100 - carbPct - protPct

  // Weight chart: last 14 entries
  const recentBody = bodyArr.slice(-14)
  const weights = recentBody.map((e: any) => e.weight).filter(Boolean)
  const minW = weights.length > 0 ? Math.min(...weights) - 1 : 0
  const maxW = weights.length > 0 ? Math.max(...weights) + 1 : 1

  if (isLoading) {
    return (
      <div className="grid-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Báo cáo & Phân tích</h1>
          <p>Theo dõi xu hướng sức khoẻ của bạn</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost2 btn-sm">Xuất PDF</button>
          <button className="btn btn-ghost2 btn-sm">Chia sẻ với bác sĩ</button>
        </div>
      </div>

      <div className="content">
        {/* Period selector */}
        <div className="period-tabs fade-up">
          {(['7', '30', '90', '365'] as const).map((p) => (
            <button
              key={p}
              className={`period-tab ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p === '7' ? '7 ngày' : p === '30' ? '30 ngày' : p === '90' ? '3 tháng' : '1 năm'}
            </button>
          ))}
        </div>

        {/* Top KPIs */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card fade-up" style={{ animationDelay: '.04s' }}>
            <div className="icon-wrap">📉</div>
            <div className="stat-val">
              {weightChange !== null
                ? `${Number(weightChange) > 0 ? '+' : ''}${weightChange}`
                : '—'}
              <span style={{ fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 400, color: 'var(--text-muted)' }}>
                {weightChange !== null ? 'kg' : ''}
              </span>
            </div>
            <div className="stat-label">Thay đổi cân nặng</div>
            <div className="stat-change up" style={{ marginTop: 8 }}>
              {bodyArr.length > 1 ? `${bodyArr.length} lần ghi nhận` : 'Chưa đủ dữ liệu'}
            </div>
          </div>
          <div className="stat-card fade-up" style={{ animationDelay: '.08s' }}>
            <div className="icon-wrap">🍽️</div>
            <div className="stat-val">{avgCalories > 0 ? avgCalories.toLocaleString() : '—'}</div>
            <div className="stat-label">TB calories/ngày</div>
            <div className="stat-change up" style={{ marginTop: 8 }}>
              {avgCalories > 0 && calorieGoal > 0
                ? `${Math.round((avgCalories / calorieGoal) * 100)}% mục tiêu`
                : 'Tháng này'}
            </div>
          </div>
          <div className="stat-card fade-up" style={{ animationDelay: '.12s' }}>
            <div className="icon-wrap">🏋️</div>
            <div className="stat-val">{totalWorkouts}</div>
            <div className="stat-label">Buổi tập tháng này</div>
            <div className="stat-change up" style={{ marginTop: 8 }}>Từ nhật ký tập luyện</div>
          </div>
          <div className="stat-card fade-up" style={{ animationDelay: '.16s' }}>
            <div className="icon-wrap">🔥</div>
            <div className="stat-val">{totalCalsBurned > 0 ? totalCalsBurned.toLocaleString() : '—'}</div>
            <div className="stat-label">Calories đốt tháng này</div>
            <div className="stat-change up" style={{ marginTop: 8 }}>Từ hoạt động thể chất</div>
          </div>
        </div>

        {/* Weekly chart + Macro breakdown */}
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card card-pad fade-up" style={{ animationDelay: '.18s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)' }}>
                  Calories theo ngày (tuần này)
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  TB: {avgCalories.toLocaleString()} kcal — Mục tiêu: {calorieGoal.toLocaleString()} kcal
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green-accent)', fontWeight: 600 }}>
                  <span style={{ display: 'inline-block', width: 16, height: 2.5, background: 'var(--green-accent)', borderRadius: 2 }}></span>Thực tế
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-block', width: 16, height: 2, background: 'var(--text-muted)', borderRadius: 2, opacity: .5 }}></span>Mục tiêu
                </span>
              </div>
            </div>
            {weekDays.length > 0 ? (
              <>
                <div className="chart-area" style={{ height: 120 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: '100%' }}>
                    {weekDays.map((day: any, i: number) => {
                      const h = Math.min(((day.calories ?? 0) / maxCal) * 100, 100)
                      const isToday = i === weekDays.length - 1
                      return (
                        <div key={day.date ?? i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }}>
                          <div style={{ fontSize: 9, color: isToday ? 'var(--green-cta)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 400 }}>
                            {(day.calories ?? 0) > 0 ? day.calories : ''}
                          </div>
                          <div style={{ flex: 1, width: '100%', background: 'var(--bg)', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <div style={{ height: `${h}%`, background: isToday ? 'var(--green-cta)' : 'var(--green-accent)', borderRadius: 6, transition: 'height .3s' }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="chart-labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  {weekDays.map((day: any, i: number) => (
                    <span key={i} className={`chart-label ${i === weekDays.length - 1 ? 'today' : ''}`}>
                      {day.date
                        ? new Date(day.date).toLocaleString('vi', { weekday: 'short' })
                        : `N${i + 1}`}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '30px 0' }}>
                Chưa có dữ liệu tuần này
              </div>
            )}
          </div>

          {/* Macro breakdown */}
          <div className="card card-pad fade-up" style={{ animationDelay: '.22s' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 20 }}>
              Phân bổ dinh dưỡng TB
            </div>
            {avgCarbs + avgProtein + avgFat > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
                  <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="65" cy="65" r="50" fill="none" stroke="#eef8f2" strokeWidth="20" />
                    <circle cx="65" cy="65" r="50" fill="none" stroke="#3a8f67" strokeWidth="20"
                      strokeDasharray={`${(carbPct / 100) * 314} 314`} strokeLinecap="butt" />
                    <circle cx="65" cy="65" r="50" fill="none" stroke="#f4a62a" strokeWidth="20"
                      strokeDasharray={`${(protPct / 100) * 314} 314`}
                      strokeDashoffset={`${-(carbPct / 100) * 314}`}
                      strokeLinecap="butt" opacity=".85" />
                    <circle cx="65" cy="65" r="50" fill="none" stroke="#e05c5c" strokeWidth="20"
                      strokeDasharray={`${(fatPct / 100) * 314} 314`}
                      strokeDashoffset={`${-((carbPct + protPct) / 100) * 314}`}
                      strokeLinecap="butt" opacity=".75" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Macro</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>TB/ngày</span>
                  </div>
                </div>
                <div className="macro-legend">
                  {[
                    { color: '#3a8f67', name: 'Carbs', pct: carbPct, val: avgCarbs },
                    { color: '#f4a62a', name: 'Protein', pct: protPct, val: avgProtein },
                    { color: '#e05c5c', name: 'Fat', pct: fatPct, val: avgFat },
                  ].map(({ color, name, pct, val }) => (
                    <div key={name} className="macro-legend-row">
                      <div className="macro-legend-dot" style={{ background: color }}></div>
                      <div className="macro-legend-name">{name}</div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="macro-legend-pct">{pct}%</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{val.toFixed(0)}g TB</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '30px 0' }}>
                Chưa có dữ liệu dinh dưỡng tháng này
              </div>
            )}
          </div>
        </div>

        {/* Weight trend + Workout frequency */}
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card card-pad fade-up" style={{ animationDelay: '.24s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)' }}>Cân nặng</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {recentBody.length > 0
                    ? `${recentBody.length} lần ghi nhận gần nhất`
                    : 'Chưa có dữ liệu'}
                </div>
              </div>
              {weightChange !== null && (
                <div className={`badge ${Number(weightChange) <= 0 ? 'badge-green' : 'badge-orange'}`}>
                  {Number(weightChange) > 0 ? '+' : ''}{weightChange}kg
                </div>
              )}
            </div>
            {recentBody.length > 1 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, marginBottom: 6 }}>
                  {recentBody.map((entry: any, i: number) => {
                    const h = entry.weight
                      ? Math.max(((entry.weight - minW) / (maxW - minW)) * 100, 5)
                      : 5
                    const isLast = i === recentBody.length - 1
                    return (
                      <div
                        key={i}
                        title={`${entry.weight}kg`}
                        style={{
                          flex: 1,
                          background: isLast ? 'var(--green-cta)' : 'var(--green-accent)',
                          borderRadius: 4,
                          height: `${h}%`,
                          opacity: 0.5 + (i / recentBody.length) * 0.5,
                        }}
                      ></div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                  <span>
                    {recentBody[0]?.date
                      ? new Date(recentBody[0].date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                      : ''}
                  </span>
                  <span>Gần nhất: {recentBody[recentBody.length - 1]?.weight}kg</span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>
                Ghi nhận body metrics để xem biểu đồ
              </div>
            )}
          </div>

          <div className="card card-pad fade-up" style={{ animationDelay: '.28s' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 20 }}>
              Tần suất tập luyện (tuần này)
            </div>
            {weekDays.length > 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100, paddingBottom: 4 }}>
                  {weekDays.map((day: any, i: number) => {
                    const maxBurned = Math.max(...weekDays.map((d: any) => d.caloriesBurned ?? 0), 1)
                    const h = Math.min(((day.caloriesBurned ?? 0) / maxBurned) * 100, 100)
                    const isToday = i === weekDays.length - 1
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                        <div style={{ flex: 1, width: '100%', background: 'var(--bg)', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                          <div style={{ height: `${h}%`, background: 'var(--green-accent)', borderRadius: 6 }}></div>
                        </div>
                        <div style={{ fontSize: 10, color: isToday ? 'var(--green-cta)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 400 }}>
                          {day.date ? new Date(day.date).toLocaleString('vi', { weekday: 'short' }) : `N${i + 1}`}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>
                      {weekDays.filter((d: any) => (d.caloriesBurned ?? 0) > 0).length}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Buổi tập tuần</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>
                      {totalWorkouts}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tháng này</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>
                      {weekDays.reduce((sum: number, d: any) => sum + (d.caloriesBurned ?? 0), 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Kcal đốt tuần</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '30px 0' }}>
                Chưa có dữ liệu tập luyện
              </div>
            )}
          </div>
        </div>

        {/* AI insights */}
        <div className="grid-2" style={{ marginBottom: 0 }}>
          <div className="card card-pad fade-up" style={{ animationDelay: '.3s' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>
              Nhận xét dinh dưỡng tháng này
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {avgCalories > 0 && (
                <div className="insight-chip good">
                  <div className="i-icon">🍽️</div>
                  <div className="i-text">
                    TB calories: <strong style={{ color: 'var(--green-dark)' }}>{avgCalories.toLocaleString()} kcal/ngày</strong>
                    {avgCalories < calorieGoal
                      ? ` — thấp hơn mục tiêu ${calorieGoal.toLocaleString()} kcal`
                      : ` — đạt mục tiêu ${calorieGoal.toLocaleString()} kcal`}
                  </div>
                </div>
              )}
              {avgProtein > 0 && (
                <div className={`insight-chip ${avgProtein < 100 ? 'warn' : 'good'}`}>
                  <div className="i-icon">🥩</div>
                  <div className="i-text">
                    Protein TB: <strong style={{ color: 'var(--green-dark)' }}>{avgProtein.toFixed(0)}g/ngày</strong>
                    {avgProtein < 100 ? ' — cần bổ sung thêm protein' : ' — đạt yêu cầu'}
                  </div>
                </div>
              )}
              {totalWorkouts > 0 && (
                <div className="insight-chip good">
                  <div className="i-icon">🏃</div>
                  <div className="i-text">
                    Bạn đã hoàn thành <strong style={{ color: 'var(--green-dark)' }}>{totalWorkouts} buổi tập</strong> tháng này.
                    {totalWorkouts >= 16 ? ' Tần suất lý tưởng!' : ' Cố gắng tập đều đặn hơn nhé.'}
                  </div>
                </div>
              )}
              {avgCalories === 0 && totalWorkouts === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  Bắt đầu ghi nhật ký để nhận nhận xét từ AI
                </div>
              )}
            </div>
          </div>

          <div className="card card-pad fade-up" style={{ animationDelay: '.34s' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>
              Thống kê cân nặng
            </div>
            {bodyArr.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lần đầu ghi nhận</span>
                  <strong style={{ color: 'var(--green-dark)' }}>{bodyArr[0]?.weight}kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Gần nhất</span>
                  <strong style={{ color: 'var(--green-dark)' }}>{bodyArr[bodyArr.length - 1]?.weight}kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Số lần ghi nhận</span>
                  <strong style={{ color: 'var(--green-dark)' }}>{bodyArr.length}</strong>
                </div>
                {weightChange !== null && (
                  <div style={{ background: Number(weightChange) <= 0 ? 'var(--green-light)' : '#fef3e2', borderRadius: 10, padding: 12, textAlign: 'center', marginTop: 4 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>
                      {Number(weightChange) > 0 ? '+' : ''}{weightChange}kg
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Thay đổi từ lần đầu đến nay
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>
                Chưa có dữ liệu body metrics
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
