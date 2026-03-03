// create a zustand store to toggle simulation settings panel and text settings panel in the right sidebar - both panels can be toggled individually
import { create } from "zustand";

interface ToggleState {
    isSimulationSettingsPanelOpen: boolean;
    isTextSettingsPanelOpen: boolean;
    isRouteSettingsPanelOpen: boolean;
    toggleSimulationSettingsPanel: () => void;
    toggleTextSettingsPanel: () => void;
    toggleRouteSettingsPanel: () => void;
    showSidebar: boolean;
    toggleSidebar: () => void;
}

const useToggleStore = create<ToggleState>((set) => ({
    isSimulationSettingsPanelOpen: true,
    isTextSettingsPanelOpen: true,
    isRouteSettingsPanelOpen: true,
    toggleSimulationSettingsPanel: () => set((state) => ({ isSimulationSettingsPanelOpen: !state.isSimulationSettingsPanelOpen })),
    toggleTextSettingsPanel: () => set((state) => ({ isTextSettingsPanelOpen: !state.isTextSettingsPanelOpen })),
    toggleRouteSettingsPanel: () => set((state) => ({ isRouteSettingsPanelOpen: !state.isRouteSettingsPanelOpen })),
    showSidebar: false,
    toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
}));

export default useToggleStore;