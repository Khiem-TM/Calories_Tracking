import { adminApi } from './adminAxios'
import type {
  AdminStats,
  AdminUser,
  AdminFood,
  AdminExercise,
  Blog,
  CreateFoodAdminDto,
  CreateExerciseAdminDto,
  CreateBlogDto,
} from '../types/admin'

interface ApiResponse<T> {
  data: T
  success: boolean
  statusCode: number
}

interface PaginatedUsers {
  users: AdminUser[]
  total: number
  page: number
  limit: number
}
interface PaginatedFoods {
  foods: AdminFood[]
  total: number
  page: number
  limit: number
}
interface PaginatedExercises {
  exercises: AdminExercise[]
  total: number
  page: number
  limit: number
}
interface PaginatedBlogs {
  blogs: Blog[]
  total: number
  page: number
  limit: number
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string): Promise<{ access_token: string }> {
  const res = await adminApi.post<ApiResponse<{ access_token: string }>>('/admin/auth/login', { email, password })
  return res.data.data
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const res = await adminApi.get<ApiResponse<AdminStats>>('/admin/stats')
  return res.data.data
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getAdminUsers(page = 1, limit = 20, search?: string): Promise<PaginatedUsers> {
  const res = await adminApi.get<ApiResponse<PaginatedUsers>>('/admin/users', {
    params: { page, limit, ...(search ? { search } : {}) },
  })
  return res.data.data
}

export async function getAdminUser(id: string): Promise<AdminUser> {
  const res = await adminApi.get<ApiResponse<AdminUser>>(`/admin/users/${id}`)
  return res.data.data
}

export async function banUser(id: string): Promise<AdminUser> {
  const res = await adminApi.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/ban`)
  return res.data.data
}

export async function unbanUser(id: string): Promise<AdminUser> {
  const res = await adminApi.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/unban`)
  return res.data.data
}

// ─── Foods ───────────────────────────────────────────────────────────────────

export async function getAdminFoods(page = 1, limit = 20, search?: string): Promise<PaginatedFoods> {
  const res = await adminApi.get<ApiResponse<PaginatedFoods>>('/admin/foods', {
    params: { page, limit, ...(search ? { search } : {}) },
  })
  return res.data.data
}

export async function createAdminFood(dto: CreateFoodAdminDto): Promise<AdminFood> {
  const res = await adminApi.post<ApiResponse<AdminFood>>('/admin/foods', dto)
  return res.data.data
}

export async function updateAdminFood(id: string, dto: Partial<CreateFoodAdminDto>): Promise<AdminFood> {
  const res = await adminApi.patch<ApiResponse<AdminFood>>(`/admin/foods/${id}`, dto)
  return res.data.data
}

export async function deleteAdminFood(id: string): Promise<void> {
  await adminApi.delete(`/admin/foods/${id}`)
}

export async function verifyAdminFood(id: string): Promise<AdminFood> {
  const res = await adminApi.patch<ApiResponse<AdminFood>>(`/admin/foods/${id}/verify`)
  return res.data.data
}

export async function rejectAdminFood(id: string): Promise<void> {
  await adminApi.patch(`/admin/foods/${id}/reject`)
}

// ─── Exercises ───────────────────────────────────────────────────────────────

export async function getAdminExercises(page = 1, limit = 20, search?: string): Promise<PaginatedExercises> {
  const res = await adminApi.get<ApiResponse<PaginatedExercises>>('/admin/exercises', {
    params: { page, limit, ...(search ? { search } : {}) },
  })
  return res.data.data
}

export async function createAdminExercise(dto: CreateExerciseAdminDto): Promise<AdminExercise> {
  const res = await adminApi.post<ApiResponse<AdminExercise>>('/admin/exercises', dto)
  return res.data.data
}

export async function updateAdminExercise(id: string, dto: Partial<CreateExerciseAdminDto>): Promise<AdminExercise> {
  const res = await adminApi.patch<ApiResponse<AdminExercise>>(`/admin/exercises/${id}`, dto)
  return res.data.data
}

export async function deleteAdminExercise(id: string): Promise<void> {
  await adminApi.delete(`/admin/exercises/${id}`)
}

// ─── Blogs ───────────────────────────────────────────────────────────────────

export async function getAdminBlogs(page = 1, limit = 20): Promise<PaginatedBlogs> {
  const res = await adminApi.get<ApiResponse<PaginatedBlogs>>('/admin/blogs', {
    params: { page, limit },
  })
  return res.data.data
}

export async function createAdminBlog(dto: CreateBlogDto): Promise<Blog> {
  const res = await adminApi.post<ApiResponse<Blog>>('/admin/blogs', dto)
  return res.data.data
}

export async function updateAdminBlog(id: string, dto: Partial<CreateBlogDto>): Promise<Blog> {
  const res = await adminApi.patch<ApiResponse<Blog>>(`/admin/blogs/${id}`, dto)
  return res.data.data
}

export async function deleteAdminBlog(id: string): Promise<void> {
  await adminApi.delete(`/admin/blogs/${id}`)
}
