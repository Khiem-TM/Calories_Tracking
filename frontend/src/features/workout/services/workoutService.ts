import { api } from '@/lib/axios'

export const workoutService = {
  getExercises: (params?: { page?: number; limit?: number; muscle_group?: string; equipment?: string }) =>
    api.get('/training/exercises', { params }),
  getFavoriteExercises: () => api.get('/training/exercises/favorites'),
  toggleFavoriteExercise: (id: string, isFav: boolean) =>
    isFav ? api.delete(`/training/exercises/${id}/favorite`) : api.post(`/training/exercises/${id}/favorite`),
  getWorkoutHistory: (params?: { limit?: number; fromDate?: string; toDate?: string }) =>
    api.get('/training/sessions', { params }),
  logWorkout: (data: { exercises: object[]; date: string; duration?: number; notes?: string }) =>
    api.post('/training/sessions', data),
  updateWorkout: (id: string, data: object) => api.patch(`/training/sessions/${id}`, data),
  deleteWorkout: (id: string) => api.delete(`/training/sessions/${id}`),
  getTips: (params?: { page?: number; limit?: number; sport_category?: string; muscle_group?: string }) =>
    api.get('/training/tips', { params }),
  getGoals: () => api.get('/training/goals'),
  createGoal: (data: object) => api.post('/training/goals', data),
}
