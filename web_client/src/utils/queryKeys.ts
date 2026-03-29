export const queryKeys = {
  dashboard: (date: string) => ['dashboard', date] as const,
  mealLogs: (date: string) => ['mealLogs', date] as const,
  mealSummary: (date: string) => ['mealLogSummary', date] as const,
  foods: (params: { search?: string; page?: number }) => ['foods', params] as const,
  foodFavorites: () => ['foodFavorites'] as const,
  bodyMetricsHistory: (range: { startDate?: string; endDate?: string }) =>
    ['bodyMetrics', 'history', range] as const,
  bodyMetricsLatest: () => ['bodyMetrics', 'latest'] as const,
  activityLog: (date: string) => ['activityLog', date] as const,
  exercises: (filters?: { name?: string; muscleGroup?: string }) =>
    ['training', 'exercises', filters ?? {}] as const,
  workoutHistory: () => ['training', 'history'] as const,
  streaks: () => ['streaks'] as const,
  notifications: (opts?: { unread?: boolean }) => ['notifications', opts ?? {}] as const,
  userMe: () => ['userMe'] as const,
  healthProfile: () => ['healthProfile'] as const,
}
