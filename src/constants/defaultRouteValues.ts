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
} from "@/types/routeConfigV2";

// ---- Fundamental defaults ----
export const DEFAULT_SCROLL_TYPE: ScrollType = "Fixed";
export const DEFAULT_POSITION: Position = "Center";
export const DEFAULT_FONT_WEIGHT: FontWeight = "Regular";
export const DEFAULT_SCROLL_SPEED = 4;
export const DEFAULT_FONT_HEIGHT = 12;
export const DEFAULT_FONT_WIDTH = 12;
export const DEFAULT_SIMULATION_HEIGHT = DEFAULT_SIMULATION_HEIGHTS[1];
export const DEFAULT_SIMULATION_WIDTH = DEFAULT_SIMULATION_WIDTHS[0];
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
export function getDefaultSingleSimulation(text?: string): Simulation {
  return {
    format: "single",
    texts: {
      text: getDefaultTextConfig(text),
    },
    height: DEFAULT_SIMULATION_HEIGHT,
    width: DEFAULT_SIMULATION_WIDTH,
    type: DEFAULT_SIMULATION_TYPE,
  };
}

export function getDefaultTwoSimulation(sideText?: string, text?: string): Simulation {
  return {
    format: "two",
    texts: {
      sideText: getDefaultTextConfig(sideText),
      text: getDefaultTextConfig(text),
    },
    height: DEFAULT_SIMULATION_HEIGHT,
    width: DEFAULT_SIMULATION_WIDTH,
    type: DEFAULT_SIMULATION_TYPE,
  };
}

export function getDefaultThreeSimulation(sideText?: string, upperHalfText?: string, lowerHalfText?: string): Simulation {
  return {
    format: "three",
    texts: {
      sideText: getDefaultTextConfig(sideText),
      upperHalfText: getDefaultTextConfig(upperHalfText),
      lowerHalfText: getDefaultTextConfig(lowerHalfText),
    },
    height: DEFAULT_SIMULATION_HEIGHT,
    width: DEFAULT_SIMULATION_WIDTH,
    type: DEFAULT_SIMULATION_TYPE,
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
};

export const AVAILABLE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "as", label: "Assamese" },
  { code: "bn", label: "Bengali" },
  { code: "gu", label: "Gujarati" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "or", label: "Odia" },
  { code: "pa", label: "Punjabi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "ur", label: "Urdu" },
  { code: "ks", label: "Kashmiri" },
  { code: "kok", label: "Konkani" },
  { code: "mai", label: "Maithili" },
  { code: "mn", label: "Manipuri" },
  { code: "ne", label: "Nepali" },
  { code: "sa", label: "Sanskrit" },
  { code: "sd", label: "Sindhi" },
  { code: "si", label: "Sinhala" },
  { code: "bho", label: "Bhojpuri" },
  { code: "doi", label: "Dogri" },
  { code: "gom", label: "Goan Konkani" },
  { code: "sat", label: "Santali" },
  { code: "mni", label: "Meitei (Manipuri)" },
  { code: "brx", label: "Bodo" },
  { code: "raj", label: "Rajasthani" },
  { code: "chy", label: "Chhattisgarhi" },
];
