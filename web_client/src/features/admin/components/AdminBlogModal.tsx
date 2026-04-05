import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../../components/ui/Modal'
import { createAdminBlog, updateAdminBlog } from '../../../services/adminService'
import type { Blog } from '../../../types/admin'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().optional(),
  thumbnailUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  content: z.string().min(1, 'Content is required'),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  blog?: Blog
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-surface-highest bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'
const labelCls = 'block text-xs font-medium text-on-surface mb-1'
const errorCls = 'text-xs text-error mt-0.5'

export function AdminBlogModal({ open, onClose, blog }: Props) {
  const qc = useQueryClient()
  const isEdit = !!blog

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      if (blog) {
        reset({
          title: blog.title,
          author: blog.author,
          thumbnailUrl: blog.thumbnailUrl ?? '',
          content: blog.content,
        })
      } else {
        reset({ title: '', author: 'Admin', thumbnailUrl: '', content: '' })
      }
    }
  }, [open, blog, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? updateAdminBlog(blog!.id, { ...data, thumbnailUrl: data.thumbnailUrl || undefined })
        : createAdminBlog({ ...data, thumbnailUrl: data.thumbnailUrl || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Post' : 'New Blog Post'} size="xl">
      <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input {...register('title')} className={inputCls} placeholder="Post title" />
          {errors.title && <p className={errorCls}>{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Author</label>
            <input {...register('author')} className={inputCls} placeholder="Author name" />
          </div>
          <div>
            <label className={labelCls}>Thumbnail URL</label>
            <input {...register('thumbnailUrl')} className={inputCls} placeholder="https://…" />
            {errors.thumbnailUrl && <p className={errorCls}>{errors.thumbnailUrl.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>Content * <span className="text-on-surface-variant font-normal">(Markdown supported)</span></label>
          <textarea
            {...register('content')}
            rows={12}
            className={`${inputCls} resize-y font-mono text-xs`}
            placeholder="Write your blog content here…"
          />
          {errors.content && <p className={errorCls}>{errors.content.message}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Post'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
