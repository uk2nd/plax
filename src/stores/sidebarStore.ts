import { create } from 'zustand';

interface SidebarState {
  isSidebarVisible: boolean;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isSidebarVisible: true,
  toggle: () => set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),
}));