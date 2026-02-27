import { useLanguageConfigs } from "@/context/LanguageConfigContext";

export function useFontFileByLanguage() {
  const offsetConfigs = useLanguageConfigs();

  return (lang: string, key: string, fontHeight?: number): string => {
    const langObj = offsetConfigs.configs.find((language) => language.code === lang);
    if (!langObj || !langObj.config || !langObj.config[key]) return "Arial";
    const use8 = typeof fontHeight === "number" ? fontHeight <= 8 : false;
    const use16 = typeof fontHeight === "number" ? fontHeight > 8 && fontHeight <= 16 : false;
    const use32 = typeof fontHeight === "number" ? fontHeight > 16 : false;

    const fontFamily = use8
      ? langObj.config[key].fontFamily8 || "Arial"
      : use16
      ? langObj.config[key].fontFamily16 || "Arial"
      : langObj.config[key].fontFamily32 || "Arial";
    return fontFamily;
  };
}

 export function useFontHeightForLanguage() {
  const offsetConfigs = useLanguageConfigs();

    return (lang: string, key: string): number => {
      console.log("Getting default font height for language ", lang, " and key ", key);
      const langObj = offsetConfigs.configs.find((language) => language.code === lang);
      if (!langObj || !langObj.config || !langObj.config[key]) return 16;
      return langObj.config[key].fontHeight || 16;
    };
  }
