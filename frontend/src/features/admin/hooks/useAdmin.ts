import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as svc from '../services/adminService'

// ─── Stats ────────────────────────────────────────────────────────────────────
export const useAdminStats = () =>
  useQuery({ queryKey: ['admin', 'stats'], queryFn: svc.getStats })

// ─── Users ────────────────────────────────────────────────────────────────────
export const useAdminUsers = (page: number, search?: string) =>
  useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: () => svc.getUsers(page, 20, search),
  })

export const useAdminUser = (id?: string) =>
  useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => svc.getUserById(id!),
    enabled: !!id,
  })

export const useBanUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: svc.banUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User banned')
    },
    onError: () => toast.error('Failed to ban user'),
  })
}

export const useUnbanUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: svc.unbanUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User unbanned')
    },
    onError: () => toast.error('Failed to unban user'),
  })
}

// ─── Foods ────────────────────────────────────────────────────────────────────
export const useAdminFoods = (page: number, search?: string) =>
  useQuery({
    queryKey: ['admin', 'foods', page, search],
    queryFn: () => svc.getFoods(page, 20, search),
  })

export const useAdminPendingFoods = (page: number) =>
  useQuery({
    queryKey: ['admin', 'foods', 'pending', page],
    queryFn: () => svc.getPendingFoods(page, 20),
  })

export const useCreateFood = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: svc.createFood,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'foods'] })
      toast.success('Food created')
    },
    onError: () => toast.error('Failed to create food'),
  })
}

export const useUpdateFood = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<svc.CreateFoodDto> }) =>
      svc.updateFood(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'foods'] })
      toast.success('Food updated')
    },
    onError: () => toast.error('Failed to update food'),
  })
}

export const useVerifyFood = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: svc.verifyFood,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'foods'] })
      toast.success('Food approved')
    },
    onError: () => toast.error('Failed to approve food'),
  })
}

export const useRejectFood = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: svc.rejectFood,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'foods'] })
      toast.success('Food rejected')
    },
    onError: () => toast.error('Failed to reject food'),
  })
}

export const useDeleteFood = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: svc.deleteFood,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'foods'] })
      toast.success('Food deleted')
    },
    onError: () => toast.error('Failed to delete food'),
  })
}

// ─── Exercises ────────────────────────────────────────────────────────────────
export const useAdminExercises = (page: number, search?: string) =>
  useQuery({
    queryKey: ['admin', 'exercises', page, search],
    queryFn: () => svc.getExercises(page, 20, search),
  })

export const useCreateExercise = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: svc.createExercise,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'exercises'] })
      toast.success('Exercise created')
    },
    onError: () => toast.error('Failed to create exercise'),
  })
}

export const useUpdateExercise = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<svc.CreateExerciseDto> }) =>
      svc.updateExercise(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'exercises'] })
      toast.success('Exercise updated')
    },
    onError: () => toast.error('Failed to update exercise'),
  })
}

export const useDeleteExercise = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: svc.deleteExercise,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'exercises'] })
      toast.success('Exercise deleted')
    },
    onError: () => toast.error('Failed to delete exercise'),
  })
}

// ─── Sport Tips ─────────────────────────────────────────────────────────────
export const useAdminSportTips = (page = 1) => {
  return useQuery({
    queryKey: ['admin', 'sport-tips', page],
    queryFn: () => svc.getSportTips(page),
  })
}

export const useCreateSportTip = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: svc.createSportTip,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'sport-tips'] })
      qc.invalidateQueries({ queryKey: ['admin', 'exercises'] })
      toast.success('Sport tip created')
    },
    onError: () => toast.error('Failed to create sport tip'),
  })
}

// ─── Blogs ────────────────────────────────────────────────────────────────────
export const useAdminBlogs = (page: number, status?: string) =>
  useQuery({
    queryKey: ['admin', 'blogs', page, status],
    queryFn: () => svc.getBlogs(page, 20, status),
  })

export const useApproveBlog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: svc.approveBlog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] })
      toast.success('Blog approved')
    },
    onError: () => toast.error('Failed to approve blog'),
  })
}

export const useRejectBlog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      svc.rejectBlog(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] })
      toast.success('Blog rejected')
    },
    onError: () => toast.error('Failed to reject blog'),
  })
}

export const useDeleteBlog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => svc.deleteBlog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] })
      toast.success('Blog deleted successfully')
    },
    onError: () => toast.error('Failed to delete blog'),
  })
}

export const useCreateBlog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: svc.CreateBlogDto) => svc.createBlog(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] })
      toast.success('Blog created successfully')
    },
    onError: () => toast.error('Failed to create blog'),
  })
}
