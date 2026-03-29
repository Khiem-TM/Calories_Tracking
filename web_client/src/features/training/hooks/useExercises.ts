import { useQuery } from '@tanstack/react-query'
import { getExercises, type ExerciseQuery } from '@/services/trainingService'
import { queryKeys } from '@/utils/queryKeys'

export function useExercises(filters?: ExerciseQuery) {
  return useQuery({
    queryKey: queryKeys.exercises(filters),
    queryFn: () => getExercises(filters),
    staleTime: 10 * 60_000,
  })
}
