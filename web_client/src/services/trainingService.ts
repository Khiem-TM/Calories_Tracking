import api from './axios'
import type {
  ApiResponse,
  Exercise,
  LogWorkoutDto,
  MuscleGroup,
  TrainingGoal,
  WorkoutSession,
} from '@/types'

export interface ExerciseQuery {
  name?: string
  muscleGroup?: MuscleGroup
}

export async function getExercises(query?: ExerciseQuery): Promise<Exercise[]> {
  const resp = await api.get<ApiResponse<Exercise[]>>('/training/exercises', { params: query })
  return resp.data.data
}

export async function logWorkout(dto: LogWorkoutDto): Promise<WorkoutSession> {
  const resp = await api.post<ApiResponse<WorkoutSession>>('/training/workout', dto)
  return resp.data.data
}

export async function getWorkoutHistory(limit = 20): Promise<WorkoutSession[]> {
  const resp = await api.get<ApiResponse<WorkoutSession[]>>('/training/history', {
    params: { limit },
  })
  return resp.data.data
}

export async function updateWorkout(
  id: string,
  dto: Partial<LogWorkoutDto>,
): Promise<WorkoutSession> {
  const resp = await api.patch<ApiResponse<WorkoutSession>>(`/training/workout/${id}`, dto)
  return resp.data.data
}

export async function deleteWorkout(id: string): Promise<void> {
  await api.delete(`/training/workout/${id}`)
}

export async function getGoals(): Promise<TrainingGoal[]> {
  const resp = await api.get<ApiResponse<TrainingGoal[]>>('/training/goals')
  return resp.data.data
}

export async function createGoal(dto: Partial<TrainingGoal>): Promise<TrainingGoal> {
  const resp = await api.post<ApiResponse<TrainingGoal>>('/training/goals', dto)
  return resp.data.data
}

export async function updateGoal(
  id: string,
  dto: Partial<TrainingGoal>,
): Promise<TrainingGoal> {
  const resp = await api.patch<ApiResponse<TrainingGoal>>(`/training/goals/${id}`, dto)
  return resp.data.data
}

export async function deleteGoal(id: string): Promise<void> {
  await api.delete(`/training/goals/${id}`)
}
