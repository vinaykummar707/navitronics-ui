import { Simulation } from "@/types/routeConfigV2";
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
  return slides.map((slide) => {
    if (!slide || slide.format === "single") return slide;
    const texts = { ...slide.texts } as Record<string, any>;

    if (isSplit) {
      // Switching to Split Route:
      // Set routeNumber1 and routeNumber2, remove sideText
      texts.routeNumber1 =
        texts.routeNumber1 ||
        texts.sideText ||
        getDefaultTextConfig(routeNumbers?.routeNumber1 || "1");
      texts.routeNumber2 =
        texts.routeNumber2 ||
        getDefaultTextConfig(routeNumbers?.routeNumber2 || "2");
      delete texts.sideText;
    } else {
      // Switching to Standard (Single Route Number):
      // Set sideText, remove routeNumber1 and routeNumber2
      texts.sideText =
        texts.sideText ||
        texts.routeNumber1 ||
        getDefaultTextConfig(routeNumbers?.routeNumber || "");
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