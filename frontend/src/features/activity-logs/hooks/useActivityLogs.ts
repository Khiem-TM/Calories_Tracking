import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { activityLogsService } from '../services/activityLogsService'

export function useActivityLogs(date?: string) {
  return useQuery({
    queryKey: ['activity-logs', date],
    queryFn: () => activityLogsService.getByDate(date).then((r) => r.data?.data ?? r.data),
  })
}

export function useLogWater() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { date?: string; glasses: number }) =>
      activityLogsService.logWater(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activity-logs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => toast.error('Không thể cập nhật nước uống'),
  })
}

export function useLogSteps() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { date?: string; steps: number }) =>
      activityLogsService.logSteps(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activity-logs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => toast.error('Không thể cập nhật bước chân'),
  })
}

export function useLogCaloriesBurned() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { date?: string; caloriesBurned: number }) =>
      activityLogsService.logCaloriesBurned(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activity-logs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => toast.error('Không thể cập nhật calories đốt'),
  })
}
