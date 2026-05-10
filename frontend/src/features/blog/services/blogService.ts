import { api } from '@/lib/axios'

export interface BlockPayload {
  order: number
  type: 'text' | 'image'
  text_content?: string
  image_base64?: string
}

export interface CreateBlogPayload {
  title: string
  thumbnailBase64?: string
  tags?: string[]
  status?: 'draft'
  blocks?: BlockPayload[]
}

export const blogService = {
  list: (params?: { page?: number; limit?: number; search?: string; tag?: string }) =>
    api.get('/blogs', { params }),

  getTags: () => api.get<string[]>('/blogs/tags'),

  getById: (id: string) => api.get(`/blogs/${id}`),

  like: (id: string) => api.post<{ liked: boolean }>(`/blogs/${id}/like`),

  checkLiked: (id: string) => api.get<{ liked: boolean }>(`/blogs/${id}/liked`),

  getComments: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/blogs/${id}/comments`, { params }),

  addComment: (id: string, content: string) =>
    api.post(`/blogs/${id}/comments`, { content }),

  deleteComment: (blogId: string, commentId: string) =>
    api.delete(`/blogs/${blogId}/comments/${commentId}`),

  getMyBlogs: (params?: { page?: number; limit?: number }) =>
    api.get('/user/blogs', { params }),

  create: (data: CreateBlogPayload) => api.post('/user/blogs', data),

  update: (id: string, data: Partial<CreateBlogPayload>) =>
    api.patch(`/user/blogs/${id}`, data),

  delete: (id: string) => api.delete(`/user/blogs/${id}`),
}
