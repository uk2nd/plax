import { create } from 'zustand';

interface GridState {
  isGridVisible: boolean;
  toggle: () => void;
}

export const useGridStore = create<GridState>((set) => ({
  isGridVisible: true,
  toggle: () => set((state) => ({ isGridVisible: !state.isGridVisible })),
}));