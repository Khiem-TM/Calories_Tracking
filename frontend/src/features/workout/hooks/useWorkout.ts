import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { workoutService } from '../services/workoutService'

export function useExercises(muscleGroup?: string, page = 1) {
  return useQuery({
    queryKey: ['exercises', muscleGroup, page],
    queryFn: () => workoutService.getExercises({ page, limit: 20, muscle_group: muscleGroup })
      .then((r) => r.data?.data ?? r.data),
  })
}

export function useWorkoutHistory(limit = 20) {
  return useQuery({
    queryKey: ['workout-history', limit],
    queryFn: () => workoutService.getWorkoutHistory({ limit }).then((r) => r.data?.data ?? r.data),
  })
}

export function useTrainingTips(page = 1) {
  return useQuery({
    queryKey: ['training-tips', page],
    queryFn: () => workoutService.getTips({ page, limit: 12 }).then((r) => r.data?.data ?? r.data),
  })
}

export function useLogWorkout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: workoutService.logWorkout,
    onSuccess: () => {
      toast.success('Workout logged!')
      qc.invalidateQueries({ queryKey: ['workout-history'] })
    },
    onError: () => toast.error('Failed to log workout'),
  })
}

export function useDeleteWorkout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: workoutService.deleteWorkout,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout-history'] }),
    onError: () => toast.error('Failed to delete workout'),
  })
}

export function useTrainingGoals() {
  return useQuery({
    queryKey: ['training-goals'],
    queryFn: () => workoutService.getGoals().then((r) => r.data?.data ?? r.data),
  })
}
