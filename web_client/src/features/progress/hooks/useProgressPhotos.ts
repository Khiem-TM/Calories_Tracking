import { useQuery } from '@tanstack/react-query'
import { getPhotos } from '@/services/bodyMetricService'

export const progressPhotosKey = () => ['bodyMetrics', 'photos'] as const

export function useProgressPhotos(limit = 30) {
  return useQuery({
    queryKey: progressPhotosKey(),
    queryFn: () => getPhotos(limit),
    staleTime: 60_000,
  })
}
