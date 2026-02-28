import React from "react";
import { FeatherBaseline, FeatherColumns, FeatherRectangleHorizontal, FeatherRows3 } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { DisplayConfigPostRequest, SIMULATION_FORMATS } from "@/types/routeConfigV2";
import { useFormContext } from "react-hook-form";
import { getDefaultSingleSimulation, getDefaultThreeSimulation, getDefaultTwoSimulation } from "@/constants/defaultRouteValues";
import useSimulationStore from "@/store/useSimulationStore";
import useTabsStore from "@/store/useTabsStore";
import { ControlAccordion } from "./ControlAccordion";
import { IconWithBackground } from "./IconWithBackground";
import { SelectionCardWithIcon } from "./SelectionCardWithIcon";

interface FormatSelectionControlRootProps extends React.ComponentProps<typeof ControlAccordion> {
  className?: string;
}



// function to generate combinations of

const FormatSelectionControlRoot = React.forwardRef<
  React.ElementRef<typeof ControlAccordion>,
  FormatSelectionControlRootProps
>(({ className, ...otherProps }, ref) => {
  const { setValue, watch, getValues } = useFormContext<DisplayConfigPostRequest>();
  const selectedSimulationIndex = useSimulationStore((state) => state.selectedSimulationIndex);
  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulation = watch(`${selectedTab}[${selectedSimulationIndex}]`);
  const generateCombinations = (texts: (string | undefined)[]): string => {
    return texts.filter(Boolean).join(" - ");
  };
  const isSplitRoute = watch("is_split_route");

  const simulationFormats = [
    {
      type: "single", Icon: FeatherRectangleHorizontal, defaultFunc: getDefaultSingleSimulation, label: "Single"
    },
    {
      type: "two", Icon: FeatherColumns, defaultFunc: getDefaultTwoSimulation(
        generateCombinations([getValues("route_number")]),
        generateCombinations([
          getValues("source"),
          getValues("destination"),
          getValues("via"),
        ]),
        'route',
        getValues("route_number_1"),
        getValues("route_number_2"),
        isSplitRoute,
      ), label: "Two"
    },
    {
      type: "three", Icon: FeatherRows3, defaultFunc: getDefaultThreeSimulation(
        generateCombinations([getValues("route_number")]),
        generateCombinations([getValues("source"), getValues("destination")]),
        generateCombinations([getValues("via")]),
        'route',
        getValues("route_number_1"),
        getValues("route_number_2"),
        isSplitRoute,
      ), label: "Three"
    }
  ];
 

  const formatFunctions = (format: string) => {
    let newSimulation;
    switch (format) {
      case "single":
        newSimulation = getDefaultSingleSimulation(
          generateCombinations([
            isSplitRoute ? getValues("route_number_1") + "/" + getValues("route_number_2") : getValues("route_number"),
            getValues("source"),
            getValues("destination"),
            getValues("via"),
          ]),
          'route',
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
          'route',
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
          'route',
          getValues("route_number_1"),
          getValues("route_number_2"),
          isSplitRoute,
        );
        break;
      default:
        console.warn("Unsupported format for adding simulation:", format);
        return;
    }

    return newSimulation;
  }

   const handleFormatChange = (formatType: string) => {
    const format = simulationFormats.find(f => f.type === formatType);
    if (format) {
      setValue(`${selectedTab}[${selectedSimulationIndex}]`, {
        ...formatFunctions(formatType),
        height: selectedSimulation?.height,
        width: selectedSimulation?.width,
      });
    }
  };

  return (
    <ControlAccordion
      className={className}
      title="Format"
      controls={
        <div className="w-full flex-col items-center justify-center gap-1 grid grid-cols-2">
          {simulationFormats.map((format) => (
            <SelectionCardWithIcon
              key={format.type}
              onClick={() => handleFormatChange(format.type)}
              icon={<format.Icon />}
              label={format.label}
              selected={selectedSimulation?.format === format.type}
            />
          ))}
        </div>
      }
      icon={<IconWithBackground variant="error" size="small" icon={<FeatherBaseline />} square={false} />}
      ref={ref}
      {...otherProps}
    />
  );
});

export const FormatSelectionControl = FormatSelectionControlRoot;