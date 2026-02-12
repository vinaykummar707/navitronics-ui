import { Stop } from "@/api/stop/types";
import {
  SimulationFormat,
  SimulationType,
  FontWeight,
  ScrollType,
  Position,
  SingleSimulationTexts,
  TwoSimulationTexts,
  ThreeSimulationTexts,
  Simulation,
  StopRouteConfig,
  DisplayConfigPostRequest,
  DEFAULT_SIMULATION_HEIGHTS,
  DEFAULT_SIMULATION_WIDTHS,
  SimulationType,
} from "@/types/routeConfigV2";

// ---- Fundamental defaults ----
export const DEFAULT_SCROLL_TYPE: ScrollType = "Fixed";
export const DEFAULT_POSITION: Position = "Center";
export const DEFAULT_FONT_WEIGHT: FontWeight = "Bold";
export const DEFAULT_SCROLL_SPEED = 9;
export const DEFAULT_FONT_HEIGHT = 14;
export const DEFAULT_FONT_WIDTH = 12;
export const DEFAULT_SIMULATION_HEIGHT = DEFAULT_SIMULATION_HEIGHTS[0];
export const DEFAULT_SIMULATION_WIDTH = DEFAULT_SIMULATION_WIDTHS[3];
export const DEFAULT_SIMULATION_TYPE: SimulationType = "route";

// ---- Default TextConfig generators ----
export function getDefaultTextConfig(
  text: string = "Text"
): Omit<SingleSimulationTexts["text"], "bitmap"> & { bitmap?: string } {
  return {
    text,
    bitmap: "",
    fontWidth: DEFAULT_FONT_WIDTH,
    scrollType: DEFAULT_SCROLL_TYPE,
    position: DEFAULT_POSITION,
    scrollSpeed: DEFAULT_SCROLL_SPEED,
    fontWeight: DEFAULT_FONT_WEIGHT,
    fontHeight: DEFAULT_FONT_HEIGHT,
    language: "en",
  };
}


export const stopStates = ["current", "next", "coming"] as const;



// ---- Default texts per format ----
export const defaultSingleSimulationTexts: SingleSimulationTexts = {
  text: getDefaultTextConfig("Main Text"),
};

export const defaultTwoSimulationTexts: TwoSimulationTexts = {
  sideText: getDefaultTextConfig("Side Text"),
  text: getDefaultTextConfig("Main Text"),
};

export const defaultThreeSimulationTexts: ThreeSimulationTexts = {
  sideText: getDefaultTextConfig("Side Text"),
  upperHalfText: getDefaultTextConfig("Upper Text"),
  lowerHalfText: getDefaultTextConfig("Lower Text"),
};

// ---- Default Simulations per format ----
export function getDefaultSingleSimulation(text?: string, type: SimulationType = DEFAULT_SIMULATION_TYPE): Simulation {
  return {
    format: "single",
    texts: {
      text: getDefaultTextConfig(text),
    },
    height: DEFAULT_SIMULATION_HEIGHT,
    width: DEFAULT_SIMULATION_WIDTH,
    type,
  };
}


// ---- Default Simulations per format ----
export function getDefaultStopSingleSimulation(text?: string, type: SimulationType = DEFAULT_SIMULATION_TYPE, stopType?: typeof stopStates[number], stop?: Stop, language?: string, direction?: string): Simulation {
  return {
    format: "single",
    texts: {
      text: getDefaultTextConfig(text),
    },
    height: DEFAULT_SIMULATION_HEIGHT,
    width: DEFAULT_SIMULATION_WIDTH,
    type,
    audioFileUrl: stop.stop_audios.url,
    stopType,
    latitude: direction === "up" ? stop.up_latitude : stop.down_latitude,
    longitude: direction === "up" ? stop.up_longitude : stop.down_longitude,
    stopTypeAudioFileUrl: AVAILABLE_LANGUAGES.find(lang => lang.code === language)?.current || null,
  };
}

export function getDefaultTwoSimulation(sideText?: string, text?: string, type: SimulationType = DEFAULT_SIMULATION_TYPE): Simulation {
  return {
    format: "two",
    texts: {
      sideText: getDefaultTextConfig(sideText),
      text: getDefaultTextConfig(text),
    },
    height: DEFAULT_SIMULATION_HEIGHT,
    width: DEFAULT_SIMULATION_WIDTH,
    type,
  };
}

export function getDefaultThreeSimulation(sideText?: string, upperHalfText?: string, lowerHalfText?: string, type: SimulationType = DEFAULT_SIMULATION_TYPE): Simulation {
  return {
    format: "three",
    texts: {
      sideText: getDefaultTextConfig(sideText),
      upperHalfText: getDefaultTextConfig(upperHalfText),
      lowerHalfText: getDefaultTextConfig(lowerHalfText),
    },
    height: DEFAULT_SIMULATION_HEIGHT,
    width: DEFAULT_SIMULATION_WIDTH,
    type,
  };
}

// ---- Utility: map for dynamic simulation creation ----
// export const simulationFormatDefaults: Record<SimulationFormat, Simulation> = {
//   single: defaultSingleSimulation,
//   two: defaultTwoSimulation,
//   three: defaultThreeSimulation,
// };

// ---- Default StopRouteConfig ----
export const defaultStopRouteConfig: StopRouteConfig = {
  id: "",
  name: "",
  latitude: 0,
  longitude: 0,
  audioFileUrl: null,
};

// ---- Example overall default DisplayConfigPostRequest ----
export const defaultDisplayConfigPostRequest: DisplayConfigPostRequest = {
  route_number: "123",
  source: "SOURCE",
  destination: "DESTINATION",
  via: "VIA:",
  route_number_1: "",
  route_number_2: "",
  separation: "",
  isSplitRoute: false,
  front: [],
  side: [],
  rear: [],
  internal: [],
  stops: [],
  version: "2.0",
  depot_id: "",
  organization_id: "",
  return: false,
};

export const AVAILABLE_LANGUAGES = [
  {
    code: "en",
    label: "English",
    current: "https://",
    next: "",
    coming: "",
  },
  { code: "hi", label: "Hindi", current: "https://", next: "", coming: "" },
  { code: "as", label: "Assamese", current: "", next: "", coming: "" },
  { code: "bn", label: "Bengali", current: "", next: "", coming: "" },
  { code: "gu", label: "Gujarati", current: "", next: "", coming: "" },
  { code: "kn", label: "Kannada", current: "", next: "", coming: "" },
  { code: "ml", label: "Malayalam", current: "", next: "", coming: "" },
  { code: "mr", label: "Marathi", current: "", next: "", coming: "" },
  { code: "or", label: "Odia", current: "", next: "", coming: "" },
  { code: "pa", label: "Punjabi", current: "", next: "", coming: "" },
  { code: "ta", label: "Tamil", current: "", next: "", coming: "" },
  { code: "te", label: "Telugu", current: "", next: "", coming: "" },
  { code: "ur", label: "Urdu", current: "", next: "", coming: "" },
  { code: "ks", label: "Kashmiri", current: "", next: "", coming: "" },
  { code: "kok", label: "Konkani", current: "", next: "", coming: "" },
  { code: "mai", label: "Maithili", current: "", next: "", coming: "" },
  { code: "mn", label: "Manipuri", current: "", next: "", coming: "" },
  { code: "ne", label: "Nepali", current: "", next: "", coming: "" },
  { code: "sa", label: "Sanskrit", current: "", next: "", coming: "" },
  { code: "sd", label: "Sindhi", current: "", next: "", coming: "" },
  { code: "si", label: "Sinhala", current: "", next: "", coming: "" },
  { code: "bho", label: "Bhojpuri", current: "", next: "", coming: "" },
  { code: "doi", label: "Dogri", current: "", next: "", coming: "" },
  { code: "gom", label: "Goan Konkani", current: "", next: "", coming: "" },
  { code: "sat", label: "Santali", current: "", next: "", coming: "" },
  { code: "mni", label: "Meitei (Manipuri)", current: "", next: "", coming: "" },
  { code: "brx", label: "Bodo", current: "", next: "", coming: "" },
  { code: "raj", label: "Rajasthani", current: "", next: "", coming: "" },
  { code: "chy", label: "Chhattisgarhi", current: "", next: "", coming: "" },
];
