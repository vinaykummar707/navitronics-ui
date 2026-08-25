export interface BitmapApiParams {
  // Content
  text?: string;
  icon?: string;

  // Icon Placement
  iconPosition?: "start" | "end" | "center";
  iconWordIndex?: number;
  iconSpacing?: number;
  iconWidthScale?: number;

  // Board Sizing
  targetRows?: number; // e.g. 8, 16, 24, 32
  height?: number; // alias for targetRows
  vAlign?: "Center" | "Top" | "Bottom";
  padding?: boolean;
  pleft?: number;
  pright?: number;
  threshold?: number; // 0 - 255

  // Typography
  family?: string;
  weight?: "Regular" | "Bold" | "";
  autoFit?: boolean;
  fontSize?: number;
  spaceWidth?: number;
}
