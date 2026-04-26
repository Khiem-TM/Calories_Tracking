export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  role: 'user' | 'admin'
  isEmailVerified: boolean
  isActive: boolean
  createdAt: string
}

export interface HealthProfile {
  id: string
  userId: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  height?: number
  weight?: number
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
  fitnessGoal?: 'lose_weight' | 'maintain_weight' | 'gain_muscle' | 'improve_fitness'
  calorieGoal?: number
  proteinGoal?: number
  carbsGoal?: number
  fatGoal?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  access_token?: string
  refresh_token?: string
}

export interface Food {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  category?: string
  imageUrl?: string
  isVerified: boolean
  isCustom: boolean
  servingSize?: number
  servingUnit?: string
}

export interface MealLog {
  id: string
  userId: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: string
  notes?: string
  imageUrl?: string
  items: MealLogItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export interface MealLogItem {
  id: string
  mealLogId: string
  food: Food
  quantity: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface DashboardData {
  date: string
  totalCalories: number
  calorieGoal: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  proteinGoal?: number
  carbsGoal?: number
  fatGoal?: number
  meals: MealLog[]
  steps?: number
  stepsGoal?: number
  waterIntake?: number
  waterGoal?: number
  caloriesBurned?: number
}

export interface WeeklyDashboard {
  weekStart: string
  weekEnd: string
  days: DashboardData[]
  avgCalories: number
  totalWorkouts: number
}

export interface BodyMetric {
  id: string
  userId: string
  date: string
  weight?: number
  chest?: number
  waist?: number
  hips?: number
  biceps?: number
  thighs?: number
}

export interface ActivityLog {
  id: string
  userId: string
  date: string
  steps?: number
  caloriesBurned?: number
  waterIntake?: number
}

export interface Exercise {
  id: string
  name: string
  description?: string
  muscleGroup?: string
  equipment?: string
  difficulty?: string
  avatarUrl?: string
  galleryUrls?: string[]
}

export interface WorkoutSession {
  id: string
  userId: string
  date: string
  duration?: number
  notes?: string
  exercises: WorkoutExercise[]
  totalCaloriesBurned?: number
}

export interface WorkoutExercise {
  id: string
  exercise: Exercise
  sets?: number
  reps?: number
  weight?: number
  duration?: number
  notes?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export interface Blog {
  id: string
  title: string
  content: string
  authorId: string
  author?: User
  tags?: string[]
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  likesCount: number
  commentsCount: number
  viewCount: number
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
}

export interface BlogComment {
  id: string
  blogId: string
  userId: string
  user?: User
  text: string
  createdAt: string
}

export interface ChatSession {
  id: string
  userId: string
  createdAt: string
  messages: ChatMessage[]
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface Streak {
  currentStreak: number
  longestStreak: number
  lastActivityDate?: string
}

export interface TrainingTip {
  id: string
  title: string
  content: string
  sportCategory?: string
  muscleGroup?: string
  imageUrl?: string
}
