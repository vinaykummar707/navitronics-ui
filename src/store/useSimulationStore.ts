// create a zustand store to manage the state of the selected simulation along with index of the selected simulation in the list of simulations. This store will be used in the SimulationPanel component to display the details of the selected simulation and to switch between different simulations.

import { Screen } from "@/types/routeConfigV2";
import { create } from "zustand";

type SimulationStore = {
  selectedSimulation: Screen | null;
  setSelectedSimulation: (value: Screen | null) => void;
  selectedSimulationIndex: number;
  setSelectedSimulationIndex: (value: number) => void;
  reset: () => void;
};

const useSimulationStore = create<SimulationStore>((set) => ({
  selectedSimulation: null,
  setSelectedSimulation: (value) => set({ selectedSimulation: value }),
  selectedSimulationIndex: 0,
  setSelectedSimulationIndex: (value) =>
    set({ selectedSimulationIndex: value }),
  reset: () => set({ selectedSimulation: null, selectedSimulationIndex: 0 }),
}));

export default useSimulationStore;
