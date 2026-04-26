import { useState, useEffect } from 'react'
// import { Dumbbell, Clock, Trash2, Plus, ChevronRight } from 'lucide-react'
// import { useExercises, useWorkoutHistory, useTrainingTips, useDeleteWorkout } from '@/features/workout/hooks/useWorkout'
// import type { WorkoutSession, Exercise, TrainingTip } from '@/types/api'
import '@/assets/workout.css'

export default function WorkoutPage() {
  const [activeDay, setActiveDay] = useState(23)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSec, setTimerSec] = useState(90)
  const timerMax = 90

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isTimerRunning && timerSec > 0) {
      interval = setInterval(() => {
        setTimerSec((prev) => prev - 1)
      }, 1000)
    } else if (timerSec <= 0) {
      setIsTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timerSec])

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimerSec(90)
  }

  const toggleTimer = () => {
    if (timerSec <= 0) resetTimer()
    setIsTimerRunning(!isTimerRunning)
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const timerArc = 440 * (timerSec / timerMax)

  // Demo Modal State
  const [selectedEx, setSelectedEx] = useState<any>(null)

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Tập luyện</h1>
          <p>Tuần này: 4/5 buổi đã hoàn thành</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost2 btn-sm">+ Thêm bài tập</button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsTimerRunning(true)}>▶ Bắt đầu buổi tập</button>
        </div>
      </div>

      <div className="content">
        {/* Week nav */}
        <div className="week-nav fade-up">
          {[
            { name: 'T4', num: 17, status: '✓ Xong', type: 'done' },
            { name: 'T5', num: 18, status: '✓ Xong', type: 'done' },
            { name: 'T6', num: 19, status: 'Nghỉ', type: 'rest' },
            { name: 'T7', num: 20, status: '✓ Xong', type: 'done' },
            { name: 'CN', num: 21, status: 'Nghỉ', type: 'rest' },
            { name: 'T2', num: 22, status: '✓ Xong', type: 'done' },
            { name: 'T3', num: 23, status: 'Hôm nay', type: 'active' },
          ].map(d => (
            <div 
              key={d.num} 
              className={`day-pill ${d.type} ${activeDay === d.num ? 'active' : ''}`}
              onClick={() => setActiveDay(d.num)}
            >
              <div className="day-name">{d.name}</div>
              <div className="day-num">{d.num}</div>
              <div className="day-status" style={{ color: d.type === 'done' && activeDay !== d.num ? 'var(--green-mid)' : d.type === 'rest' && activeDay !== d.num ? 'var(--text-muted)' : undefined }}>
                {d.status}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
          {/* Exercise list */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-dark)' }}>Strength + Cardio</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Thứ Ba, 23/04 · Ước tính 65 phút · ~540 kcal</div>
              </div>
              <div className="badge badge-orange">Đang diễn ra</div>
            </div>

            {/* Exercise cards */}
            <div className="ex-card done-ex fade-up" onClick={() => setSelectedEx({ icon: '🏃', muscle: 'Cardio', name: 'Chạy bộ ngoài trời', sets: 1, reps: '28 phút', weight: '5.2km' })}>
              <div className="ex-card-header">
                <div className="ex-icon-big">🏃</div>
                <div style={{ flex: 1 }}>
                  <div className="ex-title">Chạy bộ ngoài trời</div>
                  <div className="ex-meta">Cardio · 28 phút · 5.2km · ~285 kcal</div>
                </div>
                <div className="badge badge-green">✓ Hoàn thành</div>
              </div>
            </div>

            <div className="ex-card active-ex fade-up" style={{ animationDelay: '.06s' }} onClick={() => setSelectedEx({ icon: '💪', muscle: 'Ngực · Vai · Tay sau', name: 'Bench Press', sets: 4, reps: 10, weight: 60 })}>
              <div className="ex-card-header">
                <div className="ex-icon-big" style={{ background: 'var(--green-accent)' }}>💪</div>
                <div style={{ flex: 1 }}>
                  <div className="ex-title">Bench Press</div>
                  <div className="ex-meta">Ngực · 4 sets × 10 reps · 60kg · ~120 kcal</div>
                </div>
                <div className="badge badge-blue">Đang làm</div>
              </div>
              <div className="set-grid">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`set-box ${s <= 2 ? 'done-set' : ''}`}>
                    <div className="set-num">Set {s}</div>
                    <div className="set-val">10</div>
                    <div className="set-unit">reps × 60kg</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ex-card fade-up" style={{ animationDelay: '.1s' }} onClick={() => setSelectedEx({ icon: '🦵', muscle: 'Chân · Mông', name: 'Barbell Squat', sets: 3, reps: 12, weight: 80 })}>
              <div className="ex-card-header">
                <div className="ex-icon-big">🦵</div>
                <div style={{ flex: 1 }}>
                  <div className="ex-title">Barbell Squat</div>
                  <div className="ex-meta">Chân · 3 sets × 12 reps · 80kg · ~95 kcal</div>
                </div>
                <div className="badge" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>Chờ</div>
              </div>
              <div className="set-grid">
                {[1, 2, 3].map(s => (
                  <div key={s} className="set-box">
                    <div className="set-num">Set {s}</div>
                    <div className="set-val">12</div>
                    <div className="set-unit">reps × 80kg</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ex-card fade-up" style={{ animationDelay: '.14s' }}>
              <div className="ex-card-header">
                <div className="ex-icon-big">🤸</div>
                <div style={{ flex: 1 }}>
                  <div className="ex-title">Plank Core</div>
                  <div className="ex-meta">Core · 3 sets × 60 giây · ~40 kcal</div>
                </div>
                <div className="badge" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>Chờ</div>
              </div>
              <div className="set-grid">
                {[1, 2, 3].map(s => (
                  <div key={s} className="set-box">
                    <div className="set-num">Set {s}</div>
                    <div className="set-val">60</div>
                    <div className="set-unit">giây</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ex-card fade-up" style={{ animationDelay: '.18s' }}>
              <div className="ex-card-header">
                <div className="ex-icon-big">🏋️</div>
                <div style={{ flex: 1 }}>
                  <div className="ex-title">Deadlift</div>
                  <div className="ex-meta">Lưng & Chân · 3 sets × 8 reps · 100kg · ~100 kcal</div>
                </div>
                <div className="badge" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>Chờ</div>
              </div>
            </div>
          </div>

          {/* Right panel: Timer + summary */}
          <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Timer */}
            <div className="card card-pad fade-up" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 16 }}>Nghỉ giữa set</div>
              <div className="timer-ring">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="var(--bg)" strokeWidth="10"/>
                  <circle cx="80" cy="80" r="70" fill="none" stroke="var(--green-accent)" strokeWidth="10" strokeDasharray={`${timerArc} 440`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s linear' }} />
                </svg>
                <div className="timer-center">
                  <div className="timer-display">{formatTimer(timerSec)}</div>
                  <div className="timer-label">còn lại</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button className="btn btn-ghost2 btn-sm" onClick={resetTimer}>↺ Reset</button>
                <button className="btn btn-primary btn-sm" onClick={toggleTimer}>{isTimerRunning ? '⏸ Dừng' : '▶ Bắt đầu'}</button>
              </div>
            </div>

            {/* Session summary */}
            <div className="card card-pad fade-up" style={{ animationDelay: '.1s' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 14 }}>Buổi tập hôm nay</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="summary-stat"><div className="s-val">42</div><div className="s-lbl">Phút</div></div>
                <div className="summary-stat"><div className="s-val">405</div><div className="s-lbl">Kcal đốt</div></div>
                <div className="summary-stat"><div className="s-val">12</div><div className="s-lbl">Sets xong</div></div>
                <div className="summary-stat"><div className="s-val">3/5</div><div className="s-lbl">BT hoàn thành</div></div>
              </div>
            </div>

            {/* Weekly progress */}
            <div className="card card-pad fade-up" style={{ animationDelay: '.15s' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 12 }}>Tuần này</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Buổi tập</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-dark)' }}>4 / 5</span>
              </div>
              <div className="prog-bar" style={{ height: 8, marginBottom: 14 }}><div className="prog-fill" style={{ width: '80%' }}></div></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Calories đốt</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-dark)' }}>2,160 / 3,200</span>
              </div>
              <div className="prog-bar" style={{ height: 8 }}><div className="prog-fill orange" style={{ width: '67%' }}></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* EXERCISE DETAIL MODAL */}
      {selectedEx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSelectedEx(null)}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            {/* Hero */}
            <div style={{ background: 'var(--green-cta)', borderRadius: '24px 24px 0 0', padding: 28, color: '#fff', position: 'relative' }}>
              <button onClick={() => setSelectedEx(null)} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{selectedEx.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', opacity: .7, marginBottom: 4 }}>{selectedEx.muscle}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700 }}>{selectedEx.name}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <div className="badge" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 10 }}>Intermediate</div>
                    <div className="badge" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 10 }}>Barbell</div>
                    <div className="badge" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 10 }}>Compound</div>
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>~120</div>
                  <div style={{ fontSize: 11, opacity: .65 }}>kcal/session</div>
                </div>
              </div>
            </div>
            
            {/* Video preview dummy */}
            <div style={{ background: 'var(--green-dark)', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
              <div style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: 56, marginBottom: 8 }}>▶️</div>
                <div style={{ fontSize: 14, fontWeight: 600, opacity: .8 }}>Xem video hướng dẫn</div>
                <div style={{ fontSize: 11, opacity: .5, marginTop: 4 }}>3:24 phút</div>
              </div>
              <div style={{ position: 'absolute', bottom: 12, right: 16, background: 'rgba(255,255,255,.1)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#fff' }}>HD • 1080p</div>
            </div>

            {/* Body */}
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>{selectedEx.sets}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Sets</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>{selectedEx.reps}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Reps</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>{selectedEx.weight}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>kg</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>90</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Nghỉ (giây)</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Cơ chủ đạo</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <div className="badge badge-dark">Ngực (Pectoralis)</div>
                    <div className="badge badge-green">Vai trước</div>
                    <div className="badge badge-green">Tay sau (Triceps)</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Cơ phụ trợ</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <div className="badge" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>Vai sau</div>
                    <div className="badge" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>Core</div>
                    <div className="badge" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>Lưng</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 12 }}>Hướng dẫn thực hiện</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--green-cta)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>1</div>
                    <div style={{ fontSize: 13, color: 'var(--text-body)', lineHeight: 1.6 }}>Nằm ngửa trên ghế, bàn chân đặt phẳng trên sàn. Grip tay rộng hơn vai một chút.</div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--green-cta)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>2</div>
                    <div style={{ fontSize: 13, color: 'var(--text-body)', lineHeight: 1.6 }}>Hít sâu, hạ thanh tạ chậm rãi xuống ngực (khoảng 2-3 giây). Giữ khuỷu tay góc 45-75°.</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost2" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedEx(null)}>Đóng</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setSelectedEx(null); setIsTimerRunning(true); }}>▶ Bắt đầu bài tập</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
