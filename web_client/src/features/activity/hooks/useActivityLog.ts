import { useQuery } from '@tanstack/react-query'
import { getActivityLog } from '@/services/activityService'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/utils/queryKeys'

export function useActivityLog() {
  const date = useUIStore((s) => s.selectedDate)
  return useQuery({
    queryKey: queryKeys.activityLog(date),
    queryFn: () => getActivityLog(date),
    staleTime: 30_000,
    retry: false,
  })
}
