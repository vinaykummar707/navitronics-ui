"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  FeatherAirplay,
  FeatherChevronDown,
  FeatherChevronLeft,
  FeatherChevronRight,
  FeatherColumns2,
  FeatherCopy,
  FeatherMaximize2,
  FeatherMinus,
  FeatherMoveDown,
  FeatherMoveUp,
  FeatherPause,
  FeatherPlay,
  FeatherPlus,
  FeatherRectangleHorizontal,
  FeatherRows3,
  FeatherSparkle,
  FeatherSpeech,
  FeatherTrash,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { DropdownMenu } from "./DropdownMenu";
import { TabsPanel } from "./TabsPanel";
import DisplayEditor from "@/components/DisplayEditor";
import useTabsStore, { Tab } from "@/store/useTabsStore";
import useSimulationStore from "@/store/useSimulationStore";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  DEFAULT_SIMULATION_TYPE,
  AVAILABLE_LANGUAGES,
  getDefaultSingleSimulation,
  getDefaultTwoSimulation,
  getDefaultThreeSimulation,
  getDefaultStopSingleSimulation,
} from "@/constants/defaultRouteValues";
import { DisplayConfigPostRequest, Simulation, SimulationType } from "@/types/routeConfigV2";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { IStopWithAudio, stopCrud } from "@/types/IStop";
import { Select } from "./Select";
import { CheckboxGroup } from "./CheckboxGroup";
import { Checkbox } from "./Checkbox";

interface SignboardCanvasStageProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onAddSimulationRef?: React.MutableRefObject<((format: string, type?: SimulationType, defaultText?: string) => void) | null>;
}

export const SignboardCanvasStage = React.forwardRef<
  HTMLDivElement,
  SignboardCanvasStageProps
>(function SignboardCanvasStage({ className, onAddSimulationRef, ...otherProps }, ref) {
  const methods = useFormContext<DisplayConfigPostRequest>();
  const { getValues, watch, setValue } = methods;

  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore((state) => state.selectedSimulationIndex);
  const setSelectedSimulationIndex = useSimulationStore((state) => state.setSelectedSimulationIndex);

  const simulations: Simulation[] = watch(selectedTab as any) || [];
  const currentSimulation = simulations[selectedSimulationIndex];

  const [isPaused, setIsPaused] = useState(false);
  const [zoom, setZoom] = useState<number>(100);
  const stageRef = useRef<HTMLDivElement>(null);

  // Field Array controls
  const { append, replace } = useFieldArray({
    control: methods.control,
    name: selectedTab as any,
  });

  // Ensure selected simulation index stays valid
  useEffect(() => {
    if (!simulations || simulations.length === 0) {
      setSelectedSimulationIndex(-1);
    } else if (selectedSimulationIndex === -1 || selectedSimulationIndex >= simulations.length) {
      setSelectedSimulationIndex(0);
    }
  }, [selectedTab, simulations.length, selectedSimulationIndex, setSelectedSimulationIndex]);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(175, prev + 15));
  const handleZoomOut = () => setZoom((prev) => Math.max(40, prev - 15));
  const handleResetZoom = () => setZoom(100);
  const handleFitToScreen = () => {
    if (stageRef.current && currentSimulation) {
      // Intrinsic width of the LED screen: width columns * 8px per dot + chassis padding (approx 70px)
      const intrinsicWidth = (currentSimulation.width || 160) * 8 + 70;
      const containerWidth = stageRef.current.clientWidth - 48; // Stage padding (p-6 is 24px each side)
      if (containerWidth > 0 && intrinsicWidth > 0) {
        const computedZoom = Math.min(100, Math.max(40, Math.floor((containerWidth / intrinsicWidth) * 100)));
        setZoom(computedZoom);
        return;
      }
    }
    setZoom(100);
  };

  // Add Simulation logic with smart dimension inheritance
  const generateCombinations = (texts: (string | undefined)[]): string => {
    return texts.filter(Boolean).join(" - ");
  };

  const handleAddSimulation = (
    format: string,
    type: SimulationType = DEFAULT_SIMULATION_TYPE,
    defaultText?: string
  ) => {
    let newSim: Simulation;
    const isSplitRoute = watch("is_split_route");

    switch (format) {
      case "single":
        newSim =
          type === "route"
            ? getDefaultSingleSimulation(
                generateCombinations([
                  isSplitRoute
                    ? `${getValues("route_number_1") || ""}/${getValues("route_number_2") || ""}`
                    : getValues("route_number"),
                  getValues("source"),
                  getValues("destination"),
                  getValues("via"),
                ]),
                type
              )
            : getDefaultSingleSimulation(defaultText || "Single Route Text", type);
        break;
      case "two":
        newSim = getDefaultTwoSimulation(
          generateCombinations([getValues("route_number")]),
          generateCombinations([getValues("source"), getValues("destination"), getValues("via")]),
          type,
          getValues("route_number_1"),
          getValues("route_number_2"),
          isSplitRoute
        );
        break;
      case "three":
        newSim = getDefaultThreeSimulation(
          generateCombinations([getValues("route_number")]),
          generateCombinations([getValues("source"), getValues("destination")]),
          generateCombinations([getValues("via")]),
          type,
          getValues("route_number_1"),
          getValues("route_number_2"),
          isSplitRoute
        );
        break;
      default:
        return;
    }

    // Smart Dimension Inheritance (BUG-053)
    const existingSims = getValues(selectedTab as any) || [];
    if (existingSims.length > 0 && newSim) {
      newSim.height = existingSims[0].height;
      newSim.width = existingSims[0].width;
    }

    append(newSim);
    setSelectedSimulationIndex(simulations.length);
    toast.success(`Added new ${format.toUpperCase()} slide to ${selectedTab.toUpperCase()}`);
  };

  // Expose to parent ref if provided
  if (onAddSimulationRef) {
    onAddSimulationRef.current = handleAddSimulation;
  }

  // Duplicate slide
  const handleDuplicate = (idx: number) => {
    const list = getValues(selectedTab as any) || [];
    const target = list[idx];
    if (!target) return;
    const clone = typeof structuredClone === "function" ? structuredClone(target) : JSON.parse(JSON.stringify(target));
    const nextList = [...list, clone];
    setValue(selectedTab as any, nextList, { shouldDirty: true });
    setSelectedSimulationIndex(nextList.length - 1);
    toast.success(`Duplicated Slide #${idx + 1}`);
  };

  // Move slide Left/Right in loop
  const handleMove = (idx: number, direction: "left" | "right") => {
    const list = [...(getValues(selectedTab as any) || [])];
    const targetIdx = direction === "left" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    [list[idx], list[targetIdx]] = [list[targetIdx], list[idx]];
    setValue(selectedTab as any, list, { shouldDirty: true });
    setSelectedSimulationIndex(targetIdx);
  };

  // Remove single slide
  const handleRemove = (idx: number) => {
    const list = [...(getValues(selectedTab as any) || [])];
    list.splice(idx, 1);
    setValue(selectedTab as any, list, { shouldDirty: true });
    setSelectedSimulationIndex(list.length > 0 ? Math.min(idx, list.length - 1) : -1);
    toast.info(`Deleted Slide #${idx + 1}`);
  };

  // Delete All (BUG-056 fix)
  const handleDeleteAll = () => {
    if (confirm(`Are you sure you want to delete all slides on ${selectedTab.toUpperCase()} display?`)) {
      setValue(selectedTab as any, []);
      replace([]);
      setSelectedSimulationIndex(-1);
      toast.info(`Cleared all slides from ${selectedTab.toUpperCase()}`);
    }
  };

  // Stops Tab logic
  const { areaId, depotId } = useParams<{ areaId: string; depotId: string }>();
  const { selectedOrganization } = useOrganizationStore();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [selectedStop, setSelectedStop] = useState<IStopWithAudio | null>(null);
  const [selectedUpDown, setSelectedUpDown] = useState<"up" | "down">("up");
  const [selectedStopTypes, setSelectedStopTypes] = useState<string[]>([]);

  const { data: stopsData } = stopCrud.useList({
    filters: { depot_id: depotId || "", deleted: false, organization_id: selectedOrganization?.id || "" },
    orderBy: { column: "created_at", ascending: false },
    skip: !depotId || !selectedOrganization?.id,
  });
  const stops = (stopsData?.data as IStopWithAudio[]) || [];

  const handleGenerateStopSimulations = async () => {
    if (!selectedStop || !selectedLanguage || selectedStopTypes.length === 0) {
      toast.error("Please select a stop, language, and stop type.");
      return;
    }
    const newSims = selectedStopTypes.map((stopType) => {
      const text = `${stopType.toUpperCase()} STOP: ${selectedStop.name.toUpperCase()}`;
      return getDefaultStopSingleSimulation(text, "stop", stopType as any, selectedStop, selectedLanguage, selectedUpDown);
    });
    append(newSims);
    toast.success(`Generated ${newSims.length} stop announcements`);
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex flex-1 min-w-0 h-full flex-col bg-default-background overflow-hidden select-none",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {/* 1. Signboard Switcher & Secondary Control Bar */}
      <TabsPanel />

      {/* 2. Stage Action Header */}
      <div className="flex w-full flex-none items-center justify-between border-b border-solid border-neutral-border bg-sidebar-background/60 px-4 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          {selectedTab !== Tab.STOPS && (
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild>
                <Button
                  variant="brand-primary"
                  size="small"
                  iconRight={<FeatherChevronDown />}
                >
                  Add Slide
                </Button>
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  asChild
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherRectangleHorizontal />}
                      onClick={() => handleAddSimulation("single")}
                    >
                      Single-Line Route
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherColumns2 />}
                      onClick={() => handleAddSimulation("two")}
                    >
                      Two-Line (Route # + Terminus)
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherRows3 />}
                      onClick={() => handleAddSimulation("three")}
                    >
                      Three-Line (Route # + Dual Text)
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherSpeech />}
                      onClick={() => handleAddSimulation("single", "slogan", "PLEASE WEAR SEAT BELT")}
                    >
                      Slogan Slide
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          )}

          {selectedTab === Tab.STOPS && (
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v)}>
                {AVAILABLE_LANGUAGES.map((l) => (
                  <Select.Item key={l.code} value={l.code}>
                    {l.label}
                  </Select.Item>
                ))}
              </Select>
              <Select value={selectedUpDown} onValueChange={(v: any) => setSelectedUpDown(v)}>
                <Select.Item value="up">Up Route (Forward)</Select.Item>
                <Select.Item value="down">Down Route (Return)</Select.Item>
              </Select>
              {stops.length > 0 && (
                <Select
                  placeholder="Select Bus Stop"
                  value={selectedStop?.id || ""}
                  onValueChange={(id) => setSelectedStop(stops.find((s) => s.id === id) || null)}
                >
                  {stops.map((s) => (
                    <Select.Item key={s.id} value={s.id}>
                      {s.name}
                    </Select.Item>
                  ))}
                </Select>
              )}
              <Button
                variant="brand-primary"
                size="small"
                icon={<FeatherSparkle />}
                onClick={handleGenerateStopSimulations}
              >
                Generate Stop Slide
              </Button>
            </div>
          )}

          {simulations.length > 0 && (
            <Button
              variant="destructive-secondary"
              size="small"
              icon={<FeatherTrash />}
              onClick={handleDeleteAll}
              title="Delete all slides on this display"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 rounded-lg border border-neutral-border bg-neutral-0/40 p-1 shadow-2xs">
          <IconButton
            variant="neutral-secondary"
            size="small"
            icon={<FeatherMinus className="h-3.5 w-3.5" />}
            title="Zoom Out"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          />
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-0.5 text-xs font-mono font-bold text-default-font hover:text-brand-primary min-w-[44px] text-center cursor-pointer"
            title="Reset Zoom to 100%"
          >
            {zoom}%
          </button>
          <IconButton
            variant="neutral-secondary"
            size="small"
            icon={<FeatherPlus className="h-3.5 w-3.5" />}
            title="Zoom In"
            onClick={handleZoomIn}
            disabled={zoom >= 175}
          />
          <div className="h-3.5 w-[1px] bg-neutral-300/30 mx-0.5" />
          <Button
            variant="neutral-secondary"
            size="small"
            icon={<FeatherMaximize2 className="h-3.5 w-3.5" />}
            onClick={handleFitToScreen}
            title="Fit to Screen"
          >
            Fit
          </Button>
        </div>
      </div>

      {/* 3. Main Stage Canvas (Centered Stage + Slide Loop Strip) */}
      <div
        ref={stageRef}
        className="relative flex-1 min-h-0 w-full overflow-auto p-6 flex flex-col items-center justify-between gap-6"
        style={{
          backgroundImage: "radial-gradient(rgba(136, 153, 177, 0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {/* HERO LED STAGE */}
        {currentSimulation ? (
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
            }}
            className="flex flex-col items-center justify-center w-fit max-w-none transition-all my-auto"
          >
            {/* Real Hardware Chassis Frame - Dark Transit Equipment Styling (Adapts to LED Width) */}
            <div className="flex flex-col items-center w-fit max-w-none min-w-[520px] rounded-2xl border border-neutral-border bg-[#070a13] p-5 shadow-2xl ring-1 ring-white/5">
              {/* Hardware Top Bar */}
              <div className="flex w-full items-center justify-between pb-3 mb-3 border-b border-neutral-border/70 text-xs text-subtext-color gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="font-mono font-bold text-default-font uppercase tracking-wider text-[11px] whitespace-nowrap">
                    {selectedTab.toUpperCase()} DESTINATION SIGNBOARD
                  </span>
                  <span className="px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 font-mono text-[10px] font-bold text-brand-primary whitespace-nowrap">
                    {currentSimulation.width} × {currentSimulation.height} PX
                  </span>
                  <span className="text-[10px] text-subtext-color font-mono whitespace-nowrap">
                    SLIDE #{selectedSimulationIndex + 1} OF {simulations.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-none">
                  <Button
                    variant={isPaused ? "brand-secondary" : "neutral-secondary"}
                    size="small"
                    className="h-8 text-xs font-medium whitespace-nowrap"
                    icon={isPaused ? <FeatherPlay className="h-3.5 w-3.5" /> : <FeatherPause className="h-3.5 w-3.5" />}
                    onClick={() => setIsPaused(!isPaused)}
                  >
                    {isPaused ? "Resume Animation" : "Pause Animation"}
                  </Button>
                </div>
              </div>

              {/* Centered LED Dot Matrix Screen with Dark Recessed Bezel Housing */}
              <div className="flex items-center justify-center w-fit max-w-none p-3 rounded-xl bg-[#04060a] border border-neutral-border/50 shadow-inner">
                <DisplayEditor stopScroll={isPaused} listIndex={selectedSimulationIndex} />
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center my-auto p-12 text-center rounded-2xl border border-dashed border-neutral-border bg-neutral-0/30 max-w-lg shadow-inner">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-primary mb-4 shadow-sm">
              <FeatherAirplay className="h-8 w-8" />
            </div>
            <h3 className="text-base font-heading-3 font-semibold text-default-font">
              No Slides in {selectedTab.toUpperCase()} Display Sequence
            </h3>
            <p className="text-xs text-subtext-color max-w-md mt-1.5 mb-6">
              Bus destination signs loop through multiple slides. Add your first route destination slide to start the sequence.
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
                icon={<FeatherColumns2 />}
                onClick={() => handleAddSimulation("two")}
              >
                Add Two-Line Route
              </Button>
              <Button
                variant="neutral-secondary"
                size="small"
                icon={<FeatherSpeech />}
                onClick={() => handleAddSimulation("single", "slogan", "PLEASE WEAR SEAT BELT")}
              >
                Add Slogan Slide
              </Button>
            </div>
          </div>
        )}

        {/* 4. SLIDE LOOP PLAYLIST (Bottom Filmstrip) */}
        {simulations.length > 0 && (
          <div className="w-full flex-none flex flex-col rounded-xl border border-neutral-border bg-sidebar-background/90 p-3 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-border/60">
              <div className="flex items-center gap-2">
                <span className="text-caption-bold font-caption-bold text-default-font">
                  Signboard Loop Sequence
                </span>
                <span className="text-xs text-subtext-color font-mono">
                  ({simulations.length} Slides in Cycle)
                </span>
              </div>
              <Button
                variant="brand-primary"
                size="small"
                icon={<FeatherPlus />}
                onClick={() => handleAddSimulation("single")}
              >
                Add Slide
              </Button>
            </div>

            {/* Slide Cards Filmstrip */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 no-scrollbar">
              {simulations.map((sim, index) => {
                const isSelected = index === selectedSimulationIndex;
                const text =
                  sim.format === "single"
                    ? sim.texts?.text?.text
                    : sim.format === "two"
                    ? sim.texts?.text?.text
                    : (sim.texts as any)?.upperHalfText?.text;

                return (
                  <div
                    key={`${selectedTab}_${index}`}
                    onClick={() => setSelectedSimulationIndex(index)}
                    className={SubframeUtils.twClassNames(
                      "flex flex-col flex-none w-56 p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs select-none",
                      isSelected
                        ? "border-brand-primary ring-2 ring-brand-primary/50 bg-neutral-0/60 shadow-md"
                        : "border-neutral-border bg-neutral-100/60 hover:border-neutral-300/40 hover:bg-neutral-100/90"
                    )}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-500/10 text-brand-primary border border-brand-500/20">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.2 rounded bg-neutral-200/50 text-[9px] font-medium uppercase text-subtext-color">
                          {sim.format}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-neutral-200/50 text-[9px] font-mono text-subtext-color">
                          {sim.width}×{sim.height}
                        </span>
                      </div>
                    </div>

                    {/* Preview Text */}
                    <p className="text-xs font-semibold text-default-font truncate mb-2">
                      {text || "Untitled Slide"}
                    </p>

                    {/* Mini Actions Bar */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-neutral-border/50">
                      <div className="flex items-center gap-0.5">
                        <IconButton
                          variant="neutral-tertiary"
                          size="small"
                          icon={<FeatherChevronLeft className="h-3 w-3" />}
                          disabled={index === 0}
                          title="Move Left in Sequence"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMove(index, "left");
                          }}
                        />
                        <IconButton
                          variant="neutral-tertiary"
                          size="small"
                          icon={<FeatherChevronRight className="h-3 w-3" />}
                          disabled={index === simulations.length - 1}
                          title="Move Right in Sequence"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMove(index, "right");
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <IconButton
                          variant="neutral-tertiary"
                          size="small"
                          icon={<FeatherCopy className="h-3 w-3" />}
                          title="Duplicate Slide"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(index);
                          }}
                        />
                        <IconButton
                          variant="neutral-tertiary"
                          size="small"
                          icon={<FeatherTrash className="h-3 w-3 text-red-400" />}
                          title="Delete Slide"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(index);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
