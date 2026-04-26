import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import '@/assets/landing.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* NAVBAR */}
      <nav className="landing-nav">
        <Link to="/" className="nav-logo">Tracker<span>.</span></Link>
        <div className="nav-links">
          <a href="#features">Tính năng</a>
          <a href="#pricing">Bảng giá</a>
          <a href="#blog">Blog</a>
          <a href="#about">Về chúng tôi</a>
        </div>
        <div className="nav-actions">
          {isAuthenticated ? (
            <button className="btn-cta" onClick={() => navigate('/dashboard')}>Vào ứng dụng</button>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => navigate('/login')}>Đăng nhập</button>
              <button className="btn-cta" onClick={() => navigate('/register')}>Bắt đầu miễn phí</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow">Ứng dụng Sức khoẻ #1 Việt Nam</div>
            <h1>Kiểm soát <em>hoàn toàn</em> những gì bạn ăn</h1>
            <p>Tracker giúp bạn theo dõi calories, lên kế hoạch bữa ăn, ghi nhật ký tập luyện và đạt mục tiêu sức khoẻ — tất cả trong một ứng dụng.</p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={() => navigate('/register')}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L8 11M8 1L5 4M8 1L11 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 13H14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Tải về miễn phí
              </button>
              <button className="btn-secondary">
                Xem demo
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#1a3829" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-pill fp1">
              <div className="fp-icon" style={{ background: '#d4eddf' }}>🔥</div>
              +320 kcal đốt hôm nay
            </div>
            <div className="app-card animate-on-scroll">
              <div className="card-header">
                <div className="card-title">Tổng quan hôm nay</div>
                <div className="card-date">Thứ Tư, 23/04</div>
              </div>
              <div className="donut-wrap">
                <div className="donut">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#eef8f2" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#3a8f67" strokeWidth="10"
                      strokeDasharray="175 239" strokeLinecap="round"/>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f4a62a" strokeWidth="10"
                      strokeDasharray="45 239" strokeDashoffset="-180" strokeLinecap="round" opacity="0.7"/>
                  </svg>
                  <div className="donut-label">
                    <span className="cal">1,840</span>
                    <span className="unit">kcal</span>
                  </div>
                </div>
                <div className="donut-info">
                  <h3>1,840 kcal</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>/ 2,200 mục tiêu</p>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--green-accent)', fontWeight: 600 }}>360 kcal còn lại ✓</div>
                </div>
              </div>
              <div className="macro-bars">
                <div className="macro-row">
                  <div className="macro-name">Carbs</div>
                  <div className="macro-bar-bg"><div className="macro-bar-fill carb"></div></div>
                  <div className="macro-val">186g</div>
                </div>
                <div className="macro-row">
                  <div className="macro-name">Protein</div>
                  <div className="macro-bar-bg"><div className="macro-bar-fill prot"></div></div>
                  <div className="macro-val">92g</div>
                </div>
                <div className="macro-row">
                  <div className="macro-name">Fat</div>
                  <div className="macro-bar-bg"><div className="macro-bar-fill fat"></div></div>
                  <div className="macro-val">54g</div>
                </div>
              </div>
            </div>
            <div className="floating-pill fp2">
              <div className="fp-icon" style={{ background: '#fef3e2' }}>🥗</div>
              Bữa trưa đã ghi
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-num">5M+</div>
            <div className="stat-label">Người dùng hoạt động</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">2M+</div>
            <div className="stat-label">Thực phẩm trong database</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">98%</div>
            <div className="stat-label">Hài lòng</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-num">87%</div>
            <div className="stat-label">Đạt mục tiêu sức khoẻ</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">50+</div>
            <div className="stat-label">Chuyên gia dinh dưỡng</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">4.9★</div>
            <div className="stat-label">Đánh giá App Store</div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="landing-section">
        <div className="section-inner">
          <div className="text-center">
            <div className="section-tag">Tính năng</div>
            <h2 className="section-title">Tiêu chuẩn vàng trong theo dõi dinh dưỡng</h2>
            <p className="section-sub">Tất cả công cụ bạn cần để xây dựng thói quen ăn uống lành mạnh và đạt mục tiêu sức khoẻ.</p>
          </div>
          <div className="features-grid">
            <div className="feat-card featured animate-on-scroll">
              <div className="feat-tag">Nổi bật</div>
              <div className="feat-icon">🔬</div>
              <h3>Theo dõi vi chất dinh dưỡng</h3>
              <p>Biết chính xác lượng vitamin, khoáng chất và các vi chất bạn nạp vào mỗi ngày, không chỉ đơn giản là calories.</p>
            </div>
            <div className="feat-card animate-on-scroll">
              <div className="feat-icon">📸</div>
              <h3>Ghi nhật ký bằng hình ảnh</h3>
              <p>Chụp ảnh bữa ăn — AI nhận diện và tự động ghi lại calories, macro chỉ trong vài giây.</p>
            </div>
            <div className="feat-card animate-on-scroll">
              <div className="feat-icon">🎯</div>
              <h3>Mục tiêu cá nhân hoá</h3>
              <p>Hệ thống tính toán mục tiêu dựa trên BMI, lối sống, và mong muốn cụ thể của từng người dùng.</p>
            </div>
            <div className="feat-card animate-on-scroll">
              <div className="feat-icon">🔍</div>
              <h3>Tìm kiếm thực phẩm</h3>
              <p>Database hơn 2 triệu thực phẩm bao gồm thực phẩm Việt Nam. Tìm kiếm nhanh, ghi lại dễ dàng.</p>
            </div>
            <div className="feat-card animate-on-scroll">
              <div className="feat-icon">📊</div>
              <h3>Báo cáo & Phân tích</h3>
              <p>Visualize xu hướng dinh dưỡng theo tuần, tháng. Hiểu rõ patterns ăn uống của bạn để cải thiện.</p>
            </div>
            <div className="feat-card animate-on-scroll">
              <div className="feat-icon">🤝</div>
              <h3>Kết nối chuyên gia</h3>
              <p>Chia sẻ nhật ký trực tiếp với bác sĩ hoặc chuyên gia dinh dưỡng để được tư vấn chính xác hơn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-section" style={{ background: '#f3fbf6' }}>
        <div className="section-inner">
          <div className="how-grid">
            <div>
              <div className="section-tag">Cách hoạt động</div>
              <h2 className="section-title">Đơn giản gặp khoa học</h2>
              <p className="section-sub" style={{ marginBottom: 0 }}>Ba bước để bắt đầu hành trình sức khoẻ của bạn.</p>
              <div className="how-steps" style={{ marginTop: 36 }}>
                <div className="how-step animate-on-scroll">
                  <div className="step-num">1</div>
                  <div className="step-body">
                    <h4>Tìm & ghi bữa ăn</h4>
                    <p>Tìm kiếm nhanh hoặc quét mã vạch. Thêm khẩu phần của bạn và theo dõi toàn bộ dinh dưỡng tức thì.</p>
                  </div>
                </div>
                <div className="how-step animate-on-scroll">
                  <div className="step-num">2</div>
                  <div className="step-body">
                    <h4>Phân tích dinh dưỡng</h4>
                    <p>Hệ thống phân tích tức thì tỉ lệ macro, vi chất và so sánh với mục tiêu cá nhân của bạn.</p>
                  </div>
                </div>
                <div className="how-step animate-on-scroll">
                  <div className="step-num">3</div>
                  <div className="step-body">
                    <h4>Tối ưu & Cải thiện</h4>
                    <p>Nhận gợi ý thông minh dựa trên dữ liệu dài hạn để cải thiện thói quen ăn uống theo thời gian.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="how-visual animate-on-scroll">
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Nhật ký hôm nay</span>
                <span style={{ color: 'var(--green-accent)', cursor: 'pointer' }}>+ Thêm</span>
              </div>
              <div className="meal-log">
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 0.8, textTransform: 'uppercase', padding: '0 4px', marginBottom: 4 }}>🌅 Bữa sáng · 420 kcal</div>
                <div className="meal-item">
                  <div className="meal-emoji">🥣</div>
                  <div className="meal-info">
                    <div className="meal-name">Yến mạch sữa hạt</div>
                    <div className="meal-cal">320 kcal · C:52g P:14g F:8g</div>
                  </div>
                  <div className="meal-bar-wrap"><div className="meal-bar-bg2"><div className="meal-bar-fill2" style={{ width: '85%' }}></div></div></div>
                </div>
                <div className="meal-item">
                  <div className="meal-emoji">🍌</div>
                  <div className="meal-info">
                    <div className="meal-name">Chuối vừa</div>
                    <div className="meal-cal">100 kcal · C:26g P:1g F:0.4g</div>
                  </div>
                  <div className="meal-bar-wrap"><div className="meal-bar-bg2"><div className="meal-bar-fill2" style={{ width: '35%' }}></div></div></div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 0.8, textTransform: 'uppercase', padding: '0 4px', marginTop: 8, marginBottom: 4 }}>☀️ Bữa trưa · 680 kcal</div>
                <div className="meal-item">
                  <div className="meal-emoji">🍚</div>
                  <div className="meal-info">
                    <div className="meal-name">Cơm gà xào rau</div>
                    <div className="meal-cal">480 kcal · C:68g P:32g F:12g</div>
                  </div>
                  <div className="meal-bar-wrap"><div className="meal-bar-bg2"><div className="meal-bar-fill2" style={{ width: '70%' }}></div></div></div>
                </div>
                <div className="meal-item">
                  <div className="meal-emoji">🥤</div>
                  <div className="meal-info">
                    <div className="meal-name">Sinh tố bơ đường</div>
                    <div className="meal-cal">200 kcal · C:22g P:3g F:12g</div>
                  </div>
                  <div className="meal-bar-wrap"><div className="meal-bar-bg2"><div className="meal-bar-fill2" style={{ width: '45%' }}></div></div></div>
                </div>
              </div>
              <div className="daily-total">
                <span className="dt-label">Tổng đã ghi hôm nay</span>
                <span className="dt-value" style={{ color: 'var(--green-accent)' }}>1,840 / 2,200 kcal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKOUT */}
      <section className="workout-section">
        <div className="workout-grid">
          <div className="workout-text">
            <div className="section-tag" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>Theo dõi tập luyện</div>
            <h2 className="section-title">Ghi lại từng buổi tập. Đốt nhiều hơn.</h2>
            <p className="section-sub">Kết hợp nhật ký ăn uống với lịch tập luyện để có cái nhìn toàn diện về năng lượng tiêu thụ và đốt cháy.</p>
            <div className="workout-features">
              <div className="wf-item">
                <div className="wf-check"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                Thư viện 800+ bài tập có hướng dẫn
              </div>
              <div className="wf-item">
                <div className="wf-check"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                Tính toán calories đốt theo cơ thể bạn
              </div>
              <div className="wf-item">
                <div className="wf-check"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                Kết nối Apple Health, Google Fit, Garmin
              </div>
              <div className="wf-item">
                <div className="wf-check"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                Lập kế hoạch tập theo tuần tự động
              </div>
            </div>
          </div>
          <div className="workout-card">
            <div className="wc-header">
              <span className="wc-title">Buổi tập hôm nay</span>
              <span className="wc-badge">Đang diễn ra</span>
            </div>
            <div className="exercise-list">
              <div className="ex-item animate-on-scroll">
                <div className="ex-icon">🏃</div>
                <div className="ex-name">Chạy bộ</div>
                <div className="ex-sets">5km · 28 phút</div>
                <div className="ex-kcal">-285 kcal</div>
              </div>
              <div className="ex-item animate-on-scroll">
                <div className="ex-icon">💪</div>
                <div className="ex-name">Bench Press</div>
                <div className="ex-sets">4 sets × 10 reps</div>
                <div className="ex-kcal">-120 kcal</div>
              </div>
              <div className="ex-item animate-on-scroll">
                <div className="ex-icon">🦵</div>
                <div className="ex-name">Squat</div>
                <div className="ex-sets">3 sets × 12 reps</div>
                <div className="ex-kcal">-95 kcal</div>
              </div>
              <div className="ex-item animate-on-scroll" style={{ opacity: 0.5 }}>
                <div className="ex-icon">🤸</div>
                <div className="ex-name">Core Plank</div>
                <div className="ex-sets">3 × 60 giây</div>
                <div className="ex-kcal">-40 kcal</div>
              </div>
            </div>
            <div className="wc-total">
              <span className="wct-label">Đã đốt hôm nay</span>
              <span className="wct-val">540 kcal</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="landing-section">
        <div className="section-inner">
          <div className="text-center">
            <div className="section-tag">Bảng giá</div>
            <h2 className="section-title">Chọn hành trình sức khoẻ của bạn</h2>
            <p className="section-sub">Bắt đầu miễn phí. Nâng cấp khi bạn sẵn sàng đi xa hơn.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card animate-on-scroll">
              <div className="plan-name">Gói Free</div>
              <div className="plan-price">$0<span>/tháng</span></div>
              <div className="plan-desc">Đủ dùng cho người mới bắt đầu</div>
              <ul className="plan-features">
                <li><div className="check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="#2d6a4f" strokeWidth="1.5" strokeLinecap="round"/></svg></div>Theo dõi calories cơ bản</li>
                <li><div className="check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="#2d6a4f" strokeWidth="1.5" strokeLinecap="round"/></svg></div>Nhật ký ăn uống</li>
                <li className="disabled"><div className="x">✕</div>Phân tích vi chất</li>
                <li className="disabled"><div className="x">✕</div>Theo dõi tập luyện</li>
                <li className="disabled"><div className="x">✕</div>Nhận diện ảnh AI</li>
              </ul>
              <button className="plan-btn" onClick={() => navigate('/register')}>Dùng miễn phí</button>
            </div>
            <div className="price-card popular animate-on-scroll">
              <div className="popular-badge">Phổ biến nhất</div>
              <div className="plan-name">Gói Pro</div>
              <div className="plan-price">199k<span>/tháng</span></div>
              <div className="plan-desc">Toàn bộ công cụ để đạt mục tiêu nhanh hơn</div>
              <ul className="plan-features">
                <li><div className="check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></div>Tất cả trong gói Free</li>
                <li><div className="check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></div>Phân tích vi chất đầy đủ</li>
                <li><div className="check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></div>Theo dõi tập luyện nâng cao</li>
                <li><div className="check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></div>Nhận diện thực phẩm qua AI</li>
                <li><div className="check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></div>Kết nối chuyên gia dinh dưỡng</li>
              </ul>
              <button className="plan-btn" onClick={() => navigate('/register')}>Dùng thử 7 ngày</button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-bg landing-section">
        <div className="section-inner">
          <div className="text-center">
            <div className="section-tag">Đánh giá</div>
            <h2 className="section-title">Được tin dùng bởi hàng triệu người</h2>
          </div>
          <div className="testi-grid">
            <div className="testi-card animate-on-scroll">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"Sau 3 tháng dùng Tracker, mình đã giảm được 8kg mà không cần nhịn ăn. Ứng dụng giúp mình hiểu thực sự mình đang ăn gì."</p>
              <div className="testi-author">
                <div className="testi-avatar">NM</div>
                <div>
                  <div className="testi-name">Nguyễn Minh</div>
                  <div className="testi-role">Kỹ sư phần mềm, Hà Nội</div>
                </div>
              </div>
            </div>
            <div className="testi-card animate-on-scroll">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"Là một gym-goer, tính năng theo dõi protein của Tracker giúp mình tối ưu chế độ ăn cho việc tăng cơ rất hiệu quả."</p>
              <div className="testi-author">
                <div className="testi-avatar">TL</div>
                <div>
                  <div className="testi-name">Trần Lan</div>
                  <div className="testi-role">Personal Trainer, TP.HCM</div>
                </div>
              </div>
            </div>
            <div className="testi-card animate-on-scroll">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"Database thực phẩm Việt Nam đầy đủ nhất mình từng thấy. Từ phở đến bánh mì đều có. Cuối cùng có app dành cho người Việt!"</p>
              <div className="testi-author">
                <div className="testi-avatar">PH</div>
                <div>
                  <div className="testi-name">Phạm Hương</div>
                  <div className="testi-role">Bác sĩ dinh dưỡng, Đà Nẵng</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFESSIONALS */}
      <section className="landing-section">
        <div className="section-inner text-center">
          <div className="section-tag">Đối tác y tế</div>
          <h2 className="section-title">Được tin tưởng bởi chuyên gia y tế</h2>
          <div className="prof-logos">
            <div className="prof-logo">BV Chợ Rẫy</div>
            <div className="prof-logo">Vinmec</div>
            <div className="prof-logo">BV Bạch Mai</div>
            <div className="prof-logo">Medlatec</div>
            <div className="prof-logo">Thu Cúc</div>
            <div className="prof-logo">FV Hospital</div>
          </div>
          <div className="prof-quote">
            "Tracker là công cụ tôi khuyến nghị cho bệnh nhân cần theo dõi chế độ ăn. Dữ liệu chính xác và dễ hiểu giúp quá trình tư vấn hiệu quả hơn nhiều."
            <cite>— BS. Phạm Thị Lan, Chuyên khoa Dinh dưỡng, Bệnh viện Vinmec</cite>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="cta-banner">
        <h2>Bắt đầu hành trình sức khoẻ ngay hôm nay</h2>
        <p>Miễn phí, không cần thẻ tín dụng. Hơn 5 triệu người đã tin chọn Tracker.</p>
        <div className="cta-btns">
          <button className="btn-white" onClick={() => navigate('/register')}>Tải về miễn phí</button>
          <button className="btn-outline-white">Tìm hiểu thêm</button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="nav-logo">Tracker<span style={{ color: 'var(--green-accent)' }}>.</span></span>
            <p>Ứng dụng theo dõi dinh dưỡng và sức khoẻ hàng đầu Việt Nam. Giúp bạn hiểu rõ cơ thể và đạt mục tiêu.</p>
            <div className="app-badges" style={{ marginTop: 20 }}>
              <div className="app-badge">🍎 App Store</div>
              <div className="app-badge">▶ Google Play</div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Sản phẩm</h4>
            <ul>
              <li><Link to="#">Tính năng</Link></li>
              <li><Link to="#">Bảng giá</Link></li>
              <li><Link to="#">Blog sức khoẻ</Link></li>
              <li><Link to="#">Công thức nấu ăn</Link></li>
              <li><Link to="#">Database thực phẩm</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Công ty</h4>
            <ul>
              <li><Link to="#">Về chúng tôi</Link></li>
              <li><Link to="#">Đội ngũ</Link></li>
              <li><Link to="#">Tuyển dụng</Link></li>
              <li><Link to="#">Báo chí</Link></li>
              <li><Link to="#">Liên hệ</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><Link to="#">Trung tâm hỗ trợ</Link></li>
              <li><Link to="#">Chính sách bảo mật</Link></li>
              <li><Link to="#">Điều khoản sử dụng</Link></li>
              <li><Link to="#">Cookie</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Tracker. Bảo lưu mọi quyền.</span>
          <span>Được tạo với ❤️ tại Việt Nam</span>
        </div>
      </footer>
    </>
  )
}
