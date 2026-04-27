import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminAuthState {
  accessToken: string | null
  isAuthenticated: boolean
  setToken: (token: string) => void
  logout: () => void
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      setToken: (token) => set({ accessToken: token, isAuthenticated: true }),
      logout: () => set({ accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
