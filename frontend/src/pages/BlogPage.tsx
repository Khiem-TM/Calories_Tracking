import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  usePublicBlogs,
  useBlogTags,
  useToggleLike,
  useCheckLiked,
  useMyBlogs,
  useCreateUserBlog,
  useUpdateUserBlog,
  useDeleteUserBlog,
} from '@/features/blog/hooks/useBlog'
import { useAuthStore } from '@/stores/authStore'
import type { Blog } from '@/types/api'
import type { BlockPayload, CreateBlogPayload } from '@/features/blog/services/blogService'
import '@/assets/blog.css'

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  approved: { label: 'Đã đăng', color: '#243d24' },
  draft: { label: 'Nháp', color: '#5c5c52' },
  rejected: { label: 'Từ chối', color: '#93000a' },
}

// ─── Block editor types ───────────────────────────────────────────────────────
interface UIBlock {
  id: string
  type: 'text' | 'image'
  textContent: string
  imageBase64?: string
  imagePreview?: string
}

function makeId() {
  return Math.random().toString(36).slice(2)
}

// ─── Like button (isolated to avoid re-render storm on the list) ──────────────
function LikeButton({ blog, onClick }: { blog: Blog; onClick: (e: React.MouseEvent) => void }) {
  const token = useAuthStore((s) => s.accessToken)
  const { data } = useCheckLiked(token ? blog.id : undefined)
  const liked = data?.liked ?? false
  return (
    <button
      className={`like-btn ${liked ? 'liked' : ''}`}
      onClick={onClick}
    >
      {liked ? '❤️' : '🤍'}
    </button>
  )
}

// ─── Blog card ────────────────────────────────────────────────────────────────
function BlogCard({
  blog,
  index,
  onLike,
  onClick,
}: {
  blog: Blog
  index: number
  onLike: (e: React.MouseEvent, id: string) => void
  onClick: (blog: Blog) => void
}) {
  const bgColors = ['var(--green-light)', '#fef3e2', '#fdf0f0', '#eff5ff', '#f3e8ff']
  const textColors = ['var(--green-accent)', '#c47a00', '#c04a4a', '#2563eb', '#7c3aed']
  const emojis = ['🥗', '🏃', '😴', '🍱', '⚖️', '🧠']
  const bg = bgColors[index % bgColors.length]
  const color = textColors[index % textColors.length]
  const emoji = emojis[index % emojis.length]

  const authorName = blog.authorUser?.displayName ?? 'VitalAI'
  const authorInitial = authorName.substring(0, 2).toUpperCase()
  const firstTextBlock = blog.blocks?.find((b) => b.type === 'text')
  const excerpt = firstTextBlock?.textContent?.substring(0, 100) ?? ''

  return (
    <div
      className="blog-card2 fade-up"
      style={{ animationDelay: `${0.08 + index * 0.03}s`, cursor: 'pointer' }}
      onClick={() => onClick(blog)}
    >
      <div className="blog-card2-img" style={{ background: bg, overflow: 'hidden' }}>
        {blog.thumbnailUrl ? (
          <img src={blog.thumbnailUrl} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 32 }}>{emoji}</span>
        )}
        <LikeButton blog={blog} onClick={(e) => onLike(e, blog.id)} />
      </div>
      <div className="blog-card2-body">
        <div className="blog-cat2" style={{ color }}>
          {(blog.tags && blog.tags[0]) || 'Sức khỏe'}
        </div>
        <div className="blog-title2">{blog.title}</div>
        {excerpt && <div className="blog-excerpt2">{excerpt}...</div>}
        <div className="blog-footer">
          <div className="blog-author-dot2" style={{ background: bg, color }}>{authorInitial}</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{authorName}</span>
          <div className="blog-stats">
            <div className="blog-stat">❤️ <span>{blog.likesCount ?? 0}</span></div>
            <div className="blog-stat">👁 <span>{blog.viewCount ?? 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Block editor component ───────────────────────────────────────────────────
function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: UIBlock[]
  onChange: (blocks: UIBlock[]) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImageIndex, setPendingImageIndex] = useState<number | null>(null)

  const addTextBlock = () => {
    onChange([...blocks, { id: makeId(), type: 'text', textContent: '' }])
  }

  const addImageBlock = () => {
    const newBlock: UIBlock = { id: makeId(), type: 'image', textContent: '' }
    onChange([...blocks, newBlock])
    setPendingImageIndex(blocks.length)
    setTimeout(() => fileInputRef.current?.click(), 50)
  }

  const updateText = (id: string, val: string) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, textContent: val } : b)))
  }

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id))
  }

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || pendingImageIndex === null) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      onChange(
        blocks.map((b, i) =>
          i === pendingImageIndex
            ? { ...b, imageBase64: base64, imagePreview: base64 }
            : b,
        ),
      )
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    setPendingImageIndex(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />

      {blocks.map((block, i) => (
        <div key={block.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          {block.type === 'text' ? (
            <textarea
              className="rte-body"
              placeholder={`Đoạn văn ${i + 1}...`}
              value={block.textContent}
              onChange={(e) => updateText(block.id, e.target.value)}
              style={{ flex: 1, minHeight: 80, padding: 10, resize: 'vertical' }}
            />
          ) : (
            <div
              style={{
                flex: 1,
                border: '1px dashed var(--border)',
                borderRadius: 10,
                padding: 10,
                background: 'var(--bg-secondary)',
                minHeight: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onClick={() => {
                setPendingImageIndex(i)
                fileInputRef.current?.click()
              }}
            >
              {block.imagePreview ? (
                <img src={block.imagePreview} alt="" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8 }} />
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>📸 Nhấn để chọn ảnh</span>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => removeBlock(block.id)}
            style={{
              padding: '6px 8px',
              border: 'none',
              background: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            🗑
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button type="button" className="btn btn-ghost2 btn-sm" onClick={addTextBlock}>
          + Thêm đoạn văn
        </button>
        <button type="button" className="btn btn-ghost2 btn-sm" onClick={addImageBlock}>
          + Thêm ảnh
        </button>
      </div>
    </div>
  )
}

// ─── Thumbnail uploader ───────────────────────────────────────────────────────
function ThumbnailUploader({
  value,
  onChange,
}: {
  value?: string
  onChange: (base64: string | undefined) => void
}) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>
        Ảnh bìa
      </div>
      <label
        className="post-img-upload"
        style={{ cursor: 'pointer', display: 'block', overflow: 'hidden' }}
      >
        {value ? (
          <img src={value} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
        ) : (
          <>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📸</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>Tải ảnh lên</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>1200 × 630px</div>
          </>
        )}
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </label>
      {value && (
        <button type="button" className="btn btn-ghost2 btn-sm" style={{ marginTop: 6, width: '100%' }} onClick={() => onChange(undefined)}>
          Xóa ảnh
        </button>
      )}
    </div>
  )
}

// ─── Create / Edit modal ──────────────────────────────────────────────────────
function BlogFormModal({
  editBlog,
  onClose,
}: {
  editBlog?: Blog
  onClose: () => void
}) {
  const createMutation = useCreateUserBlog()
  const updateMutation = useUpdateUserBlog()
  const isPending = createMutation.isPending || updateMutation.isPending

  const existingBlocks: UIBlock[] = (editBlog?.blocks ?? []).map((b) => ({
    id: b.id,
    type: b.type,
    textContent: b.textContent ?? '',
    imagePreview: b.imageUrl,
  }))

  const [title, setTitle] = useState(editBlog?.title ?? '')
  const [tags, setTags] = useState((editBlog?.tags ?? []).join(', '))
  const [thumbnailBase64, setThumbnailBase64] = useState<string | undefined>(editBlog?.thumbnailUrl)
  const [blocks, setBlocks] = useState<UIBlock[]>(existingBlocks.length ? existingBlocks : [])

  const buildPayload = (status?: 'draft'): CreateBlogPayload => {
    const blockPayloads: BlockPayload[] = blocks.map((b, i) => {
      if (b.type === 'text') {
        return { order: i, type: 'text', text_content: b.textContent }
      }
      const payload: BlockPayload = { order: i, type: 'image' }
      if (b.imageBase64) payload.image_base64 = b.imageBase64
      return payload
    })

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload: CreateBlogPayload = {
      title: title.trim(),
      blocks: blockPayloads,
      tags: tagList.length ? tagList : undefined,
      ...(status ? { status } : {}),
    }

    if (thumbnailBase64 && thumbnailBase64.startsWith('data:')) {
      payload.thumbnailBase64 = thumbnailBase64
    }

    return payload
  }

  const handleSubmit = async (status?: 'draft') => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề')
      return
    }
    const payload = buildPayload(status)
    if (editBlog) {
      await updateMutation.mutateAsync({ id: editBlog.id, data: payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <div className="blog-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="post-modal">
        <div className="post-modal-header">
          <div>
            <div className="post-modal-title">{editBlog ? 'Chỉnh sửa bài viết' : 'Đăng bài viết mới'}</div>
            <div className="post-modal-subtitle">Soạn và xuất bản bài viết sức khoẻ của bạn.</div>
          </div>
          <button className="post-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="post-modal-body">
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>
                Tiêu đề bài viết
              </div>
              <input
                className="input"
                placeholder="Vd: Hành trình giảm 5kg trong 60 ngày của tôi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>
                Nội dung bài viết
              </div>
              <BlockEditor blocks={blocks} onChange={setBlocks} />
            </div>

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button
                type="button"
                className="btn btn-ghost2"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => handleSubmit('draft')}
                disabled={isPending}
              >
                {isPending ? '...' : 'Lưu nháp'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => handleSubmit()}
                disabled={isPending}
              >
                {isPending ? 'Đang đăng...' : editBlog ? 'Lưu thay đổi' : 'Đăng bài ngay'}
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ThumbnailUploader value={thumbnailBase64} onChange={setThumbnailBase64} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>
                Tags (cách nhau bằng dấu phẩy)
              </div>
              <input
                className="input"
                placeholder="#protein, #giảmcân, ..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { mutate: toggleLike } = useToggleLike()
  const deleteMutation = useDeleteUserBlog()

  const [activeTab, setActiveTab] = useState<'feed' | 'personal'>('feed')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | undefined>()
  const [feedPage, setFeedPage] = useState(1)
  const [myPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editBlog, setEditBlog] = useState<Blog | undefined>()

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearch = useCallback((val: string) => {
    setSearch(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val)
      setFeedPage(1)
    }, 400)
  }, [])

  const { data: feedData, isLoading: loadingFeed } = usePublicBlogs({
    page: feedPage,
    limit: 12,
    search: debouncedSearch || undefined,
    tag: selectedTag,
  })

  const { data: tagsData } = useBlogTags()
  const { data: myData, isLoading: loadingMy } = useMyBlogs(myPage)

  const blogs = feedData?.items ?? []
  const feedTotal = feedData?.total ?? 0
  const myBlogs = myData?.items ?? []

  const trendingBlogs = [...blogs].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0)).slice(0, 4)
  const tags = tagsData ?? []

  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!user) { toast.error('Vui lòng đăng nhập để thích bài viết'); return }
    toggleLike(id)
  }

  const handleDeleteBlog = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Bạn chắc chắn muốn xóa bài viết này?')) return
    deleteMutation.mutate(id)
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Blog Sức khoẻ</h1>
          <p>Kiến thức dinh dưỡng & tập luyện từ cộng đồng</p>
        </div>
        <div className="topbar-right">
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              placeholder="Tìm bài viết..."
              style={{ width: 200, height: 36, fontSize: 13, paddingLeft: 32 }}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" fill="none" viewBox="0 0 14 14">
              <circle cx="6" cy="6" r="5" stroke="#7a9080" strokeWidth="1.3" />
              <path d="M10 10l2.5 2.5" stroke="#7a9080" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>✏️ Đăng bài</button>
        </div>
      </div>

      <div className="content">
        {/* NAV TABS */}
        <div className="blog-nav fade-up">
          <button className={`blog-nav-tab ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>
            Tất cả bài viết
          </button>
          <button className={`blog-nav-tab ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
            Bài của tôi
          </button>
        </div>

        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
              <div>
                {/* Tag filter pills */}
                <div className="cat-pills2 fade-up" style={{ animationDelay: '.04s' }}>
                  <div
                    className={`cat-pill2 ${!selectedTag ? 'active' : ''}`}
                    onClick={() => { setSelectedTag(undefined); setFeedPage(1) }}
                  >
                    Tất cả
                  </div>
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className={`cat-pill2 ${selectedTag === tag ? 'active' : ''}`}
                      onClick={() => { setSelectedTag(tag === selectedTag ? undefined : tag); setFeedPage(1) }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>

                {/* Blog grid */}
                {loadingFeed && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Đang tải...</div>
                )}
                {!loadingFeed && blogs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    {debouncedSearch || selectedTag ? 'Không tìm thấy bài viết phù hợp.' : 'Chưa có bài viết nào.'}
                  </div>
                )}

                <div className="blog-grid2">
                  {blogs.map((b, i) => (
                    <BlogCard
                      key={b.id}
                      blog={b}
                      index={i}
                      onLike={handleLike}
                      onClick={(blog) => navigate(`/blog/${blog.id}`)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {feedTotal > 12 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                    {feedPage > 1 && (
                      <button className="btn btn-ghost2 btn-sm" onClick={() => setFeedPage((p) => p - 1)}>
                        ← Trước
                      </button>
                    )}
                    <span style={{ lineHeight: '32px', fontSize: 13, color: 'var(--text-muted)' }}>
                      Trang {feedPage} / {Math.ceil(feedTotal / 12)}
                    </span>
                    {feedPage < Math.ceil(feedTotal / 12) && (
                      <button className="btn btn-ghost2 btn-sm" onClick={() => setFeedPage((p) => p + 1)}>
                        Tiếp →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="blog-sidebar2">
                {trendingBlogs.length > 0 && (
                  <div className="card card-pad">
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 14 }}>Đang hot</div>
                    {trendingBlogs.map((b, i) => (
                      <div
                        key={b.id}
                        className="trending-item2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/blog/${b.id}`)}
                      >
                        <div className="trending-num2">{String(i + 1).padStart(2, '0')}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>{b.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {b.viewCount?.toLocaleString('vi-VN')} lượt đọc
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="card card-pad">
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 12 }}>Tags phổ biến</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {tags.slice(0, 12).map((tag) => (
                        <span
                          key={tag}
                          className="badge badge-green"
                          style={{ cursor: 'pointer', fontWeight: selectedTag === tag ? 700 : 400 }}
                          onClick={() => { setSelectedTag(selectedTag === tag ? undefined : tag); setFeedPage(1) }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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

            {loadingMy && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Đang tải...</div>}
            {!loadingMy && myBlogs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                Bạn chưa có bài viết nào.{' '}
                <button className="btn btn-ghost2 btn-sm" onClick={() => setCreateOpen(true)}>Viết ngay</button>
              </div>
            )}

            {myBlogs.map((b, i) => {
              const statusCfg = STATUS_BADGE[b.status] ?? STATUS_BADGE.draft
              return (
                <div
                  key={b.id}
                  className="personal-post fade-up"
                  style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer' }}
                  onClick={() => b.status === 'approved' && navigate(`/blog/${b.id}`)}
                >
                  <div className="personal-thumb" style={{ overflow: 'hidden' }}>
                    {b.thumbnailUrl ? (
                      <img src={b.thumbnailUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : '📝'}
                  </div>
                  <div className="personal-info">
                    <div className="personal-title">{b.title}</div>
                    {b.status === 'rejected' && b.rejectionReason && (
                      <div style={{ fontSize: 12, color: '#93000a', marginTop: 3 }}>
                        ⚠️ {b.rejectionReason}
                      </div>
                    )}
                    <div className="personal-meta">
                      <span>{new Date(b.createdAt ?? new Date()).toLocaleDateString('vi-VN')}</span>
                      <span>❤️ {b.likesCount ?? 0}</span>
                      <span>👁 {b.viewCount ?? 0}</span>
                      <span>💬 {b.commentCount ?? 0}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <div
                      className="badge"
                      style={{ background: `${statusCfg.color}18`, color: statusCfg.color, fontWeight: 700 }}
                    >
                      {statusCfg.label}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-ghost2 btn-sm"
                        onClick={(e) => { e.stopPropagation(); setEditBlog(b) }}
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        className="btn btn-ghost2 btn-sm"
                        style={{ color: '#93000a' }}
                        onClick={(e) => handleDeleteBlog(e, b.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {createOpen && <BlogFormModal onClose={() => setCreateOpen(false)} />}

      {/* EDIT MODAL */}
      {editBlog && <BlogFormModal editBlog={editBlog} onClose={() => setEditBlog(undefined)} />}
    </>
  )
}
