import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { blogService } from '../services/blogService'
import type { CreateBlogPayload } from '../services/blogService'
import { useAuthStore } from '@/stores/authStore'
import type { Blog, BlogComment, PaginatedResponse } from '@/types/api'

const unwrap = <T>(res: { data: { data?: T } & T }): T =>
  (res.data as any).data ?? res.data

// ─── Public queries ───────────────────────────────────────────────────────────

export function usePublicBlogs(params?: {
  page?: number
  limit?: number
  search?: string
  tag?: string
}) {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => blogService.list(params).then(unwrap<PaginatedResponse<Blog>>),
  })
}

export function useBlogTags() {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: () => blogService.getTags().then(unwrap<string[]>),
    staleTime: 10 * 60 * 1000,
  })
}

export function useBlogDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: () => blogService.getById(id!).then(unwrap<Blog>),
    enabled: !!id,
  })
}

export function useBlogComments(blogId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ['blog-comments', blogId, page],
    queryFn: () =>
      blogService.getComments(blogId!, { page, limit: 20 }).then(unwrap<PaginatedResponse<BlogComment>>),
    enabled: !!blogId,
  })
}

export function useCheckLiked(blogId: string | undefined) {
  const token = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['blog-liked', blogId],
    queryFn: () => blogService.checkLiked(blogId!).then(unwrap<{ liked: boolean }>),
    enabled: !!blogId && !!token,
  })
}

// ─── Auth mutations ───────────────────────────────────────────────────────────

export function useToggleLike() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (blogId: string) => blogService.like(blogId).then(unwrap<{ liked: boolean }>),
    onSuccess: (result, blogId) => {
      qc.setQueryData(['blog-liked', blogId], result)
      qc.invalidateQueries({ queryKey: ['blog', blogId] })
      qc.invalidateQueries({ queryKey: ['blogs'] })
    },
  })
}

export function useAddComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blogId, content }: { blogId: string; content: string }) =>
      blogService.addComment(blogId, content).then(unwrap<BlogComment>),
    onSuccess: (_, { blogId }) => {
      qc.invalidateQueries({ queryKey: ['blog-comments', blogId] })
      qc.invalidateQueries({ queryKey: ['blog', blogId] })
    },
    onError: () => toast.error('Không thể gửi bình luận'),
  })
}

export function useDeleteComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blogId, commentId }: { blogId: string; commentId: string }) =>
      blogService.deleteComment(blogId, commentId),
    onSuccess: (_, { blogId }) => {
      qc.invalidateQueries({ queryKey: ['blog-comments', blogId] })
      qc.invalidateQueries({ queryKey: ['blog', blogId] })
    },
    onError: () => toast.error('Không thể xóa bình luận'),
  })
}

// ─── My blogs ─────────────────────────────────────────────────────────────────

export function useMyBlogs(page = 1) {
  const token = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['my-blogs', page],
    queryFn: () =>
      blogService.getMyBlogs({ page, limit: 20 }).then(unwrap<PaginatedResponse<Blog>>),
    enabled: !!token,
  })
}

export function useCreateUserBlog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBlogPayload) => blogService.create(data).then(unwrap<Blog>),
    onSuccess: () => {
      toast.success('Bài viết đã được đăng!')
      qc.invalidateQueries({ queryKey: ['my-blogs'] })
      qc.invalidateQueries({ queryKey: ['blogs'] })
    },
    onError: () => toast.error('Lỗi khi đăng bài'),
  })
}

export function useUpdateUserBlog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBlogPayload> }) =>
      blogService.update(id, data).then(unwrap<Blog>),
    onSuccess: (_, { id }) => {
      toast.success('Đã lưu thay đổi')
      qc.invalidateQueries({ queryKey: ['my-blogs'] })
      qc.invalidateQueries({ queryKey: ['blog', id] })
      qc.invalidateQueries({ queryKey: ['blogs'] })
    },
    onError: () => toast.error('Lỗi khi cập nhật bài'),
  })
}

export function useDeleteUserBlog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => blogService.delete(id),
    onSuccess: () => {
      toast.success('Đã xóa bài viết')
      qc.invalidateQueries({ queryKey: ['my-blogs'] })
      qc.invalidateQueries({ queryKey: ['blogs'] })
    },
    onError: () => toast.error('Lỗi khi xóa bài'),
  })
}
