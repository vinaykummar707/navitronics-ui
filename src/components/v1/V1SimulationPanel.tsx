import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import useTabsStore, { Tab } from "@/store/useTabsStore";
import type { DisplayConfig } from "@/types/v1RouteTypes";
import { AVAILABLE_LANGUAGES } from "@/types/v1RouteTypes";
import { V1DisplayEditor } from "./V1DisplayEditor";
import { Button } from "@/ui/components/Button";

const BOARD_TABS = [
  { tab: Tab.FRONT, label: "Front Board" },
  { tab: Tab.SIDE, label: "Side Board" },
  { tab: Tab.REAR, label: "Rear Board" },
  { tab: Tab.INTERNAL, label: "Internal Board" },
];

export const V1SimulationPanel: React.FC = () => {
  const { control } = useFormContext<DisplayConfig>();
  const { selectedTab, setSelectedTab } = useTabsStore();

  const displayConfig = useWatch({
    control,
    name: "displayConfig",
  }) || {};

  const activeLanguages = Object.keys(displayConfig);

  const getLanguageLabel = (code: string) => {
    return AVAILABLE_LANGUAGES.find((l) => l.code === code)?.label || code.toUpperCase();
  };

  return (
    <main className="flex flex-1 flex-col overflow-y-auto bg-neutral-50 px-6 py-4">
      {/* Board Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-border pb-3 flex-none">
        {BOARD_TABS.map(({ tab, label }) => {
          const isActive = selectedTab === tab;
          return (
            <Button
              key={tab}
              size="small"
              variant={isActive ? "brand-primary" : "neutral-secondary"}
              onClick={() => setSelectedTab(tab)}
            >
              {label}
            </Button>
          );
        })}
      </div>

      {/* Simulation Viewport */}
      <div className="flex flex-col gap-6 pt-4 flex-1">
        {activeLanguages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-12 text-center text-subtext-color my-auto">
            <span className="text-body-bold font-body-bold text-default-font">
              No Languages Selected
            </span>
            <span className="text-caption font-caption text-subtext-color mt-1 max-w-sm">
              Please choose at least one language from the left panel under Language Selection to preview and configure LED boards.
            </span>
          </div>
        ) : (
          activeLanguages.map((langCode) => (
            <div
              key={langCode}
              className="flex flex-col gap-3 rounded-lg border border-neutral-border bg-default-background p-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-neutral-border pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-caption-bold font-caption-bold text-brand-700 uppercase">
                    {langCode}
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font">
                    {getLanguageLabel(langCode)} Display Simulation
                  </span>
                </div>
              </div>

              <V1DisplayEditor language={langCode} />
            </div>
          ))
        )}
      </div>
    </main>
  );
};
