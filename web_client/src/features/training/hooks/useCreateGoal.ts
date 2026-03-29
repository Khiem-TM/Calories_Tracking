import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createGoal } from '@/services/trainingService'
import { toast } from '@/components/ui/Toast'
import { trainingGoalsKey } from './useTrainingGoals'
import type { TrainingGoal } from '@/types'

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: Partial<TrainingGoal>) => createGoal(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trainingGoalsKey() })
      toast.success('Goal created!')
    },
    onError: () => toast.error('Failed to create goal'),
  })
}
