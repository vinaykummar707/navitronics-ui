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
import { IconButton } from "./IconButton";
import { DropdownMenu } from "./DropdownMenu";
import { SimulationPlayerCard } from "./SimulationPlayerCard";
import { StopDetailsCard } from "./StopDetailsCard";
import { TabsPanel } from "./TabsPanel";
import {
  FeatherMinus,

  FeatherMaximize2,
  FeatherRotateCcw,
} from "@subframe/core";
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
import useTabsStore from "@/store/useTabsStore";
import useSimulationStore from "@/store/useSimulationStore";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { Select } from "./Select";
import { useParams } from "react-router-dom";
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
  const [selectedStop, setSelectedStop] = React.useState<IStopWithAudio | null>(null);
  const [selectedUpDown, setSelectedUpDown] = React.useState<"up" | "down">(
    "up",
  );
  const [selectedStopTypes, setSelectedStopTypes] = React.useState<string[]>(
    [],
  );

  const [zoom, setZoom] = React.useState<number>(80);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(175, prev + 10));
  const handleZoomOut = () => setZoom((prev) => Math.max(40, prev - 10));
  const handleResetZoom = () => setZoom(100);

  const handleFitToWidth = () => {
    if (!canvasRef.current) return;
    const containerWidth = canvasRef.current.clientWidth - 48;
    const targetScale = Math.min(100, Math.max(40, Math.floor((containerWidth / 860) * 100)));
    setZoom(targetScale);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  const { fields, append, replace } = useFieldArray({
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
    filters: { depot_id: depotId || "", deleted: false, organization_id: selectedOrganization?.id || "" },
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
    skip: !depotId || !selectedOrganization?.id,
  });


  const stops = stopsData?.data as IStopWithAudio[];

  // function to return combined text from passed string array
  const generateCombinations = (texts: (string | undefined)[]): string => {
    return texts.filter(Boolean).join(" - ");
  };

  // function to append a new Simulation into the active signboard array
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

    // BUG-053: Smart Dimension Inheritance - inherit dimensions from existing cards on this board
    const currentBoardSims = getValues(selectedTab) || [];
    if (currentBoardSims.length > 0 && newSimulation) {
      newSimulation.height = currentBoardSims[0].height;
      newSimulation.width = currentBoardSims[0].width;
    }

    append(newSimulation);
    setSelectedSimulationIndex(simulations.length);
  };

  // log stop and language selection changes in useEffect for debugging
  useEffect(() => {
    console.log("Selected Language:", selectedLanguage);
    console.log("Selected Stop:", selectedStop);
    ``;
  }, [selectedLanguage, selectedStop]);

  // handle add simulation for stop route config when selected stop

  const generateStopSimulations = async () => {
    if (
      selectedStop &&
      selectedLanguage &&
      selectedStopTypes.length > 0 &&
      selectedUpDown
    ) {
      try {
        const newSimulations = await Promise.all(
          selectedStopTypes.map(async (stopType) => {
            const text = `${stopType} stop is ${selectedStop.name.toLocaleLowerCase()}`;
            const genText =
              selectedLanguage === "en"
                ? text.toUpperCase()
                : await translateText(text, selectedLanguage + "-IN");
            return getDefaultStopSingleSimulation(
              genText,
              "stop",
              stopType,
              selectedStop,
              selectedLanguage,
              selectedUpDown,
            );
          }),
        );
        append(newSimulations);
      } catch (err: any) {
        toast.error(
          `Failed to generate stop simulations: ${err?.message || err}`,
        );
      }
    } else {
      toast.error(
        "Please select a stop, language, stop type and up/down route to generate simulations",
      );
    }
  };

  // function to translate text from english to target language using sarvam translate api.
  const translateText = async (
    text: string,
    targetLanguage: string,
  ): Promise<string> => {
    const sarvamKey = import.meta.env.VITE_SARVAM_API_KEY || "";
    if (!sarvamKey) {
      toast.error("Sarvam AI API key is missing. Please configure VITE_SARVAM_API_KEY.");
      return text;
    }

    // Translation (POST /translate)
    const response = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: {
        "api-subscription-key": sarvamKey,
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
      <div className="flex h-full w-full flex-col items-start gap-3 bg-neutral-100/70 p-3 flex-1 min-h-0 overflow-hidden">
        {/* Action & Zoom Controls Header */}
        <div className="flex w-full flex-wrap items-center justify-between gap-2 flex-none bg-default-background p-2.5 rounded-xl border border-solid border-neutral-border shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
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
                <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 px-3 py-1.5">
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
                      variant="brand-primary"
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
                    align="start"
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
                            "THIS IS A SLOGAN SIMULATION",
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
                            "THIS IS A SPECIAL MESSAGE SIMULATION",
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
              onClick={() => {
                if (confirm(`Are you sure you want to delete all ${selectedTab.toUpperCase()} simulations?`)) {
                  setValue(selectedTab, []);
                  replace([]);
                  setSelectedSimulationIndex(-1);
                  toast.info(`Deleted all ${selectedTab.toUpperCase()} simulations`);
                }
              }}
            >
              Delete All
            </Button>
          </div>

          {/* Canvas Zoom Toolbar */}
          <div className="flex items-center gap-1 rounded-lg border border-neutral-border bg-sidebar-background p-1 shadow-xs">
            <IconButton
              variant="neutral-primary"
              size="small"
              icon={<FeatherMinus />}
              title="Zoom Out (Ctrl + Scroll Down)"
              onClick={handleZoomOut}
              disabled={zoom <= 40}
            />
            <button
              type="button"
              onClick={handleResetZoom}
              title="Click to reset zoom to 100%"
              className="px-2 py-0.5 text-xs font-mono font-bold text-default-font hover:text-brand-primary min-w-[48px] text-center cursor-pointer"
            >
              {zoom}%
            </button>
            <IconButton
              variant="neutral-primary"
              size="small"
              icon={<FeatherPlus />}
              title="Zoom In (Ctrl + Scroll Up)"
              onClick={handleZoomIn}
              disabled={zoom >= 175}
            />
            <div className="h-4 w-[1px] bg-neutral-300 mx-0.5" />
            <Button
              variant="neutral-primary"
              size="small"
              icon={<FeatherMaximize2 className="h-3.5 w-3.5" />}
              onClick={handleFitToWidth}
              title="Fit simulations to canvas width"
            >
              Fit Screen
            </Button>
          </div>
        </div>

        {/* Zoomable Canvas Container */}
        <div
          ref={canvasRef}
          onWheel={handleWheel}
          className="relative flex-1 min-h-0 w-full overflow-auto p-4 scrollbar-thin bg-neutral-100/60 rounded-xl border border-solid border-neutral-border shadow-inner"
          style={{
            backgroundImage: "radial-gradient(rgba(136, 153, 177, 0.18) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Scaled Canvas Content */}
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
              width: zoom < 100 ? `${100 * (100 / zoom)}%` : "100%",
            }}
            className="flex w-full flex-col items-start gap-4 transition-all pb-6"
          >
            {simulations.map((simulation, index) => (
              <div key={(simulation as any)?.id || `${selectedTab}_${index}`} className="  shadow-sm rounded-xl overflow-hidden">
                <SimulationPlayerCard
                  isSelected={index === selectedSimulationIndex}
                  listIndex={index}
                />
              </div>
            ))}

            {simulations.length === 0 && (
              <div className="w-full flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-primary mb-4 shadow-inner">
                  <SubframeCore.FeatherRectangleHorizontal className="h-8 w-8" />
                </div>
                <h3 className="text-base font-heading-3 font-semibold text-default-font">
                  No Slides on {selectedTab.toUpperCase()} Signboard
                </h3>
                <p className="text-xs text-subtext-color max-w-sm mt-1.5 mb-6">
                  This electronic display currently has no slides in its loop sequence. Add a slide or use a preset below to start.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="brand-primary"
                    size="small"
                    icon={<FeatherPlus />}
                    onClick={() => handleAddSimulation("single")}
                  >
                    Add Single-Line Route
                  </Button>
                  <Button
                    variant="neutral-secondary"
                    size="small"
                    icon={<SubframeCore.FeatherColumns2 />}
                    onClick={() => handleAddSimulation("two")}
                  >
                    Add Route + Terminus
                  </Button>
                  <Button
                    variant="neutral-secondary"
                    size="small"
                    icon={<SubframeCore.FeatherSpeech />}
                    onClick={() =>
                      handleAddSimulation("single", "slogan", "PLEASE WEAR SEAT BELT")
                    }
                  >
                    Add Slogan Slide
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export const SimulationsPlayerPanel = SimulationsPlayerPanelRoot;
