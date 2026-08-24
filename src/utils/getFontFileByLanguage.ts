import { useLanguageConfigs } from "@/context/LanguageConfigContext";

const normalizeLang = (l?: string): string => {
  if (!l) return "en";
  const lower = l.toLowerCase().trim();
  if (lower === "english" || lower === "en") return "en";
  if (lower === "hindi" || lower === "hi") return "hi";
  if (lower === "telugu" || lower === "te") return "te";
  return lower;
};

export function useFontFileByLanguage() {
  const offsetConfigs = useLanguageConfigs();

  return (lang: string, key: string, fontHeight?: number): string => {
    const targetLang = normalizeLang(lang);
    const langObj = offsetConfigs.configs.find(
      (language) =>
        normalizeLang(language.code) === targetLang ||
        language.name?.toLowerCase() === targetLang
    );
    if (!langObj || !langObj.config) return "Arial";

    const configForSection = langObj.config[key] || langObj.config["text"] || langObj.config["sideText"];
    if (!configForSection) return "Arial";

    const use8 = typeof fontHeight === "number" ? fontHeight <= 8 : false;
    const use16 = typeof fontHeight === "number" ? fontHeight > 8 && fontHeight <= 16 : false;

    const fontFamily = use8
      ? configForSection.fontFamily8 || "Arial"
      : use16
      ? configForSection.fontFamily16 || "Arial"
      : configForSection.fontFamily32 || configForSection.fontFamily16 || "Arial";
    return fontFamily;
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
