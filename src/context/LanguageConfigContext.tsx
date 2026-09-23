import { fontSettingsCrud, ITextConfig } from "@/types/ITextConfig";
import React, { createContext, useContext } from "react";

type LanguageConfigContextType = {
  configs: ITextConfig[];
  isLoading: boolean;
  isError: boolean;
};

const LanguageConfigContext = createContext<LanguageConfigContextType>({
  configs: [],
  isLoading: true,
  isError: false,
});

const QUERY_OPTIONS = { filters: { deleted: false } };

export const LanguageConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading, isError } = fontSettingsCrud.useList(QUERY_OPTIONS);

  const fontSettings = React.useMemo(() => {
    if (!data?.data) return [];
    return (data.data as ITextConfig[]).map((item) => ({
      ...item,
      config: typeof item.config === "string" ? JSON.parse(item.config) : item.config,
    }));
  }, [data]);

  const contextValue = React.useMemo(
    () => ({ configs: fontSettings, isLoading, isError }),
    [fontSettings, isLoading, isError]
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-default-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-800" />
          <span className="text-caption font-caption text-subtext-color">Loading language configurations...</span>
        </div>
      </div>
    );
  }

  // Gracefully provide children even if language configs fail to prevent fullscreen app crash
  if (isError) {
    console.warn("Language configurations failed to load; using defaults.");
  }

  return (
    <LanguageConfigContext.Provider value={contextValue}>
      {children}
    </LanguageConfigContext.Provider>
  );
};

export const useLanguageConfigs = () => useContext(LanguageConfigContext);