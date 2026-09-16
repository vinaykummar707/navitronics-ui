"use client";
/*
 * Documentation:
 * Accordion — https://app.subframe.com/11b10bc240cf/library?component=Accordion_d2e81e20-863a-4027-826a-991d8910efd9
 * Badge — https://app.subframe.com/11b10bc240cf/library?component=Badge_97bdb082-1124-4dd7-a335-b14b822d0157
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * Radio Card Group — https://app.subframe.com/11b10bc240cf/library?component=Radio+Card+Group_6d5193b8-6043-4dc1-aad5-7f902ef872df
 * SimulationPlayerCard — https://app.subframe.com/11b10bc240cf/library?component=SimulationPlayerCard_ef3c3c00-bb4f-481e-abb4-6cd6adf3b275
 */
// @subframe/sync-disable
import React from "react";
import { FeatherAirplay } from "@subframe/core";
import { FeatherCopy } from "@subframe/core";
import { FeatherMoveDown } from "@subframe/core";
import { FeatherMoveUp } from "@subframe/core";
import { FeatherPause } from "@subframe/core";
import { FeatherPlay } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Accordion } from "./Accordion";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { IconWithBackground } from "./IconWithBackground";
import { RadioCardGroup } from "./RadioCardGroup";
import {
  DisplayConfigPostRequest,
  Screen,
  Simulation,
} from "@/types/routeConfigV2";
import { getSimulationCardText } from "@/utils/simulationUtils";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import useTabsStore from "@/store/useTabsStore";
import useSimulationStore from "@/store/useSimulationStore";
import DisplayEditor from "@/components/DisplayEditor";
import { supabase } from "@/supabaseClient";
import { useParams } from "react-router-dom";

interface SimulationPlayerCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  isSelected?: boolean;
  className?: string;
  simulation?: Simulation;
  listIndex?: number;
}

const SimulationPlayerCardRoot = React.forwardRef<
  HTMLDivElement,
  SimulationPlayerCardRootProps
>(function SimulationPlayerCardRoot(
  {
    isSelected = false,
    listIndex = 0,
    className,
    ...otherProps
  }: SimulationPlayerCardRootProps,
  ref,
) {
  const { watch, getValues, control, setValue } = useFormContext<DisplayConfigPostRequest>();
  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore(
    (state) => state.selectedSimulationIndex,
  );
  const setSelectedSimulationIndex = useSimulationStore(
    (state) => state.setSelectedSimulationIndex,
  );
  const { setSelectedSimulation } = useSimulationStore();
  const selectedSimulation: Simulation = watch(
    `${selectedTab}[${selectedSimulationIndex}]`,
  );

  const { areaId, depotId } = useParams<{ areaId: string; depotId: string }>();

  const handleRemoveSimulation = async (index: number) => {
    const currentSimulations = getValues(selectedTab) || [];
    const updatedSimulations = [...currentSimulations];
    updatedSimulations.splice(index, 1);
    setValue(selectedTab, updatedSimulations);
    if (index === selectedSimulationIndex) {
      setSelectedSimulationIndex(updatedSimulations.length > 0 ? Math.max(0, index - 1) : -1);
    } else if (index < selectedSimulationIndex) {
      setSelectedSimulationIndex(selectedSimulationIndex - 1);
    }
  };

  // duplicate simulation
  const handleDuplicateSimulation = (index: number) => {
    const currentSimulations = getValues(selectedTab) || [];
    const simulationToDuplicate = currentSimulations[index];
    if (!simulationToDuplicate) return;
    const newSimulation =
      typeof structuredClone === "function"
        ? structuredClone(simulationToDuplicate)
        : JSON.parse(JSON.stringify(simulationToDuplicate));
    const updatedSimulations = [...currentSimulations, newSimulation];
    setValue(selectedTab, updatedSimulations);
  };

  // move up simulation
  const handleMoveUpSimulation = (index: number) => {
    if (index === 0) return;
    const currentSimulations = getValues(selectedTab) || [];
    const updatedSimulations = [...currentSimulations];
    [updatedSimulations[index - 1], updatedSimulations[index]] = [
      updatedSimulations[index],
      updatedSimulations[index - 1],
    ];
    setValue(selectedTab, updatedSimulations);
    if (index === selectedSimulationIndex) {
      setSelectedSimulationIndex(index - 1);
    } else if (index - 1 === selectedSimulationIndex) {
      setSelectedSimulationIndex(index);
    }
  };

  // move down simulation
  const handleMoveDownSimulation = (index: number) => {
    const currentSimulations = getValues(selectedTab) || [];
    if (index === currentSimulations.length - 1) return;
    const updatedSimulations = [...currentSimulations];
    [updatedSimulations[index + 1], updatedSimulations[index]] = [
      updatedSimulations[index],
      updatedSimulations[index + 1],
    ];
    setValue(selectedTab, updatedSimulations);
    if (index === selectedSimulationIndex) {
      setSelectedSimulationIndex(index + 1);
    } else if (index + 1 === selectedSimulationIndex) {
      setSelectedSimulationIndex(index);
    }
  };

  //function to return the text based on the screen format
  const getSimulationCardText = () => {
    const sim = getValues(`${selectedTab}[${listIndex}]`) as Simulation;
    if (!sim) return "Slide";
    const { format } = sim;
    switch (format) {
      case "single":
        return getValues(`${selectedTab}[${listIndex}].texts.text.text`);
      case "two":
        return getValues(`${selectedTab}[${listIndex}].texts.text.text`);
      case "three":
        return getValues(`${selectedTab}[${listIndex}].texts.upperHalfText.text`);
      default:
        return "Route Simulation";
    }
  };

  const [pauseSimulation, setPauseSimulation] = React.useState(false);

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start gap-4",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start rounded-xl border border-solid transition-all overflow-hidden",
          isSelected
            ? "border-brand-primary ring-1 ring-brand-primary/50 shadow-md bg-brand-50/40"
            : "border-neutral-border bg-sidebar-background hover:border-brand-primary/40",
        )}
      >
        <Accordion
          onClick={() => {
            setSelectedSimulationIndex(listIndex);
          }}
          trigger={
            <div className="flex w-full items-center gap-3 px-4 py-3">
              <span className="px-2 py-0.5 rounded text-micro font-micro-bold font-mono bg-brand-500/10 text-brand-primary border border-brand-500/20">
                #{String(listIndex + 1).padStart(2, "0")}
              </span>
              <IconWithBackground
                variant="brand"
                size="small"
                icon={<FeatherAirplay />}
              />
              <span className="grow shrink-0 truncate line-clamp-1 basis-0 text-caption-bold font-caption-bold text-default-font">
                {getSimulationCardText() || "Untitled Slide"}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge className="capitalize text-micro" variant="warning">
                  {watch(`${selectedTab}[${listIndex}].type`)}
                </Badge>
                <Badge className="capitalize text-micro" variant="success">
                  {watch(`${selectedTab}[${listIndex}].format`)} Text
                </Badge>
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-subtext-color font-mono text-micro font-bold border border-neutral-border">
                  {watch(`${selectedTab}[${listIndex}].width`)}×{watch(`${selectedTab}[${listIndex}].height`)}
                </span>
              </div>
              <Accordion.Chevron />
            </div>
          }
          defaultOpen={true}
        >
          <div className="flex w-full flex-col items-start gap-3 px-4 pb-4">
            <RadioCardGroup className="h-auto w-full flex-none">
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 w-full">
                <DisplayEditor stopScroll={pauseSimulation} listIndex={listIndex} />

                {/* Sleek Action Toolbar */}
                <div className="flex w-full items-center justify-between gap-2 pt-2 border-t border-neutral-border">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={pauseSimulation ? "brand-secondary" : "neutral-secondary"}
                      size="small"
                      icon={pauseSimulation ? <FeatherPlay /> : <FeatherPause />}
                      onClick={() => setPauseSimulation((prev) => !prev)}
                    >
                      {pauseSimulation ? "Resume" : "Pause"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="neutral-secondary"
                      size="small"
                      icon={<FeatherCopy />}
                      onClick={() => handleDuplicateSimulation(listIndex)}
                      title="Duplicate Slide"
                    >
                      Duplicate
                    </Button>
                    <Button
                      variant="neutral-secondary"
                      size="small"
                      icon={<FeatherMoveUp />}
                      disabled={listIndex === 0}
                      onClick={() => handleMoveUpSimulation(listIndex)}
                      title="Move Up"
                    >
                      Up
                    </Button>
                    <Button
                      variant="neutral-secondary"
                      size="small"
                      icon={<FeatherMoveDown />}
                      disabled={listIndex === (getValues(selectedTab) || []).length - 1}
                      onClick={() => handleMoveDownSimulation(listIndex)}
                      title="Move Down"
                    >
                      Down
                    </Button>
                    <Button
                      variant="destructive-secondary"
                      size="small"
                      icon={<FeatherTrash />}
                      onClick={() => handleRemoveSimulation(listIndex)}
                      title="Delete Slide"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </RadioCardGroup>
          </div>
        </Accordion>
      </div>
    </div>
  );
});

export const SimulationPlayerCard = React.memo(SimulationPlayerCardRoot);
