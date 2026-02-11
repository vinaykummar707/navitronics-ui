"use client";
/*
 * Documentation:
 * ControlAccordion — https://app.subframe.com/11b10bc240cf/library?component=ControlAccordion_02fd28eb-e693-4480-aa67-324390fa558c
 * FormatSelectionControl — https://app.subframe.com/11b10bc240cf/library?component=FormatSelectionControl_39266a01-1738-455d-a867-d19c3c6c2938
 * HeightControl — https://app.subframe.com/11b10bc240cf/library?component=HeightControl_c59f947a-0310-4574-b7c8-ba7e56d2f8f5
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * PanelHeader — https://app.subframe.com/11b10bc240cf/library?component=PanelHeader_286b22f5-d2e6-41bd-bbab-508f594b21cc
 * SelectionCardWithText — https://app.subframe.com/11b10bc240cf/library?component=SelectionCardWithText_ddf3d814-92a8-485d-84fb-a8a0af6dd41e
 * SimulationSettingsPanel — https://app.subframe.com/11b10bc240cf/library?component=SimulationSettingsPanel_0df56ea1-d9ba-4b7a-8f9a-27e6e907b44d
 * SimulationTypeControl — https://app.subframe.com/11b10bc240cf/library?component=SimulationTypeControl_1a8f29d0-cff7-4376-987d-bb3fa1be4b7d
 * WidthControl — https://app.subframe.com/11b10bc240cf/library?component=WidthControl_78413c09-bee6-4d5f-a6b2-4bb68f45b0cf
 */

import React, { useEffect } from "react";
import { FeatherCopy } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { ControlAccordion } from "./ControlAccordion";
import { FormatSelectionControl } from "./FormatSelectionControl";
import { HeightControl } from "./HeightControl";
import { IconWithBackground } from "./IconWithBackground";
import { PanelHeader } from "./PanelHeader";
import { SelectionCardWithText } from "./SelectionCardWithText";
import { SimulationTypeControl } from "./SimulationTypeControl";
import { WidthControl } from "./WidthControl";
import useSimulationStore from "@/store/useSimulationStore";
import { useFormContext, useWatch } from "react-hook-form";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";
import useTabsStore from "@/store/useTabsStore";
import { set } from "zod";

interface SimulationSettingsPanelRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SimulationSettingsPanelRoot = React.forwardRef<
  HTMLDivElement,
  SimulationSettingsPanelRootProps
>(function SimulationSettingsPanelRoot(
  { className, ...otherProps }: SimulationSettingsPanelRootProps,
  ref,
) {
  const methods = useFormContext<DisplayConfigPostRequest>();
  const {watch} = methods;
  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulation = useSimulationStore((state) => state.selectedSimulation);
  const selectedSimulationIndex = useSimulationStore((state) => state.selectedSimulationIndex);
  const setSelectedSimulation = useSimulationStore((state) => state.setSelectedSimulation);
  const simulations = watch(selectedTab);



  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-64 flex-col items-start overflow-y-auto",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <PanelHeader title="Simulation Settings" />
      {simulations[selectedSimulationIndex]  && (
        <>
          <SimulationTypeControl />
          <FormatSelectionControl />
          <HeightControl />
          <WidthControl />
          <ControlAccordion
            title="Copy Simulations"
            controls={
              <div className="w-full items-center justify-center gap-1 grid grid-cols-2">
                <SelectionCardWithText title="Front" />
                <SelectionCardWithText title="Side" />
                <SelectionCardWithText title="Rear" />
                <SelectionCardWithText title="Internal" />
              </div>
            }
            icon={
              <IconWithBackground
                variant="warning"
                size="small"
                icon={<FeatherCopy />}
                square={false}
              />
            }
          />
        </>
      )}
      {!simulations[selectedSimulationIndex]  && (
        <div className="flex h-full w-full p-6 items-center justify-center">
          <p className="text-xs text-center font-heading-3  text-subtext-color">
            Select a simulation or add simulation to edit its settings.
          </p>
        </div>
      )}
    </div>
  );
});

export const SimulationSettingsPanel = SimulationSettingsPanelRoot;
