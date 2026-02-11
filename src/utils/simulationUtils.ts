import { Screen } from "@/types/routeConfigV2";

//function to return the text based on the screen format
export const getSimulationCardText = (simulation: Screen) => {
    const { format } = simulation;
    switch (format) {
        case 'single':
            return simulation.texts?.text.text || 'Single Screen Simulation';
        case 'two':
            return simulation.texts?.text.text || 'Two Screen Simulation';
        case 'three':
            return simulation.texts?.upperHalfText.text || 'Three Screen Simulation';
        default:
            return 'Route Simulation';
    }
}