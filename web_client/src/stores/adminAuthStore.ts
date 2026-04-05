import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AdminAuthState {
  adminToken: string | null
  isAdminAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      adminToken: null,
      isAdminAuthenticated: false,

      login: (token) => set({ adminToken: token, isAdminAuthenticated: true }),

      logout: () => set({ adminToken: null, isAdminAuthenticated: false }),
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        adminToken: s.adminToken,
        isAdminAuthenticated: s.isAdminAuthenticated,
      }),
    },
  ),
)
