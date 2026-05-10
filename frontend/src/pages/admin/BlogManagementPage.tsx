import { useState } from 'react'
import {
  useAdminBlogs,
  useApproveBlog,
  useRejectBlog,
  useDeleteBlog,
  useCreateBlog,
  useUpdateBlog,
  useBatchApproveBlog,
  useBatchRejectBlog,
} from '@/features/admin/hooks/useAdmin'
import type { AdminBlog, CreateBlogDto, AdminBlockPayload } from '@/features/admin/services/adminService'

type StatusFilter = 'all' | 'approved' | 'rejected' | 'draft'

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: '#ccebc7', color: '#243d24', label: 'Approved' },
  rejected: { bg: '#ffdad6', color: '#93000a', label: 'Rejected' },
  draft: { bg: '#e3e3de', color: '#434841', label: 'Draft' },
}

// ─── Block editor for admin ───────────────────────────────────────────────────
interface UIAdminBlock { id: string; type: 'text' | 'image'; textContent: string; imageUrl: string }

function makeId() { return Math.random().toString(36).slice(2) }

function AdminBlockEditor({
  blocks,
  onChange,
}: {
  blocks: UIAdminBlock[]
  onChange: (b: UIAdminBlock[]) => void
}) {
  const addText = () => onChange([...blocks, { id: makeId(), type: 'text', textContent: '', imageUrl: '' }])
  const addImage = () => onChange([...blocks, { id: makeId(), type: 'image', textContent: '', imageUrl: '' }])
  const remove = (id: string) => onChange(blocks.filter((b) => b.id !== id))
  const update = (id: string, field: 'textContent' | 'imageUrl', val: string) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, [field]: val } : b)))

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={block.id} className="flex gap-2 items-start">
          {block.type === 'text' ? (
            <textarea
              rows={3}
              value={block.textContent}
              onChange={(e) => update(block.id, 'textContent', e.target.value)}
              placeholder={`Paragraph ${i + 1}...`}
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none resize-vertical border border-[#c3c8bf] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888]"
            />
          ) : (
            <input
              value={block.imageUrl}
              onChange={(e) => update(block.id, 'imageUrl', e.target.value)}
              placeholder="Image URL (https://...)"
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888]"
            />
          )}
          <button
            type="button"
            onClick={() => remove(block.id)}
            className="p-2 rounded-xl hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <button type="button" onClick={addText} className="px-4 py-2 rounded-xl text-xs font-bold border border-[#c3c8bf] hover:bg-[#faf9f5] transition-colors" style={{ color: '#4a6549' }}>
          + Add Text
        </button>
        <button type="button" onClick={addImage} className="px-4 py-2 rounded-xl text-xs font-bold border border-[#c3c8bf] hover:bg-[#faf9f5] transition-colors" style={{ color: '#4a6549' }}>
          + Add Image URL
        </button>
      </div>
    </div>
  )
}

// ─── Blog form modal (create / edit) ─────────────────────────────────────────
function BlogFormModal({
  editBlog,
  onClose,
}: {
  editBlog?: AdminBlog
  onClose: () => void
}) {
  const createMutation = useCreateBlog()
  const updateMutation = useUpdateBlog()
  const isPending = createMutation.isPending || updateMutation.isPending

  const existingBlocks: UIAdminBlock[] = (editBlog?.blocks ?? []).map((b) => ({
    id: b.id,
    type: b.type,
    textContent: b.textContent ?? '',
    imageUrl: b.imageUrl ?? '',
  }))

  const [title, setTitle] = useState(editBlog?.title ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState(editBlog?.thumbnailUrl ?? '')
  const [tagsInput, setTagsInput] = useState((editBlog?.tags ?? []).join(', '))
  const [blocks, setBlocks] = useState<UIAdminBlock[]>(existingBlocks)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const blockPayloads: AdminBlockPayload[] = blocks.map((b, i) => ({
      order: i,
      type: b.type,
      text_content: b.type === 'text' ? b.textContent : undefined,
      image_url: b.type === 'image' ? b.imageUrl : undefined,
    }))
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    const dto: CreateBlogDto = {
      title: title.trim(),
      blocks: blockPayloads,
      tags: tags.length ? tags : undefined,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
    }
    if (editBlog) {
      await updateMutation.mutateAsync({ id: editBlog.id, dto })
    } else {
      await createMutation.mutateAsync(dto)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(47,49,46,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" style={{ border: '1px solid #E2E8DE' }}>
        <div className="px-8 py-6 border-b border-[#E2E8DE] bg-[#F9FAF7] flex justify-between items-center">
          <h2 className="text-2xl font-extrabold" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
            {editBlog ? 'Edit Post' : 'Compose New Post'}
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#E2E8DE] transition-colors" style={{ color: '#737970' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Post Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl text-lg font-bold outline-none border border-[#c3c8bf] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888]"
              placeholder="Enter a compelling title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Thumbnail URL</label>
              <input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5]"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Tags (comma-separated)</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5]"
                placeholder="protein, nutrition, ..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Content Blocks</label>
            <AdminBlockEditor blocks={blocks} onChange={setBlocks} />
          </div>

          <div className="flex justify-end gap-4 pt-2">
            <button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl text-sm font-bold" style={{ color: '#737970' }}>
              Discard
            </button>
            <button type="submit" disabled={isPending} className="px-10 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-green-100" style={{ backgroundColor: '#4a6549' }}>
              {isPending ? 'Saving...' : editBlog ? 'Save Changes' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BlogManagementPage() {
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [editBlog, setEditBlog] = useState<AdminBlog | undefined>()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [batchRejectOpen, setBatchRejectOpen] = useState(false)
  const [batchRejectReason, setBatchRejectReason] = useState('')

  const { data, isLoading } = useAdminBlogs(page, status === 'all' ? undefined : status)
  const approveMutation = useApproveBlog()
  const rejectMutation = useRejectBlog()
  const deleteMutation = useDeleteBlog()
  const batchApproveMutation = useBatchApproveBlog()
  const batchRejectMutation = useBatchRejectBlog()

  const blogs: AdminBlog[] = (data as any)?.items ?? (data as any)?.blogs ?? []
  const total = (data as any)?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  const handleReject = async () => {
    if (!rejectTarget) return
    await rejectMutation.mutateAsync({ id: rejectTarget, reason: rejectReason || undefined })
    setRejectTarget(null)
    setRejectReason('')
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === blogs.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(blogs.map((b) => b.id)))
    }
  }

  const handleBatchApprove = async () => {
    await batchApproveMutation.mutateAsync(Array.from(selected))
    setSelected(new Set())
  }

  const handleBatchReject = async () => {
    await batchRejectMutation.mutateAsync({ ids: Array.from(selected), reason: batchRejectReason || undefined })
    setSelected(new Set())
    setBatchRejectOpen(false)
    setBatchRejectReason('')
  }

  const filterTabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Posts' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'draft', label: 'Draft' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
            Blog Management
          </h1>
          <p className="text-base" style={{ color: '#737970' }}>
            Manage your editorial calendar and platform content.
          </p>
        </div>
        <button
          onClick={() => { setEditBlog(undefined); setShowFormModal(true) }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-green-100"
          style={{ backgroundColor: '#8ba888' }}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create New Post
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="bg-white rounded-2xl p-1.5 flex items-center gap-1 w-fit shadow-sm" style={{ border: '1px solid #E2E8DE', backgroundColor: '#f4f4ef' }}>
        {filterTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => { setStatus(t.value); setPage(1); setSelected(new Set()) }}
            className="px-6 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              backgroundColor: status === t.value ? '#fff' : 'transparent',
              color: status === t.value ? '#4a6549' : '#737970',
              boxShadow: status === t.value ? '0 2px 8px rgba(74, 101, 73, 0.08)' : 'none',
              border: 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Batch toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-4 px-6 py-3 rounded-2xl" style={{ background: '#f0f7ee', border: '1px solid #c9ecc6' }}>
          <span className="text-sm font-bold" style={{ color: '#4a6549' }}>{selected.size} selected</span>
          <button
            onClick={handleBatchApprove}
            disabled={batchApproveMutation.isPending}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
            style={{ backgroundColor: '#4a6549' }}
          >
            ✓ Approve All
          </button>
          <button
            onClick={() => setBatchRejectOpen(true)}
            className="px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ background: '#ffdad6', color: '#93000a' }}
          >
            ✕ Reject All
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs font-bold" style={{ color: '#737970' }}>
            Clear
          </button>
        </div>
      )}

      {/* Select all row */}
      {blogs.length > 0 && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected.size === blogs.length && blogs.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 accent-[#4a6549] cursor-pointer"
          />
          <span className="text-xs font-bold" style={{ color: '#737970' }}>Select all on this page</span>
        </div>
      )}

      {/* Blog Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-sm" style={{ color: '#737970' }}>
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-3xl">motion_photos_on</span>
            Loading articles...
          </div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="py-24 text-center rounded-3xl" style={{ border: '1px solid #E2E8DE', backgroundColor: '#fff', color: '#737970' }}>
          <span className="material-symbols-outlined text-6xl block mb-4" style={{ color: '#c3c8bf' }}>article</span>
          <p className="text-sm font-medium">No blog posts found matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              selected={selected.has(blog.id)}
              onSelect={() => toggleSelect(blog.id)}
              onApprove={() => approveMutation.mutate(blog.id)}
              onReject={() => setRejectTarget(blog.id)}
              onEdit={() => { setEditBlog(blog); setShowFormModal(true) }}
              onDelete={() => deleteMutation.mutate(blog.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-8">
          <p className="text-sm font-medium" style={{ color: '#737970' }}>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </p>
          <div className="flex gap-2">
            <PagBtn disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </PagBtn>
            <PagBtn disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </PagBtn>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showFormModal && (
        <BlogFormModal
          editBlog={editBlog}
          onClose={() => { setShowFormModal(false); setEditBlog(undefined) }}
        />
      )}

      {/* Single Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(47,49,46,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl" style={{ border: '1px solid #E2E8DE' }}>
            <h3 className="text-2xl font-extrabold mb-2" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
              Decline Submission
            </h3>
            <p className="text-sm mb-6 font-medium" style={{ color: '#737970' }}>
              Provide feedback for the author regarding this decision.
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl text-sm outline-none resize-none mb-6 border border-[#c3c8bf] bg-[#faf9f5] focus:bg-white focus:border-[#ba1a1a]"
              placeholder="Reason for rejection (optional)..."
            />
            <div className="flex gap-4 justify-end">
              <button onClick={() => { setRejectTarget(null); setRejectReason('') }} className="px-6 py-2 rounded-xl text-sm font-bold" style={{ color: '#737970' }}>
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectMutation.isPending}
                className="px-8 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
                style={{ backgroundColor: '#ba1a1a' }}
              >
                {rejectMutation.isPending ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Reject Modal */}
      {batchRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(47,49,46,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl" style={{ border: '1px solid #E2E8DE' }}>
            <h3 className="text-2xl font-extrabold mb-2" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
              Reject {selected.size} Post{selected.size > 1 ? 's' : ''}
            </h3>
            <textarea
              rows={4}
              value={batchRejectReason}
              onChange={(e) => setBatchRejectReason(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl text-sm outline-none resize-none mb-6 border border-[#c3c8bf] bg-[#faf9f5] focus:bg-white focus:border-[#ba1a1a]"
              placeholder="Reason applied to all (optional)..."
            />
            <div className="flex gap-4 justify-end">
              <button onClick={() => setBatchRejectOpen(false)} className="px-6 py-2 rounded-xl text-sm font-bold" style={{ color: '#737970' }}>
                Cancel
              </button>
              <button
                onClick={handleBatchReject}
                disabled={batchRejectMutation.isPending}
                className="px-8 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
                style={{ backgroundColor: '#ba1a1a' }}
              >
                {batchRejectMutation.isPending ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BlogCard({
  blog,
  selected,
  onSelect,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: {
  blog: AdminBlog
  selected: boolean
  onSelect: () => void
  onApprove: () => void
  onReject: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const statusStyle = STATUS_STYLES[blog.status] ?? STATUS_STYLES.draft
  const canApprove = blog.status !== 'approved'
  const canReject = blog.status !== 'rejected'

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden flex flex-col transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1"
      style={{ border: selected ? '2px solid #4a6549' : '1px solid #E2E8DE' }}
    >
      {/* Thumbnail */}
      <div className="h-48 relative overflow-hidden" style={{ backgroundColor: '#efeeea' }}>
        {blog.thumbnailUrl ? (
          <img
            src={blog.thumbnailUrl}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <span className="material-symbols-outlined text-6xl" style={{ color: '#1a1c1a' }}>article</span>
          </div>
        )}
        {/* Checkbox */}
        <div className="absolute top-3 left-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 accent-[#4a6549] cursor-pointer"
          />
        </div>
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-40">
          {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <h3 className="font-extrabold text-lg mb-2 line-clamp-2 leading-tight group-hover:text-[#4a6549] transition-colors" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
          {blog.title}
        </h3>
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {blog.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#e8f5e4', color: '#4a6549' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        {blog.rejectionReason && (
          <p className="text-xs mb-3 p-2 rounded-lg" style={{ background: '#fff1f0', color: '#93000a' }}>
            ⚠️ {blog.rejectionReason}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-3 text-xs mb-4" style={{ color: '#737970' }}>
          <span>❤️ {blog.likesCount ?? 0}</span>
          <span>👁 {blog.viewCount ?? 0}</span>
          <span>💬 {blog.commentCount ?? 0}</span>
        </div>

        {/* Author + Actions */}
        <div className="mt-auto pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(226,232,222,0.6)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#c9ecc6] flex items-center justify-center text-[10px] font-bold text-[#243d24]">
              {(blog.author?.displayName || 'A').charAt(0)}
            </div>
            <span className="text-xs font-bold" style={{ color: '#434841' }}>
              {blog.author?.displayName ?? 'VitalAI Editor'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {canApprove && (
              <button onClick={onApprove} className="p-1.5 rounded-xl transition-all hover:bg-[#c9ecc6] text-[#4a6549]" title="Approve">
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </button>
            )}
            {canReject && (
              <button onClick={onReject} className="p-1.5 rounded-xl transition-all hover:bg-[#ffdad6] text-[#ba1a1a]" title="Reject">
                <span className="material-symbols-outlined text-lg">cancel</span>
              </button>
            )}
            <button onClick={onEdit} className="p-1.5 rounded-xl transition-all hover:bg-[#e8f5e4] text-[#4a6549]" title="Edit">
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-xl transition-all hover:bg-[#ffdad6] text-[#ba1a1a]" title="Delete">
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PagBtn({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-10 h-10 flex items-center justify-center rounded-xl text-sm transition-all border border-[#c3c8bf] bg-white text-[#434841] hover:bg-[#faf9f5] disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}
