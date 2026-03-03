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
import { watch } from "node:fs";

interface SimulationTypeControlRootProps extends React.ComponentProps<typeof ControlAccordion> {
  className?: string;
}

const simulationOptions = [
  { type: "route", icon: FeatherRoute, label: "Route Simulation" },
  { type: "slogan", icon: FeatherSpeech, label: "Slogan Simulation" },
  { type: "stop", icon: FeatherHand, label: "Stop Simulation" },
  { type: "special message", icon: FeatherMic2, label: "Special Message" }
];

const SimulationTypeControlRoot = React.forwardRef<
  React.ElementRef<typeof ControlAccordion>,
  SimulationTypeControlRootProps
>((props, ref) => {
  const { className, ...otherProps } = props;
  const { setValue,watch } = useFormContext<DisplayConfigPostRequest>();
  const selectedTab = useTabsStore(state => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore(state => state.selectedSimulationIndex);
  const selectedSimulation: Simulation = watch(`${selectedTab}[${selectedSimulationIndex}]`);

  const handleSelection = (type: string) => {
    setValue(`${selectedTab}[${selectedSimulationIndex}].type`, type);
  };
  

  const renderSelectionCards = (filterCondition: boolean) => {
    const filteredOptions = simulationOptions.filter(option => filterCondition ? option.type === "stop" : option.type !== "stop");
    
    return filteredOptions.map(option => (
      <SelectionCardWithIcon
        key={option.type}
        onClick={() => handleSelection(option.type)}
        selected={selectedSimulation.type === option.type}
        icon={<option.icon />}
        label={option.label}
      />
    ));
    };
    
  return (
    <ControlAccordion
      className={className}
      title="Simulation Type"
      controls={
        <div className="w-full flex-col items-center justify-center gap-1 grid grid-cols-1">
           {selectedTab === 'stops' ? renderSelectionCards(true) : renderSelectionCards(false)}
        
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