import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext } from "react";

type LanguageConfigContextType = {
  configs: any[];
  isLoading: boolean;
  isError: boolean;
};

const LanguageConfigContext = createContext<LanguageConfigContextType>({
  configs: [],
  isLoading: true,
  isError: false,
});

const fetchConfigs = async () => {
  const res = await fetch("https://api.navitronix.in/navitranix/api/languages/all");
  if (!res.ok) throw new Error("Failed to fetch configs");
  return res.json();
};

export const LanguageConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["languageConfigs"],
    queryFn: fetchConfigs,
    initialData: [],
    retry:false
  });
  // Optional: Show loading UI while fetching
  if (isLoading) {
    return <div>Loading language configs...</div>;
  }

  if (isError) {
    return <div>Failed to load language configs.</div>;
  }

  return (
    <LanguageConfigContext.Provider value={{ configs: data || [], isLoading, isError }}>
      {children}
    </LanguageConfigContext.Provider>
  );
};

export const useLanguageConfigs = () => useContext(LanguageConfigContext);