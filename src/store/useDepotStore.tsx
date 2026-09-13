import { IDepot } from "@/types/IDepot";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DepotStore {
  selectedDepot: IDepot | null;
  setSelectedDepot: (depot: IDepot | null) => void;

  // Routes page last selected depot
  routesPageDepot: IDepot | null;
  setRoutesPageDepot: (depot: IDepot | null) => void;
}

export const useDepotStore = create<DepotStore>()(
  persist(
    (set) => ({
      selectedDepot: null,
      setSelectedDepot: (depot) => set({ selectedDepot: depot }),

      routesPageDepot: null,
      setRoutesPageDepot: (depot) =>
        set({ routesPageDepot: depot, selectedDepot: depot }),
    }),
    {
      name: "depot-storage",
      partialize: (state) => ({
        selectedDepot: state.selectedDepot,
        routesPageDepot: state.routesPageDepot,
      }),
    },
  ),
);
