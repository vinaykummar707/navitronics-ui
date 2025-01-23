import { create } from 'zustand';
import { Area } from '../types/area';

interface AreaStore {
  selectedArea: Area | null;
  setSelectedArea: (area: Area | null) => void;
}

export const useAreaStore = create<AreaStore>((set) => ({
  selectedArea: null,
  setSelectedArea: (area) => set({ selectedArea: area }),
}));
