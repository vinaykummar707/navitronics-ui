/** 
 * Scroll direction types for text on the screen. 
 */
export const SCROLL_TYPES = ['Left To Right', 'Right To Left', 'Fixed'] as const;
export type ScrollType = typeof SCROLL_TYPES[number];

/**
 * Allowed text positions.
 */
export const POSITIONS = ['Left', 'Right', 'Center'] as const;
export type Position = typeof POSITIONS[number];

/**
 * Supported screen layouts.
 */
export const SCREEN_FORMATS = ['single', 'two', 'three'] as const;
export type ScreenFormat = typeof SCREEN_FORMATS[number];

/**
 * Screen type definitions, controls the semantics of the screen.
 */
export const SCREEN_TYPES = ['route', 'special message', 'slogan', 'announcement'] as const;
export type ScreenType = typeof SCREEN_TYPES[number];

/**
 * Supported font weights.
 */
export const FONT_WEIGHTS = ['Regular', 'Bold'] as const;
export type FontWeight = typeof FONT_WEIGHTS[number];

/**
 * Default allowed screen heights and widths.
 */
export const DEFAULT_SCREEN_HEIGHTS = [16, 32] as const;
export type ScreenHeight = typeof DEFAULT_SCREEN_HEIGHTS[number];
export const DEFAULT_SCREEN_WIDTHS = [64, 96, 128, 160, 192, 224] as const;
export type ScreenWidth = typeof DEFAULT_SCREEN_WIDTHS[number];

/**
 * Scroll speed presets with labels and values.
 */
export const SCROLL_SPEED_PRESETS = [
  { label: "Very Fast", value: 9 },
  { label: "Medium Fast", value: 6 },
  { label: "Normal", value: 4 },
  { label: "Slow", value: 3 },
  { label: "Very Slow", value: 1 },
] as const;
export type ScrollSpeedPresetLabel = typeof SCROLL_SPEED_PRESETS[number]['label'];
export type ScrollSpeedPresetValue = typeof SCROLL_SPEED_PRESETS[number]['value'];

/**
 * Basic translation for bitmap graphics.
 */
export interface BitmapTranslations {
  bitmap: string;
  width: number;
  height: number;
}

/**
 * Text configuration for a single line/section on a screen.
 */
export interface TextConfig {
  text: string;
  bitmap?: string;
  fontWidth?: number;
  scrollType: ScrollType;
  position: Position;
  scrollSpeed: number;
  fontWeight: FontWeight;
  fontHeight?: number;
}

// Text keys defining different text fields on screen layouts.
export type ScreenTextKey = 'sideText' | 'upperHalfText' | 'lowerHalfText' | 'text';

export type ScreenTexts<T extends readonly ScreenTextKey[]> = {
  [K in T[number]]: TextConfig;
};

export type SingleScreenTexts = ScreenTexts<['text']>;
export type TwoScreenTexts = ScreenTexts<['sideText', 'text']>;
export type ThreeScreenTexts = ScreenTexts<['sideText', 'upperHalfText', 'lowerHalfText']>;

/**
 * Represents a digital screen configuration.
 */
export interface Screen {
  format: ScreenFormat;
  texts: SingleScreenTexts | TwoScreenTexts | ThreeScreenTexts;
  height: ScreenHeight;
  width: ScreenWidth;
  type: ScreenType;
}

export interface StopRouteConfig {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  audioFileUrl: string | null;
}

/**
 * The full request payload to send display config data.
 */
export interface DisplayConfigPostRequest {
  route_number: string;
  source: string;
  destination: string;
  via: string;
  route_number_1: string;
  route_number_2: string;
  separation: string;
  isSplitRoute: boolean;
  front: Screen[];
  side: Screen[];
  rear: Screen[];
  internal: Screen[];
  stops?: StopRouteConfig[];
  version: string;
  depot_id: string;
  organization_id: string;
}