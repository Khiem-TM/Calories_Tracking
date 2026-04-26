import { api } from '@/lib/axios'

export const blogService = {
  list: (params?: { page?: number; limit?: number; search?: string; tag?: string }) =>
    api.get('/blogs', { params }),
  getTags: () => api.get('/blogs/tags'),
  getById: (id: string) => api.get(`/blogs/${id}`),
  like: (id: string) => api.post(`/blogs/${id}/like`),
  checkLiked: (id: string) => api.get(`/blogs/${id}/liked`),
  getComments: (id: string) => api.get(`/blogs/${id}/comments`),
  addComment: (id: string, text: string) => api.post(`/blogs/${id}/comments`, { text }),
  deleteComment: (id: string, commentId: string) => api.delete(`/blogs/${id}/comments/${commentId}`),
  // My blogs
  getMyBlogs: (params?: { page?: number; limit?: number }) => api.get('/user/blogs', { params }),
  create: (data: { title: string; content: string; tags?: string[] }) => api.post('/user/blogs', data),
  update: (id: string, data: object) => api.patch(`/user/blogs/${id}`, data),
  delete: (id: string) => api.delete(`/user/blogs/${id}`),
}
