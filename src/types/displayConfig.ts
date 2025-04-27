export type ScrollType =
	| 'Left To Right'
	| 'Right To Left'
	| 'Fixed'
	| 'Flicker';
export type Position = 'Left' | 'Right' | 'Center';
export type ScreenFormat = 'single' | 'two' | 'three';
export type FontWeight = 'Regular' | 'Bold';

export interface BitmapTranslations {
	bitmap: string;
	width: number;
	height: number;
}

export interface TextConfig {
	text: string;
	bitmap: string;
	scrollType: ScrollType;
	position: Position;
	scrollSpeed: number;
	fontSize: number;
	fontWeight: FontWeight;
	fontHeight: number;
	x_offset: number;
	y_offset: number;
	spacing: number;
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
	specialMessage: boolean;
}

// Language-specific screen configurations
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
	active?: string;
	deleted?: string;
	id?: string;
	specialMessages: any[];
}
