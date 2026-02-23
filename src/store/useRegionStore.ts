import { IRegion } from '@/types/IRegion';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RegionStore {
  selectedRegion: IRegion | null;
  setSelectedRegion: (region:  IRegion | null) => void;
}

export const useRegionStore = create<RegionStore>()(
  persist(
    (set) => ({
      selectedRegion: null,
      setSelectedRegion: (region) => set({ selectedRegion: region }),
    }),
    {
      name: 'region-storage',
      partialize: (state) => ({ selectedRegion: state.selectedRegion }),
    }
  )
);
