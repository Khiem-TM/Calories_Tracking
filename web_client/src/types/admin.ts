export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalFoods: number
  pendingFoods: number
  totalBlogs: number
  totalExercises: number
}

export interface AdminUser {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  role: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  healthProfile?: AdminHealthProfile | null
  recentWorkouts?: AdminWorkoutSession[]
}

export interface AdminHealthProfile {
  id: string
  birthDate: string
  gender: string
  heightCm: number
  initialWeightKg: number
  activityLevel: string
  dietType: string
  weightGoalKg: number | null
  waterGoalMl: number
  caloriesGoal: number | null
}

export interface AdminWorkoutSession {
  id: string
  sessionDate: string
  durationMinutes: number
  caloriesBurnedSnapshot: number
  sets: number
  repsPerSet: number
  exercise?: { id: string; name: string; primaryMuscleGroup: string }
}

export interface AdminFood {
  id: string
  name: string
  name_en: string | null
  brand: string | null
  category: string | null
  food_type: string
  serving_size_g: number
  calories_per_100g: number
  protein_per_100g: number
  fat_per_100g: number
  carbs_per_100g: number
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export interface AdminExercise {
  id: string
  name: string
  description: string | null
  primaryMuscleGroup: string
  intensity: string
  metValue: number
  instructions: string | null
  videoUrl: string | null
  createdAt: string
}

export interface Blog {
  id: string
  title: string
  content: string
  author: string
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminPaginatedResponse<T> {
  total: number
  page: number
  limit: number
  users?: T[]
  foods?: T[]
  exercises?: T[]
  blogs?: T[]
}

export interface CreateFoodAdminDto {
  name: string
  nameEn?: string
  brand?: string
  category?: string
  foodType?: 'ingredient' | 'dish' | 'product'
  servingSizeG?: number
  caloriesPer100g: number
  proteinPer100g?: number
  fatPer100g?: number
  carbsPer100g?: number
  isVerified?: boolean
}

export interface CreateExerciseAdminDto {
  name: string
  description?: string
  primaryMuscleGroup: string
  intensity: string
  metValue?: number
  instructions?: string
  videoUrl?: string
}

export interface CreateBlogDto {
  title: string
  content: string
  author?: string
  thumbnailUrl?: string
}
