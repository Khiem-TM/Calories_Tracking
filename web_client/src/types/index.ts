// ─── Enums / Literal Types ─────────────────────────────────────────────────

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio'
  | 'full_body'

export type TrainingIntensity = 'low' | 'medium' | 'high'

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'

export type GoalType =
  | 'lose_weight'
  | 'gain_muscle'
  | 'improve_endurance'
  | 'maintain'

export type TrainingGoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED'

export type FoodType = 'ingredient' | 'dish' | 'product'

export type DietType =
  | 'standard'
  | 'vegetarian'
  | 'vegan'
  | 'keto'
  | 'paleo'
  | 'mediterranean'
  | 'gluten_free'
  | 'dairy_free'

export type FoodAllergyType =
  | 'gluten'
  | 'dairy'
  | 'eggs'
  | 'fish'
  | 'shellfish'
  | 'tree_nuts'
  | 'peanuts'
  | 'soy'
  | 'sesame'
  | 'pork'
  | 'beef'
  | 'spicy'
  | 'none'

export type UserRole = 'user' | 'admin'

export type Gender = 'male' | 'female' | 'other'

export type StreakType =
  | 'daily_logs'
  | 'daily_training'
  | 'daily_water'
  | 'daily_steps'

export type ProgressPhotoType = 'front' | 'back' | 'side'

// ─── API Response Wrapper ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  data: T
  message?: string
  timestamp?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

// ─── User ──────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  role: UserRole
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HealthProfile {
  id: string
  userId: string
  birthDate: string | null
  gender: Gender | null
  heightCm: number | null
  initialWeightKg: number | null
  activityLevel: ActivityLevel
  dietType: DietType | null
  foodAllergies: FoodAllergyType[]
  weightGoalKg: number | null
  waterGoalMl: number
  caloriesGoal: number
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RegisterDto {
  email: string
  password: string
  display_name: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface UpdateProfileDto {
  display_name?: string
  avatar_url?: string
}

export interface UpdateHealthProfileDto {
  birthDate?: string
  gender?: Gender
  heightCm?: number
  initialWeightKg?: number
  activityLevel?: ActivityLevel
  dietType?: DietType
  foodAllergies?: FoodAllergyType[]
  weightGoalKg?: number
  waterGoalMl?: number
  caloriesGoal?: number
}

// ─── Food ──────────────────────────────────────────────────────────────────

export interface Food {
  id: string
  name: string
  name_en: string | null
  brand: string | null
  category: string | null
  food_type: FoodType
  serving_size_g: number
  serving_unit: string | null
  calories_per_100g: number
  protein_per_100g: number
  fat_per_100g: number
  carbs_per_100g: number
  fiber_per_100g: number
  sugar_per_100g: number | null
  sodium_per_100g: number | null
  cholesterol_per_100g: number | null
  image_urls: string[]
  is_custom: boolean
  is_verified: boolean
}

export interface CreateFoodDto {
  name: string
  name_en?: string
  brand?: string
  category?: string
  food_type?: FoodType
  serving_size_g: number
  serving_unit?: string
  calories_per_100g: number
  protein_per_100g?: number
  fat_per_100g?: number
  carbs_per_100g?: number
  fiber_per_100g?: number
  sugar_per_100g?: number
  sodium_per_100g?: number
  cholesterol_per_100g?: number
  image_urls?: string[]
}

// ─── Meal Log ──────────────────────────────────────────────────────────────

export interface MealLogItem {
  id: string
  meal_log_id: string
  food_id: string
  food: Food
  quantity: number
  serving_unit: string | null
  quantity_in_grams: number
  calories_snapshot: number
  protein_snapshot: number
  fat_snapshot: number
  carbs_snapshot: number
  fiber_snapshot: number | null
  sugar_snapshot: number | null
  sodium_snapshot: number | null
  source: 'manual' | 'ai_scan' | 'barcode' | 'history' | 'favorite'
  created_at: string
}

export interface MealLog {
  id: string
  user_id: string
  log_date: string
  meal_type: MealType
  notes: string | null
  items: MealLogItem[]
  created_at: string
  updated_at: string
}

export interface CreateMealLogDto {
  log_date: string
  meal_type: MealType
  notes?: string
}

export interface CreateMealLogItemDto {
  food_id: string
  quantity: number
  serving_unit?: string
  source?: 'manual' | 'barcode' | 'history' | 'favorite'
}

export interface UpdateMealLogItemDto {
  quantity?: number
  serving_unit?: string
}

export interface MealLogSummary {
  date: string
  total_calories: number
  total_protein: number
  total_fat: number
  total_carbs: number
  total_fiber: number
  meal_breakdown: {
    meal_type: MealType
    calories: number
    items_count: number
  }[]
}

// ─── Body Metrics ──────────────────────────────────────────────────────────

export interface BodyMetric {
  id: string
  userId: string
  recordedDate: string
  weightKg: number | null
  bodyFatPct: number | null
  bmi: number | null
  bmr: number | null
  tdee: number | null
  waistCm: number | null
  hipCm: number | null
  chestCm: number | null
  neckCm: number | null
  notes: string | null
  createdAt: string
}

export interface UpsertBodyMetricDto {
  recordedDate: string
  weightKg?: number
  bodyFatPct?: number
  waistCm?: number
  hipCm?: number
  chestCm?: number
  neckCm?: number
  notes?: string
}

export interface BodyProgressPhoto {
  id: string
  photoUrl: string
  photoType: ProgressPhotoType
  bodyMetricId: string | null
  createdAt: string
}

// ─── Activity Log ──────────────────────────────────────────────────────────

export interface ActivityLog {
  id: string
  userId: string
  logDate: string
  steps: number
  caloriesBurned: number
  activeMinutes: number
  waterMl: number
  exerciseNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface LogStepsDto {
  logDate: string
  steps: number
}

export interface LogWaterDto {
  logDate: string
  waterMl: number
}

export interface LogCaloriesBurnedDto {
  logDate: string
  caloriesBurned: number
}

// ─── Training ──────────────────────────────────────────────────────────────

export interface Exercise {
  id: string
  name: string
  description: string | null
  primaryMuscleGroup: MuscleGroup
  intensity: TrainingIntensity
  metValue: number
  instructions: string | null
  videoUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkoutSession {
  id: string
  userId: string
  exerciseId: string
  exercise: Exercise
  sessionDate: string
  durationMinutes: number
  weightKg: number | null
  sets: number | null
  repsPerSet: number | null
  caloriesBurnedSnapshot: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface LogWorkoutDto {
  exerciseId: string
  sessionDate: string
  durationMinutes: number
  weightKg?: number
  sets?: number
  repsPerSet?: number
  notes?: string
}

export interface TrainingGoal {
  id: string
  userId: string
  goalType: GoalType
  targetValue: number | null
  currentValue: number | null
  startDate: string
  dailyCaloriesGoal: number | null
  proteinG: number | null
  fatG: number | null
  carbsG: number | null
  weeklyRateKg: number | null
  deadline: string | null
  status: TrainingGoalStatus
  createdAt: string
  updatedAt: string
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardNutrition {
  total_calories: number
  total_protein: number
  total_fat: number
  total_carbs: number
  total_fiber: number
  meal_logs: MealLog[]
}

export interface DashboardActivity {
  steps: number
  calories_burned: number
  active_minutes: number
  water_ml: number
}

export interface DashboardBody {
  current_weight: number | null
  bmi: number | null
}

export interface DashboardData {
  date: string
  nutrition: DashboardNutrition
  activity: DashboardActivity
  body: DashboardBody
  streaks: StreakData
  recent_workouts: WorkoutSession[]
}

// ─── Streak ────────────────────────────────────────────────────────────────

export interface StreakData {
  id: string
  userId: string
  streakType: StreakType
  currentCount: number
  lastActivityDate: string | null
  longestStreak: number
}

// ─── Notification ──────────────────────────────────────────────────────────

export interface Notification {
  id: string
  userId: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
}
