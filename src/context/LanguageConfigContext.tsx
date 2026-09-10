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
    return <div>Loading language configs...</div>;
  }

  if (isError) {
    return <div>Failed to load language configs.</div>;
  }

  return (
    <LanguageConfigContext.Provider value={contextValue}>
      {children}
    </LanguageConfigContext.Provider>
  );
};

export const useLanguageConfigs = () => useContext(LanguageConfigContext);