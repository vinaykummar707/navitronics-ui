"use client";
/*
 * Documentation:
 * RouteCreationHeader — https://app.subframe.com/11b10bc240cf/library?component=RouteCreationHeader_2c1f8c72-5508-4e9b-9575-25f7e76705fb
 * RouteCreationLayout — https://app.subframe.com/11b10bc240cf/library?component=RouteCreationLayout_4b11b654-1ecc-4f37-a317-20f9b75b32e1
 * RouteSettingsPanel — https://app.subframe.com/11b10bc240cf/library?component=RouteSettingsPanel_3c29757f-eb43-4b44-a993-fa6a60e8cd92
 * SimulationSettingsPanel — https://app.subframe.com/11b10bc240cf/library?component=SimulationSettingsPanel_0df56ea1-d9ba-4b7a-8f9a-27e6e907b44d
 * SimulationsPlayerPanel — https://app.subframe.com/11b10bc240cf/library?component=SimulationsPlayerPanel_75abdfca-b495-4e48-b001-16b705951f40
 * TextSettingsPanel — https://app.subframe.com/11b10bc240cf/library?component=TextSettingsPanel_4a1acded-5433-4051-89f3-db7282cc2d47
 */
// @subframe/sync-disable
import React from "react";
import * as SubframeUtils from "../utils";
import { RouteCreationHeader } from "./RouteCreationHeader";
import { RouteSettingsPanel } from "./RouteSettingsPanel";
import { SimulationSettingsPanel } from "./SimulationSettingsPanel";
import { SimulationsPlayerPanel } from "./SimulationsPlayerPanel";
import { TextSettingsPanel } from "./TextSettingsPanel";
import useToggleStore from "@/store/useToggleStore";

interface RouteCreationLayoutRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  mode?: "create" | "edit";
}

const RouteCreationLayoutRoot = React.forwardRef<
  HTMLDivElement,
  RouteCreationLayoutRootProps
>(function RouteCreationLayoutRoot(
  { className, mode, ...otherProps }: RouteCreationLayoutRootProps,
  ref
) {

  const {isSimulationSettingsPanelOpen,isTextSettingsPanelOpen,isRouteSettingsPanelOpen} = useToggleStore();
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col items-start bg-default-background",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <RouteCreationHeader mode={mode} />
      <div className="flex w-full grow shrink-0 basis-0 items-start overflow-hidden">
        {isRouteSettingsPanelOpen && <RouteSettingsPanel className="h-auto w-72 flex-none self-stretch" />}
        <SimulationsPlayerPanel />
        {isSimulationSettingsPanelOpen && <SimulationSettingsPanel  className="h-auto w-72 flex-none self-stretch" />}
        {isTextSettingsPanelOpen && <TextSettingsPanel   className="h-auto w-72 flex-none self-stretch"/>}
      </div>
    </div>
  );
});

export const RouteCreationLayout = RouteCreationLayoutRoot;
