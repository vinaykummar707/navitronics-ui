"use client";

import React from "react";
import { FeatherMoveVertical } from "@subframe/core";
import { useFormContext, useWatch } from "react-hook-form";
import { DisplayConfigPostRequest, Simulation } from "@/types/routeConfigV2";
import useSimulationStore from "@/store/useSimulationStore";
import useTabsStore from "@/store/useTabsStore";
import { ControlAccordion } from "./ControlAccordion";
import { IconWithBackground } from "./IconWithBackground";
import { SelectionCardWithText } from "./SelectionCardWithText";
interface HeightControlRootProps extends React.ComponentProps<typeof ControlAccordion> {
  className?: string;
}

const heightOptions = [
  { height: 16, title: "16" },
  { height: 32, title: "32" }
];

const HeightControlRoot = React.forwardRef<
  React.ElementRef<typeof ControlAccordion>,
  HeightControlRootProps
>((props, ref) => {
  const { className, ...otherProps } = props;
  const { setValue, watch } = useFormContext<DisplayConfigPostRequest>();
  const selectedTab = useTabsStore(state => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore(state => state.selectedSimulationIndex);
  const selectedSimulation:Simulation = watch(`${selectedTab}[${selectedSimulationIndex}]`);

  const changeHeight = (heightValue) => {
    setValue(`${selectedTab}[${selectedSimulationIndex}].height`, heightValue);
  };
  
  return (
    <ControlAccordion
      className={className}
      title="Height"
      controls={
        <div className="w-full flex-wrap items-center justify-center gap-1 grid grid-cols-2">
          {heightOptions.map((option) => (
            <SelectionCardWithText
              key={option.title}
              onClick={() => changeHeight(option.height)}
              selected={selectedSimulation.height === option.height}
              title={option.title}
            />
          ))}
        </div>
      }
      icon={
        <IconWithBackground
          variant="warning"
          size="small"
          icon={<FeatherMoveVertical />}
          square={false}
        />
      }
      ref={ref}
      {...otherProps}
    />
  );
});

export const HeightControl = HeightControlRoot;