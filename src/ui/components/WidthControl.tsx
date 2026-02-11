"use client";
/*
 * Documentation:
 * ControlAccordion — https://app.subframe.com/11b10bc240cf/library?component=ControlAccordion_02fd28eb-e693-4480-aa67-324390fa558c
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * SelectionCardWithText — https://app.subframe.com/11b10bc240cf/library?component=SelectionCardWithText_ddf3d814-92a8-485d-84fb-a8a0af6dd41e
 * WidthControl — https://app.subframe.com/11b10bc240cf/library?component=WidthControl_78413c09-bee6-4d5f-a6b2-4bb68f45b0cf
 */

import React from "react";
import { FeatherMoveHorizontal } from "@subframe/core";
import { ControlAccordion } from "./ControlAccordion";
import { IconWithBackground } from "./IconWithBackground";
import { SelectionCardWithText } from "./SelectionCardWithText";
import { DisplayConfigPostRequest, Simulation } from "@/types/routeConfigV2";
import { useFormContext, useWatch } from "react-hook-form";
import useSimulationStore from "@/store/useSimulationStore";
import useTabsStore from "@/store/useTabsStore";

interface WidthControlRootProps
  extends React.ComponentProps<typeof ControlAccordion> {
  className?: string;
}

const WidthControlRoot = React.forwardRef<
  React.ElementRef<typeof ControlAccordion>,
  WidthControlRootProps
>((props, ref) => {
  const { className, ...otherProps } = props;
  const { setValue } = useFormContext<DisplayConfigPostRequest>();
  const selectedTab = useTabsStore(state => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore(state => state.selectedSimulationIndex);
  const selectedSimulation: Simulation = useWatch({
    name: `${selectedTab}[${selectedSimulationIndex}]`,
  });

  // Helper function to create width selection cards
  const createWidthSelectionCard = (width: number, title: string) => (
    <SelectionCardWithText
      key={width}
      onClick={() => setValue(`${selectedTab}[${selectedSimulationIndex}].width`, width)}
      selected={selectedSimulation.width === width}
      title={title}
    />
  );

  const widths = [64, 96, 128, 160, 192, 224]; // Define the width options

  return (
    <ControlAccordion
      className={className}
      title="Width"
      controls={
        <div className="w-full flex-col items-center justify-center gap-1 grid grid-cols-2">
          {widths.map((width, index) => createWidthSelectionCard(width, width.toString()))}
        </div>
      }
      icon={
        <IconWithBackground
          variant="error"
          size="small"
          icon={<FeatherMoveHorizontal />}
          square={false}
        />
      }
      ref={ref}
      {...otherProps}
    />
  );
});

export const WidthControl = WidthControlRoot;
