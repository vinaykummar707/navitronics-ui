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
import { useFormContext, useWatch } from "react-hook-form";
import useTabsStore from "@/store/useTabsStore";
import useSimulationStore from "@/store/useSimulationStore";
import { get } from "node:http";

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
  const { watch, getValues } = useFormContext<DisplayConfigPostRequest>();
  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore(
    (state) => state.selectedSimulationIndex,
  );
  const setSelectedSimulationIndex = useSimulationStore(
    (state) => state.setSelectedSimulationIndex,
  );
  const selectedSimulation: Simulation = watch(
    `${selectedTab}[${selectedSimulationIndex}]`,
  );

  //function to return the text based on the screen format
  const getSimulationCardText = () => {
    const { format } = getValues(`${selectedTab}[${listIndex}]`) as Simulation;
    switch (format) {
      case "single":
        return getValues(`${selectedTab}[${listIndex}].texts.text.text`) ;
      case "two":
        return getValues(`${selectedTab}[${listIndex}].texts.text.text`) ;
      case "three":
        return getValues(`${selectedTab}[${listIndex}].texts.upperHalfText.text`) ;
      default:
        return "Route Simulation";
    }
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/ef3c3c00 flex w-full flex-col items-start gap-4",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start rounded-md border border-solid border-neutral-border bg-neutral-50",
          { "border border-solid border-brand-400": isSelected },
        )}
      >
        <Accordion
          onClick={() => setSelectedSimulationIndex(listIndex)}
          trigger={
            <div className="flex w-full items-center gap-4 px-4 py-4">
              <IconWithBackground
                variant="success"
                size="medium"
                icon={<FeatherAirplay />}
              />
              <span className="grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
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
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 px-4 pb-4">
            <RadioCardGroup className="h-auto w-full flex-none">
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
                <div className="flex h-24 w-full flex-none flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-2 py-2" />
                <div className="flex w-full items-start gap-1">
                  <Button
                    className="h-9 grow shrink-0 basis-0"
                    disabled={false}
                    variant="neutral-secondary"
                    size="medium"
                    icon={<FeatherPlay />}
                    loading={false}
                  >
                    Play
                  </Button>
                  <Button
                    className="h-9 grow shrink-0 basis-0"
                    disabled={false}
                    variant="neutral-secondary"
                    size="medium"
                    icon={<FeatherCopy />}
                    iconRight={null}
                    loading={false}
                  >
                    Duplicate
                  </Button>
                  <Button
                    className="h-9 grow shrink-0 basis-0"
                    disabled={false}
                    variant="neutral-secondary"
                    size="medium"
                    icon={<FeatherMoveUp />}
                    iconRight={null}
                    loading={false}
                  >
                    Move Up
                  </Button>
                  <Button
                    className="h-9 grow shrink-0 basis-0"
                    disabled={false}
                    variant="neutral-secondary"
                    size="medium"
                    icon={<FeatherMoveDown />}
                    iconRight={null}
                    loading={false}
                  >
                    Move Down
                  </Button>
                  <Button
                    className="h-9 grow shrink-0 basis-0"
                    disabled={false}
                    variant="neutral-secondary"
                    size="medium"
                    icon={<FeatherTrash />}
                    iconRight={null}
                    loading={false}
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
