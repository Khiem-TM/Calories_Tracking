import { useRef, useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { profileService } from '@/features/profile/services/profileService'
import { useAuthStore } from '@/stores/authStore'
import '@/assets/profile.css'

const schema = z.object({
  displayName: z.string().min(2),
  lastName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(['Nam', 'Nữ', 'Khác']).optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  activityLevel: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<'info' | 'goals' | 'connect' | 'notif' | 'plan'>('info')
  const [selectedGoal, setSelectedGoal] = useState<'lose' | 'gain' | 'maintain' | 'health'>('gain')

  // Using real data where possible, but mapping to the design's rich UI
  const { data: healthProfile } = useQuery({
    queryKey: ['health-profile'],
    queryFn: () => profileService.getHealthProfile().then(r => r.data?.data ?? r.data),
  })

  const { data: streaks } = useQuery({
    queryKey: ['streaks'],
    queryFn: () => profileService.getStreaks().then(r => r.data?.data ?? r.data),
  })

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      displayName: user?.displayName ?? 'Minh',
      lastName: 'Trần',
      email: user?.email ?? 'tranminh@gmail.com',
      phone: '0901 234 567',
      dob: '15/08/1995',
      gender: 'Nam',
      height: healthProfile?.height ?? 175,
      weight: healthProfile?.weight ?? 68.4,
      activityLevel: 'Vận động vừa (tập 3–5 ngày/tuần)',
    },
  })

  useEffect(() => {
    if (healthProfile) {
      reset({
        ...user,
        displayName: user?.displayName ?? 'Minh',
        lastName: 'Trần',
        email: user?.email ?? 'tranminh@gmail.com',
        height: healthProfile.height ?? 175,
        weight: healthProfile.weight ?? 68.4,
      })
    }
  }, [user, healthProfile, reset])

  const { mutate: updateProfile, isPending: saving } = useMutation({
    mutationFn: (data: FormValues) => profileService.updateProfile(user!.id, { displayName: `${data.lastName} ${data.displayName}`.trim() }),
    onSuccess: (res) => {
      const updated = res.data?.data ?? res.data
      setUser({ ...user!, ...updated })
      toast.success('Đã lưu thay đổi')
    },
    onError: () => toast.error('Failed to update'),
  })

  const { mutate: uploadAvatar, isPending: uploading } = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData(); fd.append('file', file)
      return profileService.uploadAvatar(fd)
    },
    onSuccess: (res) => {
      const updated = res.data?.data ?? res.data
      setUser({ ...user!, avatarUrl: updated.avatarUrl ?? updated.url })
      qc.invalidateQueries({ queryKey: ['me'] })
      toast.success('Avatar updated!')
    },
    onError: () => toast.error('Failed to upload avatar'),
  })

  const initials = user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'TM'
  const displayNames = user?.displayName?.split(' ') ?? ['Trần', 'Minh']
  const lName = displayNames[0]
  const fName = displayNames.slice(1).join(' ') || 'Minh'

  const currentStreak = streaks?.currentStreak ?? 7
  // const longestStreak = streaks?.longestStreak ?? 14

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Hồ sơ cá nhân</h1>
          <p>Quản lý thông tin và cài đặt của bạn</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm" disabled={saving} onClick={handleSubmit(d => updateProfile(d as FormValues))}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <div className="content">
        {/* Profile hero */}
        <div className="profile-hero fade-up">
          <div style={{ position: 'relative' }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="avatar-big" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="avatar-big">{initials}</div>
            )}
            <div className="avatar-edit" onClick={() => fileRef.current?.click()} style={{ opacity: uploading ? 0.5 : 1 }}>
              ✏️
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f) }} />
          </div>
          <div className="profile-info">
            <div className="profile-name">{user?.displayName ?? 'Trần Minh'}</div>
            <div className="profile-handle">@{user?.displayName?.toLowerCase().replace(/\s/g,'') ?? 'tranminh'} · {user?.email ?? 'tranminh@gmail.com'}</div>
            <div className="profile-badges">
              <div className="profile-badge">Pro Plan</div>
              <div className="profile-badge">Streak {currentStreak} ngày</div>
              <div className="profile-badge">Thành viên từ 01/2026</div>
            </div>
          </div>
          <div className="profile-stats">
            <div className="ps-item"><div className="ps-val">18</div><div className="ps-lbl">Buổi tập</div></div>
            <div className="ps-item"><div className="ps-val">{currentStreak}</div><div className="ps-lbl">Streak ngày</div></div>
            <div className="ps-item"><div className="ps-val">−1.6kg</div><div className="ps-lbl">Tiến trình</div></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs fade-up" style={{ animationDelay: '.06s' }}>
          <div className={`ptab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Thông tin cơ bản</div>
          <div className={`ptab ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => setActiveTab('goals')}>Mục tiêu</div>
          <div className={`ptab ${activeTab === 'connect' ? 'active' : ''}`} onClick={() => setActiveTab('connect')}>Kết nối thiết bị</div>
          <div className={`ptab ${activeTab === 'notif' ? 'active' : ''}`} onClick={() => setActiveTab('notif')}>Thông báo</div>
          <div className={`ptab ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => setActiveTab('plan')}>Gói đăng ký</div>
        </div>

        {/* Tab: Thông tin cơ bản */}
        {activeTab === 'info' && (
          <div id="tab-info" className="fade-up" style={{ animationDelay: '.1s' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
              <div>
                <div className="card card-pad">
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 20 }}>Thông tin cá nhân</div>
                  <div className="field-group">
                    <div className="field-row">
                      <div><div className="field-label">Họ</div><input className="input" defaultValue={lName} {...register('lastName')} /></div>
                      <div><div className="field-label">Tên</div><input className="input" defaultValue={fName} {...register('displayName')} /></div>
                    </div>
                  </div>
                  <div className="field-group">
                    <div className="field-label">Email</div>
                    <input className="input" type="email" {...register('email')} disabled style={{ opacity: 0.7 }} />
                  </div>
                  <div className="field-group">
                    <div className="field-label">Số điện thoại</div>
                    <input className="input" {...register('phone')} />
                  </div>
                  <div className="field-group">
                    <div className="field-row">
                      <div><div className="field-label">Ngày sinh</div><input className="input" type="text" {...register('dob')} /></div>
                      <div>
                        <div className="field-label">Giới tính</div>
                        <select className="input" {...register('gender')}>
                          <option>Nam</option>
                          <option>Nữ</option>
                          <option>Khác</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card card-pad">
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 20 }}>Thể trạng</div>
                  <div className="field-group">
                    <div className="field-row">
                      <div>
                        <div className="field-label">Chiều cao</div>
                        <div style={{ position: 'relative' }}>
                          <input className="input" style={{ paddingRight: 36 }} {...register('height')} />
                          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)' }}>cm</span>
                        </div>
                      </div>
                      <div>
                        <div className="field-label">Cân nặng hiện tại</div>
                        <div style={{ position: 'relative' }}>
                          <input className="input" style={{ paddingRight: 36 }} {...register('weight')} />
                          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)' }}>kg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="field-group">
                    <div className="field-label">Mức độ hoạt động</div>
                    <select className="input" {...register('activityLevel')}>
                      <option>Ít vận động (văn phòng)</option>
                      <option>Vận động vừa (tập 3–5 ngày/tuần)</option>
                      <option>Vận động nhiều (tập 6–7 ngày/tuần)</option>
                      <option>Vận động rất nhiều (vận động viên)</option>
                    </select>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>22.3</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>BMI</div>
                      <div className="badge badge-green" style={{ marginTop: 4, fontSize: 10 }}>Bình thường</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>2,200</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>TDEE (kcal)</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-dark)', fontFamily: "'Playfair Display',serif" }}>1,730</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>BMR (kcal)</div>
                    </div>
                  </div>
                </div>

                <div className="card card-pad">
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>Các dị ứng & hạn chế</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <div className="badge badge-red" style={{ cursor: 'pointer' }}>Hải sản ✕</div>
                    <div className="badge badge-orange" style={{ cursor: 'pointer' }}>Sữa bò ✕</div>
                    <div className="badge" style={{ background: 'var(--bg)', color: 'var(--text-muted)', cursor: 'pointer', border: '1.5px dashed var(--border)' }}>+ Thêm</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Mục tiêu */}
        {activeTab === 'goals' && (
          <div id="tab-goals" className="fade-up">
            <div className="card card-pad" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>Mục tiêu chính</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                <div className={`goal-card ${selectedGoal === 'lose' ? 'selected' : ''}`} onClick={() => setSelectedGoal('lose')}>
                  <div className="goal-icon">📉</div>
                  <div className="goal-name">Giảm cân</div>
                  <div className="goal-desc">Giảm mỡ, cải thiện vóc dáng</div>
                </div>
                <div className={`goal-card ${selectedGoal === 'gain' ? 'selected' : ''}`} onClick={() => setSelectedGoal('gain')}>
                  <div className="goal-icon">💪</div>
                  <div className="goal-name">Tăng cơ</div>
                  <div className="goal-desc">Xây dựng cơ bắp, tăng sức mạnh</div>
                </div>
                <div className={`goal-card ${selectedGoal === 'maintain' ? 'selected' : ''}`} onClick={() => setSelectedGoal('maintain')}>
                  <div className="goal-icon">⚖️</div>
                  <div className="goal-name">Duy trì cân nặng</div>
                  <div className="goal-desc">Giữ cân nặng hiện tại ổn định</div>
                </div>
                <div className={`goal-card ${selectedGoal === 'health' ? 'selected' : ''}`} onClick={() => setSelectedGoal('health')}>
                  <div className="goal-icon">❤️</div>
                  <div className="goal-name">Sức khoẻ chung</div>
                  <div className="goal-desc">Ăn uống lành mạnh, sống khoẻ</div>
                </div>
              </div>
            </div>
            
            <div className="grid-2">
              <div className="card card-pad">
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>Mục tiêu cân nặng</div>
                <div className="field-group">
                  <div className="field-row">
                    <div>
                      <div className="field-label">Cân nặng hiện tại</div>
                      <div style={{ position: 'relative' }}>
                        <input className="input" defaultValue="68.4" style={{ paddingRight: 36 }} />
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)' }}>kg</span>
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Cân nặng mục tiêu</div>
                      <div style={{ position: 'relative' }}>
                        <input className="input" defaultValue="65" style={{ paddingRight: 36 }} />
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)' }}>kg</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="field-group">
                  <div className="field-label">Tốc độ giảm/tăng cân</div>
                  <select className="input">
                    <option>Nhẹ (0.25kg/tuần)</option>
                    <option selected>Vừa (0.5kg/tuần)</option>
                    <option>Nhanh (1kg/tuần)</option>
                  </select>
                </div>
                <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--green-mid)' }}>
                  Ước tính đạt mục tiêu: <strong>khoảng 6–7 tuần nữa</strong>
                </div>
              </div>
              
              <div className="card card-pad">
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>Mục tiêu dinh dưỡng tùy chỉnh</div>
                <div className="field-group">
                  <div className="field-label">Calories mục tiêu / ngày</div>
                  <div style={{ position: 'relative' }}>
                    <input className="input" defaultValue="2200" style={{ paddingRight: 56 }} />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)' }}>kcal</span>
                  </div>
                </div>
                <div className="field-group">
                  <div className="field-row3">
                    <div><div className="field-label">Carbs %</div><input className="input" defaultValue="50" /></div>
                    <div><div className="field-label">Protein %</div><input className="input" defaultValue="30" /></div>
                    <div><div className="field-label">Fat %</div><input className="input" defaultValue="20" /></div>
                  </div>
                </div>
                <div className="field-group">
                  <div className="field-label">Nước uống mục tiêu</div>
                  <div style={{ position: 'relative' }}>
                    <input className="input" defaultValue="8" style={{ paddingRight: 36 }} />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)' }}>ly</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Connect */}
        {activeTab === 'connect' && (
          <div id="tab-connect" className="fade-up">
            <div className="card card-pad" style={{ maxWidth: 640 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>Kết nối thiết bị & Ứng dụng</div>
              <div className="conn-row">
                <div className="conn-icon" style={{ background: '#000', color: '#fff' }}>🍎</div>
                <div><div className="conn-name">Apple Health</div><div className="conn-status">Đã kết nối · Đồng bộ: bước chân, cân nặng, giấc ngủ</div></div>
                <label className="toggle" style={{ marginLeft: 'auto' }}><input type="checkbox" defaultChecked /><div className="toggle-slider"></div></label>
              </div>
              <div className="conn-row">
                <div className="conn-icon" style={{ background: '#4285f4', color: '#fff' }}>G</div>
                <div><div className="conn-name">Google Fit</div><div className="conn-status">Chưa kết nối</div></div>
                <button className="btn btn-ghost2 btn-sm" style={{ marginLeft: 'auto' }}>Kết nối</button>
              </div>
              <div className="conn-row">
                <div className="conn-icon" style={{ background: '#00b0b9', color: '#fff' }}>G</div>
                <div><div className="conn-name">Garmin Connect</div><div className="conn-status">Đã kết nối · Nhịp tim, GPS workout</div></div>
                <label className="toggle" style={{ marginLeft: 'auto' }}><input type="checkbox" defaultChecked /><div className="toggle-slider"></div></label>
              </div>
              <div className="conn-row">
                <div className="conn-icon" style={{ background: '#fb8c00', color: '#fff' }}>M</div>
                <div><div className="conn-name">MyFitnessPal Import</div><div className="conn-status">Nhập dữ liệu lịch sử</div></div>
                <button className="btn btn-ghost2 btn-sm" style={{ marginLeft: 'auto' }}>Nhập</button>
              </div>
              <div className="conn-row">
                <div className="conn-icon" style={{ background: '#1877f2', color: '#fff' }}>S</div>
                <div><div className="conn-name">Samsung Health</div><div className="conn-status">Chưa kết nối</div></div>
                <button className="btn btn-ghost2 btn-sm" style={{ marginLeft: 'auto' }}>Kết nối</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Notifications */}
        {activeTab === 'notif' && (
          <div id="tab-notif" className="fade-up">
            <div className="card card-pad" style={{ maxWidth: 560 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 4 }}>Cài đặt thông báo</div>
              <div className="notif-row">
                <div className="notif-text"><div className="notif-title">Nhắc nhở bữa ăn</div><div className="notif-desc">Nhắc bạn ghi nhật ký vào giờ ăn</div></div>
                <label className="toggle"><input type="checkbox" defaultChecked /><div className="toggle-slider"></div></label>
              </div>
              <div className="notif-row">
                <div className="notif-text"><div className="notif-title">Nhắc uống nước</div><div className="notif-desc">Mỗi 2 tiếng từ 8:00 – 20:00</div></div>
                <label className="toggle"><input type="checkbox" defaultChecked /><div className="toggle-slider"></div></label>
              </div>
              <div className="notif-row">
                <div className="notif-text"><div className="notif-title">Nhắc tập luyện</div><div className="notif-desc">Theo lịch tập đã đặt</div></div>
                <label className="toggle"><input type="checkbox" defaultChecked /><div className="toggle-slider"></div></label>
              </div>
              <div className="notif-row">
                <div className="notif-text"><div className="notif-title">Tổng kết hàng tuần</div><div className="notif-desc">Báo cáo mỗi Chủ Nhật 9:00</div></div>
                <label className="toggle"><input type="checkbox" defaultChecked /><div className="toggle-slider"></div></label>
              </div>
              <div className="notif-row">
                <div className="notif-text"><div className="notif-title">Thành tích mới</div><div className="notif-desc">Khi đạt milestone hoặc streak</div></div>
                <label className="toggle"><input type="checkbox" /><div className="toggle-slider"></div></label>
              </div>
              <div className="notif-row">
                <div className="notif-text"><div className="notif-title">Tin tức & Blog</div><div className="notif-desc">Bài viết mới từ chuyên gia dinh dưỡng</div></div>
                <label className="toggle"><input type="checkbox" /><div className="toggle-slider"></div></label>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Plan */}
        {activeTab === 'plan' && (
          <div id="tab-plan" className="fade-up">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 700 }}>
              <div className="card card-pad" style={{ border: '2px solid var(--green-accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Gói Pro</div>
                  <div className="badge badge-green">Gói hiện tại</div>
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: 'var(--green-dark)' }}>
                  199k<span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/tháng</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 16px' }}>Gia hạn: 23/05/2026</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-body)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ color: 'var(--green-accent)' }}>✓</span> Theo dõi vi chất đầy đủ</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ color: 'var(--green-accent)' }}>✓</span> AI nhận diện thực phẩm</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ color: 'var(--green-accent)' }}>✓</span> Kết nối chuyên gia dinh dưỡng</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ color: 'var(--green-accent)' }}>✓</span> Báo cáo không giới hạn</div>
                </div>
                <button className="btn btn-ghost2" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>Quản lý thanh toán</button>
              </div>
              
              <div className="card card-pad" style={{ background: 'var(--green-cta)', border: 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Nâng cấp Premium</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#fff' }}>
                  499k<span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,.6)' }}>/tháng</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', margin: '8px 0 16px' }}>Hoặc 3,999k/năm (tiết kiệm 33%)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.85)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span>✓</span> Tất cả tính năng Pro</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span>✓</span> 1-1 với chuyên gia dinh dưỡng</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span>✓</span> Lập kế hoạch meal prep AI</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span>✓</span> Phân tích gene & thể trạng</div>
                </div>
                <button className="btn btn-white" style={{ width: '100%', justifyContent: 'center', marginTop: 16, background: '#fff', color: 'var(--green-cta)', border: 'none', fontWeight: 700 }}>Nâng cấp ngay</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
