import { create } from 'zustand'
import type { HealthProfile } from '@/types'

interface UserStoreState {
  healthProfile: HealthProfile | null
  isOnboardingComplete: boolean
  setHealthProfile: (profile: HealthProfile | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserStoreState>()((set) => ({
  healthProfile: null,
  isOnboardingComplete: false,

  setHealthProfile: (profile) =>
    set({
      healthProfile: profile,
      isOnboardingComplete: profile !== null,
    }),

  clearUser: () =>
    set({
      healthProfile: null,
      isOnboardingComplete: false,
    }),
}))
