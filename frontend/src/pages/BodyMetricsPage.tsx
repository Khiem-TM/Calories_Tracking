import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useLatestBodyMetrics, useLogBodyMetrics } from '@/features/body-metrics/hooks/useBodyMetrics'
import '@/assets/bodymetrics.css'

const schema = z.object({
  weight: z.coerce.number().optional(),
  chest: z.coerce.number().optional(),
  waist: z.coerce.number().optional(),
  hips: z.coerce.number().optional(),
})
type FormValues = z.infer<typeof schema>

export default function BodyMetricsPage() {
  const [logOpen, setLogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'timeline'|'photos'|'charts'>('timeline')

  const { data: latest } = useLatestBodyMetrics()
  const { mutate: log, isPending } = useLogBodyMetrics()

  const { register, handleSubmit } = useForm<FormValues>({ resolver: zodResolver(schema) as unknown as Resolver<FormValues> })

  const currWeight = latest?.weight || 68.4

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Body Metrics</h1>
          <p>Theo dõi số đo và thay đổi cơ thể theo thời gian</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost2 btn-sm" onClick={() => setLogOpen(!logOpen)}>+ Cập nhật hôm nay</button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('photos')}>📸 Thêm ảnh</button>
        </div>
      </div>

      <div className="content">
        {/* KPI row */}
        <div className="grid-4 fade-up" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="icon-wrap">⚖️</div>
            <div className="stat-val">{currWeight}<span style={{ fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 400, color: 'var(--text-muted)' }}>kg</span></div>
            <div className="stat-label">Cân nặng hiện tại</div>
            <div className="stat-change down" style={{ marginTop: 8 }}>↓ −1.6kg từ tháng trước</div>
            <div style={{ marginTop: 10 }}>
              <div className="mini-chart" style={{ height: 36 }}>
                <div className="mini-bar" style={{ height: '100%' }}></div><div className="mini-bar" style={{ height: '92%' }}></div><div className="mini-bar" style={{ height: '88%' }}></div><div className="mini-bar" style={{ height: '95%' }}></div><div className="mini-bar" style={{ height: '85%' }}></div><div className="mini-bar" style={{ height: '78%' }}></div><div className="mini-bar highlighted" style={{ height: '76%' }}></div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="icon-wrap">📐</div>
            <div className="stat-val">22.3</div>
            <div className="stat-label">BMI</div>
            <div className="stat-change down" style={{ marginTop: 8 }}>Bình thường (18.5–24.9)</div>
            <div className="bmi-bar" style={{ marginTop: 10 }}>
              <div className="bmi-needle" style={{ left: '40%' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)' }}><span>Gầy</span><span>BT</span><span>Thừa cân</span><span>Béo</span></div>
          </div>
          <div className="stat-card">
            <div className="icon-wrap">📏</div>
            <div className="stat-val">18.5<span style={{ fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 400, color: 'var(--text-muted)' }}>%</span></div>
            <div className="stat-label">Tỷ lệ mỡ cơ thể</div>
            <div className="stat-change down" style={{ marginTop: 8 }}>↓ −0.8% từ tháng trước</div>
            <div style={{ marginTop: 10 }}><div className="prog-bar" style={{ height: 8 }}><div className="prog-fill" style={{ width: '62%' }}></div></div></div>
          </div>
          <div className="stat-card">
            <div className="icon-wrap">💪</div>
            <div className="stat-val">55.8<span style={{ fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 400, color: 'var(--text-muted)' }}>kg</span></div>
            <div className="stat-label">Khối lượng cơ (LBM)</div>
            <div className="stat-change up" style={{ marginTop: 8 }}>↑ +0.4kg từ tháng trước</div>
            <div style={{ marginTop: 10 }}><div className="prog-bar" style={{ height: 8 }}><div className="prog-fill orange" style={{ width: '81%' }}></div></div></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          {/* Left: Timeline & Data */}
          <div>
            {/* Tabs */}
            <div className="metrics-tabs fade-up" style={{ animationDelay: '.06s' }}>
              <button className={`metrics-tab ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>Lịch sử</button>
              <button className={`metrics-tab ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>Ảnh so sánh</button>
              <button className={`metrics-tab ${activeTab === 'charts' ? 'active' : ''}`} onClick={() => setActiveTab('charts')}>Biểu đồ</button>
            </div>

            {/* Timeline */}
            {activeTab === 'timeline' && (
              <div className="timeline fade-up" style={{ animationDelay: '.1s' }}>
                <div className="timeline-entry">
                  <div className="timeline-dot today"></div>
                  <div className="entry-card">
                    <div className="entry-header">
                      <div>
                        <div className="entry-date">Hôm nay — 23/04/2026</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Cảm giác: Khoẻ mạnh, năng lượng tốt</div>
                      </div>
                      <div className="badge badge-green">Hôm nay</div>
                    </div>
                    <div className="entry-body">
                      <div className="metric-chip"><div className="metric-val">{currWeight}</div><div className="metric-lbl">Cân nặng (kg)</div><div className="metric-change down">↓ −0.3</div></div>
                      <div className="metric-chip"><div className="metric-val">{latest?.waist || 80}</div><div className="metric-lbl">Vòng eo (cm)</div><div className="metric-change down">↓ −0.5</div></div>
                      <div className="metric-chip"><div className="metric-val">{latest?.hips || 96}</div><div className="metric-lbl">Vòng hông (cm)</div><div className="metric-change down">↓ −0.2</div></div>
                      <div className="metric-chip"><div className="metric-val">{latest?.chest || 38}</div><div className="metric-lbl">Vòng ngực (cm)</div><div className="metric-change" style={{ color: 'var(--text-muted)' }}>—</div></div>
                      <div className="metric-chip"><div className="metric-val">55</div><div className="metric-lbl">Vòng đùi (cm)</div><div className="metric-change down">↓ −0.3</div></div>
                      <div className="photo-thumb">🧍</div>
                    </div>
                  </div>
                </div>

                <div className="timeline-entry">
                  <div className="timeline-dot"></div>
                  <div className="entry-card">
                    <div className="entry-header">
                      <div>
                        <div className="entry-date">16/04/2026</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Cảm giác: Hơi mệt, sau buổi tập nặng</div>
                      </div>
                      <div className="badge" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>7 ngày trước</div>
                    </div>
                    <div className="entry-body">
                      <div className="metric-chip"><div className="metric-val">68.7</div><div className="metric-lbl">Cân nặng (kg)</div><div className="metric-change down">↓ −0.5</div></div>
                      <div className="metric-chip"><div className="metric-val">80.5</div><div className="metric-lbl">Vòng eo (cm)</div><div className="metric-change down">↓ −0.5</div></div>
                      <div className="metric-chip"><div className="metric-val">96.2</div><div className="metric-lbl">Vòng hông (cm)</div><div className="metric-change down">↓ −0.3</div></div>
                      <div className="metric-chip"><div className="metric-val">38</div><div className="metric-lbl">Vòng ngực (cm)</div><div className="metric-change" style={{ color: 'var(--text-muted)' }}>—</div></div>
                      <div className="metric-chip"><div className="metric-val">55.3</div><div className="metric-lbl">Vòng đùi (cm)</div><div className="metric-change down">↓ −0.2</div></div>
                      <div className="photo-thumb">📸</div>
                    </div>
                  </div>
                </div>

                <div className="timeline-entry">
                  <div className="timeline-dot" style={{ background: 'var(--text-muted)', boxShadow: '0 0 0 2px var(--text-muted)' }}></div>
                  <div className="entry-card" style={{ borderColor: 'var(--border)' }}>
                    <div className="entry-header">
                      <div>
                        <div className="entry-date">25/03/2026 — Điểm khởi đầu</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Bắt đầu hành trình với Tracker</div>
                      </div>
                      <div className="badge badge-blue">Điểm đầu</div>
                    </div>
                    <div className="entry-body">
                      <div className="metric-chip"><div className="metric-val">70.0</div><div className="metric-lbl">Cân nặng (kg)</div><div className="metric-change" style={{ color: 'var(--text-muted)' }}>Bắt đầu</div></div>
                      <div className="metric-chip"><div className="metric-val">83</div><div className="metric-lbl">Vòng eo (cm)</div><div className="metric-change" style={{ color: 'var(--text-muted)' }}>Bắt đầu</div></div>
                      <div className="metric-chip"><div className="metric-val">97.5</div><div className="metric-lbl">Vòng hông (cm)</div><div className="metric-change" style={{ color: 'var(--text-muted)' }}>Bắt đầu</div></div>
                      <div className="metric-chip"><div className="metric-val">38</div><div className="metric-lbl">Vòng ngực (cm)</div><div className="metric-change" style={{ color: 'var(--text-muted)' }}>Bắt đầu</div></div>
                      <div className="metric-chip"><div className="metric-val">56.5</div><div className="metric-lbl">Vòng đùi (cm)</div><div className="metric-change" style={{ color: 'var(--text-muted)' }}>Bắt đầu</div></div>
                      <div className="photo-thumb">📸</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Photos tab */}
            {activeTab === 'photos' && (
              <div className="card card-pad fade-up">
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 6 }}>So sánh ảnh trước / sau</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Chọn 2 mốc thời gian để so sánh</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Trước — 25/03/2026</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <div className="photo-slot filled" style={{ aspectRatio: '3/4' }}><div className="slot-emoji">🧍</div><div className="slot-label">Trước</div></div>
                      <div className="photo-slot filled" style={{ aspectRatio: '3/4' }}><div className="slot-emoji">🧍</div><div className="slot-label">Nghiêng</div></div>
                      <div className="photo-slot filled" style={{ aspectRatio: '3/4' }}><div className="slot-emoji">🧍</div><div className="slot-label">Sau lưng</div></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-accent)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Sau — 23/04/2026</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <div className="photo-slot filled" style={{ aspectRatio: '3/4', borderColor: 'var(--green-accent)' }}><div className="slot-emoji" style={{ fontSize: 40 }}>🧍</div><div className="slot-label" style={{ color: 'var(--green-accent)' }}>Trước</div></div>
                      <div className="photo-slot filled" style={{ aspectRatio: '3/4', borderColor: 'var(--green-accent)' }}><div className="slot-emoji" style={{ fontSize: 40 }}>🧍</div><div className="slot-label" style={{ color: 'var(--green-accent)' }}>Nghiêng</div></div>
                      <div className="photo-slot filled" style={{ aspectRatio: '3/4', borderColor: 'var(--green-accent)' }}><div className="slot-emoji" style={{ fontSize: 40 }}>🧍</div><div className="slot-label" style={{ color: 'var(--green-accent)' }}>Sau lưng</div></div>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: 14, marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, textAlign: 'center' }}>
                  <div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>−1.6kg</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cân nặng</div></div>
                  <div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>−3cm</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vòng eo</div></div>
                  <div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>−1.5cm</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vòng hông</div></div>
                  <div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>29 ngày</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Thời gian</div></div>
                </div>
              </div>
            )}

            {/* Charts tab */}
            {activeTab === 'charts' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="fade-up">
                <div className="card card-pad">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>Cân nặng (kg)</div>
                  <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs><linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3a8f67"/><stop offset="100%" stopColor="#3a8f67" stopOpacity="0"/></linearGradient></defs>
                    <path d="M0,15 L60,30 L120,48 L180,62 L240,74 L300,82 L300,100 L0,100Z" fill="url(#wGrad)" opacity=".2"/>
                    <path d="M0,15 L60,30 L120,48 L180,62 L240,74 L300,82" fill="none" stroke="var(--green-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="300" cy="82" r="4" fill="var(--green-cta)" stroke="#fff" strokeWidth="2"/>
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}><span>25/3</span><span>9/4</span><span>16/4</span><span>Hnay</span></div>
                </div>
                <div className="card card-pad">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>Vòng eo (cm)</div>
                  <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <path d="M0,10 L60,28 L120,45 L180,60 L240,72 L300,80 L300,100 L0,100Z" fill="url(#wGrad)" opacity=".15"/>
                    <path d="M0,10 L60,28 L120,45 L180,60 L240,72 L300,80" fill="none" stroke="#f4a62a" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="300" cy="80" r="4" fill="#f4a62a" stroke="#fff" strokeWidth="2"/>
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}><span>25/3</span><span>9/4</span><span>16/4</span><span>Hnay</span></div>
                </div>
                <div className="card card-pad">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>% Mỡ cơ thể</div>
                  <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <path d="M0,8 L60,22 L120,40 L180,55 L240,68 L300,76 L300,100 L0,100Z" fill="#e05c5c" opacity=".1"/>
                    <path d="M0,8 L60,22 L120,40 L180,55 L240,68 L300,76" fill="none" stroke="#e05c5c" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="300" cy="76" r="4" fill="#e05c5c" stroke="#fff" strokeWidth="2"/>
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}><span>25/3</span><span>9/4</span><span>16/4</span><span>Hnay</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Goal progress */}
            <div className="card card-pad fade-up" style={{ animationDelay: '.12s' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 14 }}>Tiến trình mục tiêu</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cân nặng: 68.4 → 65kg</span>
                <span className="badge badge-green">−1.6kg</span>
              </div>
              <div className="prog-bar" style={{ height: 10, marginBottom: 14 }}><div className="prog-fill" style={{ width: '37%' }}></div></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Vòng eo: 80 → 76cm</span>
                <span className="badge badge-green">−3cm</span>
              </div>
              <div className="prog-bar" style={{ height: 10 }}><div className="prog-fill orange" style={{ width: '43%' }}></div></div>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>Ước tính đạt mục tiêu cân nặng trong <strong style={{ color: 'var(--green-dark)' }}>~5 tuần</strong></div>
            </div>

            {/* Quick update button proxy */}
            <div className="card card-pad fade-up border !border-green-accent bg-green-light/20 cursor-pointer hover:bg-green-light transition-colors" onClick={() => setLogOpen(true)}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', textAlign: 'center' }}>+ Cập nhật Body Metrics ngày hôm nay</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add entry modal */}
      {logOpen && (
        <div className="lightbox open" onClick={() => setLogOpen(false)}>
          <div className="lightbox-inner" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 4, fontFamily: "'Playfair Display',serif" }}>Cập nhật Body Metrics</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>23/04/2026</div>
            <form onSubmit={handleSubmit((v) => log(v, { onSuccess: () => setLogOpen(false) }))}>
              <div className="measurements-grid" style={{ marginBottom: 16, textAlign: 'left' }}>
                <div className="m-field"><label>Cân nặng</label><div className="m-input-wrap"><input type="number" step="0.1" {...register('weight')} /><span className="m-unit">kg</span></div></div>
                <div className="m-field"><label>Vòng eo</label><div className="m-input-wrap"><input type="number" step="0.5" {...register('waist')} /><span className="m-unit">cm</span></div></div>
                <div className="m-field"><label>Vòng hông</label><div className="m-input-wrap"><input type="number" step="0.5" {...register('hips')} /><span className="m-unit">cm</span></div></div>
                <div className="m-field"><label>Vòng ngực</label><div className="m-input-wrap"><input type="number" step="0.5" {...register('chest')} /><span className="m-unit">cm</span></div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 24 }}>
                <button type="button" className="btn btn-ghost2" style={{ justifyContent: 'center' }} onClick={() => setLogOpen(false)}>Huỷ</button>
                <button type="submit" disabled={isPending} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                  {isPending ? <Loader2 className="animate-spin" size={16} /> : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
