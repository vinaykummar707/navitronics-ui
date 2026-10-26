import { Simulation, TextConfig } from "@/types/routeConfigV2";
import { getDefaultTextConfig } from "@/constants/defaultRouteValues";

/**
 * Returns summary text based on the simulation format for cards/previews.
 */
export const getSimulationCardText = (simulation: Simulation) => {
  const { format } = simulation;
  const texts = simulation.texts as any;
  switch (format) {
    case "single":
      return texts?.text?.text || "Single Screen Simulation";
    case "two":
      return texts?.text?.text || "Two Screen Simulation";
    case "three":
      return texts?.upperHalfText?.text || "Three Screen Simulation";
    default:
      return "Route Simulation";
  }
};

/**
 * Strips unnecessary keys from a slide's `texts` based on format and split route mode.
 */
export const sanitizeSimulation = (
  sim: Simulation,
  isSplitRoute: boolean
): Simulation => {
  if (!sim || !sim.texts) return sim;
  const texts = { ...sim.texts } as Record<string, any>;

  if (sim.format === "single") {
    return {
      ...sim,
      texts: {
        text: texts.text,
      } as any,
    };
  }

  // Handle route number keys based on isSplitRoute
  if (isSplitRoute) {
    delete texts.sideText;
  } else {
    delete texts.routeNumber1;
    delete texts.routeNumber2;
  }

  // Handle layout-specific text keys
  if (sim.format === "two") {
    delete texts.upperHalfText;
    delete texts.lowerHalfText;
  } else if (sim.format === "three") {
    delete texts.text;
  }

  return { ...sim, texts: texts as any };
};

/**
 * Sanitizes all signboard slide arrays (front, side, rear, internal, stops) within route data.
 */
export const sanitizeRouteBoards = <T extends Record<string, any>>(data: T): T => {
  if (!data) return data;
  const boards = ["front", "side", "rear", "internal", "stops"] as const;
  const cleaned: Record<string, any> = { ...data };
  const isSplit = Boolean(cleaned.is_split_route);

  boards.forEach((board) => {
    const slides = cleaned[board];
    if (Array.isArray(slides)) {
      cleaned[board] = slides.map((slide) => {
        if (typeof slide === "object" && slide !== null && "format" in slide) {
          return sanitizeSimulation(slide, isSplit);
        }
        return slide;
      });
    }
  });

  return cleaned as T;
};

/** Route Setup values that drive the preset text of route slides. */
export interface RouteFieldValues {
  routeNumber?: string;
  routeNumber1?: string;
  routeNumber2?: string;
  source?: string;
  destination?: string;
  via?: string;
  separation?: string;
}

export const ROUTE_SEPARATOR_OPTIONS = ["-", "TO", "↔"] as const;

/** Joins source and destination with the chosen route separator (default "-"). */
export const joinSourceDestination = (source?: string, destination?: string, separation?: string) =>
  [source, destination].filter(Boolean).join(` ${(separation || "").trim() || "-"} `);

const joinRouteParts = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" - ");

// Texts the editor fills in when a Route Setup field is still empty.
const ZONE_PLACEHOLDER_TEXTS: Record<string, string[]> = {
  text: ["", "Single Route Text", "Main Text", "Text"],
  sideText: ["", "Side Text"],
  upperHalfText: ["", "Upper Text"],
  lowerHalfText: ["", "Lower Text"],
  routeNumber1: ["", "1", "Route 1"],
  routeNumber2: ["", "2", "Route 2"],
};

/**
 * Text a zone gets when a route slide is added (mirrors the Add Slide presets).
 */
export const getRoutePresetZoneText = (
  format: Simulation["format"],
  zoneKey: string,
  values: RouteFieldValues
): string | undefined => {
  switch (zoneKey) {
    case "text": {
      const routeText = joinRouteParts(joinSourceDestination(values.source, values.destination, values.separation), values.via);
      return format === "single" ? routeText || "Single Route Text" : routeText;
    }
    case "upperHalfText":
      return joinSourceDestination(values.source, values.destination, values.separation);
    case "lowerHalfText":
      return values.via || "";
    case "sideText":
      return values.routeNumber || "";
    case "routeNumber1":
      return values.routeNumber1 || "Route 1";
    case "routeNumber2":
      return values.routeNumber2 || "Route 2";
    default:
      return undefined;
  }
};

/**
 * True when a zone still shows auto-generated text (preset or placeholder) rather than a manual edit.
 */
export const isAutoRouteZoneText = (
  format: Simulation["format"],
  zoneKey: string,
  text: string | undefined,
  values: RouteFieldValues
): boolean => {
  const value = text ?? "";
  if (ZONE_PLACEHOLDER_TEXTS[zoneKey]?.includes(value)) return true;
  const preset = getRoutePresetZoneText(format, zoneKey, values);
  return preset !== undefined && value === preset;
};

/**
 * Re-applies Route Setup changes to existing slides. Only zones whose text still matches the
 * preset for the previous values are updated, so manual text edits are kept.
 */
export const syncSlidesWithRouteFields = (
  slides: Simulation[],
  prevValues: RouteFieldValues,
  nextValues: RouteFieldValues
): { slides: Simulation[]; changed: boolean } => {
  if (!Array.isArray(slides)) return { slides: [], changed: false };
  let changed = false;

  const next = slides.map((slide) => {
    // Only route slides carry Route Setup text; slogans, special messages and stops are user content.
    if (!slide || !slide.texts || (slide.type && slide.type !== "route")) return slide;
    let slideChanged = false;
    const texts = { ...slide.texts } as Record<string, TextConfig | undefined>;

    Object.keys(texts).forEach((zoneKey) => {
      const zone = texts[zoneKey];
      if (!zone || typeof zone !== "object") return;
      if (!isAutoRouteZoneText(slide.format, zoneKey, zone.text, prevValues)) return;
      const nextText = getRoutePresetZoneText(slide.format, zoneKey, nextValues);
      if (nextText === undefined || nextText === zone.text) return;
      texts[zoneKey] = { ...zone, text: nextText, bitmap: "" };
      slideChanged = true;
    });

    if (!slideChanged) return slide;
    changed = true;
    return { ...slide, texts: texts as Simulation["texts"] } as Simulation;
  });

  return { slides: changed ? next : slides, changed };
};

/**
 * Migrates existing slides when toggling split route mode on/off in the studio editor.
 */
export const migrateSlidesOnSplitRouteToggle = (
  slides: Simulation[],
  isSplit: boolean,
  routeNumbers?: {
    routeNumber?: string;
    routeNumber1?: string;
    routeNumber2?: string;
  }
): Simulation[] => {
  if (!Array.isArray(slides)) return [];
  const fieldValues: RouteFieldValues = {
    routeNumber: routeNumbers?.routeNumber,
    routeNumber1: routeNumbers?.routeNumber1,
    routeNumber2: routeNumbers?.routeNumber2,
  };
  return slides.map((slide) => {
    if (!slide || slide.format === "single") return slide;
    const texts = { ...slide.texts } as Record<string, any>;

    if (isSplit) {
      // Switching to Split Route:
      // Set routeNumber1 and routeNumber2, remove sideText
      const sideText = texts.sideText;
      // An auto-filled route number badge takes the Route #1 value; a manually edited one is kept.
      const sideIsAuto =
        sideText && isAutoRouteZoneText(slide.format, "sideText", sideText.text, fieldValues);
      texts.routeNumber1 =
        texts.routeNumber1 ||
        (sideText && !sideIsAuto ? sideText : undefined) ||
        (sideText
          ? { ...sideText, text: routeNumbers?.routeNumber1 || "1", bitmap: "" }
          : getDefaultTextConfig(routeNumbers?.routeNumber1 || "1"));
      texts.routeNumber2 =
        texts.routeNumber2 ||
        getDefaultTextConfig(routeNumbers?.routeNumber2 || "2");
      delete texts.sideText;
    } else {
      // Switching to Standard (Single Route Number):
      // Set sideText, remove routeNumber1 and routeNumber2
      const routeNumber1 = texts.routeNumber1;
      const routeNumber1IsAuto =
        routeNumber1 && isAutoRouteZoneText(slide.format, "routeNumber1", routeNumber1.text, fieldValues);
      texts.sideText =
        texts.sideText ||
        (routeNumber1 && !routeNumber1IsAuto ? routeNumber1 : undefined) ||
        (routeNumber1
          ? { ...routeNumber1, text: routeNumbers?.routeNumber || "", bitmap: "" }
          : getDefaultTextConfig(routeNumbers?.routeNumber || ""));
      delete texts.routeNumber1;
      delete texts.routeNumber2;
    }

    // Clean up layout-specific keys
    if (slide.format === "two") {
      delete texts.upperHalfText;
      delete texts.lowerHalfText;
    } else if (slide.format === "three") {
      delete texts.text;
    }

    return { ...slide, texts: texts as any } as Simulation;
  });
};