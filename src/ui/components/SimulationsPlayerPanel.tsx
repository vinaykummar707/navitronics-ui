"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Dropdown Menu — https://app.subframe.com/11b10bc240cf/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * SimulationPlayerCard — https://app.subframe.com/11b10bc240cf/library?component=SimulationPlayerCard_ef3c3c00-bb4f-481e-abb4-6cd6adf3b275
 * SimulationsPlayerPanel — https://app.subframe.com/11b10bc240cf/library?component=SimulationsPlayerPanel_75abdfca-b495-4e48-b001-16b705951f40
 * StopDetailsCard — https://app.subframe.com/11b10bc240cf/library?component=StopDetailsCard_b89cf4a1-9cb9-461a-95a5-a9cab69cafa1
 * TabsPanel — https://app.subframe.com/11b10bc240cf/library?component=TabsPanel_ebc70a28-cb3a-45d5-8906-b6431bea5c62
 */
// @subframe/sync-disable
import React, { useEffect } from "react";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherStar } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { DropdownMenu } from "./DropdownMenu";
import { SimulationPlayerCard } from "./SimulationPlayerCard";
import { StopDetailsCard } from "./StopDetailsCard";
import { TabsPanel } from "./TabsPanel";
import {
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { DisplayConfigPostRequest, Simulation } from "@/types/routeConfigV2";
import {
  getDefaultSingleSimulation,
  getDefaultTwoSimulation,
  getDefaultThreeSimulation,
} from "@/constants/defaultRouteValues";
import { get } from "node:http";
import useTabsStore from "@/store/useTabsStore";
import useSimulationStore from "@/store/useSimulationStore";

interface SimulationsPlayerPanelRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SimulationsPlayerPanelRoot = React.forwardRef<
  HTMLDivElement,
  SimulationsPlayerPanelRootProps
>(function SimulationsPlayerPanelRoot(
  { className, ...otherProps }: SimulationsPlayerPanelRootProps,
  ref,
) {
  const methods = useFormContext<DisplayConfigPostRequest>();
  const { getValues, watch, setValue } = methods;

  // get all fields from the selected tab  field array to display in the UI
  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulation = useSimulationStore(
    (state) => state.selectedSimulation,
  );
  const setSelectedSimulation = useSimulationStore(
    (state) => state.setSelectedSimulation,
  );
  const selectedSimulationIndex = useSimulationStore(
    (state) => state.selectedSimulationIndex,
  );

  const simulations: Simulation[] = watch(selectedTab);

  // by default select the first simulation in the list when the component mounts or when the selected tab changes
  useEffect(() => {
    console.log('index', selectedSimulationIndex)
    console.log('simulations', simulations[selectedSimulationIndex])
    if (simulations.length > 0) {
      setSelectedSimulation(simulations[selectedSimulationIndex]);
    } else {
      setSelectedSimulation(null);
    }
  }, [simulations, selectedSimulationIndex, setSelectedSimulation]);

  // function to append a new Simulation into the "front" field array
  const handleAddSimulation = (format: string) => {
    console.log("Selected Tab for adding simulation:", selectedTab);
    console.log(
      "Current values of the selected tab field array:",
      getValues(selectedTab),
    );
    switch (format) {
      case "single":
        setValue(selectedTab, [
          ...getValues(selectedTab),
          getDefaultSingleSimulation('Single Text Route Simulation'),
        ]);
        break;
      case "two":
        setValue(selectedTab, [
          ...getValues(selectedTab),
          getDefaultTwoSimulation('123','Two Text Route Simulation'),
        ]);
        break;
      case "three":
        // For three simulation simulation, we can default to single simulation and let the user change it to three simulation in the settings if needed
        setValue(selectedTab, [
          ...getValues(selectedTab),
          getDefaultThreeSimulation('123','Upper Half Text Simulation','Lower Half Text Simulation'),
        ]);
        break;
      default:
        console.warn("Unsupported format for adding simulation:", format);
    }
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full overflow-hidden flex-col items-start border-x border-solid border-neutral-border overflow-hidden",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <TabsPanel />
      <div className="flex w-full overflow-hidden grow shrink-0 basis-0 flex-col items-start gap-4 bg-default-background px-4 py-4">
        <div className="flex w-full items-center justify-end gap-1">
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild={true}>
              <div className="flex items-start justify-end gap-1">
                <Button
                  disabled={false}
                  variant="neutral-secondary"
                  size="medium"
                  iconRight={<FeatherChevronDown />}
                  loading={false}
                >
                  Add Simulation
                </Button>
              </div>
            </SubframeCore.DropdownMenu.Trigger>
            <SubframeCore.DropdownMenu.Portal>
              <SubframeCore.DropdownMenu.Content
                side="bottom"
                align="end"
                sideOffset={4}
                asChild={true}
              >
                <DropdownMenu>
                  <DropdownMenu.DropdownItem
                    icon={<SubframeCore.FeatherRoute />}
                    onClick={() => handleAddSimulation("single")}
                  >
                    Single Text Route Simulation
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem
                    icon={<SubframeCore.FeatherRoute />}
                    onClick={() => handleAddSimulation("two")}
                  >
                    Two Text Route Simulation
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem
                    icon={<SubframeCore.FeatherRoute />}
                    onClick={() => handleAddSimulation("three")}
                  >
                    Three Text Route Simulation
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<SubframeCore.FeatherMic />}>
                    Slogan Simulation
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                    Stop Simulation
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                    Special Message Simulation
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
        </div>
        <div className="flex w-full  overflow-y-scroll flex-col items-start gap-2">
          {simulations.map((simulation, index) => (
            <SimulationPlayerCard
              key={index}
              isSelected={index === selectedSimulationIndex}
              listIndex={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export const SimulationsPlayerPanel = SimulationsPlayerPanelRoot;
