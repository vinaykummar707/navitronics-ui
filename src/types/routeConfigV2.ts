import { stopStates } from "@/constants/defaultRouteValues";

/** 
 * Scroll direction types for text on the simulation. 
 */
export const SCROLL_TYPES = ['Left To Right', 'Right To Left', 'Fixed'] as const;
export type ScrollType = typeof SCROLL_TYPES[number];

/**
 * Allowed text positions.
 */
export const POSITIONS = ['Left', 'Right', 'Center'] as const;
export type Position = typeof POSITIONS[number];

/**
 * Supported simulation layouts.
 */
export const SIMULATION_FORMATS = ['single', 'two', 'three'] as const;
export type SimulationFormat = typeof SIMULATION_FORMATS[number];

/**
 * Simulation type definitions, controls the semantics of the simulation.
 */
export const SIMULATION_TYPES = ['route', 'special message', 'slogan', 'stop'] as const;
export type SimulationType = typeof SIMULATION_TYPES[number];

/**
 * Supported font weights.
 */
export const FONT_WEIGHTS = ['Regular', 'Bold'] as const;
export type FontWeight = typeof FONT_WEIGHTS[number];

/**
 * Default allowed simulation heights and widths.
 */
export const DEFAULT_SIMULATION_HEIGHTS = [16, 32] as const;
export type SimulationHeight = typeof DEFAULT_SIMULATION_HEIGHTS[number];
export const DEFAULT_SIMULATION_WIDTHS = [64, 96, 128, 160, 192, 224] as const;
export type SimulationWidth = typeof DEFAULT_SIMULATION_WIDTHS[number];

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
 * Text configuration for a single line/section on a simulation.
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
  language: string;
}

// Text keys defining different text fields on simulation layouts.
export type SimulationTextKey = 'sideText' | 'upperHalfText' | 'lowerHalfText' | 'text' | 'routeNumber1' | 'routeNumber2';

export type SimulationTexts<T extends readonly SimulationTextKey[]> = {
  [K in T[number]]: TextConfig;
};

export type SingleSimulationTexts = SimulationTexts<['text']>;
export type TwoSimulationTexts = SimulationTexts<['sideText', 'text', 'routeNumber1', 'routeNumber2']>; // Added route numbers for two-screen format
export type ThreeSimulationTexts = SimulationTexts<['sideText', 'upperHalfText', 'lowerHalfText', 'routeNumber1', 'routeNumber2']>;

/**
 * Represents a digital simulation configuration.
 */
export interface Simulation {
  format: SimulationFormat;
  texts: SingleSimulationTexts | TwoSimulationTexts | ThreeSimulationTexts;
  height: SimulationHeight;
  width: SimulationWidth;
  type: SimulationType;
  latitude?: number;
  longitude?: number;
  audioFileUrl?: string | null;
  audioFileName?: string | null;
  stopType?: typeof stopStates[number];
  stopTypeAudioFileUrl?: string | null;
  stopTypeAudioFileName?: string | null;
}

export interface StopRouteConfig extends Simulation {
  name: string;
  latitude: number;
  longitude: number;
  down_longitude: number;
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
  is_split_route: boolean;
  front: Simulation[];
  side: Simulation[];
  rear: Simulation[];
  internal: Simulation[];
  stops?: Simulation[];
  version: string;
  depot_id: string;
  organization_id: string;
  return: boolean;
}

export interface DisplayConfigGetRequest {
  id: string;
  created_at: string;
  route_number: string;
  source: string;
  destination: string;
  via: string;
  route_number_1: string;
  route_number_2: string;
  separation: string;
  is_split_route: boolean;
  front: Simulation[];
  side: Simulation[];
  rear: Simulation[];
  internal: Simulation[];
  stops?: Simulation[];
  version: string;
  depot_id: string;
  organization_id: string;
  return: boolean;
}