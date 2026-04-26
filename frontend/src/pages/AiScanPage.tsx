import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { mealLogService } from '@/features/meal-logs/services/mealLogService'
import { foodService } from '@/features/food/services/foodService'
import '@/assets/aiscan.css'

interface ScanResult {
  id?: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence?: number
}

function formatDate(d: Date) { return d.toISOString().split('T')[0] }

const MEAL_TYPE_OPTIONS = [
  { value: 'breakfast', label: '🌅 Bữa sáng' },
  { value: 'lunch', label: '☀️ Bữa trưa' },
  { value: 'snack', label: '🍊 Bữa phụ' },
  { value: 'dinner', label: '🌙 Bữa tối' },
]

const FOOD_ICONS = ['🍚', '🍗', '🥦', '🥚', '🍜', '🥗', '🍱', '🥩']

export default function AiScanPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [step, setStep] = useState<'upload' | 'loading' | 'result'>('upload')
  const [results, setResults] = useState<ScanResult[]>([])
  const [selectedItems, setSelectedItems] = useState<boolean[]>([])
  const [mealType, setMealType] = useState('lunch')
  const [addingToLog, setAddingToLog] = useState(false)

  const { mutate: analyze } = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData()
      fd.append('image', file)
      return api.post('/ai-scan/analyze', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: (res) => {
      const data = res.data?.data ?? res.data
      const arr = Array.isArray(data) ? data : [data]
      setResults(arr)
      setSelectedItems(arr.map(() => true))
      setTimeout(() => setStep('result'), 2600)
    },
    onError: () => {
      toast.error('Không thể phân tích ảnh. Vui lòng thử lại.')
      setStep('upload')
    },
  })

  const handleFile = (file: File) => {
    setStep('loading')
    setResults([])
    analyze(file)
  }

  const selectedCals = results.reduce((acc, curr, i) => acc + (selectedItems[i] ? curr.calories : 0), 0)
  const selectedCount = selectedItems.filter(Boolean).length

  const handleAddToLog = async () => {
    const selected = results.filter((_, i) => selectedItems[i])
    if (selected.length === 0) {
      toast.error('Chọn ít nhất một món để thêm')
      return
    }

    setAddingToLog(true)
    try {
      // 1. Tạo meal log
      const logRes = await mealLogService.create({
        mealType,
        date: formatDate(new Date()),
        notes: 'Thêm từ AI Scan',
      })
      const mealLog = logRes.data?.data ?? logRes.data
      const mealLogId = mealLog?.id

      if (!mealLogId) throw new Error('Không tạo được nhật ký bữa ăn')

      // 2. Với mỗi món được chọn: tìm food có sẵn hoặc tạo custom food, rồi add item
      for (const item of selected) {
        try {
          let foodId = item.id

          if (!foodId) {
            // Tạo custom food từ dữ liệu AI scan
            const createRes = await foodService.create({
              name: item.name,
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fat: item.fat,
              servingSize: 100,
            })
            const created = createRes.data?.data ?? createRes.data
            foodId = created?.id
          }

          if (foodId) {
            await mealLogService.addItem(mealLogId, { foodId, quantity: 100 })
          }
        } catch {
          // Bỏ qua nếu không thêm được 1 món
        }
      }

      qc.invalidateQueries({ queryKey: ['meal-logs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`Đã thêm ${selected.length} món vào ${MEAL_TYPE_OPTIONS.find(m => m.value === mealType)?.label ?? mealType}`)
      navigate('/food-log')
    } catch (err) {
      toast.error('Không thể thêm vào nhật ký')
    } finally {
      setAddingToLog(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>AI Scan</h1>
          <p>Nhận diện thực phẩm bằng ảnh · Powered by AI</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost2 btn-sm" onClick={() => navigate('/food-log')}>
            ← Nhật ký hôm nay
          </button>
        </div>
      </div>

      <div className="scan-stage">
        <div className="scan-hero fade-up">
          <div className="scan-hero-icon">🔍</div>
          <div>
            <h2>Chụp ảnh — AI nhận diện ngay</h2>
            <p>Chụp hoặc tải ảnh bữa ăn. AI sẽ tự nhận diện từng món và tính calo chỉ trong vài giây.</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, opacity: .65, marginBottom: 4 }}>Độ chính xác trung bình</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, lineHeight: 1 }}>91%</div>
          </div>
        </div>

        <div className="scan-card fade-up" style={{ animationDelay: '.07s' }}>

          {step === 'upload' && (
            <div id="state-upload">
              <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)' }}>Tải ảnh lên</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="badge badge-green">📷 Ảnh thực phẩm</span>
                  <span className="badge badge-orange">🍽️ Đĩa đồ ăn</span>
                </div>
              </div>
              <div className="upload-zone" onClick={() => fileRef.current?.click()}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🍽️</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 6 }}>
                  Kéo & thả ảnh vào đây
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                  Hỗ trợ JPG, PNG, HEIC · tối đa 20MB
                </div>
                <div className="upload-camera-row" onClick={(e) => e.stopPropagation()}>
                  {/* Camera input (mobile: captures from camera) */}
                  <button className="btn btn-primary" onClick={() => cameraRef.current?.click()}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
                      <rect x="1" y="3" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                      <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M5 1h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    Chụp ảnh
                  </button>
                  <button className="btn btn-ghost2" onClick={() => fileRef.current?.click()}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
                      <rect x="1" y="1" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M4 8l2.5 2.5L11 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Chọn từ thư viện
                  </button>
                </div>
                {/* File input: gallery */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
                {/* Camera input: capture */}
                <input
                  ref={cameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
              </div>

              <div style={{ padding: '16px 24px 24px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Chọn ảnh bữa ăn để AI phân tích dinh dưỡng tự động
                </div>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div id="state-loading" className="loading-state">
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 20px', animation: 'pulse 1.5s ease-in-out infinite' }}>
                🔍
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 6 }}>
                Đang phân tích...
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                AI đang xử lý hình ảnh của bạn
              </div>
              <div className="scan-bar"><div className="scan-progress"></div></div>
              <div className="scan-dots">
                <div className="scan-dot"></div>
                <div className="scan-dot" style={{ animationDelay: '.15s' }}></div>
                <div className="scan-dot" style={{ animationDelay: '.3s' }}></div>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div id="state-result">
              <div className="result-image-preview">🍱</div>

              <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: 'var(--green-dark)' }}>
                    Món ăn được nhận diện
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Nhận diện {results.length} món trong ảnh
                  </div>
                </div>
                <button className="btn btn-ghost2 btn-sm" onClick={() => setStep('upload')}>
                  ↺ Quét lại
                </button>
              </div>

              <div className="result-summary">
                <div className="result-sum-box">
                  <div className="result-sum-val">{results.reduce((acc, curr) => acc + curr.calories, 0)}</div>
                  <div className="result-sum-lbl">kcal tổng</div>
                </div>
                <div className="result-sum-box">
                  <div className="result-sum-val">{results.reduce((acc, curr) => acc + curr.carbs, 0)}g</div>
                  <div className="result-sum-lbl">Carbs</div>
                </div>
                <div className="result-sum-box">
                  <div className="result-sum-val">{results.reduce((acc, curr) => acc + curr.protein, 0)}g</div>
                  <div className="result-sum-lbl">Protein</div>
                </div>
                <div className="result-sum-box">
                  <div className="result-sum-val">{results.reduce((acc, curr) => acc + curr.fat, 0)}g</div>
                  <div className="result-sum-lbl">Fat</div>
                </div>
              </div>

              <div style={{ padding: '16px 24px 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-muted)' }}>
                Chọn món muốn thêm vào nhật ký
              </div>

              <div>
                {results.map((item, i) => (
                  <div key={i} className="detected-item">
                    <input
                      type="checkbox"
                      className="di-check"
                      checked={selectedItems[i]}
                      onChange={() => {
                        const next = [...selectedItems]
                        next[i] = !next[i]
                        setSelectedItems(next)
                      }}
                    />
                    <div className="di-avatar">{FOOD_ICONS[i % FOOD_ICONS.length]}</div>
                    <div className="di-info">
                      <div className="di-name">{item.name}</div>
                      <div className="di-sub">1 phần · {item.carbs}g carbs · {item.protein}g protein · {item.fat}g fat</div>
                      {item.confidence != null && (
                        <div className="di-confidence" style={{ marginTop: 4 }}>
                          <div className="conf-bar">
                            <div
                              className="conf-fill"
                              style={{ width: `${item.confidence * 100}%`, background: item.confidence > 0.8 ? '#3a8f67' : '#f4a62a' }}
                            ></div>
                          </div>
                          <span className="conf-pct" style={{ color: item.confidence > 0.8 ? 'var(--text-muted)' : '#c47a00' }}>
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="di-cal">{item.calories}</div>
                      <div className="di-cal-unit">kcal</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '20px 24px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Calo từ các món đã chọn</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: 'var(--green-dark)', lineHeight: 1 }}>
                    {selectedCals}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>kcal · {selectedCount} món</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Thêm vào bữa
                    </label>
                    <select
                      className="input"
                      style={{ padding: '8px 12px', fontSize: 13, minWidth: 140 }}
                      value={mealType}
                      onChange={e => setMealType(e.target.value)}
                    >
                      {MEAL_TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-primary"
                      disabled={selectedCount === 0 || addingToLog}
                      onClick={handleAddToLog}
                    >
                      {addingToLog ? '⏳ Đang thêm...' : `+ Thêm ${selectedCount} món`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {step === 'upload' && (
          <div className="fade-up" style={{ width: '100%', maxWidth: 820, marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, animationDelay: '.15s' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(201,228,212,.5)', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>📸</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 4 }}>Chụp từ phía trên</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Góc chụp thẳng từ trên xuống giúp AI nhận diện chính xác hơn</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(201,228,212,.5)', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>💡</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 4 }}>Đủ ánh sáng</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chụp trong điều kiện ánh sáng tốt để màu sắc thực phẩm hiện rõ</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(201,228,212,.5)', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🎯</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 4 }}>Một đĩa mỗi lần</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chụp từng đĩa riêng biệt để AI phân tích chính xác từng món</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
