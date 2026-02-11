"use client";

import React from "react";
import {
  FeatherAirplay,
  FeatherHand,
  FeatherMic2,
  FeatherRoute,
  FeatherSpeech
} from "@subframe/core";
import useSimulationStore from "@/store/useSimulationStore";
import useTabsStore from "@/store/useTabsStore";
import { DisplayConfigPostRequest, Simulation } from "@/types/routeConfigV2";
import { useFormContext, useWatch } from "react-hook-form";
import { ControlAccordion } from "./ControlAccordion";
import { SelectionCardWithIcon } from "./SelectionCardWithIcon";
import { IconWithBackground } from "./IconWithBackground";

interface SimulationTypeControlRootProps extends React.ComponentProps<typeof ControlAccordion> {
  className?: string;
}

const simulationOptions = [
  { type: "route", icon: FeatherRoute, label: "Route Simulation" },
  { type: "slogan", icon: FeatherSpeech, label: "Slogan Simulation" },
  { type: "announcement", icon: FeatherHand, label: "Announcement" },
  { type: "special message", icon: FeatherMic2, label: "Special Message" }
];

const SimulationTypeControlRoot = React.forwardRef<
  React.ElementRef<typeof ControlAccordion>,
  SimulationTypeControlRootProps
>((props, ref) => {
  const { className, ...otherProps } = props;
  const { setValue } = useFormContext<DisplayConfigPostRequest>();
  const selectedTab = useTabsStore(state => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore(state => state.selectedSimulationIndex);
  const selectedSimulation: Simulation = useWatch({
    name: `${selectedTab}[${selectedSimulationIndex}]`,
  });

  const handleSelection = (type: string) => {
    setValue(`${selectedTab}[${selectedSimulationIndex}].type`, type);
  };
  
  return (
    <ControlAccordion
      className={className}
      title="Simulation Type"
      controls={
        <div className="w-full flex-col items-center justify-center gap-1 grid grid-cols-1">
          {simulationOptions.map((option) => (
            <SelectionCardWithIcon
              key={option.type}
              onClick={() => handleSelection(option.type)}
              selected={selectedSimulation.type === option.type}
              icon={<option.icon />}
              label={option.label}
            />
          ))}
        </div>
      }
      icon={
        <IconWithBackground
          size="small"
          icon={<FeatherAirplay />}
          square={false}
        />
      }
      ref={ref}
      {...otherProps}
    />
  );
});

export const SimulationTypeControl = SimulationTypeControlRoot;