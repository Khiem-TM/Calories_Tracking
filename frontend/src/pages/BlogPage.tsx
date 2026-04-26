import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { blogService } from '@/features/blog/services/blogService'
import type { Blog } from '@/types/api'
import '@/assets/blog.css'

const createSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  tags: z.string().optional(),
})
type CreateValues = z.infer<typeof createSchema>

export default function BlogPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'feed' | 'personal' | 'favorites'>('feed')
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [commentInput, setCommentInput] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', search],
    queryFn: () => blogService.list({ page: 1, limit: 20, search: search || undefined }).then(r => r.data?.data ?? r.data),
  })

  const { data: rawMyBlogs, isLoading: loadingMyBlogs } = useQuery({
    queryKey: ['my-blogs'],
    queryFn: () => blogService.getMyBlogs().then(r => r.data?.data ?? r.data),
  })

  useQuery({
    queryKey: ['blog-comments', selectedBlog?.id],
    queryFn: () => blogService.getComments(selectedBlog!.id).then(r => r.data?.data ?? r.data),
    enabled: !!selectedBlog,
  })

  // We are currently simulating like behavior for the demo:
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(['3']))

  const { mutate: likeBlog } = useMutation({
    mutationFn: (id: string) => blogService.like(id),
    onSuccess: (_, id) => {
      setLikedPosts(prev => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
      // Usually, invalidate query: qc.invalidateQueries({ queryKey: ['blogs'] })
    },
  })

  const { mutate: createBlog, isPending: creating } = useMutation({
    mutationFn: (data: CreateValues) => blogService.create({
      title: data.title,
      content: data.content,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()) : undefined,
    }),
    onSuccess: () => {
      toast.success('Bài viết đã được đăng thành công!')
      qc.invalidateQueries({ queryKey: ['blogs'] })
      setCreateOpen(false)
      reset()
    },
    onError: () => toast.error('Lỗi khi đăng bài'),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
  })

  const blogs: Blog[] = Array.isArray(data) ? data : (data?.items ?? [])
  const myBlogs: Blog[] = Array.isArray(rawMyBlogs) ? rawMyBlogs : (rawMyBlogs?.items ?? [])

  const handlePostComment = () => {
    if (!commentInput.trim()) return
    toast.success('Bình luận đã được gửi')
    setCommentInput('')
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Blog Sức khoẻ</h1>
          <p>Kiến thức dinh dưỡng & tập luyện từ chuyên gia</p>
        </div>
        <div className="topbar-right">
          <div style={{ position: 'relative' }}>
            <input 
              className="input" 
              placeholder="Tìm bài viết..." 
              style={{ width: 200, height: 36, fontSize: 13, paddingLeft: 32 }} 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" fill="none" viewBox="0 0 14 14"><circle cx="6" cy="6" r="5" stroke="#7a9080" strokeWidth="1.3"/><path d="M10 10l2.5 2.5" stroke="#7a9080" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>✏️ Đăng bài</button>
        </div>
      </div>

      <div className="content">
        {/* NAV TABS */}
        <div className="blog-nav fade-up">
          <button className={`blog-nav-tab ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>Tất cả bài viết</button>
          <button className={`blog-nav-tab ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>Bài của tôi</button>
          <button className={`blog-nav-tab ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>Đã lưu ❤️</button>
        </div>

        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <div id="blog-feed">
            {/* Featured */}
            <div className="blog-featured fade-up" style={{ animationDelay: '.04s' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="feat-tag2">Bài viết nổi bật</div>
                <div className="feat-title2">Protein — Bao nhiêu là đủ? Hướng dẫn toàn diện cho người tập gym</div>
                <div className="feat-desc2">Hiểu đúng về nhu cầu protein giúp bạn tăng cơ hiệu quả mà không lãng phí.</div>
                <div className="feat-meta">
                  <div className="feat-avatar2">PL</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>BS. Phạm Thị Lan</div>
                    <div style={{ fontSize: 11, opacity: .6 }}>8 phút đọc · 12.4k lượt xem</div>
                  </div>
                  <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', marginLeft: 16 }} onClick={() => setSelectedBlog({ id: 'f1', title: 'Protein...', content: '...' } as Blog)}>Đọc ngay →</button>
                </div>
              </div>
              <div className="feat-image2">🥩</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
              <div>
                {/* Category pills */}
                <div className="cat-pills2 fade-up" style={{ animationDelay: '.06s' }}>
                  <div className="cat-pill2 active">Tất cả</div>
                  <div className="cat-pill2">Dinh dưỡng</div>
                  <div className="cat-pill2">Tập luyện</div>
                  <div className="cat-pill2">Công thức ăn</div>
                  <div className="cat-pill2">Giảm cân</div>
                  <div className="cat-pill2">Tâm lý</div>
                </div>

                {/* Blog grid */}
                <div className="blog-grid2">
                  {blogs.length === 0 && !isLoading && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Chưa có bài viết nào.</div>
                  )}
                  {isLoading && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Đang tải...</div>}
                  {blogs.map((b, i) => {
                    const isLiked = likedPosts.has(b.id)
                    const bgColors = ['var(--green-light)', '#fef3e2', '#fdf0f0', '#eff5ff', '#f3e8ff']
                    const textColors = ['var(--green-accent)', '#c47a00', '#c04a4a', '#2563eb', '#7c3aed']
                    const emojis = ['🥗', '🏃', '😴', '🍱', '⚖️', '🧠']
                    
                    const bg = bgColors[i % bgColors.length]
                    const color = textColors[i % textColors.length]
                    const img = emojis[i % emojis.length]
                    const authorName = typeof b.author === 'string' ? b.author : (b.author as any)?.full_name ?? 'Ẩn danh'
                    const authorInitial = authorName.substring(0, 2).toUpperCase()

                    return (
                      <div key={b.id} className="blog-card2 fade-up" style={{ animationDelay: `${0.08 + i * 0.03}s` }} onClick={() => setSelectedBlog(b)}>
                        <div className="blog-card2-img" style={{ background: bg, overflow: 'hidden' }}>
                          {b.thumbnailUrl ? (
                            <img src={b.thumbnailUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : img}
                          <button className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); likeBlog(b.id) }}>{isLiked ? '❤️' : '🤍'}</button>
                        </div>
                        <div className="blog-card2-body">
                          <div className="blog-cat2" style={{ color: color }}>{(b.tags && b.tags[0]) || 'Sức khỏe'}</div>
                          <div className="blog-title2">{b.title}</div>
                          <div className="blog-excerpt2">{b.content?.substring(0, 100) || ''}...</div>
                          <div className="blog-footer">
                            <div className="blog-author-dot2" style={{ background: bg, color: color }}>{authorInitial}</div>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{authorName}</span>
                            <div className="blog-stats">
                              <div className="blog-stat" onClick={(e) => { e.stopPropagation(); likeBlog(b.id) }}>
                                <span>{isLiked ? '❤️' : '🤍'}</span><span>{b.likesCount ?? 0}</span>
                              </div>
                              <div className="blog-stat">💬 <span>{b.viewCount ?? 0}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <button className="btn btn-ghost2">Xem thêm bài viết</button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="blog-sidebar2">
                <div className="card card-pad">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 14 }}>Đang hot</div>
                  <div className="trending-item2"><div className="trending-num2">01</div><div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>Protein — Bao nhiêu là đủ?</div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>12.4k lượt đọc</div></div></div>
                  <div className="trending-item2"><div className="trending-num2">02</div><div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>Intermittent Fasting 16:8</div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>9.8k lượt đọc</div></div></div>
                  <div className="trending-item2"><div className="trending-num2">03</div><div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>Carbs không phải kẻ thù</div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>8.2k lượt đọc</div></div></div>
                  <div className="trending-item2"><div className="trending-num2">04</div><div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>5 dấu hiệu thiếu sắt</div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>7.1k lượt đọc</div></div></div>
                </div>
                <div className="card card-pad">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 12 }}>Tags phổ biến</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <span className="badge badge-green" style={{ cursor: 'pointer' }}>#protein</span>
                    <span className="badge badge-green" style={{ cursor: 'pointer' }}>#giảmcân</span>
                    <span className="badge badge-orange" style={{ cursor: 'pointer' }}>#tăngcơ</span>
                    <span className="badge badge-blue" style={{ cursor: 'pointer' }}>#dinh dưỡng</span>
                    <span className="badge badge-green" style={{ cursor: 'pointer' }}>#mealprep</span>
                    <span className="badge badge-red" style={{ cursor: 'pointer' }}>#giấcngủ</span>
                  </div>
                </div>
                <div style={{ background: 'var(--green-dark)', borderRadius: 'var(--radius)', padding: 20, color: '#fff' }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Nhận bài mới nhất</div>
                  <div style={{ fontSize: 12, opacity: .6, marginBottom: 14, lineHeight: 1.5 }}>Mỗi tuần một bài từ chuyên gia. Không spam.</div>
                  <input type="email" placeholder="Email của bạn..." style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: 'none', fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 8, outline: 'none' }} />
                  <button style={{ width: '100%', padding: 9, borderRadius: 10, background: 'var(--green-accent)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>Đăng ký</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PERSONAL TAB */}
        {activeTab === 'personal' && (
          <div id="blog-personal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-dark)' }}>Bài viết của bạn</div>
              <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>✏️ Viết bài mới</button>
            </div>
            
            {myBlogs.length === 0 && !loadingMyBlogs && (
               <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Bạn chưa có bài viết nào.</div>
            )}
            {loadingMyBlogs && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Đang tải...</div>}

            {myBlogs.map((b, i) => (
              <div key={b.id} className="personal-post fade-up" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => setSelectedBlog(b)}>
                <div className="personal-thumb" style={{ overflow: 'hidden' }}>
                    {b.thumbnailUrl ? (
                        <img src={b.thumbnailUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : '📝'}
                </div>
                <div className="personal-info">
                  <div className="personal-title">{b.title}</div>
                  <div className="personal-meta">
                    <span>{new Date(b.createdAt ?? new Date()).toLocaleDateString('vi-VN')}</span>
                    <span>❤️ {b.likesCount ?? 0} thích</span>
                    <span style={{ color: 'var(--green-accent)' }}>👁 {b.viewCount ?? 0} lượt xem</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <div className="badge badge-green">Đã đăng</div>
                  <button className="btn btn-ghost2 btn-sm" onClick={(e) => e.stopPropagation()}>Chỉnh sửa</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAVORITES TAB */}
        {activeTab === 'favorites' && (
          <div id="blog-favorites">
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 20 }}>Bài viết đã lưu — 2 bài</div>
            <div className="personal-post fade-up">
              <div className="personal-thumb" style={{ background: '#eff5ff' }}>🍱</div>
              <div className="personal-info">
                <div className="personal-title">5 công thức meal prep nhanh cho cả tuần — chỉ 2 tiếng cuối tuần</div>
                <div className="personal-meta"><span>Kim Hoà</span><span>❤️ 312</span><span>💬 54</span></div>
              </div>
              <button className="btn btn-ghost2 btn-sm">❤️ Đã lưu</button>
            </div>
            <div className="personal-post fade-up" style={{ animationDelay: '.05s' }}>
              <div className="personal-thumb">🥩</div>
              <div className="personal-info">
                <div className="personal-title">Protein — Bao nhiêu là đủ? Hướng dẫn toàn diện cho người tập gym</div>
                <div className="personal-meta"><span>BS. Phạm Thị Lan</span><span>❤️ 891</span><span>💬 143</span></div>
              </div>
              <button className="btn btn-ghost2 btn-sm">❤️ Đã lưu</button>
            </div>
          </div>
        )}
      </div>

      {/* ARTICLE DETAIL MODAL */}
      {selectedBlog && (
        <div className="blog-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedBlog(null) }}>
          <div className="article-modal">
            <div className="article-modal-hero">
              <button className="article-close" onClick={() => setSelectedBlog(null)}>✕</button>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', opacity: .7, marginBottom: 10 }}>Dinh dưỡng</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, lineHeight: 1.25, marginBottom: 12 }}>{selectedBlog.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, opacity: .8 }}>
                <span>BS. Phan Lan</span>
                <span>·</span><span>5 phút đọc</span>
                <span>·</span><span>1.2k lượt xem</span>
                <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', marginLeft: 'auto' }} onClick={() => toast.success('Đã lưu bài viết')}>🔖 Lưu bài</button>
              </div>
            </div>
            <div className="article-modal-body">
              <p className="article-p">Nội dung demo bài viết... Protein là một trong ba đại chất dinh dưỡng quan trọng nhất (cùng với carbohydrate và chất béo) và đóng vai trò thiết yếu trong việc xây dựng và phục hồi cơ bắp, tổng hợp hormone, và duy trì hệ miễn dịch khoẻ mạnh.</p>
              <div className="article-tip">💡 <strong>Tóm tắt nhanh:</strong> Nếu bạn tập luyện thường xuyên, hãy nhắm tới 1.6–2.2g protein per kg cân nặng mỗi ngày để đạt kết quả tối ưu.</div>
              <h2 className="article-h2">Tại sao protein quan trọng với người tập gym?</h2>
              <p className="article-p">Khi bạn tập tạ, các sợi cơ bị tổn thương nhỏ. Quá trình phục hồi và phát triển cơ bắp (hypertrophy) cần amino acid từ protein. Không có đủ protein, cơ thể sẽ không thể tái tạo và phát triển cơ bắp dù bạn tập bao nhiêu.</p>
            </div>
            
            {/* Comments */}
            <div className="comment-section">
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 16 }}>Bình luận</div>
              <div className="comment-input-row">
                <div className="comment-avatar">ME</div>
                <input 
                  type="text" 
                  placeholder="Viết bình luận..." 
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handlePostComment() }}
                />
                <button className="btn btn-primary btn-sm" onClick={handlePostComment}>Gửi</button>
              </div>
              <div>
                <div className="comment-item">
                  <div className="comment-avatar">KH</div>
                  <div>
                    <div className="comment-bubble">
                      <div className="comment-name">Kim Hoà</div>
                      <div className="comment-text">Bài viết rất hữu ích! Tôi đang bổ sung whey protein nhưng không chắc liều lượng, bài này giải đáp được.</div>
                      <div className="comment-meta">
                        <span className="comment-like">🤍 12</span><span className="comment-reply">Trả lời</span><span>2 giờ trước</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer actions */}
            <div style={{ padding: '16px 36px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <button className="btn btn-ghost2" onClick={() => likeBlog(selectedBlog.id)}>🤍 Thích <span style={{ marginLeft: 4 }}>123</span></button>
              <button className="btn btn-ghost2" onClick={() => toast.success('Đã lưu bài viết')}>🔖 Lưu bài</button>
              <button className="btn btn-ghost2">↗ Chia sẻ</button>
              <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setSelectedBlog(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* POST MODAL */}
      {createOpen && (
        <div className="blog-overlay" onClick={(e) => { if (e.target === e.currentTarget) setCreateOpen(false) }}>
          <div className="post-modal">
            <div className="post-modal-header">
              <div>
                <div className="post-modal-title">Đăng bài viết mới</div>
                <div className="post-modal-subtitle">Soạn và xuất bản bài viết sức khoẻ của bạn.</div>
              </div>
              <button className="post-modal-close" onClick={() => setCreateOpen(false)}>✕</button>
            </div>
            
            <div className="post-modal-body">
              {/* LEFT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>Tiêu đề bài viết</div>
                  <input className={`input ${errors.title ? 'error' : ''}`} placeholder="Vd: Hành trình giảm 5kg trong 60 ngày của tôi" {...register('title')} />
                </div>
                
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>Nội dung bài viết</div>
                  <div className="rte-toolbar">
                    <button type="button" className="rte-btn"><b>B</b></button>
                    <button type="button" className="rte-btn"><i>I</i></button>
                    <button type="button" className="rte-btn" style={{ textDecoration: 'underline' }}>U</button>
                    <div className="rte-divider"></div>
                    <button type="button" className="rte-btn" style={{ fontSize: 11, fontWeight: 800, width: 36 }}>H1</button>
                    <button type="button" className="rte-btn" style={{ fontSize: 11, fontWeight: 800, width: 36 }}>H2</button>
                    <div className="rte-divider"></div>
                    <button type="button" className="rte-add-media">Thêm ảnh/media</button>
                  </div>
                  <textarea className={`rte-body ${errors.content ? 'error' : ''}`} placeholder="Bắt đầu viết bài của bạn tại đây..." {...register('content')} style={{ width: '100%', minHeight: 200, padding: 14 }}></textarea>
                </div>

                <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                  <button type="button" className="btn btn-ghost2" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setCreateOpen(false)}>Lưu nháp</button>
                  <button type="button" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit((d) => createBlog(d))} disabled={creating}>
                    {creating ? 'Đang đăng...' : 'Đăng bài ngay'}
                  </button>
                </div>
              </div>

              {/* RIGHT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>Ảnh bìa</div>
                  <div className="post-img-upload">
                    <div style={{ fontSize: 24, marginBottom: 4 }}>📸</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>Tải ảnh lên</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>1200 × 630px</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>Tags</div>
                  <input className="input" placeholder="#protein #giảmcân ..." {...register('tags')} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
