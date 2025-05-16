import { Depot } from '@/types/depot';
import { create } from 'zustand';

interface DepotStore {
	selectedDepot: Depot | null;
	setSelectedDepot: (depot: Depot | null) => void;
}

export const useDepotStore = create<DepotStore>((set) => ({
	selectedDepot: null,
	setSelectedDepot: (depot) => set({ selectedDepot: depot }),
}));
