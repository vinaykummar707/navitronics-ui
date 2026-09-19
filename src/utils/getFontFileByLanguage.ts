import { useLanguageConfigs } from "@/context/LanguageConfigContext";

const SCRIPT_FALLBACKS: Record<string, string> = {
  hi: "Noto Sans Devanagari",
  mr: "Noto Sans Devanagari",
  kn: "Noto Sans Kannada",
  te: "Noto Sans Telugu",
  ta: "Noto Sans Tamil",
  ml: "Noto Sans Malayalam",
  bn: "Noto Sans Bengali",
  gu: "Noto Sans Gujarati",
  pa: "Noto Sans Gurmukhi",
  en: "Arial",
};

const normalizeLang = (l?: string): string => {
  if (!l) return "en";
  const lower = l.toLowerCase().trim();
  const base = lower.replace(/\d+$/, "");
  if (base === "english" || base === "en") return "en";
  if (base === "hindi" || base === "hi") return "hi";
  if (base === "telugu" || base === "te") return "te";
  if (base === "kannada" || base === "kn") return "kn";
  if (base === "tamil" || base === "ta") return "ta";
  if (base === "marathi" || base === "mr") return "mr";
  if (base === "malayalam" || base === "ml") return "ml";
  if (base === "bengali" || base === "bn") return "bn";
  if (base === "gujarati" || base === "gu") return "gu";
  return base;
};

export function useFontFileByLanguage() {
  const offsetConfigs = useLanguageConfigs();

  return (lang: string, key: string, fontHeight?: number): string => {
    const targetLang = normalizeLang(lang);
    const fallbackFont = SCRIPT_FALLBACKS[targetLang] || "Arial";

    const langObj = offsetConfigs?.configs?.find(
      (language) =>
        normalizeLang(language.code) === targetLang ||
        language.name?.toLowerCase() === targetLang
    );
    if (!langObj || !langObj.config) return fallbackFont;

    const configForSection = langObj.config[key] || langObj.config["text"] || langObj.config["sideText"];
    if (!configForSection) return fallbackFont;

    const use8 = typeof fontHeight === "number" ? fontHeight <= 8 : false;
    const use16 = typeof fontHeight === "number" ? fontHeight > 8 && fontHeight <= 16 : false;

    const fontFamily = use8
      ? configForSection.fontFamily8 || fallbackFont
      : use16
      ? configForSection.fontFamily16 || fallbackFont
      : configForSection.fontFamily32 || configForSection.fontFamily16 || fallbackFont;

    return (fontFamily && fontFamily !== "Arial") ? fontFamily : fallbackFont;
  };
}

export function useFontHeightForLanguage() {
  const offsetConfigs = useLanguageConfigs();

  return (lang: string, key: string): number => {
    const targetLang = normalizeLang(lang);
    const langObj = offsetConfigs.configs.find(
      (language) =>
        normalizeLang(language.code) === targetLang ||
        language.name?.toLowerCase() === targetLang
    );
    if (!langObj || !langObj.config) return 16;
    const configForSection = langObj.config[key] || langObj.config["text"] || langObj.config["sideText"];
    if (!configForSection) return 16;
    return Number(configForSection.fontHeight) || 16;
  };
}
