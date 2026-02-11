import { useLanguageConfigs } from "@/context/LanguageConfigContext";

export function useFontFileByLanguage() {
  const offsetConfigs = useLanguageConfigs();
  return (lang: string, key: string, fontHeight?: number): string => {
    const langObj = offsetConfigs.configs.find((language) => language.code === lang);
    if (!langObj || !langObj.config || !langObj.config[key]) return "Arial";
    const use8 = typeof fontHeight === "number" ? fontHeight <= 8 : false;

    const fontFamily = use8
      ? langObj.config[key].fontFamily8 || "Arial"
      : langObj.config[key].fontFamily16 || "Arial";
    return fontFamily;
  };
}