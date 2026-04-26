import { useState } from 'react'
// import { useWeeklyDashboard, useMonthlyDashboard } from '@/features/dashboard/hooks/useDashboard'
// import { useBodyMetricsHistory } from '@/features/body-metrics/hooks/useBodyMetrics'
import '@/assets/reports.css'

export default function ReportsPage() {
  const [period, setPeriod] = useState<string>('30 ngày')

  // const now = new Date()
  // const year = now.getFullYear()
  // const month = now.getMonth() + 1

  // const { data: weekly } = useWeeklyDashboard()
  // const { data: monthly } = useMonthlyDashboard(year, month)
  // const { data: bodyHistory } = useBodyMetricsHistory()

  // For the sake of the static pixel perfect UI
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
          <button className={`period-tab ${period === '7 ngày' ? 'active' : ''}`} onClick={() => setPeriod('7 ngày')}>7 ngày</button>
          <button className={`period-tab ${period === '30 ngày' ? 'active' : ''}`} onClick={() => setPeriod('30 ngày')}>30 ngày</button>
          <button className={`period-tab ${period === '3 tháng' ? 'active' : ''}`} onClick={() => setPeriod('3 tháng')}>3 tháng</button>
          <button className={`period-tab ${period === '1 năm' ? 'active' : ''}`} onClick={() => setPeriod('1 năm')}>1 năm</button>
        </div>

        {/* Top KPIs */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card fade-up" style={{ animationDelay: '.04s' }}>
            <div className="icon-wrap">📉</div>
            <div className="stat-val">−1.6<span style={{ fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 400, color: 'var(--text-muted)' }}>kg</span></div>
            <div className="stat-label">Giảm cân tháng này</div>
            <div className="stat-change up" style={{ marginTop: 8 }}>↓ Đang giảm đều</div>
          </div>
          <div className="stat-card fade-up" style={{ animationDelay: '.08s' }}>
            <div className="icon-wrap">🍽️</div>
            <div className="stat-val">1,956</div>
            <div className="stat-label">TB calories/ngày</div>
            <div className="stat-change up" style={{ marginTop: 8 }}>↓ Thấp hơn mục tiêu 11%</div>
          </div>
          <div className="stat-card fade-up" style={{ animationDelay: '.12s' }}>
            <div className="icon-wrap">🏋️</div>
            <div className="stat-val">18</div>
            <div className="stat-label">Buổi tập tháng này</div>
            <div className="stat-change up" style={{ marginTop: 8 }}>↑ +3 so với tháng trước</div>
          </div>
          <div className="stat-card fade-up" style={{ animationDelay: '.16s' }}>
            <div className="icon-wrap">🔥</div>
            <div className="stat-val">9,720</div>
            <div className="stat-label">Calories đốt tháng này</div>
            <div className="stat-change up" style={{ marginTop: 8 }}>↑ +12% so với tháng trước</div>
          </div>
        </div>

        {/* Calories chart + Macro breakdown */}
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card card-pad fade-up" style={{ animationDelay: '.18s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)' }}>Calories theo ngày</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>TB: 1,956 kcal — Mục tiêu: 2,200 kcal</div>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green-accent)', fontWeight: 600 }}>
                  <span style={{ display: 'inline-block', width: 16, height: 2.5, background: 'var(--green-accent)', borderRadius: 2 }}></span>Thực tế</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-block', width: 16, height: 2, background: 'var(--text-muted)', borderRadius: 2, opacity: .5 }}></span>Mục tiêu</span>
              </div>
            </div>
            <div className="chart-area">
              <svg className="chart-svg" viewBox="0 0 600 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3a8f67"/>
                    <stop offset="100%" stopColor="#3a8f67" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* grid lines */}
                <line x1="0" y1="40" x2="600" y2="40" className="chart-grid"/>
                <line x1="0" y1="80" x2="600" y2="80" className="chart-grid"/>
                <line x1="0" y1="120" x2="600" y2="120" className="chart-grid"/>
                {/* target line */}
                <line x1="0" y1="52" x2="600" y2="52" className="chart-line-target"/>
                {/* area fill */}
                <path d="M0,72 L40,65 L80,78 L120,60 L160,82 L200,58 L240,70 L280,50 L320,75 L360,62 L400,78 L440,55 L480,68 L520,60 L560,72 L600,65 L600,160 L0,160 Z" className="chart-area-fill"/>
                {/* line */}
                <path d="M0,72 L40,65 L80,78 L120,60 L160,82 L200,58 L240,70 L280,50 L320,75 L360,62 L400,78 L440,55 L480,68 L520,60 L560,72 L600,65" className="chart-line"/>
                {/* dots */}
                <circle cx="0" cy="72" r="4" className="chart-dot"/>
                <circle cx="80" cy="78" r="4" className="chart-dot"/>
                <circle cx="160" cy="82" r="4" className="chart-dot"/>
                <circle cx="280" cy="50" r="4" className="chart-dot"/>
                <circle cx="400" cy="78" r="4" className="chart-dot"/>
                <circle cx="600" cy="65" r="5" className="chart-dot today"/>
                {/* y labels */}
                <text x="608" y="44" fontSize="9" fill="#7a9080">2.5k</text>
                <text x="608" y="84" fontSize="9" fill="#7a9080">2.0k</text>
                <text x="608" y="124" fontSize="9" fill="#7a9080">1.5k</text>
              </svg>
            </div>
            <div className="chart-labels">
              <span className="chart-label">25/3</span>
              <span className="chart-label">1/4</span>
              <span className="chart-label">7/4</span>
              <span className="chart-label">14/4</span>
              <span className="chart-label">21/4</span>
              <span className="chart-label today">Hôm nay</span>
            </div>
          </div>

          {/* Macro breakdown */}
          <div className="card card-pad fade-up" style={{ animationDelay: '.22s' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 20 }}>Phân bổ dinh dưỡng TB</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
                <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#eef8f2" strokeWidth="20"/>
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#3a8f67" strokeWidth="20" strokeDasharray="176 314" strokeLinecap="butt"/>
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#f4a62a" strokeWidth="20" strokeDasharray="88 314" strokeDashoffset="-176" strokeLinecap="butt" opacity=".85"/>
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#e05c5c" strokeWidth="20" strokeDasharray="50 314" strokeDashoffset="-264" strokeLinecap="butt" opacity=".75"/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Macro</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>TB/ngày</span>
                </div>
              </div>
              <div className="macro-legend">
                <div className="macro-legend-row">
                  <div className="macro-legend-dot" style={{ background: '#3a8f67' }}></div>
                  <div className="macro-legend-name">Carbs</div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="macro-legend-pct">56%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>192g TB</div>
                  </div>
                </div>
                <div className="macro-legend-row">
                  <div className="macro-legend-dot" style={{ background: '#f4a62a' }}></div>
                  <div className="macro-legend-name">Protein</div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="macro-legend-pct">28%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>96g TB</div>
                  </div>
                </div>
                <div className="macro-legend-row">
                  <div className="macro-legend-dot" style={{ background: '#e05c5c' }}></div>
                  <div className="macro-legend-name">Fat</div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="macro-legend-pct">16%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>31g TB</div>
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }}></div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mục tiêu: C50% P30% F20%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weight + Workout trends */}
        <div className="grid-2" style={{ marginBottom: 20 }}>
          {/* Weight trend */}
          <div className="card card-pad fade-up" style={{ animationDelay: '.24s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)' }}>Cân nặng</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Mục tiêu: 65kg · Hiện tại: 68.4kg</div>
              </div>
              <div className="badge badge-green">−1.6kg tháng này</div>
            </div>
            <div className="chart-area">
              <svg className="chart-svg" viewBox="0 0 600 140" preserveAspectRatio="none">
                <defs><linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4a90e2"/><stop offset="100%" stopColor="#4a90e2" stopOpacity="0"/></linearGradient></defs>
                <line x1="0" y1="35" x2="600" y2="35" className="chart-grid"/>
                <line x1="0" y1="70" x2="600" y2="70" className="chart-grid"/>
                <line x1="0" y1="105" x2="600" y2="105" className="chart-grid"/>
                {/* target at 65kg */}
                <line x1="0" y1="120" x2="600" y2="120" className="chart-line-target"/>
                <path d="M0,30 L80,38 L160,50 L240,60 L320,68 L400,75 L480,82 L600,90 L600,140 L0,140 Z" style={{ fill: 'url(#blueGrad)', opacity: .12 }}/>
                <path d="M0,30 L80,38 L160,50 L240,60 L320,68 L400,75 L480,82 L600,90" fill="none" stroke="#4a90e2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="0" cy="30" r="4" fill="#4a90e2"/>
                <circle cx="600" cy="90" r="5" fill="#1e4d35" stroke="#fff" strokeWidth="2"/>
                <text x="0" y="24" fontSize="9" fill="#4a90e2" textAnchor="middle">70.0</text>
                <text x="600" y="84" fontSize="9" fill="#1e4d35" textAnchor="middle">68.4</text>
              </svg>
            </div>
            <div className="chart-labels">
              <span className="chart-label">25/3</span>
              <span className="chart-label">1/4</span>
              <span className="chart-label">7/4</span>
              <span className="chart-label">14/4</span>
              <span className="chart-label">21/4</span>
              <span className="chart-label today">Hôm nay</span>
            </div>
          </div>

          {/* Workout frequency */}
          <div className="card card-pad fade-up" style={{ animationDelay: '.28s' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 20 }}>Tần suất tập luyện (tuần)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, paddingBottom: 4 }}>
              {/* week bars */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                <div style={{ flex: 1, width: '100%', background: 'var(--bg)', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ height: '60%', background: 'var(--green-accent)', borderRadius: 6 }}></div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>T1</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                <div style={{ flex: 1, width: '100%', background: 'var(--bg)', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ height: '80%', background: 'var(--green-accent)', borderRadius: 6 }}></div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>T2</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                <div style={{ flex: 1, width: '100%', background: 'var(--bg)', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ height: '40%', background: 'var(--green-accent)', borderRadius: 6 }}></div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>T3</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                <div style={{ flex: 1, width: '100%', background: 'var(--bg)', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ height: '100%', background: 'var(--green-accent)', borderRadius: 6 }}></div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--green-cta)', fontWeight: 700 }}>T4</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>4.5</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>TB buổi/tuần</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>52'</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>TB thời gian</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>540</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>TB kcal đốt</div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights + Achievements */}
        <div className="grid-2" style={{ marginBottom: 0 }}>
          <div className="card card-pad fade-up" style={{ animationDelay: '.3s' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>Nhận xét AI tháng này</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="insight-chip good">
                <div className="i-icon">📉</div>
                <div className="i-text">Cân nặng giảm <strong style={{ color: 'var(--green-dark)' }}>1.6kg</strong> đúng nhịp. Ở tốc độ này, bạn sẽ đạt mục tiêu 65kg sau <strong style={{ color: 'var(--green-dark)' }}>~5 tuần</strong> nữa.</div>
              </div>
              <div className="insight-chip warn">
                <div className="i-icon">⚠️</div>
                <div className="i-text">Protein trung bình <strong style={{ color: 'var(--green-dark)' }}>96g/ngày</strong>, thấp hơn mục tiêu 125g. Hãy thêm ức gà hoặc trứng vào bữa phụ.</div>
              </div>
              <div className="insight-chip good">
                <div className="i-icon">🏃</div>
                <div className="i-text">Bạn tập đều đặn <strong style={{ color: 'var(--green-dark)' }}>4–5 buổi/tuần</strong>, đây là tần suất lý tưởng cho mục tiêu giảm cân và giữ cơ.</div>
              </div>
              <div className="insight-chip warn">
                <div className="i-icon">💧</div>
                <div className="i-text">Chỉ <strong style={{ color: 'var(--green-dark)' }}>62%</strong> số ngày đạt đủ 8 ly nước. Mất nước có thể ảnh hưởng đến năng lượng tập luyện.</div>
              </div>
            </div>
          </div>

          <div className="card card-pad fade-up" style={{ animationDelay: '.34s' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>Thành tích đạt được</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="achieve-card">
                <div className="achieve-icon">🏆</div>
                <div><div className="achieve-name">Streak 7 ngày</div><div className="achieve-desc">Ghi nhật ký 7 ngày liên tiếp</div></div>
                <div className="achieve-date">22/04</div>
              </div>
              <div className="achieve-card">
                <div className="achieve-icon">💪</div>
                <div><div className="achieve-name">Tập luyện 20 buổi</div><div className="achieve-desc">Hoàn thành 20 buổi tập trong tháng</div></div>
                <div className="achieve-date">20/04</div>
              </div>
              <div className="achieve-card">
                <div className="achieve-icon">⚖️</div>
                <div><div className="achieve-name">Giảm 1kg đầu tiên</div><div className="achieve-desc">Cột mốc giảm cân quan trọng!</div></div>
                <div className="achieve-date">10/04</div>
              </div>
              <div className="achieve-card">
                <div className="achieve-icon">🥗</div>
                <div><div className="achieve-name">Ăn uống lành mạnh</div><div className="achieve-desc">Đạt mục tiêu calories 15 ngày/tháng</div></div>
                <div className="achieve-date">18/04</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
