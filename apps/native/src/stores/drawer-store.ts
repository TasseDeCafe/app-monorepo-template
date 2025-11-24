import { create } from 'zustand'

interface DrawerState {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  toggleDrawer: () => void
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
}))
