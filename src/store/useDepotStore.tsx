import { IDepot } from "@/types/IDepot";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DepotStore {
  selectedDepot: IDepot | null;
  setSelectedDepot: (depot: IDepot | null) => void;
}

export const useDepotStore = create<DepotStore>()(
  persist(
    (set) => ({
      selectedDepot: null,
      setSelectedDepot: (depot) => set({ selectedDepot: depot }),
    }),
    {
      name: "depot-storage",
      partialize: (state) => ({ selectedDepot: state.selectedDepot }),
    },
  ),
);
