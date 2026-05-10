import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useBlogDetail,
  useBlogComments,
  useCheckLiked,
  useToggleLike,
  useAddComment,
  useDeleteComment,
} from '@/features/blog/hooks/useBlog'
import { useAuthStore } from '@/stores/authStore'
import type { BlogBlock } from '@/types/api'
import { toast } from 'sonner'

// ─── Block renderer ───────────────────────────────────────────────────────────
function BlockRenderer({ block }: { block: BlogBlock }) {
  if (block.type === 'text') {
    return (
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.8,
          color: 'var(--text-primary)',
          margin: '0 0 20px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {block.textContent}
      </p>
    )
  }
  if (block.type === 'image' && block.imageUrl) {
    return (
      <div style={{ margin: '20px 0' }}>
        <img
          src={block.imageUrl}
          alt=""
          style={{
            width: '100%',
            borderRadius: 12,
            display: 'block',
            maxHeight: 480,
            objectFit: 'cover',
          }}
        />
      </div>
    )
  }
  return null
}

// ─── Tag badge ────────────────────────────────────────────────────────────────
function TagBadge({ tag }: { tag: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        background: 'var(--green-light)',
        color: 'var(--green-accent)',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      #{tag}
    </span>
  )
}

// ─── Avatar circle ────────────────────────────────────────────────────────────
function Avatar({ name, url, size = 36 }: { name: string; url?: string; size?: number }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  const initials = name.substring(0, 2).toUpperCase()
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--green-light)',
        color: 'var(--green-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.35,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [commentPage, setCommentPage] = useState(1)
  const [commentInput, setCommentInput] = useState('')

  const { data: blog, isLoading, isError } = useBlogDetail(id)
  const { data: commentsData, isLoading: loadingComments } = useBlogComments(id, commentPage)
  const { data: likedData } = useCheckLiked(user ? id : undefined)
  const { mutate: toggleLike, isPending: likePending } = useToggleLike()
  const { mutate: addComment, isPending: commentPending } = useAddComment()
  const { mutate: deleteComment } = useDeleteComment()

  const liked = likedData?.liked ?? false
  const comments = commentsData?.items ?? []
  const commentTotal = commentsData?.total ?? 0

  const handleLike = () => {
    if (!user) { toast.error('Vui lòng đăng nhập để thích bài viết'); return }
    if (id) toggleLike(id)
  }

  const handleAddComment = () => {
    if (!user) { toast.error('Vui lòng đăng nhập để bình luận'); return }
    if (!commentInput.trim()) return
    addComment(
      { blogId: id!, content: commentInput.trim() },
      { onSuccess: () => setCommentInput('') },
    )
  }

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('Xóa bình luận này?')) return
    deleteComment({ blogId: id!, commentId })
  }

  if (isLoading) {
    return (
      <div className="content" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: 'var(--text-muted)' }}>Đang tải bài viết...</div>
      </div>
    )
  }

  if (isError || !blog) {
    return (
      <div className="content" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
        <div style={{ fontWeight: 700, color: 'var(--green-dark)', marginBottom: 8 }}>Không tìm thấy bài viết</div>
        <button className="btn btn-ghost2 btn-sm" onClick={() => navigate('/blog')}>← Quay lại Blog</button>
      </div>
    )
  }

  const authorName = blog.authorUser?.displayName ?? 'VitalAI'
  const isAuthor = user && blog.authorId && user.id === blog.authorId
  const sortedBlocks = [...(blog.blocks ?? [])].sort((a, b) => a.order - b.order)

  return (
    <div className="content">
      {/* Back button */}
      <button
        className="btn btn-ghost2 btn-sm"
        style={{ marginBottom: 20 }}
        onClick={() => navigate(-1)}
      >
        ← Quay lại Blog
      </button>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Thumbnail */}
        {blog.thumbnailUrl && (
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 28, height: 340 }}>
            <img
              src={blog.thumbnailUrl}
              alt={blog.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {blog.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--green-dark)',
            lineHeight: 1.25,
            marginBottom: 16,
          }}
        >
          {blog.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          <Avatar name={authorName} url={blog.authorUser?.avatarUrl} size={36} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--green-dark)' }}>{authorName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date(blog.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>👁 {blog.viewCount?.toLocaleString('vi-VN')} lượt xem</span>
            {isAuthor && (
              <button
                className="btn btn-ghost2 btn-sm"
                onClick={() => navigate('/blog', { state: { editId: blog.id } })}
              >
                ✏️ Sửa bài
              </button>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)', marginBottom: 32 }} />

        {/* Content blocks */}
        <div style={{ marginBottom: 40 }}>
          {sortedBlocks.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Bài viết chưa có nội dung.</p>
          )}
          {sortedBlocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />

        {/* Like / stats row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <button
            className={`btn ${liked ? 'btn-primary' : 'btn-ghost2'}`}
            onClick={handleLike}
            disabled={likePending}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {liked ? '❤️' : '🤍'} {blog.likesCount ?? 0} Thích
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            💬 {blog.commentCount ?? 0} bình luận
          </span>
        </div>

        {/* Comments section */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 20 }}>
            Bình luận ({commentTotal})
          </div>

          {/* Comment input */}
          {user ? (
            <div className="comment-input-row" style={{ marginBottom: 24 }}>
              <Avatar name={user.displayName} url={user.avatarUrl} size={36} />
              <input
                type="text"
                placeholder="Viết bình luận..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddComment}
                disabled={commentPending || !commentInput.trim()}
              >
                {commentPending ? '...' : 'Gửi'}
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: '14px 16px',
                background: 'var(--bg-secondary)',
                borderRadius: 10,
                marginBottom: 24,
                fontSize: 13,
                color: 'var(--text-muted)',
              }}
            >
              <button className="btn btn-ghost2 btn-sm" onClick={() => navigate('/login')}>Đăng nhập</button>{' '}
              để tham gia bình luận
            </div>
          )}

          {/* Comment list */}
          {loadingComments && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Đang tải bình luận...</div>}

          {comments.map((c) => {
            const cAuthor = c.authorUser?.displayName ?? 'Người dùng'
            const isOwnComment = user && c.authorId && user.id === c.authorId
            return (
              <div key={c.id} className="comment-item">
                <Avatar name={cAuthor} url={c.authorUser?.avatarUrl} size={36} />
                <div style={{ flex: 1 }}>
                  <div className="comment-bubble">
                    <div className="comment-name">{cAuthor}</div>
                    <div className="comment-text">{c.content}</div>
                    <div className="comment-meta">
                      <span>
                        {new Date(c.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                      {isOwnComment && (
                        <button
                          className="comment-reply"
                          style={{ color: '#93000a', marginLeft: 8 }}
                          onClick={() => handleDeleteComment(c.id)}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Comment pagination */}
          {commentTotal > 20 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              {commentPage > 1 && (
                <button className="btn btn-ghost2 btn-sm" onClick={() => setCommentPage((p) => p - 1)}>
                  ← Trước
                </button>
              )}
              {commentPage < Math.ceil(commentTotal / 20) && (
                <button className="btn btn-ghost2 btn-sm" onClick={() => setCommentPage((p) => p + 1)}>
                  Xem thêm bình luận →
                </button>
              )}
            </div>
          )}

          {!loadingComments && comments.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
