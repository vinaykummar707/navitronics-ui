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
import { get } from "node:http";
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

  const simulations = watch(selectedTab);
  const audioFileUrl = watch(`${selectedTab}[${selectedSimulationIndex}].audioFileUrl`);

const handleRemoveSimulation = async (index: number) => {
  const updatedSimulations = [...simulations];
  updatedSimulations.splice(index, 1);
  setValue(selectedTab, updatedSimulations);
  // If the removed simulation is the currently selected one, reset the selection
  if (index === selectedSimulationIndex) {
    setSelectedSimulationIndex(-1);
  }
  console.log(audioFileUrl);
  if (audioFileUrl) {
    // Extract the file path relative to the 'stops' bucket
    const pathMatch = audioFileUrl.match(/\/stops\/(.+)$/);
    const filePath = pathMatch ? pathMatch[1] : null;
    console.log("Deleting file from Supabase Storage at path:", filePath);
    if (filePath) {
      const { error } = await supabase.storage.from("stops").remove([filePath]);
      if (error) {
        console.error("Error deleting file from Supabase Storage:", error);
      }
    }
  }
};

  // duplicate simulation
  const handleDuplicateSimulation = (index: number) => {
    const simulationToDuplicate = simulations[index];
    const newSimulation = { ...simulationToDuplicate };
    const updatedSimulations = [...simulations, newSimulation];
    setValue(selectedTab, updatedSimulations);
  };


  // move up simulation
  const handleMoveUpSimulation = (index: number) => {
    if (index === 0) return;
    const updatedSimulations = [...simulations];
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
    if (index === simulations.length - 1) return;
    const updatedSimulations = [...simulations];
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
    const { format } = getValues(`${selectedTab}[${listIndex}]`) as Simulation;
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
        "group/ef3c3c00 flex  flex-col items-start gap-4",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background hover:bg-neutral-50",
          { "border border-solid border-brand-800": isSelected },
        )}
      >
        <Accordion
          onClick={() => {
            setSelectedSimulationIndex(listIndex);
            // console.log("Selected Simulation Index:", listIndex);
            // console.log("Selected Simulation:", getValues(`${selectedTab}[${listIndex}]`));
            // setSelectedSimulation(getValues(`${selectedTab}[${listIndex}]`));
          }}
          trigger={
            <div className="flex w-full items-center gap-4 px-4 py-4">
              <IconWithBackground
                variant="success"
                size="medium"
                icon={<FeatherAirplay />}
              />
              <span className="grow shrink-0  truncate line-clamp-1 basis-0 text-body-bold font-body-bold text-default-font">
                {getSimulationCardText()}
              </span>
              <div className="flex items-center gap-1">
                <Badge className="capitalize" variant="warning">
                  {" "}
                  {watch(`${selectedTab}[${listIndex}].type`)}{" "}
                  Simulation
                </Badge>
                <Badge className="capitalize" variant="success">
                  {watch(`${selectedTab}[${listIndex}].format`)} Text
                </Badge>
                <Badge className="capitalize" variant="warning">
                  {watch(`${selectedTab}[${listIndex}].height`)} Height
                </Badge>
                <Badge className="capitalize" variant="error">
                  {watch(`${selectedTab}[${listIndex}].width`)} Width
                </Badge>
              </div>
              <Accordion.Chevron />
            </div>
          }
          defaultOpen={true}
        >
          <div className="flex w-full  flex-col items-start gap-4 px-4 pb-4">
            <RadioCardGroup className="h-auto w-full flex-none">
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
                <DisplayEditor stopScroll={pauseSimulation} listIndex={listIndex} />

                <div className="flex w-full items-start gap-1">
                  <Button
                    className="h-9 grow shrink-0 basis-0"
                    disabled={false}
                    variant="neutral-primary"
                    size="medium"
                    icon={<FeatherPlay />}
                    loading={false}
                    onClick={() => setPauseSimulation((prev) => !prev)}
                  >
                    {pauseSimulation ? "Play" : "Pause"}
                  </Button>
                  <Button
                    className="h-9 grow shrink-0 basis-0"
                    disabled={false}
                    variant="neutral-primary"
                    size="medium"
                    icon={<FeatherCopy />}
                    iconRight={null}
                    loading={false}
                    onClick={() => handleDuplicateSimulation(listIndex)}
                  >
                    Duplicate
                  </Button>
                  <Button
                    className="h-9 grow shrink-0 basis-0"
                    disabled={false}
                    variant="neutral-primary"
                    size="medium"
                    icon={<FeatherMoveUp />}
                    iconRight={null}
                    loading={false}
                    onClick={() => handleMoveUpSimulation(listIndex)}
                  >
                    Move Up
                  </Button>
                  <Button
                    className="h-9 grow shrink-0 basis-0"
                    disabled={false}
                    variant="neutral-primary"
                    size="medium"
                    icon={<FeatherMoveDown />}
                    iconRight={null}
                    loading={false}
                    onClick={() => handleMoveDownSimulation(listIndex)}
                  >
                    Move Down
                  </Button>
                  <Button
                    className="h-9 grow shrink-0 basis-0"
                    disabled={false}
                    variant="neutral-primary"
                    size="medium"
                    icon={<FeatherTrash />}
                    iconRight={null}
                    loading={false}
                    onClick={() => handleRemoveSimulation(listIndex)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </RadioCardGroup>
          </div>
        </Accordion>
      </div>
    </div>
  );
});

export const SimulationPlayerCard = SimulationPlayerCardRoot;
