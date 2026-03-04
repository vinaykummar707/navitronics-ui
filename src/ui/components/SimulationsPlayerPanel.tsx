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
import {
  DisplayConfigPostRequest,
  Simulation,
  SimulationType,
} from "@/types/routeConfigV2";
import {
  getDefaultSingleSimulation,
  getDefaultTwoSimulation,
  getDefaultThreeSimulation,
  DEFAULT_SIMULATION_TYPE,
  AVAILABLE_LANGUAGES,
  stopStates,
  getDefaultStopSingleSimulation,
} from "@/constants/defaultRouteValues";
import { get } from "node:http";
import useTabsStore from "@/store/useTabsStore";
import useSimulationStore from "@/store/useSimulationStore";
import { set } from "zod";
import { useStops } from "@/api/stop/hooks";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { Select } from "./Select";
import { useParams } from "react-router-dom";
import { Stop } from "@/api/stop/types";
import { CheckboxGroup } from "./CheckboxGroup";
import { Checkbox } from "./Checkbox";
import { toast } from "react-toastify";
import { IStopWithAudio, stopCrud } from "@/types/IStop";
import { supabase } from "@/supabaseClient";

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
  const setSelectedSimulationIndex = useSimulationStore(
    (state) => state.setSelectedSimulationIndex,
  );
  const selectedSimulationIndex = useSimulationStore(
    (state) => state.selectedSimulationIndex,
  );

  const simulations: Simulation[] = watch(selectedTab);

  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("en");
  const [selectedStop, setSelectedStop] = React.useState<Stop | null>(null);
  const [selectedUpDown, setSelectedUpDown] = React.useState<"up" | "down">(
    "up",
  );
  const [selectedStopTypes, setSelectedStopTypes] = React.useState<string[]>(
    [],
  );

  const { fields, append } = useFieldArray({
    control: methods.control,
    name: selectedTab,
  });

  useEffect(() => {
    if (!simulations || simulations.length === 0) {
      setSelectedSimulationIndex(-1);
    } else if (selectedSimulationIndex === -1) {
      setSelectedSimulationIndex(0);
    }
  }, [selectedTab, setSelectedSimulationIndex, simulations, selectedSimulationIndex]);

  // get depot id from params
  const { areaId, depotId } = useParams<{ areaId: string; depotId: string }>();

  const { selectedOrganization } = useOrganizationStore();

  const { data: stopsData, refetch: refetchStops } = stopCrud.useList({
    filters: { depot_id: depotId || "", deleted: false, organization_id: selectedOrganization.id },
    orderBy: { column: "created_at", ascending: false },
    custom(query) {
      return query
        .select(
          `*,
           stop_audios (
      id,
      url,
      file_name,file_size
    )
          ` // Verify this line. It should correctly reflect your schema relationships.
        )

    },
    skip: !depotId,
  });


  const stops = stopsData?.data as IStopWithAudio[];

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
        newSimulation = type === 'route' ?
          getDefaultSingleSimulation(
            generateCombinations([
              isSplitRoute ? getValues("route_number_1") + "/" + getValues("route_number_2") : getValues("route_number"),
              getValues("source"),
              getValues("destination"),
              getValues("via"),
            ]),
            type,
          ) : getDefaultSingleSimulation(
            generateCombinations([defaultText || "Single Text Simulation"
            ]),
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

    append(newSimulation);
    setSelectedSimulationIndex(simulations.length); // Set the newly added simulation as selected
  };

  // log stop and language selection changes in useEffect for debugging
  useEffect(() => {
    console.log("Selected Language:", selectedLanguage);
    console.log("Selected Stop:", selectedStop);
    ``;
  }, [selectedLanguage, selectedStop]);

  // handle add simulation for stop route config when selected stop

  const generateStopSimulations = async () => {
    if (selectedStop && selectedLanguage && selectedStopTypes.length > 0 && (selectedUpDown || selectedUpDown)) {
      selectedStopTypes.forEach(async (stopType) => {
        const text = `${stopType} stop is ${selectedStop.name.toLocaleLowerCase()}`;
        const genText =
          selectedLanguage === "en"
            ? text.toUpperCase()
            : await translateText(text, selectedLanguage + "-IN");
        append(
          getDefaultStopSingleSimulation(
            genText,
            "stop",
            stopType,
            selectedStop,
            selectedLanguage,
            selectedUpDown,
          ),
        );
      });
    } else {
      toast.error("Please select a stop, language, stop type and up/down route to generate simulations");
    }
  };

  // function to translate text from english to target language using sarvam translate api.
  const translateText = async (
    text: string,
    targetLanguage: string,
  ): Promise<string> => {
    // Translation (POST /translate)
    const response = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: {
        "api-subscription-key": "sk_ub6tmck1_GssLt4xToCdAjQGEgh3BJQKk",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
        source_language_code: "auto",
        target_language_code: targetLanguage,
      }),
    });

    const body = await response.json();
    return body.translated_text;
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col items-start border-x border-solid border-neutral-border overflow-hidden",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <TabsPanel />
      <div className="flex  overflow-scroll no-scrollbar h-full w-full  flex-col items-start gap-4 bg-default-background px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {selectedTab === "stops" && (
            <>
              <Select
                value={selectedLanguage}
                onValueChange={(value) => setSelectedLanguage(value)}
              >
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <Select.Item key={lang.code} value={lang.code}>
                    {lang.label}
                  </Select.Item>
                ))}
              </Select>
              <Select
                value={selectedUpDown}
                onValueChange={(value: "up" | "down") =>
                  setSelectedUpDown(value)
                }
              >
                <Select.Item value="up">Up Route Lat Lngs</Select.Item>
                <Select.Item value="down">Down Route Lat Lngs</Select.Item>
              </Select>
              <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-2">
                <CheckboxGroup
                  className=""
                  label=""
                  helpText=""
                  error={false}
                  horizontal={true}
                >
                  <Checkbox
                    label="current"
                    checked={selectedStopTypes.includes("current")}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setSelectedStopTypes([...selectedStopTypes, "current"]);
                      } else {
                        setSelectedStopTypes(
                          selectedStopTypes.filter(
                            (type) => type !== "current",
                          ),
                        );
                      }
                    }}
                  />
                  <Checkbox
                    label="next"
                    checked={selectedStopTypes.includes("next")}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setSelectedStopTypes([...selectedStopTypes, "next"]);
                      } else {
                        setSelectedStopTypes(
                          selectedStopTypes.filter((type) => type !== "next"),
                        );
                      }
                    }}
                  />
                  <Checkbox
                    label="Arriving"
                    checked={selectedStopTypes.includes("coming")}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setSelectedStopTypes([...selectedStopTypes, "coming"]);
                      } else {
                        setSelectedStopTypes(
                          selectedStopTypes.filter((type) => type !== "coming"),
                        );
                      }
                    }}
                  />
                </CheckboxGroup>
              </div>

              {stops && stops.length > 0 && (
                <Select
                  className="truncate text-xs"
                  placeholder="Select Stop"
                  onValueChange={(value) => {
                    const stop = stops.find((s) => s.id === value);
                    setSelectedStop(stop || null);
                  }}
                  value={selectedStop?.id || ""}
                >
                  {stops?.map((stop) => (
                    <Select.Item key={stop.id} value={stop.id}>
                      {stop.name}
                    </Select.Item>
                  ))}
                </Select>
              )}
              <Button
                disabled={false}
                size="medium"
                iconRight={<SubframeCore.FeatherSparkle />}
                loading={false}
                onClick={generateStopSimulations}
              >
                Generate Stop Simulations
              </Button>
            </>
          )}

          {selectedTab !== "stops" && (
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <div className="flex items-start justify-end gap-1">
                  <Button
                    disabled={false}
                    variant=""
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
                      icon={<SubframeCore.FeatherRectangleHorizontal />}
                      onClick={() => handleAddSimulation("single")}
                    >
                      Single Text Route Simulation
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={<SubframeCore.FeatherColumns2 />}
                      onClick={() => handleAddSimulation("two")}
                    >
                      Two Text Route Simulation
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={<SubframeCore.FeatherRows3 />}
                      onClick={() => handleAddSimulation("three")}
                    >
                      Three Text Route Simulation
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      onClick={() =>
                        handleAddSimulation(
                          "single",
                          "slogan",
                          "This is a Slogan Simulation",
                        )
                      }
                      icon={<SubframeCore.FeatherSpeech />}
                    >
                      Slogan Simulation
                    </DropdownMenu.DropdownItem>

                    <DropdownMenu.DropdownItem
                      onClick={() =>
                        handleAddSimulation(
                          "single",
                          "special message",
                          "This is a Special Message Simulation",
                        )
                      }
                      icon={<SubframeCore.FeatherMic />}
                    >
                      Special Message Simulation
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          )}
          <Button
            disabled={false}
            variant="destructive-secondary"
            size="medium"
            icon={<FeatherTrash />}
            loading={false}
            onClick={async () => {
              if (confirm("Are you sure you want to delete all simulations?")) {

                if(selectedTab !== "stops"){

                simulations.forEach(async (simulation, index) => {
                  console.log("Deleting simulation at index:", simulation);
                  if (simulation.audioFileUrl) {
                    const audioFileUrl = simulation.audioFileUrl;
                    console.log("Audio file URL to delete:", audioFileUrl);
                    // Extract the file path relative to the 'stops' bucket
                    const pathMatch = audioFileUrl.match(/\/stops\/(.+)$/);
                    const filePath = pathMatch ? pathMatch[1] : null;
                    console.log("Deleting file from Supabase Storage at path:", filePath);
                    if (filePath) {
                      const { error } = await supabase.storage.from("stops").remove([filePath]);
                      // remove index from simulations.
                      console.log("Deleting simulation at index:", index);
                      simulations.splice(index, 1);
                       setValue(selectedTab, simulations);
                      if (error) {
                        console.error("Error deleting file from Supabase Storage:", error);
                      }
                    }
                  } 
                });
              } else {
                setValue(selectedTab, []);
                setSelectedSimulationIndex(-1);
              }
             
              }
            }}
          >
            Delete All
          </Button>
        </div>
        <div className="flex  w-full flex-col items-start gap-2">
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
