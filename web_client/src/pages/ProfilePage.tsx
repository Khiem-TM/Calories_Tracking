import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { updateHealthProfile, uploadAvatar, updateProfile } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { queryKeys } from '@/utils/queryKeys'
import type { ActivityLevel } from '@/types'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001'

const healthSchema = z.object({
  heightCm: z.coerce.number().min(100).max(250).optional(),
  initialWeightKg: z.coerce.number().min(30).max(300).optional(),
  activityLevel: z.string().optional(),
  weightGoalKg: z.coerce.number().min(30).max(300).optional(),
  waterGoalMl: z.coerce.number().min(500).max(5000).optional(),
  caloriesGoal: z.coerce.number().min(1000).max(10000).optional(),
})

const nameSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
})

type TabId = 'settings' | 'goals'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const healthProfile = useUserStore((s) => s.healthProfile)
  const setHealthProfile = useUserStore((s) => s.setHealthProfile)
  const { mutate: logout } = useLogout()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingName, setEditingName] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('settings')

  const { register, handleSubmit } = useForm({
    resolver: zodResolver(healthSchema),
    defaultValues: {
      heightCm: healthProfile?.heightCm ?? undefined,
      initialWeightKg: healthProfile?.initialWeightKg ?? undefined,
      activityLevel: healthProfile?.activityLevel ?? 'moderate',
      weightGoalKg: healthProfile?.weightGoalKg ?? undefined,
      waterGoalMl: healthProfile?.waterGoalMl ?? 2000,
      caloriesGoal: healthProfile?.caloriesGoal ?? 2000,
    },
  })

  const {
    register: registerName,
    handleSubmit: handleNameSubmit,
    reset: resetName,
    formState: { errors: nameErrors },
  } = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { display_name: user?.display_name ?? '' },
  })

  const { mutate: saveHealth, isPending: savingHealth } = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateHealthProfile({
        ...data,
        activityLevel: (data.activityLevel as ActivityLevel) ?? undefined,
      }),
    onSuccess: (updated) => {
      setHealthProfile(updated)
      void queryClient.invalidateQueries({ queryKey: queryKeys.healthProfile() })
      toast.success('Profile updated!')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const { mutate: saveName, isPending: savingName } = useMutation({
    mutationFn: (display_name: string) => {
      if (!user?.id) throw new Error('No user')
      return updateProfile(user.id, { display_name })
    },
    onSuccess: (updated) => {
      updateUser({ display_name: updated.display_name })
      setEditingName(false)
      toast.success('Name updated!')
    },
    onError: () => toast.error('Failed to update name'),
  })

  const { mutate: uploadAvatarMutation, isPending: uploadingAvatar } = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: (updated) => {
      updateUser({ avatar_url: updated.avatar_url })
      toast.success('Avatar updated!')
    },
    onError: () => toast.error('Failed to upload avatar'),
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadAvatarMutation(file)
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h1 className="text-2xl font-semibold text-on-surface font-newsreader">Profile</h1>

      {/* Avatar + name — always visible */}
      <div className="bg-surface-lowest rounded-2xl shadow-card p-6 flex items-start gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative h-16 w-16 rounded-full overflow-hidden hover:ring-2 hover:ring-primary transition-all"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url.startsWith("http") ? user.avatar_url : `${BASE_URL}${user.avatar_url}`}
                alt={user.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-primary-container/25 text-primary flex items-center justify-center text-2xl font-bold font-newsreader">
                {user?.display_name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            )}
            <div className="absolute inset-0 bg-on-surface/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
        </div>

        <div className="flex-1 min-w-0">
          {editingName ? (
            <form onSubmit={handleNameSubmit((data) => saveName(data.display_name))} className="flex gap-2">
              <Input
                placeholder="Display name"
                error={nameErrors.display_name?.message}
                className="flex-1"
                autoFocus
                {...registerName('display_name')}
              />
              <Button type="submit" size="sm" loading={savingName}>Save</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setEditingName(false); resetName() }}>
                Cancel
              </Button>
            </form>
          ) : (
            <>
              <p className="font-semibold text-on-surface font-manrope">{user?.display_name}</p>
              <p className="text-sm text-on-surface-variant font-manrope">{user?.email}</p>
              <button onClick={() => setEditingName(true)} className="text-xs text-primary mt-1.5 hover:underline font-manrope">
                Edit name
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-container rounded-full p-1 gap-1 w-fit">
        {(['settings', 'goals'] as TabId[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-5 py-1.5 rounded-full text-sm font-medium font-manrope transition-colors capitalize',
              activeTab === tab
                ? 'bg-surface-lowest text-primary shadow-card'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {tab === 'settings' ? 'Profile Settings' : 'Health Goals'}
          </button>
        ))}
      </div>

      {/* Tab: Profile Settings */}
      {activeTab === 'settings' && (
        <div className="bg-surface-lowest rounded-2xl shadow-card p-6">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Height (cm)" type="number" {...register('heightCm')} />
              <Input label="Current Weight (kg)" type="number" step={0.1} {...register('initialWeightKg')} />
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface font-manrope block mb-1.5">Activity Level</label>
              <select
                {...register('activityLevel')}
                className="w-full rounded-lg ring-1 ring-outline-variant/60 bg-surface-lowest px-3 py-2.5 text-sm text-on-surface font-manrope focus:outline-none focus:ring-2 focus:ring-primary/25"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
            <Button
              type="button"
              loading={savingHealth}
              onClick={() => void handleSubmit((data) => saveHealth(data as Record<string, unknown>))()}
              className="mt-1 w-full"
            >
              Save Changes
            </Button>

            <div className="pt-4 mt-2 border-t border-outline-variant/20">
              <Button variant="danger" className="w-full" onClick={() => logout()}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Health Goals */}
      {activeTab === 'goals' && (
        <div className="bg-surface-lowest rounded-2xl shadow-card p-6">
          <form onSubmit={handleSubmit((data) => saveHealth(data as Record<string, unknown>))} className="flex flex-col gap-4">
            <p className="text-sm text-on-surface-variant font-manrope">
              Adjust your nutrition and fitness targets.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Calorie Goal (kcal)" type="number" {...register('caloriesGoal')} />
              <Input label="Water Goal (ml)" type="number" {...register('waterGoalMl')} />
            </div>
            <Input label="Target Weight (kg)" type="number" step={0.1} {...register('weightGoalKg')} />
            <Button type="submit" loading={savingHealth} className="mt-1 w-full">
              Save Goals
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
