import axios from "axios";
import { BitmapApiParams } from "@/types/bitmapApi";

const getInitialBitmapUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_BITMAP_API_URL;
  if (envUrl) return envUrl;
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return "http://13.233.103.63:5288/api/bitmap";
  }
  return "http://13.233.103.63:5288/api/bitmap";
};

export const BITMAP_API_BASE_URL = getInitialBitmapUrl();

/**
 * Builds the complete URL with search params for the Bitmap API.
 */
export function buildBitmapApiUrl(
  params: BitmapApiParams,
  baseUrl: string = BITMAP_API_BASE_URL
): string {
  const query = new URLSearchParams();

  let textToRender =
    params.text !== undefined && params.text !== null
      ? params.text.toString().trim()
      : "";
  const icon = params.icon ? params.icon.trim() : "";

  if (icon) {
    // If text already has {icon} placeholder, leave it as is
    if (!textToRender.includes("{icon}")) {
      if (!textToRender) {
        textToRender = "{icon}";
      } else {
        const pos = params.iconPosition || "start";
        if (
          params.iconWordIndex !== undefined &&
          params.iconWordIndex !== null &&
          params.iconWordIndex > 0
        ) {
          const words = textToRender.split(" ");
          const idx = Math.min(params.iconWordIndex, words.length);
          words.splice(idx, 0, "{icon}");
          textToRender = words.join(" ");
        } else if (pos === "start") {
          textToRender = `{icon} ${textToRender}`;
        } else if (pos === "end") {
          textToRender = `${textToRender} {icon}`;
        } else if (pos === "center") {
          const words = textToRender.split(" ");
          const mid = Math.ceil(words.length / 2);
          words.splice(mid, 0, "{icon}");
          textToRender = words.join(" ");
        }
      }
    }
    query.append("icon", icon);
    query.append("text", textToRender);
    if (params.iconPosition) {
      query.append("iconPosition", params.iconPosition);
    }
  } else {
    query.append("text", textToRender || " ");
  }

  if (
    params.iconWordIndex !== undefined &&
    params.iconWordIndex !== null &&
    params.iconWordIndex > 0
  ) {
    query.append("iconWordIndex", params.iconWordIndex.toString());
  }

  if (
    params.iconSpacing !== undefined &&
    params.iconSpacing !== null &&
    params.iconSpacing >= 0
  ) {
    query.append("iconSpacing", params.iconSpacing.toString());
  }

  if (
    params.iconWidthScale !== undefined &&
    params.iconWidthScale !== null &&
    params.iconWidthScale > 0
  ) {
    query.append("iconWidthScale", params.iconWidthScale.toString());
  }

  if (params.height !== undefined && params.height !== null) {
    query.append("height", params.height.toString());
  } else if (params.targetRows !== undefined && params.targetRows !== null) {
    query.append("targetRows", params.targetRows.toString());
  }

  if (params.vAlign) {
    query.append("vAlign", params.vAlign);
  }

  if (params.padding !== undefined && params.padding !== null) {
    query.append("padding", params.padding.toString());
  }

  if (params.pleft !== undefined && params.pleft !== null) {
    query.append("pleft", params.pleft.toString());
  }

  if (params.pright !== undefined && params.pright !== null) {
    query.append("pright", params.pright.toString());
  }

  if (
    params.threshold !== undefined &&
    params.threshold !== null &&
    params.threshold > 0
  ) {
    query.append("threshold", params.threshold.toString());
  }

  if (params.family && params.family.trim() !== "") {
    query.append("family", params.family.trim());
  }

  if (params.weight && params.weight.trim() !== "") {
    query.append("weight", params.weight.trim());
  }

  if (params.autoFit !== undefined && params.autoFit !== null) {
    query.append("autoFit", params.autoFit.toString());
  }

  if (
    params.fontSize !== undefined &&
    params.fontSize !== null &&
    params.fontSize > 0
  ) {
    query.append("fontSize", params.fontSize.toString());
  }

  if (
    params.spaceWidth !== undefined &&
    params.spaceWidth !== null &&
    params.spaceWidth > 0
  ) {
    query.append("spaceWidth", params.spaceWidth.toString());
  }

  const queryString = query.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Fetches the multiline ASCII LED bitmap string from the Bitmap API.
 */
export async function fetchBitmapMatrix(
  params: BitmapApiParams,
  baseUrl: string = BITMAP_API_BASE_URL
): Promise<string> {
  const url = buildBitmapApiUrl(params, baseUrl);
  const response = await axios.get<string>(url, {
    responseType: "text",
  });
  return response.data;
}
