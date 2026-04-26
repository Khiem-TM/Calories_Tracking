import { useState, useEffect, useMemo } from 'react'
import { useWorkoutHistory } from '@/features/workout/hooks/useWorkout'
import '@/assets/workout.css'

function formatDate(d: Date) { return d.toISOString().split('T')[0] }

function getLast7Days() {
  const days: Date[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export default function WorkoutPage() {
  const todayStr = formatDate(new Date())
  const [activeDate, setActiveDate] = useState(todayStr)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSec, setTimerSec] = useState(90)
  const timerMax = 90
  const [selectedEx, setSelectedEx] = useState<any>(null)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isTimerRunning && timerSec > 0) {
      interval = setInterval(() => setTimerSec((prev) => prev - 1), 1000)
    } else if (timerSec <= 0) {
      setIsTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timerSec])

  const resetTimer = () => { setIsTimerRunning(false); setTimerSec(90) }
  const toggleTimer = () => { if (timerSec <= 0) resetTimer(); setIsTimerRunning(!isTimerRunning) }
  const formatTimer = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
  const timerArc = 440 * (timerSec / timerMax)

  const last7Days = useMemo(() => getLast7Days(), [])

  const { data: historyRaw = [] } = useWorkoutHistory(30)
  const historyArr: any[] = Array.isArray(historyRaw)
    ? historyRaw
    : (historyRaw as any)?.items ?? []

  const historyByDate = useMemo(() => {
    const map: Record<string, any> = {}
    historyArr.forEach((w: any) => {
      const date = (w.date ?? w.createdAt ?? '').split('T')[0]
      if (date) map[date] = w
    })
    return map
  }, [historyArr])

  const activeWorkout = historyByDate[activeDate]
  const exercises: any[] = activeWorkout?.exercises ?? []
  const totalCalsBurned = activeWorkout?.caloriesBurned ?? activeWorkout?.calories_burned ?? 0
  const durationMin = activeWorkout?.duration ?? 0
  const totalSets = exercises.reduce((acc: number, ex: any) => acc + (Number(ex.sets) || 0), 0)

  const thisWeekWorkouts = last7Days.filter(d => !!historyByDate[formatDate(d)]).length
  const weeklyCalsBurned = last7Days.reduce(
    (acc, d) => acc + (historyByDate[formatDate(d)]?.caloriesBurned ?? 0), 0
  )

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Tập luyện</h1>
          <p>
            {historyArr.length > 0
              ? `${thisWeekWorkouts}/7 buổi tuần này · ${historyArr.length} buổi tổng`
              : 'Bắt đầu ghi nhật ký luyện tập'}
          </p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm" onClick={() => setIsTimerRunning(true)}>
            ▶ Bắt đầu buổi tập
          </button>
        </div>
      </div>

      <div className="content">
        {/* Week nav */}
        <div className="week-nav fade-up">
          {last7Days.map(d => {
            const dateStr = formatDate(d)
            const isToday = dateStr === todayStr
            const hasWorkout = !!historyByDate[dateStr]
            const type = isToday ? 'active' : hasWorkout ? 'done' : 'rest'
            return (
              <div
                key={dateStr}
                className={`day-pill ${type} ${activeDate === dateStr ? 'active' : ''}`}
                onClick={() => setActiveDate(dateStr)}
              >
                <div className="day-name">{DAY_NAMES[d.getDay()]}</div>
                <div className="day-num">{d.getDate()}</div>
                <div
                  className="day-status"
                  style={{
                    color:
                      type === 'done' && activeDate !== dateStr
                        ? 'var(--green-mid)'
                        : type === 'rest' && activeDate !== dateStr
                        ? 'var(--text-muted)'
                        : undefined,
                  }}
                >
                  {isToday ? 'Hôm nay' : hasWorkout ? '✓ Xong' : 'Nghỉ'}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
          {/* Exercise list */}
          <div>
            {activeWorkout ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-dark)' }}>
                      {activeWorkout.notes || 'Buổi tập'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(activeWorkout.date ?? activeWorkout.createdAt).toLocaleDateString('vi-VN', {
                        weekday: 'long', day: '2-digit', month: '2-digit',
                      })}
                      {durationMin > 0 && ` · ${durationMin} phút`}
                      {totalCalsBurned > 0 && ` · ~${totalCalsBurned} kcal`}
                    </div>
                  </div>
                  <div className="badge badge-green">Đã hoàn thành</div>
                </div>

                {exercises.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Buổi tập này chưa có bài tập nào được ghi.
                  </div>
                )}

                {exercises.map((ex: any, i: number) => (
                  <div
                    key={ex.id ?? i}
                    className="ex-card done-ex fade-up"
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => setSelectedEx(ex)}
                  >
                    <div className="ex-card-header">
                      <div className="ex-icon-big">💪</div>
                      <div style={{ flex: 1 }}>
                        <div className="ex-title">
                          {ex.exercise?.name ?? ex.exerciseName ?? ex.name ?? `Bài ${i + 1}`}
                        </div>
                        <div className="ex-meta">
                          {ex.exercise?.muscleGroup && `${ex.exercise.muscleGroup} · `}
                          {ex.sets} sets × {ex.reps} reps
                          {ex.weight ? ` · ${ex.weight}kg` : ''}
                          {ex.caloriesBurned ? ` · ~${ex.caloriesBurned} kcal` : ''}
                        </div>
                      </div>
                      <div className="badge badge-green">✓</div>
                    </div>
                    {Number(ex.sets) > 0 && (
                      <div className="set-grid">
                        {Array.from({ length: Number(ex.sets) }).map((_, s) => (
                          <div key={s} className="set-box done-set">
                            <div className="set-num">Set {s + 1}</div>
                            <div className="set-val">{ex.reps}</div>
                            <div className="set-unit">
                              reps{ex.weight ? ` × ${ex.weight}kg` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🏋️</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 6 }}>
                  {activeDate === todayStr ? 'Chưa có buổi tập hôm nay' : 'Không có buổi tập'}
                </div>
                <div style={{ fontSize: 13 }}>
                  {activeDate === todayStr ? 'Ghi lại buổi tập của bạn!' : 'Ngày nghỉ ngơi'}
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Timer */}
            <div className="card card-pad fade-up" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 16 }}>
                Nghỉ giữa set
              </div>
              <div className="timer-ring">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="var(--bg)" strokeWidth="10" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke="var(--green-accent)" strokeWidth="10"
                    strokeDasharray={`${timerArc} 440`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s linear' }} />
                </svg>
                <div className="timer-center">
                  <div className="timer-display">{formatTimer(timerSec)}</div>
                  <div className="timer-label">còn lại</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button className="btn btn-ghost2 btn-sm" onClick={resetTimer}>↺ Reset</button>
                <button className="btn btn-primary btn-sm" onClick={toggleTimer}>
                  {isTimerRunning ? '⏸ Dừng' : '▶ Bắt đầu'}
                </button>
              </div>
            </div>

            {/* Session summary */}
            {activeWorkout && (
              <div className="card card-pad fade-up" style={{ animationDelay: '.1s' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 14 }}>
                  Buổi tập này
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="summary-stat">
                    <div className="s-val">{durationMin}</div>
                    <div className="s-lbl">Phút</div>
                  </div>
                  <div className="summary-stat">
                    <div className="s-val">{totalCalsBurned}</div>
                    <div className="s-lbl">Kcal đốt</div>
                  </div>
                  <div className="summary-stat">
                    <div className="s-val">{totalSets}</div>
                    <div className="s-lbl">Tổng sets</div>
                  </div>
                  <div className="summary-stat">
                    <div className="s-val">{exercises.length}</div>
                    <div className="s-lbl">Bài tập</div>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly progress */}
            <div className="card card-pad fade-up" style={{ animationDelay: '.15s' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 12 }}>
                Tuần này
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Buổi tập</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-dark)' }}>
                  {thisWeekWorkouts} / 7
                </span>
              </div>
              <div className="prog-bar" style={{ height: 8, marginBottom: 14 }}>
                <div className="prog-fill" style={{ width: `${Math.min((thisWeekWorkouts / 7) * 100, 100)}%` }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Calories đốt</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-dark)' }}>
                  {weeklyCalsBurned.toLocaleString()} kcal
                </span>
              </div>
              <div className="prog-bar" style={{ height: 8 }}>
                <div
                  className="prog-fill orange"
                  style={{ width: `${Math.min((weeklyCalsBurned / 3200) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise detail modal */}
      {selectedEx && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setSelectedEx(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ background: 'var(--green-cta)', borderRadius: '24px 24px 0 0', padding: 28, color: '#fff', position: 'relative' }}>
              <button
                onClick={() => setSelectedEx(null)}
                style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                  💪
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', opacity: .7, marginBottom: 4 }}>
                    {selectedEx.exercise?.muscleGroup ?? selectedEx.muscleGroup ?? 'Bài tập'}
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>
                    {selectedEx.exercise?.name ?? selectedEx.exerciseName ?? selectedEx.name ?? 'Chi tiết'}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { val: selectedEx.sets, lbl: 'Sets' },
                  { val: selectedEx.reps, lbl: 'Reps' },
                  { val: selectedEx.weight ?? '—', lbl: 'kg' },
                  { val: selectedEx.caloriesBurned ?? '—', lbl: 'Kcal' },
                ].map(({ val, lbl }) => (
                  <div key={lbl} style={{ background: 'var(--bg)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>
                      {val}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{lbl}</div>
                  </div>
                ))}
              </div>
              {selectedEx.notes && (
                <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 13, color: 'var(--text-body)' }}>
                  {selectedEx.notes}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost2" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedEx(null)}>
                  Đóng
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => { setSelectedEx(null); setIsTimerRunning(true) }}
                >
                  ▶ Nghỉ set
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
