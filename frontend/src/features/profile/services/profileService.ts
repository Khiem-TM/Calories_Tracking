import { api } from '@/lib/axios'

export const profileService = {
  getMe: () => api.get('/users/me'),
  getHealthProfile: () => api.get('/users/me/health-profile'),
  updateProfile: (id: string, data: { displayName?: string; avatarUrl?: string }) => {
    const body: any = {}
    if (data.displayName) body.display_name = data.displayName
    if (data.avatarUrl) body.avatar_url = data.avatarUrl
    return api.patch(`/users/${id}`, body)
  },
  uploadAvatar: (formData: FormData) =>
    api.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateHealthProfile: (data: object) => api.put('/users/me/health-profile', data),
  getStreaks: () => api.get('/streaks'),
}
