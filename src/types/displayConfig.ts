export type ScrollType = 'left-to-right' | 'right-to-left' | 'fixed' | 'flicker';
export type Position = 'left' | 'right' | 'center';
export type ScreenFormat = 'single' | 'two' | 'three';

export interface BitmapTranslations {
    bitmap: string;
    width: number;
    height: number;
}

export interface TextConfig {
  text:string;
  bitmap: BitmapTranslations;
  scrollType: ScrollType;
  position: Position;
  scrollSpeed: number;
  fontSize: number;
}

export interface SingleScreenTexts {
  text: TextConfig;
}

export interface TwoScreenTexts {
  sideText: TextConfig;
  text: TextConfig;
}

export interface ThreeScreenTexts {
  sideText: TextConfig;
  upperHalfText: TextConfig;
  lowerHalfText: TextConfig;
}

export interface Screen {
  format: ScreenFormat;
  texts: SingleScreenTexts | TwoScreenTexts | ThreeScreenTexts;
}

export interface Screens {
  front: Screen;
  side: Screen;
  rear: Screen;
  internal: Screen;
}

export interface RouteInformation {
  routeNumber: string;
  source: string;
  destination: string;
  via: string;
  splitRoute: boolean;
  routeNumber1: string;
  routeNumber2: string;
  separation: string;
}

// Language-specific screen configurations
export interface LanguageDisplayConfig {
  [languageCode: string]: Screens;
}

export interface DisplayConfig {
  route: RouteInformation;
  displayConfig: LanguageDisplayConfig;
}
