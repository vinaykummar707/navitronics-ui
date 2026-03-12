"use client";

import React from "react";
import {
  FeatherAirplay,
  FeatherHand,
  FeatherMic2,
  FeatherRoute,
  FeatherSpeech,
} from "@subframe/core";
import useSimulationStore from "@/store/useSimulationStore";
import useTabsStore from "@/store/useTabsStore";
import {
  DisplayConfigPostRequest,
  Simulation,
  SimulationType,
} from "@/types/routeConfigV2";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ControlAccordion } from "./ControlAccordion";
import { SelectionCardWithIcon } from "./SelectionCardWithIcon";
import { IconWithBackground } from "./IconWithBackground";
import { watch } from "node:fs";
import {
  DEFAULT_SIMULATION_TYPE,
  getDefaultSingleSimulation,
  getDefaultThreeSimulation,
  getDefaultTwoSimulation,
} from "@/constants/defaultRouteValues";

interface SimulationTypeControlRootProps extends React.ComponentProps<
  typeof ControlAccordion
> {
  className?: string;
}

const simulationOptions = [
  { type: "route", icon: FeatherRoute, label: "Route Simulation" },
  { type: "slogan", icon: FeatherSpeech, label: "Slogan Simulation" },
  { type: "stop", icon: FeatherHand, label: "Stop Simulation" },
  { type: "special message", icon: FeatherMic2, label: "Special Message" },
];

const SimulationTypeControlRoot = React.forwardRef<
  React.ElementRef<typeof ControlAccordion>,
  SimulationTypeControlRootProps
>((props, ref) => {
  const { className, ...otherProps } = props;

  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore(
    (state) => state.selectedSimulationIndex,
  );
 

  const methods = useFormContext<DisplayConfigPostRequest>();
  const { setValue, watch, getValues } = methods;
  const { fields, append } = useFieldArray({
    control: methods.control,
    name: selectedTab,
  });

   const selectedSimulation: Simulation = watch(
    `${selectedTab}[${selectedSimulationIndex}]`,
  );

  // function to return combined text from passed string array
  const generateCombinations = (texts: (string | undefined)[]): string => {
    return texts.filter(Boolean).join(" - ");
  };

  // function to append a new Simulation into the "front" field array
  const handleAddSimulation = (
    format: string,
    type: SimulationType = DEFAULT_SIMULATION_TYPE,
    defaultText?: string,
  ) => {
    let newSimulation;
    const isSplitRoute = watch("is_split_route");
    switch (format) {
      case "single":
        newSimulation =
          type === "route"
            ? getDefaultSingleSimulation(
                generateCombinations([
                  isSplitRoute
                    ? getValues("route_number_1") +
                      "/" +
                      getValues("route_number_2")
                    : getValues("route_number"),
                  getValues("source"),
                  getValues("destination"),
                  getValues("via"),
                ]),
                type,
              )
            : getDefaultSingleSimulation(
                generateCombinations([defaultText || "Single Text Simulation"]),
                type,
              );
        break;
      case "two":
        newSimulation = getDefaultTwoSimulation(
          generateCombinations([getValues("route_number")]),
          generateCombinations([
            getValues("source"),
            getValues("destination"),
            getValues("via"),
          ]),
          type,
          getValues("route_number_1"),
          getValues("route_number_2"),
          isSplitRoute,
        );
        break;
      case "three":
        newSimulation = getDefaultThreeSimulation(
          generateCombinations([getValues("route_number")]),
          generateCombinations([getValues("source"), getValues("destination")]),
          generateCombinations([getValues("via")]),
          type,
          getValues("route_number_1"),
          getValues("route_number_2"),
          isSplitRoute,
        );
        break;
      default:
        console.warn("Unsupported format for adding simulation:", format);
        return;
    }

    setValue(`${selectedTab}[${selectedSimulationIndex}]`, newSimulation);
  };
  const handleSelection = (type: string) => {
    
    if (type === "route") {
      handleAddSimulation("single", "route");
    }
    if (type === "slogan") {
      handleAddSimulation("single", "slogan", "THIS IS A SLOGAN SIMULATION");
    }
    if (type === "special message") {
      handleAddSimulation("single", "special message", "THIS IS A SPECIAL MESSAGE SIMULATION");
    }
  };
  const renderSelectionCards = (filterCondition: boolean) => {
    const filteredOptions = simulationOptions.filter((option) =>
      filterCondition ? option.type === "stop" : option.type !== "stop",
    );

    return filteredOptions.map((option) => (
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
          {selectedTab === "stops"
            ? renderSelectionCards(true)
            : renderSelectionCards(false)}
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
