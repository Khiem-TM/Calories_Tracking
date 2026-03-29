import { create } from 'zustand'

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + delta)
  return d.toISOString().split('T')[0]
}

interface UIStoreState {
  selectedDate: string
  sidebarCollapsed: boolean
  activeModal: string | null
  modalData: Record<string, unknown>
  // Actions
  setDate: (date: string) => void
  goToPrevDay: () => void
  goToNextDay: () => void
  toggleSidebar: () => void
  openModal: (name: string, data?: Record<string, unknown>) => void
  closeModal: () => void
}

export const useUIStore = create<UIStoreState>()((set) => ({
  selectedDate: todayISO(),
  sidebarCollapsed: false,
  activeModal: null,
  modalData: {},

  setDate: (date) => set({ selectedDate: date }),

  goToPrevDay: () =>
    set((s) => ({ selectedDate: addDays(s.selectedDate, -1) })),

  goToNextDay: () =>
    set((s) => {
      const next = addDays(s.selectedDate, 1)
      return next <= todayISO() ? { selectedDate: next } : s
    }),

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  openModal: (name, data = {}) => set({ activeModal: name, modalData: data }),

  closeModal: () => set({ activeModal: null, modalData: {} }),
}))
