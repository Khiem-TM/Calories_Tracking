import { useQuery } from '@tanstack/react-query'
import { getWorkoutHistory } from '@/services/trainingService'
import { queryKeys } from '@/utils/queryKeys'

export function useWorkoutHistory(limit = 20) {
  return useQuery({
    queryKey: queryKeys.workoutHistory(),
    queryFn: () => getWorkoutHistory(limit),
    staleTime: 30_000,
  })
}
