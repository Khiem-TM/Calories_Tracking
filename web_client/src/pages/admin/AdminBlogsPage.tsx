import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAdminBlogs, deleteAdminBlog } from '../../services/adminService'
import type { Blog } from '../../types/admin'
import { AdminBlogModal } from '../../features/admin/components/AdminBlogModal'

export default function AdminBlogsPage() {
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editBlog, setEditBlog] = useState<Blog | null>(null)
  const qc = useQueryClient()
  const LIMIT = 20

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'blogs', { page }],
    queryFn: () => getAdminBlogs(page, LIMIT),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminBlog,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'blogs'] }),
  })

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  function openCreate() { setEditBlog(null); setModalOpen(true) }
  function openEdit(blog: Blog) { setEditBlog(blog); setModalOpen(true) }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface font-newsreader">Blog Posts</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">{data?.total ?? 0} posts</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-highest">
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Author</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Thumbnail</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-highest">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div></td></tr>
              ) : data?.blogs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant text-sm">No posts yet. Create your first post!</td></tr>
              ) : (
                data?.blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-on-surface line-clamp-1 max-w-xs">{blog.title}</p>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{blog.author}</td>
                    <td className="px-4 py-3">
                      {blog.thumbnailUrl ? (
                        <img src={blog.thumbnailUrl} alt="" className="w-12 h-8 rounded-lg object-cover" />
                      ) : (
                        <span className="text-on-surface-variant text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(blog)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { if (confirm('Delete this post?')) deleteMutation.mutate(blog.id) }} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-highest">
            <span className="text-xs text-on-surface-variant">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface disabled:opacity-40 transition-colors"><ChevronLeft size={15} /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface disabled:opacity-40 transition-colors"><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>

      <AdminBlogModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditBlog(null) }}
        blog={editBlog ?? undefined}
      />
    </div>
  )
}
