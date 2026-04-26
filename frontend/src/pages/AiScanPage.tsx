import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useNavigate } from 'react-router-dom'
import '@/assets/aiscan.css'

interface ScanResult {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence?: number
}

export default function AiScanPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  
  const [step, setStep] = useState<'upload' | 'loading' | 'result'>('upload')
  const [results, setResults] = useState<ScanResult[]>([])
  const [selectedItems, setSelectedItems] = useState<boolean[]>([])

  const { mutate: analyze } = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData(); fd.append('image', file)
      return api.post('/ai-scan/analyze', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: (res) => {
      const data = res.data?.data ?? res.data
      const arr = Array.isArray(data) ? data : [data]
      setResults(arr)
      setSelectedItems(arr.map(() => true))
      
      // Simulate loading animation
      setTimeout(() => {
        setStep('result')
      }, 2600)
    },
  })

  const handleFile = (file: File) => {
    setStep('loading')
    setResults([])
    analyze(file)
  }

  // Demo behavior:
  const handleDemoScan = () => {
    setStep('loading')
    setTimeout(() => {
      setResults([
        { name: 'Cơm gạo trắng', calories: 260, carbs: 56, protein: 5, fat: 0, confidence: 0.96 },
        { name: 'Thịt gà kho gừng', calories: 218, carbs: 12, protein: 28, fat: 8, confidence: 0.91 },
        { name: 'Rau cải xào tỏi', calories: 72, carbs: 5, protein: 2, fat: 5, confidence: 0.88 },
        { name: 'Trứng chiên', calories: 98, carbs: 1, protein: 7, fat: 7, confidence: 0.74 }
      ])
      setSelectedItems([true, true, true, false])
      setStep('result')
    }, 2600)
  }

  const selectedCals = results.reduce((acc, curr, i) => acc + (selectedItems[i] ? curr.calories : 0), 0)
  const selectedCount = selectedItems.filter(Boolean).length

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>AI Scan</h1>
          <p>Nhận diện thực phẩm bằng ảnh · Powered by AI</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost2 btn-sm" onClick={() => navigate('/food-log')}>← Nhật ký hôm nay</button>
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
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 6 }}>Kéo & thả ảnh vào đây</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Hỗ trợ JPG, PNG, HEIC · tối đa 20MB</div>
                <div className="upload-camera-row" onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-primary" onClick={handleDemoScan}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 15 15"><rect x="1" y="3" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 1h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    Chụp ảnh
                  </button>
                  <button className="btn btn-ghost2" onClick={handleDemoScan}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 15 15"><rect x="1" y="1" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M4 8l2.5 2.5L11 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Chọn từ thư viện
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              </div>
              
              <div style={{ padding: '0 24px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-muted)', marginBottom: 12 }}>Lần quét gần đây</div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  <div style={{ flexShrink: 0, width: 90, cursor: 'pointer' }} onClick={handleDemoScan}>
                    <div style={{ width: 90, height: 72, background: 'var(--green-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 6, border: '2px solid transparent', transition: 'border .15s' }}>🍚</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-dark)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Cơm gà xào</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>480 kcal · 2h ago</div>
                  </div>
                  <div style={{ flexShrink: 0, width: 90 }}>
                    <div style={{ width: 90, height: 72, background: '#fef3e2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 6 }}>🥣</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-dark)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Yến mạch</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>320 kcal · hôm qua</div>
                  </div>
                  <div style={{ flexShrink: 0, width: 90 }}>
                    <div style={{ width: 90, height: 72, background: '#f0f4ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 6 }}>🍜</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-dark)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Phở bò</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>620 kcal · 2 ngày</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div id="state-loading" className="loading-state">
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 20px', animation: 'pulse 1.5s ease-in-out infinite' }}>🔍</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 6 }}>Đang thuật toán phân tích...</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>AI đang xử lý hình ảnh của bạn</div>
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
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: 'var(--green-dark)' }}>Món ăn được nhận diện</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Nhận diện {results.length} món trong ảnh</div>
                </div>
                <button className="btn btn-ghost2 btn-sm" onClick={() => setStep('upload')}>↺ Quét lại</button>
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
                        const newSelected = [...selectedItems]
                        newSelected[i] = !newSelected[i]
                        setSelectedItems(newSelected)
                      }} 
                    />
                    <div className="di-avatar">{i === 0 ? '🍚' : i === 1 ? '🍗' : i === 2 ? '🥦' : '🥚'}</div>
                    <div className="di-info">
                      <div className="di-name">{item.name}</div>
                      <div className="di-sub">1 phần</div>
                      {item.confidence && (
                        <div className="di-confidence" style={{ marginTop: 4 }}>
                          <div className="conf-bar"><div className="conf-fill" style={{ width: `${item.confidence * 100}%`, background: item.confidence > 0.8 ? '#3a8f67' : '#f4a62a' }}></div></div>
                          <span className="conf-pct" style={{ color: item.confidence > 0.8 ? 'var(--text-muted)' : '#c47a00' }}>{Math.round(item.confidence * 100)}%</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="di-cal">{item.calories}</div>
                      <div className="di-cal-unit">kcal</div>
                    </div>
                    <button className="di-edit" title="Chỉnh sửa">✏️</button>
                  </div>
                ))}
              </div>

              <div style={{ padding: '20px 24px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Calo từ các món đã chọn</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: 'var(--green-dark)', lineHeight: 1 }}>{selectedCals}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>kcal · {selectedCount} món</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Thêm vào bữa</label>
                    <select className="input" style={{ padding: '8px 12px', fontSize: 13, minWidth: 140 }}>
                      <option>🌅 Bữa sáng</option>
                      <option>☀️ Bữa trưa</option>
                      <option>🍊 Bữa phụ</option>
                      <option>🌙 Bữa tối</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/food-log')}>
                      + Thêm vào nhật ký
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
