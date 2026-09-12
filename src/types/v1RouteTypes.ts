export const ScrollTypes = [
  'Left To Right',
  'Right To Left',
  'Fixed',
  'Flashing',
] as const;
export type ScrollType = typeof ScrollTypes[number];

export const Positions = ['Left', 'Right', 'Center'] as const;
export type Position = typeof Positions[number];

export const ScreenFormats = ['single', 'two', 'three'] as const;
export type ScreenFormat = typeof ScreenFormats[number];

export const FontWeights = ['Regular', 'Bold'] as const;
export type FontWeight = typeof FontWeights[number];

export const DEFAULT_SCREEN_HEIGHTS = [16, 32] as const;
export type ScreenHeight = typeof DEFAULT_SCREEN_HEIGHTS[number];

export const DEFAULT_SCREEN_WIDTHS = [64, 96, 128, 160, 192, 224] as const;
export type ScreenWidth = typeof DEFAULT_SCREEN_WIDTHS[number];

export const SCROLL_SPEED_PRESETS = [
  { label: "Very Fast", value: 9 },
  { label: "Medium Fast", value: 6 },
  { label: "Normal", value: 4 },
  { label: "Slow", value: 3 },
  { label: "Very Slow", value: 1 },
] as const;

export type ScrollSpeedPresetLabel = typeof SCROLL_SPEED_PRESETS[number]['label'];
export type ScrollSpeedPresetValue = typeof SCROLL_SPEED_PRESETS[number]['value'];

export interface BitmapTranslations {
  bitmap: string;
  width: number;
  height: number;
}

export interface TextConfig {
  text: string;
  bitmap?: string;
  fontWidth?: number;
  scrollType: ScrollType;
  position: Position;
  scrollSpeed: number;
  fontWeight: FontWeight;
  fontHeight?: number;
  fontSize?: number;
  language?: string;
}

export interface Screen {
  format: ScreenFormat;
  texts: Record<string, TextConfig>;
  height: ScreenHeight;
  width: ScreenWidth;
}

export interface Screens {
  front: Screen;
  side: Screen;
  rear: Screen;
  internal: Screen;
}

export interface RouteFlags {
  splitRoute: boolean;
  showRt: boolean;
  showSpm: boolean;
  showBoth: boolean;
}

export interface RouteInformation {
  routeNumber: string;
  source: string;
  destination: string;
  via: string;
  routeNumber1: string;
  routeNumber2: string;
  separation: string;
  splitRoute: boolean;
  showRt: boolean;
  showSpm: boolean;
  showBoth: boolean;
  specialMessage?: boolean;
}

export interface SpecialMessage {
  title: string;
  message: string;
  priority?: number;
}

export interface LanguageDisplayConfig {
  [languageCode: string]: Screens;
}

export interface DisplayConfig {
  route: RouteInformation;
  displayConfig: LanguageDisplayConfig;
  version: string;
  areaId: string;
  depotId: string;
  createdAt?: string;
  active?: boolean | string;
  deleted?: boolean | string;
  id?: string;
  specialMessages: SpecialMessage[];
}

export const defaultRoute: RouteInformation = {
  routeNumber: "",
  source: "",
  destination: "",
  via: "",
  splitRoute: false,
  routeNumber1: "",
  routeNumber2: "",
  separation: "-",
  showRt: true,
  showSpm: false,
  showBoth: false,
};

export const getDefaultTextConfig = (): TextConfig => ({
  text: "",
  bitmap: "",
  fontWidth: 12,
  scrollType: "Fixed",
  position: "Center",
  scrollSpeed: 1,
  fontWeight: "Regular",
  fontHeight: 12,
});

export const getDefaultTextConfigRouteNumber = (): TextConfig => ({
  text: "",
  bitmap: "",
  fontWidth: 12,
  scrollType: "Fixed",
  position: "Center",
  scrollSpeed: 1,
  fontWeight: "Regular",
  fontHeight: 12,
});

export const getDefaultTextConfigRouteNumber1 = (): TextConfig => ({
  text: "",
  bitmap: "",
  fontWidth: 12,
  scrollType: "Fixed",
  position: "Center",
  scrollSpeed: 1,
  fontWeight: "Regular",
  fontHeight: 12,
});

export const getDefaultTextConfigRouteNumber2 = (): TextConfig => ({
  text: "",
  bitmap: "",
  fontWidth: 12,
  scrollType: "Fixed",
  position: "Center",
  scrollSpeed: 1,
  fontWeight: "Regular",
  fontHeight: 12,
});

export function getDefaultTextsForFormat(format: ScreenFormat, splitRoute: boolean = false) {
  const base = getDefaultTextConfig();
  const base2 = getDefaultTextConfigRouteNumber();
  const base3 = getDefaultTextConfigRouteNumber1();
  const base4 = getDefaultTextConfigRouteNumber2();

  const routeTexts = splitRoute
    ? { routeNumber1: { ...base3 }, routeNumber2: { ...base4 } }
    : { sideText: { ...base2 } };

  if (format === "single") {
    return { text: { ...base } };
  }
  if (format === "two") {
    return {
      ...routeTexts,
      text: { ...base },
    };
  }
  if (format === "three") {
    return {
      ...routeTexts,
      upperHalfText: { ...base },
      lowerHalfText: { ...base },
    };
  }
  return { text: { ...base } };
}

export function getDefaultScreen(format: ScreenFormat = "single", height: ScreenHeight = 16, width: ScreenWidth = 96): Screen {
  return {
    format,
    texts: getDefaultTextsForFormat(format),
    height,
    width,
  };
}

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
] as const;

export const defaultV1Values: DisplayConfig = {
  route: defaultRoute,
  displayConfig: {},
  version: "1.0",
  areaId: "",
  depotId: "",
  specialMessages: [],
};
