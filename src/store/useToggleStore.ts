// create a zustand store to toggle simulation settings panel and text settings panel in the right sidebar - both panels can be toggled individually
import { create } from "zustand";

interface ToggleState {
    isRoutePanelOpen: boolean;
    toggleRoutePanel: () => void;
    isInspectorOpen: boolean;
    toggleInspector: () => void;
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
    isRoutePanelOpen: true,
    toggleRoutePanel: () => set((state) => ({ isRoutePanelOpen: !state.isRoutePanelOpen })),
    isInspectorOpen: true,
    toggleInspector: () => set((state) => ({ isInspectorOpen: !state.isInspectorOpen })),
    isSimulationSettingsPanelOpen: true,
    isTextSettingsPanelOpen: true,
    isRouteSettingsPanelOpen: true,
    toggleSimulationSettingsPanel: () => set((state) => ({ isSimulationSettingsPanelOpen: !state.isSimulationSettingsPanelOpen })),
    toggleTextSettingsPanel: () => set((state) => ({ isTextSettingsPanelOpen: !state.isTextSettingsPanelOpen })),
    toggleRouteSettingsPanel: () => set((state) => ({ isRouteSettingsPanelOpen: !state.isRouteSettingsPanelOpen })),
    showSidebar: true,
    toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
}));

export default useToggleStore;