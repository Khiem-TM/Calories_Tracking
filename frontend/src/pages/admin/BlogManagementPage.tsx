import { useState } from 'react'
import {
  useAdminBlogs,
  useApproveBlog,
  useRejectBlog,
  useDeleteBlog,
  useCreateBlog,
} from '@/features/admin/hooks/useAdmin'
import type { AdminBlog, CreateBlogDto } from '@/features/admin/services/adminService'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'draft'

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: '#fff3cd', color: '#856404', label: 'Pending Review' },
  approved: { bg: '#ccebc7', color: '#243d24', label: 'Approved' },
  rejected: { bg: '#ffdad6', color: '#93000a', label: 'Rejected' },
  draft: { bg: '#e3e3de', color: '#434841', label: 'Draft' },
}

const EMPTY_BLOG: CreateBlogDto = {
  title: '',
  content: '',
  author: 'Admin',
  thumbnailUrl: '',
  tags: [],
}

export default function BlogManagementPage() {
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [blogForm, setBlogForm] = useState<CreateBlogDto>(EMPTY_BLOG)

  const { data, isLoading } = useAdminBlogs(page, status === 'all' ? undefined : status)
  const approveMutation = useApproveBlog()
  const rejectMutation = useRejectBlog()
  const deleteMutation = useDeleteBlog()
  const createMutation = useCreateBlog()

  const blogs: AdminBlog[] = data?.blogs ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  const handleReject = async () => {
    if (!rejectTarget) return
    await rejectMutation.mutateAsync({ id: rejectTarget, reason: rejectReason || undefined })
    setRejectTarget(null)
    setRejectReason('')
  }

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMutation.mutateAsync(blogForm)
    setShowCreateModal(false)
    setBlogForm(EMPTY_BLOG)
  }

  const filterTabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Posts' },
    { value: 'pending', label: 'Pending' },
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
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-green-100"
          style={{ backgroundColor: '#8ba888' }}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create New Post
        </button>
      </div>

      {/* Status filter tabs */}
      <div
        className="bg-white rounded-2xl p-1.5 flex items-center gap-1 w-fit shadow-sm"
        style={{ border: '1px solid #E2E8DE', backgroundColor: '#f4f4ef' }}
      >
        {filterTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => { setStatus(t.value); setPage(1) }}
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

      {/* Blog Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-sm" style={{ color: '#737970' }}>
           <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-3xl">motion_photos_on</span>
              Loading articles...
            </div>
        </div>
      ) : blogs.length === 0 ? (
        <div
          className="py-24 text-center rounded-3xl"
          style={{ border: '1px solid #E2E8DE', backgroundColor: '#fff', color: '#737970' }}
        >
          <span className="material-symbols-outlined text-6xl block mb-4" style={{ color: '#c3c8bf' }}>article</span>
          <p className="text-sm font-medium">No blog posts found matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onApprove={() => approveMutation.mutate(blog.id)}
              onReject={() => setRejectTarget(blog.id)}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(47,49,46,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            style={{ border: '1px solid #E2E8DE' }}
          >
            <div className="px-8 py-6 border-b border-[#E2E8DE] bg-[#F9FAF7] flex justify-between items-center">
              <h2 className="text-2xl font-extrabold" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
                Compose New Post
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#E2E8DE] transition-colors"
                style={{ color: '#737970' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateBlog} className="p-10 space-y-8 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Post Title *</label>
                <input
                  required
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl text-lg font-bold outline-none border border-[#c3c8bf] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888]"
                  placeholder="Enter a compelling title..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Author Display Name</label>
                  <input
                    value={blogForm.author}
                    onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5]"
                    placeholder="e.g. Admin or Dr. Vita"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Thumbnail Image URL</label>
                  <input
                    value={blogForm.thumbnailUrl}
                    onChange={(e) => setBlogForm({ ...blogForm, thumbnailUrl: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5]"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Content Body (HTML or Markdown) *</label>
                <textarea
                  required
                  rows={8}
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888] resize-none"
                  placeholder="Write your article content here..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-8 py-3 rounded-2xl text-sm font-bold transition-all" style={{ color: '#737970' }}>
                  Discard
                </button>
                <button type="submit" disabled={createMutation.isPending} className="px-10 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-green-100" style={{ backgroundColor: '#4a6549' }}>
                  {createMutation.isPending ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(47,49,46,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl"
            style={{ border: '1px solid #E2E8DE' }}
          >
            <h3 className="text-2xl font-extrabold mb-2" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
              Decline Submission
            </h3>
            <p className="text-sm mb-6 font-medium" style={{ color: '#737970' }}>
              Please provide feedback for the author regarding this decision.
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl text-sm outline-none resize-none mb-6 border border-[#c3c8bf] bg-[#faf9f5] focus:bg-white focus:border-[#ba1a1a]"
              placeholder="Internal notes or reason for rejection..."
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => { setRejectTarget(null); setRejectReason('') }}
                className="px-6 py-2 rounded-xl text-sm font-bold"
                style={{ color: '#737970' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectMutation.isPending}
                className="px-8 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-red-100"
                style={{ backgroundColor: '#ba1a1a' }}
              >
                {rejectMutation.isPending ? 'Processing...' : 'Confirm Rejection'}
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
  onApprove,
  onReject,
  onDelete,
}: {
  blog: AdminBlog
  onApprove: () => void
  onReject: () => void
  onDelete: () => void
}) {
  const statusStyle = STATUS_STYLES[blog.status] ?? STATUS_STYLES.draft
  const isPending = blog.status === 'pending'

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden flex flex-col transition-all duration-500 group shadow-sm hover:shadow-xl hover:-translate-y-1"
      style={{ border: '1px solid #E2E8DE' }}
    >
      {/* Thumbnail */}
      <div className="h-56 relative overflow-hidden" style={{ backgroundColor: '#efeeea' }}>
        {blog.thumbnail_url ? (
          <img
            src={blog.thumbnail_url}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <span className="material-symbols-outlined text-6xl" style={{ color: '#1a1c1a' }}>article</span>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <span
            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
          >
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-40">
          {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <h3
          className="font-extrabold text-xl mb-3 line-clamp-2 leading-tight group-hover:text-[#4a6549] transition-colors"
          style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}
        >
          {blog.title}
        </h3>
        
        {/* Author + Actions */}
        <div
          className="mt-auto pt-6 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(226,232,222,0.4)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#c9ecc6] flex items-center justify-center text-[10px] font-bold text-[#243d24]">
              { (blog.author?.display_name || 'A').charAt(0) }
            </div>
            <span className="text-xs font-bold" style={{ color: '#434841' }}>
              {blog.author?.display_name ?? 'Vitaflow Editor'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {isPending && (
              <button
                onClick={onApprove}
                className="p-2 rounded-xl transition-all hover:bg-[#c9ecc6] text-[#4a6549]"
                title="Approve"
              >
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </button>
            )}
            {isPending && (
              <button
                onClick={onReject}
                className="p-2 rounded-xl transition-all hover:bg-[#ffdad6] text-[#ba1a1a]"
                title="Reject"
              >
                <span className="material-symbols-outlined text-xl">cancel</span>
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-2 rounded-xl transition-all hover:bg-[#ffdad6] text-[#ba1a1a]"
              title="Delete"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
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
