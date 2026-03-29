import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logWorkout } from '@/services/trainingService'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/utils/queryKeys'
import { toast } from '@/components/ui/Toast'
import type { LogWorkoutDto } from '@/types'

export function useLogWorkout() {
  const queryClient = useQueryClient()
  const date = useUIStore((s) => s.selectedDate)
  const closeModal = useUIStore((s) => s.closeModal)

  return useMutation({
    mutationFn: (dto: LogWorkoutDto) => logWorkout(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workoutHistory() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(date) })
      closeModal()
      toast.success('Workout logged!')
    },
    onError: () => {
      toast.error('Failed to log workout')
    },
  })
}
