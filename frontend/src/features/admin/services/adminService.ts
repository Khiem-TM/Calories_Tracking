import { adminApi } from '@/lib/adminAxios'

const unwrap = <T>(res: { data: { data?: T } & T }): T =>
  (res.data as any).data ?? res.data

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const adminLogin = async (email: string, password: string): Promise<{ access_token: string }> => {
  const res = await adminApi.post('/admin/auth/login', { email, password })
  return unwrap(res)
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalFoods: number
  pendingFoods: number
  totalBlogs: number
  totalExercises: number
  totalSportTips: number
}

export const getStats = async (): Promise<AdminStats> => {
  const res = await adminApi.get('/admin/stats')
  return unwrap(res)
}

// ─── Users ────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string
  display_name: string
  email: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  avatar_url?: string
}

export interface PaginatedUsers {
  users: AdminUser[]
  total: number
  page: number
  limit: number
}

export const getUsers = async (page = 1, limit = 20, search?: string): Promise<PaginatedUsers> => {
  const res = await adminApi.get('/admin/users', { params: { page, limit, search } })
  return unwrap(res)
}

export interface UserDetail extends AdminUser {
  healthProfile?: {
    gender?: string
    height?: number
    weight?: number
    goal?: string
    activityLevel?: string
  }
  recentWorkouts?: any[]
}

export const getUserById = async (id: string): Promise<UserDetail> => {
  const res = await adminApi.get(`/admin/users/${id}`)
  return unwrap(res)
}

export const banUser = async (id: string): Promise<void> => {
  await adminApi.patch(`/admin/users/${id}/ban`)
}

export const unbanUser = async (id: string): Promise<void> => {
  await adminApi.patch(`/admin/users/${id}/unban`)
}

// ─── Foods ────────────────────────────────────────────────────────────────────
export interface AdminFood {
  id: string
  name: string
  name_en?: string
  brand?: string
  category: string
  food_type: string
  calories_per_100g: number
  protein_per_100g: number
  fat_per_100g: number
  carbs_per_100g: number
  serving_size_g: number
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export interface PaginatedFoods {
  foods: AdminFood[]
  total: number
  page: number
  limit: number
}

export const getFoods = async (page = 1, limit = 20, search?: string): Promise<PaginatedFoods> => {
  const res = await adminApi.get('/admin/foods', { params: { page, limit, search } })
  return unwrap(res)
}

export const getPendingFoods = async (page = 1, limit = 20): Promise<PaginatedFoods> => {
  const res = await adminApi.get('/admin/foods/pending', { params: { page, limit } })
  return unwrap(res)
}

export interface CreateFoodDto {
  name: string
  nameEn?: string
  brand?: string
  category: string
  foodType?: string
  servingSizeG?: number
  caloriesPer100g: number
  proteinPer100g?: number
  fatPer100g?: number
  carbsPer100g?: number
  isVerified?: boolean
}

export const createFood = async (dto: CreateFoodDto): Promise<AdminFood> => {
  const res = await adminApi.post('/admin/foods', dto)
  return unwrap(res)
}

export const updateFood = async (id: string, dto: Partial<CreateFoodDto>): Promise<AdminFood> => {
  const res = await adminApi.patch(`/admin/foods/${id}`, dto)
  return unwrap(res)
}

export const verifyFood = async (id: string): Promise<void> => {
  await adminApi.patch(`/admin/foods/${id}/verify`)
}

export const rejectFood = async (id: string): Promise<void> => {
  await adminApi.patch(`/admin/foods/${id}/reject`)
}

export const deleteFood = async (id: string): Promise<void> => {
  await adminApi.delete(`/admin/foods/${id}`)
}

// ─── Exercises ────────────────────────────────────────────────────────────────
export interface AdminExercise {
  id: string
  name: string
  description?: string
  primaryMuscleGroup: string
  intensity: string
  metValue: number
  instructions?: string
  videoUrl?: string
  createdAt: string
  tips?: AdminSportTip[]
}

export interface AdminSportTip {
  id: string
  title: string
  content: string
  sport_category?: string
  muscle_group?: string
  author: string
  is_published: boolean
  exercise_id?: string
}

export interface PaginatedExercises {
  exercises: AdminExercise[]
  total: number
  page: number
  limit: number
}

export const getExercises = async (page = 1, limit = 20, search?: string): Promise<PaginatedExercises> => {
  const res = await adminApi.get('/admin/exercises', { params: { page, limit, search } })
  return unwrap(res)
}

export interface CreateExerciseDto {
  name: string
  description?: string
  primaryMuscleGroup: string
  intensity: string
  metValue?: number
  instructions?: string
  videoUrl?: string
}

export const createExercise = async (dto: CreateExerciseDto): Promise<AdminExercise> => {
  const res = await adminApi.post('/admin/exercises', dto)
  return unwrap(res)
}

export const updateExercise = async (id: string, dto: Partial<CreateExerciseDto>): Promise<AdminExercise> => {
  const res = await adminApi.patch(`/admin/exercises/${id}`, dto)
  return unwrap(res)
}

export const deleteExercise = async (id: string): Promise<void> => {
  await adminApi.delete(`/admin/exercises/${id}`)
}

// ─── Sport Tips ─────────────────────────────────────────────────────────────
export interface CreateSportTipDto {
  title: string
  content: string
  sport_category?: string
  muscle_group?: string
  exercise_id?: string
  author?: string
}

export const getSportTips = async (page = 1, limit = 20): Promise<{ tips: AdminSportTip[], total: number }> => {
  const res = await adminApi.get('/admin/sport-tips', { params: { page, limit } })
  return unwrap(res)
}

export const createSportTip = async (dto: CreateSportTipDto): Promise<AdminSportTip> => {
  const res = await adminApi.post('/admin/sport-tips', dto)
  return unwrap(res)
}

// ─── Blogs ────────────────────────────────────────────────────────────────────
export interface AdminBlogBlock {
  id: string
  order: number
  type: 'text' | 'image'
  textContent?: string
  imageUrl?: string
}

export interface AdminBlog {
  id: string
  title: string
  status: 'approved' | 'rejected' | 'draft'
  author?: { displayName: string; avatarUrl?: string }
  createdAt: string
  updatedAt: string
  thumbnailUrl?: string
  tags?: string[]
  blocks?: AdminBlogBlock[]
  rejectionReason?: string
  likesCount?: number
  viewCount?: number
  commentCount?: number
}

export interface PaginatedBlogs {
  items: AdminBlog[]
  total: number
  page: number
  limit: number
}

export const getBlogs = async (
  page = 1,
  limit = 20,
  status?: string,
): Promise<PaginatedBlogs> => {
  const res = await adminApi.get('/admin/blogs', { params: { page, limit, status } })
  return unwrap(res)
}

export const getPendingBlogCount = async (): Promise<number> => {
  const res = await adminApi.get('/admin/blogs/pending-count')
  return unwrap(res)
}

export interface AdminBlockPayload {
  order: number
  type: 'text' | 'image'
  text_content?: string
  image_url?: string
}

export interface CreateBlogDto {
  title: string
  blocks?: AdminBlockPayload[]
  thumbnailUrl?: string
  tags?: string[]
}

export const createBlog = async (dto: CreateBlogDto): Promise<AdminBlog> => {
  const res = await adminApi.post('/admin/blogs', dto)
  return unwrap(res)
}

export const updateBlog = async (id: string, dto: Partial<CreateBlogDto>): Promise<AdminBlog> => {
  const res = await adminApi.patch(`/admin/blogs/${id}`, dto)
  return unwrap(res)
}

export const approveBlog = async (id: string): Promise<void> => {
  await adminApi.patch(`/admin/blogs/${id}/approve`)
}

export const rejectBlog = async (id: string, reason?: string): Promise<void> => {
  await adminApi.patch(`/admin/blogs/${id}/reject`, { reason })
}

export const deleteBlog = async (id: string): Promise<void> => {
  await adminApi.delete(`/admin/blogs/${id}`)
}

export const batchApproveBlog = async (ids: string[]): Promise<{ updated: number }> => {
  const res = await adminApi.patch('/admin/blogs/batch-approve', { ids })
  return unwrap(res)
}

export const batchRejectBlog = async (ids: string[], reason?: string): Promise<{ updated: number }> => {
  const res = await adminApi.patch('/admin/blogs/batch-reject', { ids, reason })
  return unwrap(res)
}
