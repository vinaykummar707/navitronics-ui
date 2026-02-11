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

const simulationFormats = [
  { type: "single", Icon: FeatherRectangleHorizontal, defaultFunc: getDefaultSingleSimulation, label: "Single" },
  { type: "two", Icon: FeatherColumns, defaultFunc: getDefaultTwoSimulation, label: "Two" },
  { type: "three", Icon: FeatherRows3, defaultFunc: getDefaultThreeSimulation, label: "Three" }
];

const FormatSelectionControlRoot = React.forwardRef<
  React.ElementRef<typeof ControlAccordion>,
  FormatSelectionControlRootProps
>(({ className, ...otherProps }, ref) => {
  const { setValue } = useFormContext<DisplayConfigPostRequest>();
  const selectedSimulationIndex = useSimulationStore((state) => state.selectedSimulationIndex);
  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulation = useFormContext().watch(`${selectedTab}[${selectedSimulationIndex}]`);

  const handleFormatChange = (formatType: string) => {
    const format = simulationFormats.find(f => f.type === formatType);
    if (format) {
      setValue(`${selectedTab}[${selectedSimulationIndex}]`, {
        ...format.defaultFunc(format.label),
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