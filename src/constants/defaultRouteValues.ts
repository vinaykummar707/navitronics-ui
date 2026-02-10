import {
    ScreenFormat,
    ScreenType,
    FontWeight,
    ScrollType,
    Position,
    SingleScreenTexts,
    TwoScreenTexts,
    ThreeScreenTexts,
    Screen,
    StopRouteConfig,
    DisplayConfigPostRequest,
    DEFAULT_SCREEN_HEIGHTS,
    DEFAULT_SCREEN_WIDTHS,
} from "@/types/routeConfigV2";

// ---- Fundamental defaults ----
export const DEFAULT_SCROLL_TYPE: ScrollType = "Fixed";
export const DEFAULT_POSITION: Position = "Center";
export const DEFAULT_FONT_WEIGHT: FontWeight = "Regular";
export const DEFAULT_SCROLL_SPEED = 4;
export const DEFAULT_FONT_HEIGHT = 12;
export const DEFAULT_FONT_WIDTH = 12;
export const DEFAULT_SCREEN_HEIGHT = DEFAULT_SCREEN_HEIGHTS[0];
export const DEFAULT_SCREEN_WIDTH = DEFAULT_SCREEN_WIDTHS[0];
export const DEFAULT_SCREEN_TYPE: ScreenType = "route";

// ---- Default TextConfig generators ----
export function getDefaultTextConfig(text: string = "Text"): Omit<SingleScreenTexts["text"], "bitmap"> & { bitmap?: string } {
    return {
        text,
        bitmap: "",
        fontWidth: DEFAULT_FONT_WIDTH,
        scrollType: DEFAULT_SCROLL_TYPE,
        position: DEFAULT_POSITION,
        scrollSpeed: DEFAULT_SCROLL_SPEED,
        fontWeight: DEFAULT_FONT_WEIGHT,
        fontHeight: DEFAULT_FONT_HEIGHT,
    };
}

// ---- Default texts per format ----
export const defaultSingleScreenTexts: SingleScreenTexts = {
    text: getDefaultTextConfig("Main Text"),
};

export const defaultTwoScreenTexts: TwoScreenTexts = {
    sideText: getDefaultTextConfig("Side Text"),
    text: getDefaultTextConfig("Main Text"),
};

export const defaultThreeScreenTexts: ThreeScreenTexts = {
    sideText: getDefaultTextConfig("Side Text"),
    upperHalfText: getDefaultTextConfig("Upper Text"),
    lowerHalfText: getDefaultTextConfig("Lower Text"),
};

// ---- Default Screens per format ----
export const defaultSingleScreen: Screen = {
    format: "single",
    texts: defaultSingleScreenTexts,
    height: DEFAULT_SCREEN_HEIGHT,
    width: DEFAULT_SCREEN_WIDTH,
    type: DEFAULT_SCREEN_TYPE,
};

export const defaultTwoScreen: Screen = {
    format: "two",
    texts: defaultTwoScreenTexts,
    height: DEFAULT_SCREEN_HEIGHT,
    width: DEFAULT_SCREEN_WIDTH,
    type: DEFAULT_SCREEN_TYPE,
};

export const defaultThreeScreen: Screen = {
    format: "three",
    texts: defaultThreeScreenTexts,
    height: DEFAULT_SCREEN_HEIGHT,
    width: DEFAULT_SCREEN_WIDTH,
    type: DEFAULT_SCREEN_TYPE,
};

// ---- Utility: map for dynamic screen creation ----
export const screenFormatDefaults: Record<ScreenFormat, Screen> = {
    single: defaultSingleScreen,
    two: defaultTwoScreen,
    three: defaultThreeScreen,
};

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
    route_number: "",
    source: "",
    destination: "",
    via: "",
    route_number_1: "",
    route_number_2: "",
    separation: "",
    isSplitRoute: false,
    front: [],
    side: [],
    rear: [],
    internal: [],
    stops: [],
    version: "1.0",
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