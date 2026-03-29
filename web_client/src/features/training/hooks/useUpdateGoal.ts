import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateGoal } from '@/services/trainingService'
import { toast } from '@/components/ui/Toast'
import { trainingGoalsKey } from './useTrainingGoals'
import type { TrainingGoal } from '@/types'

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<TrainingGoal> }) => updateGoal(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trainingGoalsKey() })
    },
    onError: () => toast.error('Failed to update goal'),
  })
}
