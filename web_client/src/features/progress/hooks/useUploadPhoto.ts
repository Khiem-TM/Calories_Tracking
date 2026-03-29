import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadPhoto, deletePhoto } from '@/services/bodyMetricService'
import { toast } from '@/components/ui/Toast'
import { progressPhotosKey } from './useProgressPhotos'

export function useUploadPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => uploadPhoto(formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: progressPhotosKey() })
      toast.success('Photo uploaded!')
    },
    onError: () => toast.error('Failed to upload photo'),
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePhoto(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: progressPhotosKey() })
    },
    onError: () => toast.error('Failed to delete photo'),
  })
}
