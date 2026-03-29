import { useQuery } from '@tanstack/react-query'
import { getGoals } from '@/services/trainingService'

export const trainingGoalsKey = () => ['training', 'goals'] as const

export function useTrainingGoals() {
  return useQuery({
    queryKey: trainingGoalsKey(),
    queryFn: getGoals,
    staleTime: 60_000,
  })
}
