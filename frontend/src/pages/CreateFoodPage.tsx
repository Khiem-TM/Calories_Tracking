import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
// import { useState } from 'react'
import { useCreateFood } from '@/features/food/hooks/useFood'
import '@/assets/createfood.css'

const CATEGORIES = ['Món Việt', 'Đồ uống', 'Trái cây', 'Rau củ', 'Thịt & Hải sản', 'Ngũ cốc', 'Ăn vặt', 'Khác']

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  brand: z.string().optional(),
  calories: z.coerce.number().min(0).default(0),
  protein: z.coerce.number().min(0).default(0),
  carbs: z.coerce.number().min(0).default(0),
  fat: z.coerce.number().min(0).default(0),
  category: z.string().optional(),
  servingSize: z.coerce.number().optional().default(100),
  servingUnit: z.string().optional().default('g'),
  emoji: z.string().optional().default('🍹'),
})
type FormValues = z.infer<typeof schema>

export default function CreateFoodPage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateFood()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: { servingSize: 300, servingUnit: 'ml', emoji: '🍹', calories: 280, carbs: 32, protein: 4, fat: 14, category: 'Đồ uống', name: '' },
  })

  // Watch for live preview
  const wName = watch('name')
  const wEmoji = watch('emoji')
  const wCal = watch('calories')
  const wCarb = watch('carbs')
  const wProt = watch('protein')
  const wFat = watch('fat')
  const wSize = watch('servingSize')
  const wUnit = watch('servingUnit')

  const total = (wCarb * 4) + (wProt * 4) + (wFat * 9) || 1
  const pc = Math.round((wCarb * 4 / total) * 100) || 0
  const pp = Math.round((wProt * 4 / total) * 100) || 0
  const pf = Math.round((wFat * 9 / total) * 100) || 0

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Tạo thực phẩm mới</h1>
          <p>Thêm món ăn cá nhân hoá của bạn</p>
        </div>
        <div className="topbar-right">
          <button type="button" onClick={() => navigate('/my-foods')} className="btn btn-ghost2 btn-sm">← Huỷ</button>
        </div>
      </div>

      <form onSubmit={handleSubmit((v) => mutate(v as Parameters<typeof mutate>[0], { onSuccess: () => {
        // use toast and navigate! Our backend creates it.
        navigate('/my-foods')
      }}))}>
        <div className="content" style={{ paddingBottom: 90 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
            
            {/* LEFT: Form */}
            <div>
              {/* Thông tin cơ bản */}
              <div className="form-section fade-up">
                <div className="form-section-header">
                  <div className="form-section-icon">📝</div>
                  <div className="form-section-title">Thông tin cơ bản</div>
                </div>
                <div className="form-section-body">
                  <div className="form-row" style={{ gridTemplateColumns: '1fr auto', alignItems: 'end', marginBottom: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Tên món ăn <span className="req">*</span></label>
                      <input className="input" placeholder="VD: Sinh tố bơ mật ong" {...register('name')} style={errors.name ? { borderColor: '#e05c5c' } : {}} />
                      {errors.name && <p className="text-xs" style={{ color: '#e05c5c' }}>{errors.name.message}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Icon / Emoji</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input className="input" {...register('emoji')} style={{ width: 56, textAlign: 'center', fontSize: 22, padding: 8 }} />
                      </div>
                    </div>
                  </div>
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <label className="form-label">Thương hiệu / Nguồn gốc</label>
                      <input className="input" {...register('brand')} placeholder="VD: Tự làm, Grab Food..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Loại thực phẩm</label>
                      <select className="input" {...register('category')}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <label className="form-label">Khẩu phần chuẩn <span className="req">*</span></label>
                      <input className="input" type="number" {...register('servingSize')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Đơn vị</label>
                      <select className="input" {...register('servingUnit')}>
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="ly">ly</option>
                        <option value="tô">tô</option>
                        <option value="cái">cái</option>
                        <option value="quả">quả</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mô tả ngắn</label>
                    <textarea className="input" rows={2} placeholder="Mô tả về món ăn này..." style={{ resize: 'vertical' }}></textarea>
                  </div>
                </div>
              </div>

              {/* Calories & Macros */}
              <div className="form-section fade-up" style={{ animationDelay: '.05s' }}>
                <div className="form-section-header">
                  <div className="form-section-icon">🔥</div>
                  <div className="form-section-title">Calories & Macronutrients</div>
                </div>
                <div className="form-section-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#7a9080" strokeWidth="1.3"/><path d="M8 5v3.5l2 2" stroke="#7a9080" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nhập thủ công <b style={{ color: 'var(--green-dark)' }}>hoặc</b> để hệ thống tự tính</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--green-dark)' }}>
                      <input type="checkbox" style={{ accentColor: 'var(--green-accent)' }} /> Tự tính
                    </label>
                  </div>
                  <div className="form-row cols-4" id="macro-inputs">
                    <div className="form-group">
                      <label className="form-label">Calories <span className="req">*</span></label>
                      <input className="input" type="number" style={{ fontWeight: 700, fontSize: 15 }} {...register('calories')} />
                      <span className="form-hint">kcal</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#3a8f67' }}>Carbs</label>
                      <input className="input" type="number" {...register('carbs')} />
                      <span className="form-hint">gam</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#c47a00' }}>Protein</label>
                      <input className="input" type="number" {...register('protein')} />
                      <span className="form-hint">gam</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#2563eb' }}>Fat</label>
                      <input className="input" type="number" {...register('fat')} />
                      <span className="form-hint">gam</span>
                    </div>
                  </div>
                  <div className="form-row cols-3" style={{ marginBottom: 0 }}>
                    <div className="form-group">
                      <label className="form-label">Chất xơ</label>
                      <input className="input" type="number" defaultValue="2.1" step="0.1" />
                      <span className="form-hint">gam</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Đường</label>
                      <input className="input" type="number" defaultValue="18" step="0.1" />
                      <span className="form-hint">gam</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Natri</label>
                      <input className="input" type="number" defaultValue="42" />
                      <span className="form-hint">mg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image upload */}
              <div className="form-section fade-up" style={{ animationDelay: '.15s' }}>
                <div className="form-section-header">
                  <div className="form-section-icon">📸</div>
                  <div className="form-section-title">Ảnh món ăn</div>
                </div>
                <div className="form-section-body">
                  <div className="img-upload-zone" id="upload-zone">
                    <div id="upload-placeholder">
                      <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 4 }}>Kéo thả ảnh vào đây</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>hoặc click để chọn từ máy</div>
                      <button type="button" className="btn btn-ghost2 btn-sm">Chọn ảnh</button>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>JPG, PNG tối đa 5MB</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Live preview */}
            <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="cal-preview-big fade-up">
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', opacity: .7, marginBottom: 6 }}>Xem trước</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                    {wEmoji}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{wName || 'Tên món ăn'}</div>
                    <div style={{ fontSize: 11, opacity: .65, marginTop: 2 }}>Mỗi {wSize} {wUnit}</div>
                  </div>
                </div>
                <div className="cal-auto">{wCal}</div>
                <div style={{ fontSize: 11, opacity: .6, marginTop: 4 }}>calories</div>
                <div className="macro-pct-bar">
                  <div className="macro-seg" style={{ background: '#3a8f67', width: `${pc}%` }}></div>
                  <div className="macro-seg" style={{ background: '#f4a62a', width: `${pp}%` }}></div>
                  <div className="macro-seg" style={{ background: '#4a90e2', width: `${pf}%` }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: .85 }}>
                  <span>C: <b>{wCarb}g</b></span>
                  <span>P: <b>{wProt}g</b></span>
                  <span>F: <b>{wFat}g</b></span>
                </div>
              </div>

              <div className="card fade-up" style={{ animationDelay: '.1s' }}>
                <div className="card-pad" style={{ padding: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-muted)', marginBottom: 12 }}>Phân bổ Macro</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Carbs</span>
                        <span style={{ fontWeight: 700, color: 'var(--green-dark)' }}>{pc}%</span>
                      </div>
                      <div className="prog-bar"><div className="prog-fill" style={{ width: `${pc}%` }}></div></div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Protein</span>
                        <span style={{ fontWeight: 700, color: 'var(--green-dark)' }}>{pp}%</span>
                      </div>
                      <div className="prog-bar"><div className="prog-fill orange" style={{ width: `${pp}%` }}></div></div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Fat</span>
                        <span style={{ fontWeight: 700, color: 'var(--green-dark)' }}>{pf}%</span>
                      </div>
                      <div className="prog-bar"><div className="prog-fill blue" style={{ width: `${pf}%` }}></div></div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <b style={{ color: 'var(--green-dark)' }}>💡 Mẹo:</b> Điền đầy đủ nguyên liệu và bật <em>Tự tính</em> để hệ thống tự tổng hợp dinh dưỡng chính xác nhất.
              </div>
            </div>

          </div>
        </div>

        <div className="sticky-actions">
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <span>Chưa lưu</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost2" onClick={() => navigate('/my-foods')}>Huỷ</button>
            <button type="button" className="btn btn-ghost2">Lưu nháp</button>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Lưu thực phẩm
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
