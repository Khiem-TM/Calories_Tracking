import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import '@/assets/onboarding.css'

const schema = z.object({
  dob: z.string().min(1, 'Vui lòng nhập ngày sinh hợp lệ'),
  gender: z.enum(['male', 'female', 'other']),
  height: z.coerce.number().min(100, 'Nhập chiều cao từ 100–250 cm').max(250),
  weight: z.coerce.number().min(30, 'Nhập cân nặng từ 30–300 kg').max(300),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']),
  fitnessGoal: z.enum(['lose_weight', 'maintain_weight', 'gain_muscle', 'improve_fitness']),
})
type FormValues = z.infer<typeof schema>

const STEP_LABELS = ['Bước 1 / 5', 'Bước 2 / 5', 'Bước 3 / 5', 'Bước 4 / 5', 'Bước 5 / 5']
const PROGRESS = [20, 40, 60, 80, 100]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loadingStep, setLoadingStep] = useState(0) // 0: not loading, 1-4: specific steps

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: { 
      gender: 'male', 
      activityLevel: 'lightly_active', 
      fitnessGoal: 'maintain_weight',
      dob: '1995-06-15',
      height: 172,
      weight: 68
    },
  })

  const watchGender = watch('gender')
  const watchActivity = watch('activityLevel')
  const watchGoal = watch('fitnessGoal')
  const weight = watch('weight')
  
  // Calculate target based on goal
  const targetWeight = watchGoal === 'lose_weight' ? Math.round(weight * 0.93) : watchGoal === 'gain_muscle' ? Math.round(weight * 1.05) : weight
  const diff = targetWeight - weight

  const { mutate } = useMutation({
    mutationFn: (data: FormValues) => {
      // Prepare data for API
      const birth = new Date(data.dob)
      const age = new Date().getFullYear() - birth.getFullYear()
      return api.put('/users/me/health-profile', { ...data, age })
    },
    onSuccess: () => {
      // Optional: don't navigate immediately since we want to show results.
      // Setup is done via the demo calculation steps in UI.
    },
    onError: () => toast.error('Failed to save profile'),
  })

  const onSubmit = (data: unknown) => {
    mutate(data as FormValues)
    startCalculation()
  }

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await trigger(['dob', 'height', 'weight'])
      if (!isValid) return
    }
    if (step === 4) {
      handleSubmit(onSubmit)()
    } else if (step < 5) {
      setStep(s => s + 1)
    }
  }

  const startCalculation = () => {
    setStep(5)
    setLoadingStep(1)
    setTimeout(() => setLoadingStep(2), 700)
    setTimeout(() => setLoadingStep(3), 1400)
    setTimeout(() => setLoadingStep(4), 2100)
    setTimeout(() => setLoadingStep(5), 2800) // 5 means show result
  }

  // Calculate results for step 5
  const h = (watch('height') || 172) / 100
  const w = watch('weight') || 68
  const birth = new Date(watch('dob') || '1995-06-15')
  const age = new Date().getFullYear() - birth.getFullYear()
  const isMale = watchGender !== 'female'
  
  const bmr = isMale
    ? 10 * w + 6.25 * (watch('height') || 172) - 5 * age + 5
    : 10 * w + 6.25 * (watch('height') || 172) - 5 * age - 161
  
  const activityFactors: Record<string, number> = {
    sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725, extra_active: 1.9
  }
  const tdee = Math.round(bmr * (activityFactors[watchActivity] || 1.375))
  
  const goalAdjs: Record<string, number> = {
    lose_weight: -500, maintain_weight: 0, gain_muscle: 500, improve_fitness: 0
  }
  const targetCal = tdee + (goalAdjs[watchGoal] || 0)
  const bmi = (w / (h * h)).toFixed(1)

  let macros = { c: 50, p: 25, f: 25 }
  if (goalAdjs[watchGoal] < 0) macros = { c: 40, p: 35, f: 25 }
  else if (goalAdjs[watchGoal] > 0) macros = { c: 45, p: 30, f: 25 }

  const protein = Math.round(targetCal * macros.p / 100 / 4)
  const bmiStatus = parseFloat(bmi) < 18.5 ? 'Thiếu cân' : parseFloat(bmi) < 25 ? 'Bình thường' : parseFloat(bmi) < 30 ? 'Thừa cân' : 'Béo phì'
  const water = (w * 0.033).toFixed(1)

  const goalNames: Record<string, string> = { 'lose_weight': 'Giảm cân', 'maintain_weight': 'Duy trì cân nặng', 'gain_muscle': 'Tăng cơ', 'improve_fitness': 'Cải thiện thể lực' }
  const activityNames: Record<string, string> = { 'sedentary': 'Ít vận động', 'lightly_active': 'Nhẹ nhàng', 'moderately_active': 'Vừa phải', 'very_active': 'Năng động', 'extra_active': 'Cực kỳ năng động' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* HEADER */}
      <div className="ob-header">
        <a href="#" className="ob-logo">Tracker<span>.</span></a>
        <span className="ob-step-label">{STEP_LABELS[step - 1]}</span>
      </div>

      {/* PROGRESS */}
      <div className="ob-progress">
        <div className="ob-progress-track">
          <div className="ob-progress-fill" style={{ width: `${PROGRESS[step - 1]}%` }}></div>
        </div>
        <div className="ob-step-dots">
          {[1, 2, 3, 4, 5].map((i) => (
            <div className="ob-dot" key={i}>
              <div className={`ob-dot-circle ${i < step || (i === 5 && loadingStep === 5) ? 'done' : i === step ? 'active' : ''}`}>
                {i < step || (i === 5 && loadingStep === 5) ? '✓' : i}
              </div>
              <div className={`ob-dot-label ${i === step ? 'active' : ''}`}>
                {i === 1 ? 'Cơ bản' : i === 2 ? 'Vận động' : i === 3 ? 'Mục tiêu' : i === 4 ? 'Chế độ ăn' : 'Kết quả'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STAGE */}
      <div className="ob-stage">
        <div className="ob-card">

          {/* ═══ STEP 1 ═══ */}
          <div className={`ob-step ${step === 1 ? 'active' : ''}`}>
            <div className="ob-card-inner">
              <div className="step-eyebrow">Bước 1 — Thông tin cơ bản</div>
              <div className="step-title">Hãy cho chúng tôi biết về bạn</div>
              <div className="step-sub">Thông tin này giúp chúng tôi tính toán chỉ số sức khoẻ chính xác nhất.</div>

              <div className="form-group">
                <label className="form-label">Giới tính <span style={{ color: '#e05c5c' }}>*</span></label>
                <div className="gender-cards">
                  <button type="button" className={`gender-card ${watchGender === 'male' ? 'selected' : ''}`} onClick={() => setValue('gender', 'male')}>
                    <div className="gc-icon">👨</div>
                    <div className="gc-label">Nam</div>
                  </button>
                  <button type="button" className={`gender-card ${watchGender === 'female' ? 'selected' : ''}`} onClick={() => setValue('gender', 'female')}>
                    <div className="gc-icon">👩</div>
                    <div className="gc-label">Nữ</div>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dob">Ngày sinh <span style={{ color: '#e05c5c' }}>*</span></label>
                <input type="date" className={`form-input ${errors.dob ? 'error' : ''}`} id="dob" max="2010-01-01" {...register('dob')} />
                {errors.dob && <div className="field-error visible">{errors.dob.message}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Chiều cao <span style={{ color: '#e05c5c' }}>*</span></label>
                  <div className="input-group">
                    <input type="number" className={`form-input ${errors.height ? 'error' : ''}`} placeholder="170" {...register('height')} />
                    <select className="form-input" style={{ flex: '0 0 64px' }}><option>cm</option><option>ft</option></select>
                  </div>
                  {errors.height && <div className="field-error visible">{errors.height.message}</div>}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cân nặng <span style={{ color: '#e05c5c' }}>*</span></label>
                  <div className="input-group">
                    <input type="number" className={`form-input ${errors.weight ? 'error' : ''}`} placeholder="65" {...register('weight')} />
                    <select className="form-input" style={{ flex: '0 0 64px' }}><option>kg</option><option>lbs</option></select>
                  </div>
                  {errors.weight && <div className="field-error visible">{errors.weight.message}</div>}
                </div>
              </div>
            </div>
            <div className="ob-footer">
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Chào mừng bạn! 👋</div>
              <button className="ob-btn ob-btn-primary" onClick={handleNext}>
                Tiếp tục
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          {/* ═══ STEP 2 ═══ */}
          <div className={`ob-step ${step === 2 ? 'active' : ''}`}>
            <div className="ob-card-inner">
              <div className="step-eyebrow">Bước 2 — Mức độ vận động</div>
              <div className="step-title">Bạn vận động thế nào?</div>
              <div className="step-sub">Mức độ hoạt động hàng ngày giúp tính chính xác năng lượng tiêu thụ.</div>

              <div className="card-options">
                <button type="button" className={`option-card ${watchActivity === 'sedentary' ? 'selected' : ''}`} onClick={() => setValue('activityLevel', 'sedentary')}>
                  <div className="oc-icon">🪑</div>
                  <div className="oc-body">
                    <span className="oc-title">Ít vận động</span>
                    <span className="oc-sub">Ngồi nhiều, ít đi lại, không tập thể dục</span>
                  </div>
                  <div className="oc-check"></div>
                </button>
                <button type="button" className={`option-card ${watchActivity === 'lightly_active' ? 'selected' : ''}`} onClick={() => setValue('activityLevel', 'lightly_active')}>
                  <div className="oc-icon">🚶</div>
                  <div className="oc-body">
                    <span className="oc-title">Nhẹ nhàng</span>
                    <span className="oc-sub">Tập thể dục nhẹ 1–3 ngày/tuần</span>
                  </div>
                  <div className="oc-check"></div>
                </button>
                <button type="button" className={`option-card ${watchActivity === 'moderately_active' ? 'selected' : ''}`} onClick={() => setValue('activityLevel', 'moderately_active')}>
                  <div className="oc-icon">🏃</div>
                  <div className="oc-body">
                    <span className="oc-title">Vừa phải</span>
                    <span className="oc-sub">Tập thể dục vừa phải 3–5 ngày/tuần</span>
                  </div>
                  <div className="oc-check"></div>
                </button>
                <button type="button" className={`option-card ${watchActivity === 'very_active' ? 'selected' : ''}`} onClick={() => setValue('activityLevel', 'very_active')}>
                  <div className="oc-icon">💪</div>
                  <div className="oc-body">
                    <span className="oc-title">Năng động</span>
                    <span className="oc-sub">Tập luyện cường độ cao 6–7 ngày/tuần</span>
                  </div>
                  <div className="oc-check"></div>
                </button>
                <button type="button" className={`option-card ${watchActivity === 'extra_active' ? 'selected' : ''}`} onClick={() => setValue('activityLevel', 'extra_active')}>
                  <div className="oc-icon">🏋️</div>
                  <div className="oc-body">
                    <span className="oc-title">Cực kỳ năng động</span>
                    <span className="oc-sub">VĐV, tập luyện 2 lần/ngày</span>
                  </div>
                  <div className="oc-check"></div>
                </button>
              </div>
            </div>
            <div className="ob-footer">
              <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setStep(1)}>← Quay lại</button>
              <button type="button" className="ob-btn ob-btn-primary" onClick={handleNext}>
                Tiếp tục
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          {/* ═══ STEP 3 ═══ */}
          <div className={`ob-step ${step === 3 ? 'active' : ''}`}>
            <div className="ob-card-inner">
              <div className="step-eyebrow">Bước 3 — Mục tiêu</div>
              <div className="step-title">Bạn muốn đạt được gì?</div>
              <div className="step-sub">Chúng tôi sẽ điều chỉnh kế hoạch dinh dưỡng phù hợp với mục tiêu của bạn.</div>

              <div className="card-options cols-3" style={{ marginBottom: 20 }}>
                <button type="button" className={`option-card ${watchGoal === 'lose_weight' ? 'selected' : ''}`} style={{ flexDirection: 'column', textAlign: 'center', padding: '20px 12px', alignItems: 'center' }} onClick={() => setValue('fitnessGoal', 'lose_weight')}>
                  <div className="oc-icon" style={{ marginBottom: 8 }}>⬇️</div>
                  <span className="oc-title" style={{ textAlign: 'center' }}>Giảm cân</span>
                  <span className="oc-sub" style={{ textAlign: 'center' }}>Giảm mỡ thừa</span>
                </button>
                <button type="button" className={`option-card ${watchGoal === 'maintain_weight' ? 'selected' : ''}`} style={{ flexDirection: 'column', textAlign: 'center', padding: '20px 12px', alignItems: 'center' }} onClick={() => setValue('fitnessGoal', 'maintain_weight')}>
                  <div className="oc-icon" style={{ marginBottom: 8, background: 'var(--green-light)' }}>⚖️</div>
                  <span className="oc-title" style={{ textAlign: 'center' }}>Duy trì</span>
                  <span className="oc-sub" style={{ textAlign: 'center' }}>Giữ cân nặng hiện tại</span>
                </button>
                <button type="button" className={`option-card ${watchGoal === 'gain_muscle' ? 'selected' : ''}`} style={{ flexDirection: 'column', textAlign: 'center', padding: '20px 12px', alignItems: 'center' }} onClick={() => setValue('fitnessGoal', 'gain_muscle')}>
                  <div className="oc-icon" style={{ marginBottom: 8 }}>💪</div>
                  <span className="oc-title" style={{ textAlign: 'center' }}>Tăng cơ</span>
                  <span className="oc-sub" style={{ textAlign: 'center' }}>Xây dựng cơ bắp</span>
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Cân nặng mục tiêu</label>
                <div className="input-group">
                  <input type="number" className="form-input" disabled value={targetWeight} />
                  <select className="form-input" style={{ flex: '0 0 64px' }}><option>kg</option><option>lbs</option></select>
                </div>
              </div>

              <div className="weight-compare">
                <div className="wc-item">
                  <div className="wc-val">{weight} kg</div>
                  <div className="wc-lbl">Hiện tại</div>
                </div>
                <div className="wc-arrow">→</div>
                <div className="wc-item">
                  <div className="wc-val" style={{ color: 'var(--green-accent)' }}>{targetWeight} kg</div>
                  <div className="wc-lbl">Mục tiêu</div>
                </div>
                <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }}></div>
                <div className="wc-item">
                  <div className="wc-val" style={{ color: diff < 0 ? '#3a8f67' : diff > 0 ? '#f4a62a' : 'var(--green-dark)' }}>
                    {diff > 0 ? '+' : ''}{diff} kg
                  </div>
                  <div className="wc-lbl">Chênh lệch</div>
                </div>
              </div>
            </div>
            <div className="ob-footer">
              <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setStep(2)}>← Quay lại</button>
              <button type="button" className="ob-btn ob-btn-primary" onClick={handleNext}>
                Tiếp tục
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          {/* ═══ STEP 4 ═══ */}
          <div className={`ob-step ${step === 4 ? 'active' : ''}`}>
            <div className="ob-card-inner">
              <div className="step-eyebrow">Bước 4 — Chế độ ăn uống</div>
              <div className="step-title">Bạn có hạn chế gì không?</div>
              <div className="step-sub">Không bắt buộc. Giúp chúng tôi gợi ý thực phẩm phù hợp với bạn hơn.</div>

              <div className="form-group">
                <label className="form-label">Dị ứng & hạn chế thực phẩm</label>
                <div className="badge-select">
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>🥜 Đậu phộng</button>
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>🥛 Sữa / Lactose</button>
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>🌾 Gluten</button>
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>🥚 Trứng</button>
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>🦐 Hải sản</button>
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>🌰 Hạt cây</button>
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>🌿 Đậu nành</button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Chế độ ăn đặc biệt</label>
                <div className="badge-select">
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>🥗 Thuần chay (Vegan)</button>
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>🥩 Ăn chay (Vegetarian)</button>
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>🥑 Keto</button>
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>⚡ Paleo</button>
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>🕌 Halal</button>
                  <button type="button" className="badge-option" onClick={(e) => e.currentTarget.classList.toggle('selected')}>✡️ Kosher</button>
                </div>
              </div>
            </div>
            <div className="ob-footer">
              <button type="button" className="ob-btn ob-btn-ghost" onClick={() => setStep(3)}>← Quay lại</button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="ob-btn ob-btn-ghost" onClick={handleNext} style={{ color: 'var(--text-muted)' }}>Bỏ qua</button>
                <button type="button" className="ob-btn ob-btn-primary" onClick={handleNext}>
                  Hoàn thành
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* ═══ STEP 5: Loading ═══ */}
          <div className={`ob-step ${step === 5 && loadingStep < 5 ? 'active' : ''}`}>
            <div className="loading-state">
              <div className="loader-ring"></div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 6 }}>
                {loadingStep === 1 ? 'Tính BMI và chỉ số cơ thể...' : 
                 loadingStep === 2 ? 'Ước tính TDEE...' : 
                 loadingStep === 3 ? 'Xây dựng kế hoạch calo...' : 'Hoàn tất! 🎉'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>AI đang phân tích hồ sơ sức khoẻ của bạn</div>
              <div className="calc-steps">
                <div className={`calc-step ${loadingStep >= 1 ? 'done' : ''}`}><div className="cs-icon">{loadingStep >= 1 ? '✓' : '1'}</div> Tính BMI và chỉ số cơ thể</div>
                <div className={`calc-step ${loadingStep >= 2 ? 'done' : ''}`}><div className="cs-icon">{loadingStep >= 2 ? '✓' : '2'}</div> Ước tính TDEE</div>
                <div className={`calc-step ${loadingStep >= 3 ? 'done' : ''}`}><div className="cs-icon">{loadingStep >= 3 ? '✓' : '3'}</div> Xây dựng kế hoạch calo</div>
                <div className={`calc-step ${loadingStep >= 4 ? 'done' : ''}`}><div className="cs-icon">{loadingStep >= 4 ? '✓' : '4'}</div> Tính tỷ lệ Macro tối ưu</div>
              </div>
            </div>
          </div>

          {/* ═══ STEP 5: Result ═══ */}
          <div className={`ob-step ${step === 5 && loadingStep === 5 ? 'active' : ''}`}>
            <div className="result-hero">
              <div>
                <div style={{ fontSize: 11, opacity: .65, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 6 }}>Hồ sơ đã sẵn sàng 🎉</div>
                <h2>Chào bạn!</h2>
                <p>Kế hoạch cá nhân hoá đã được tạo dựa trên hồ sơ của bạn.</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(255,255,255,.15)', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>{goalNames[watchGoal]}</span>
                  <span style={{ background: 'rgba(255,255,255,.15)', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>{activityNames[watchActivity]}</span>
                </div>
              </div>
              <div className="bmi-badge">
                <div className="bmi-val">{bmi}</div>
                <div className="bmi-lbl">BMI</div>
                <div style={{ fontSize: 10, marginTop: 4, opacity: .8 }}>{bmiStatus}</div>
              </div>
            </div>

            <div className="result-stats">
              <div className="rstat">
                <div className="rstat-val">{tdee.toLocaleString()}</div>
                <div className="rstat-lbl">TDEE (kcal/ngày)</div>
              </div>
              <div className="rstat">
                <div className="rstat-val">{targetCal.toLocaleString()}</div>
                <div className="rstat-lbl">Mục tiêu calo/ngày</div>
              </div>
              <div className="rstat">
                <div className="rstat-val">{protein}</div>
                <div className="rstat-lbl">Protein (g/ngày)</div>
              </div>
              <div className="rstat">
                <div className="rstat-val">{water}</div>
                <div className="rstat-lbl">Nước uống (lít/ngày)</div>
              </div>
            </div>

            <div className="macro-bar-row">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Phân bổ Macro</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{macros.c}% C · {macros.p}% P · {macros.f}% F</div>
              </div>
              <div className="macro-bar-track">
                <div className="macro-seg" style={{ background: '#3a8f67', width: `${macros.c}%` }}></div>
                <div className="macro-seg" style={{ background: '#f4a62a', width: `${macros.p}%` }}></div>
                <div className="macro-seg" style={{ background: '#4a90e2', width: `${macros.f}%` }}></div>
              </div>
              <div className="macro-legend">
                <div className="ml-item"><div className="ml-dot" style={{ background: '#3a8f67' }}></div>Carbs <b>{macros.c}%</b></div>
                <div className="ml-item"><div className="ml-dot" style={{ background: '#f4a62a' }}></div>Protein <b>{macros.p}%</b></div>
                <div className="ml-item"><div className="ml-dot" style={{ background: '#4a90e2' }}></div>Fat <b>{macros.f}%</b></div>
              </div>
            </div>

            <div style={{ padding: '0 20px 24px' }}>
              <button className="ob-btn ob-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }} onClick={() => navigate('/dashboard')}>
                🚀 Bắt đầu hành trình của bạn
              </button>
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>Bạn có thể thay đổi thông tin này bất kỳ lúc nào trong Hồ sơ</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
