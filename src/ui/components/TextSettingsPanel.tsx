"use client";
/*
 * Documentation:
 * LowerHalfTextControl — https://app.subframe.com/11b10bc240cf/library?component=LowerHalfTextControl_75976a45-1519-4346-ae23-9dabb5226bf0
 * MainTextControl — https://app.subframe.com/11b10bc240cf/library?component=MainTextControl_e4ff4b67-10c4-42bc-9858-9354ca649270
 * PanelHeader — https://app.subframe.com/11b10bc240cf/library?component=PanelHeader_286b22f5-d2e6-41bd-bbab-508f594b21cc
 * RouteNumberControl — https://app.subframe.com/11b10bc240cf/library?component=RouteNumberControl_9619fde6-f09b-47b4-ad50-04123510ad59
 * TextSettingsPanel — https://app.subframe.com/11b10bc240cf/library?component=TextSettingsPanel_4a1acded-5433-4051-89f3-db7282cc2d47
 * UpperHalfTextControl — https://app.subframe.com/11b10bc240cf/library?component=UpperHalfTextControl_b90bd228-fb07-4b50-8df6-5bacedd402b3
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { LowerHalfTextControl } from "./LowerHalfTextControl";
import { MainTextControl } from "./MainTextControl";
import { PanelHeader } from "./PanelHeader";
import { RouteNumberControl } from "./RouteNumberControl";
import { UpperHalfTextControl } from "./UpperHalfTextControl";
import useSimulationStore from "@/store/useSimulationStore";
import useTabsStore from "@/store/useTabsStore";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";
import { useFormContext } from "react-hook-form";
import { RouteNumberControl1 } from "./RouteNumberControl1";
import { RouteNumberControl2 } from "./RouteNumberControl2";

interface TextSettingsPanelRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const TextSettingsPanelRoot = React.forwardRef<
  HTMLDivElement,
  TextSettingsPanelRootProps
>(function TextSettingsPanelRoot(
  { className, ...otherProps }: TextSettingsPanelRootProps,
  ref,
) {
    const methods = useFormContext<DisplayConfigPostRequest>();
  
    const {watch} = methods;
    const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore((state) => state.selectedSimulationIndex);
    const simulations = watch(selectedTab);
  const renderControls = () => {
    if (!simulations[selectedSimulationIndex])
      return (
        <div className="flex h-full w-full p-6 items-center justify-center">
          <p className="text-xs text-center font-heading-3  text-subtext-color">
            Select a simulation or add simulation to edit its text settings.
          </p>
        </div>
      );

    const { format } = simulations[selectedSimulationIndex];
    const isSplitRoute = watch('is_split_route')
    return (
      <>
        {(format === "two" || format === "three") && !isSplitRoute && <RouteNumberControl />}
        {(format === "three" || format === "two") && isSplitRoute && <>
        
        <RouteNumberControl1/>
        <RouteNumberControl2/>
        
        </>}
        {(format === "single" || format === "two") && <MainTextControl />}
        {format === "three" && (
          <>
            <UpperHalfTextControl />
            <LowerHalfTextControl />
          </>
        )}

      </>
    );
  };
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-64 flex-col items-start no-scrollbar border-l border-solid border-neutral-border overflow-y-auto",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <PanelHeader title="Text Settings" />

      {renderControls()}
    </div>
  );
});

export const TextSettingsPanel = TextSettingsPanelRoot;
