"use client";
import React, { useState, useRef } from "react";
import {
  FeatherAirplay,
  FeatherCheck,
  FeatherCopy,
  FeatherMusic,
  FeatherPlus,
  FeatherSliders,
  FeatherTrash,
  FeatherType,
  FeatherX,
} from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { TextPropertiesControls } from "./TextPropertiesControls";
import useSimulationStore from "@/store/useSimulationStore";
import useTabsStore from "@/store/useTabsStore";
import useToggleStore from "@/store/useToggleStore";
import { useFormContext } from "react-hook-form";
import {
  DEFAULT_SIMULATION_HEIGHTS,
  DEFAULT_SIMULATION_WIDTHS,
  DisplayConfigPostRequest,
  SIMULATION_FORMATS,
  SIMULATION_TYPES,
  Simulation,
} from "@/types/routeConfigV2";
import {
  getDefaultSingleSimulation,
  getDefaultTwoSimulation,
  getDefaultThreeSimulation,
} from "@/constants/defaultRouteValues";
import { generateAudio, handleSloganAudioGeneration } from "@/utils/fetchTTS";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "@/supabaseClient";


interface SlidePropertyInspectorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onAddSimulation?: (format: string, type?: string) => void;
}

export const SlidePropertyInspector = React.forwardRef<
  HTMLDivElement,
  SlidePropertyInspectorProps
>(function SlidePropertyInspector({ className, onAddSimulation, ...otherProps }, ref) {
  const { isInspectorOpen, toggleInspector } = useToggleStore();
  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore((state) => state.selectedSimulationIndex);

  const methods = useFormContext<DisplayConfigPostRequest>();
  const { watch, setValue, getValues } = methods;

  const simulations: Simulation[] = watch(selectedTab as any) || [];
  const currentSimulation = simulations[selectedSimulationIndex];
  const isSplitRoute = watch("is_split_route");

  const { depotId } = useParams<{ depotId: string }>();

  // Audio synthesis state
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const audiopath = watch(`${selectedTab}[${selectedSimulationIndex}].audioFileUrl`);
  const stopTypeAudioFileUrl = watch(`${selectedTab}[${selectedSimulationIndex}].stopTypeAudioFileUrl`);

  // Active sub-property for text (e.g. main text vs route number vs upper/lower)
  const [activeTextZone, setActiveTextZone] = useState<string>("text");

  if (!isInspectorOpen) return null;

  // Change slide format with clean state migration
  const handleFormatChange = (newFormat: "single" | "two" | "three") => {
    if (!currentSimulation || currentSimulation.format === newFormat) return;
    const w = currentSimulation.width;
    const h = currentSimulation.height;
    const t = currentSimulation.type;

    let updated: Simulation;
    const routeNum = isSplitRoute
      ? `${getValues("route_number_1") || ""}/${getValues("route_number_2") || ""}`
      : getValues("route_number") || "";
    const routeText = [getValues("source"), getValues("destination"), getValues("via")].filter(Boolean).join(" - ");

    if (newFormat === "single") {
      updated = getDefaultSingleSimulation(routeText || "Single Route Text", t);
    } else if (newFormat === "two") {
      updated = getDefaultTwoSimulation(
        routeNum,
        routeText,
        t,
        getValues("route_number_1"),
        getValues("route_number_2"),
        isSplitRoute
      );
    } else {
      updated = getDefaultThreeSimulation(
        routeNum,
        [getValues("source"), getValues("destination")].filter(Boolean).join(" - "),
        getValues("via") || "",
        t,
        getValues("route_number_1"),
        getValues("route_number_2"),
        isSplitRoute
      );
    }

    updated.width = w;
    updated.height = h;
    setValue(`${selectedTab}[${selectedSimulationIndex}]`, updated, { shouldDirty: true });
    setActiveTextZone(newFormat === "single" ? "text" : "text");
    toast.success(`Converted slide layout to ${newFormat.toUpperCase()}`);
  };

  // Change slide type
  const handleTypeChange = (newType: any) => {
    if (!currentSimulation) return;
    setValue(`${selectedTab}[${selectedSimulationIndex}].type`, newType, { shouldDirty: true });
  };

  // Copy current slide to another signboard
  const handleCopyCurrentSlideToBoard = (destBoard: string) => {
    if (!currentSimulation) return;
    const destSims = getValues(destBoard as any) || [];
    const cloned = JSON.parse(JSON.stringify(currentSimulation));
    setValue(destBoard as any, [...destSims, cloned], { shouldDirty: true });
    toast.success(
      `Copied Slide #${selectedSimulationIndex + 1} to ${destBoard.toUpperCase()} (Total: ${destSims.length + 1} slides)`
    );
  };

  // Audio Playback
  const handlePlayAudio = () => {
    if (!audioElementRef.current) return;
    const targetUrl = audiopath || stopTypeAudioFileUrl;
    if (!targetUrl) return;

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    audioElementRef.current.src = targetUrl;
    audioElementRef.current
      .play()
      .catch((err) => {
        console.warn("Audio play prevented:", err);
        setIsPlayingAudio(false);
      });
    audioElementRef.current.onended = () => setIsPlayingAudio(false);
  };

  const handleGenerateAudio = async () => {
    const textToConvert =
      currentSimulation?.texts?.text?.text ||
      (currentSimulation?.texts as any)?.upperHalfText?.text ||
      "";
    if (!textToConvert.trim()) {
      toast.warning("Please enter text content before generating audio.");
      return;
    }
    if (!depotId) {
      toast.warning("Depot ID is required for audio storage.");
      return;
    }
    try {
      setGeneratingAudio(true);
      toast.info("Synthesizing voice announcement via Sarvam AI...");
      const { fileUrl, fileName } = await handleSloganAudioGeneration(textToConvert, depotId);
      setValue(`${selectedTab}[${selectedSimulationIndex}].audioFileUrl`, fileUrl, { shouldDirty: true });
      setValue(`${selectedTab}[${selectedSimulationIndex}].audioFileName`, fileName, { shouldDirty: true });
      toast.success("Voice announcement synthesized successfully!");
    } catch (err: any) {
      console.error("Audio generation failed:", err);
      toast.error(`Audio synthesis failed: ${err?.message || err}`);
    } finally {
      setGeneratingAudio(false);
    }
  };

  const handleDeleteAudio = async () => {
    if (!audiopath || !depotId) return;
    const path = audiopath.split("/").pop();
    if (!path) return;
    try {
      await supabase.storage.from("stops").remove([`${depotId}/${path}`]);
      setValue(`${selectedTab}[${selectedSimulationIndex}].audioFileUrl`, null, { shouldDirty: true });
      setValue(`${selectedTab}[${selectedSimulationIndex}].audioFileName`, null, { shouldDirty: true });
      toast.success("Audio file removed");
    } catch (err: any) {
      toast.error(`Failed to delete audio: ${err.message || err}`);
    }
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "fixed xl:relative inset-y-0 right-0 z-40 xl:z-auto flex h-full w-[360px] max-w-[90vw] sm:max-w-[360px] flex-none flex-col border-l border-solid border-neutral-border bg-sidebar-background shadow-2xl xl:shadow-md overflow-hidden select-none pb-safe",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <audio ref={audioElementRef} className="hidden" />

      {/* Inspector Header */}
      <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border px-3 bg-neutral-0/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-brand-primary border border-brand-500/20">
            <FeatherSliders className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-caption-bold font-caption-bold text-default-font truncate">
              {currentSimulation
                ? `Slide #${selectedSimulationIndex + 1} Inspector`
                : `${selectedTab.toUpperCase()} Board Config`}
            </span>
            <span className="text-[10px] text-subtext-color uppercase tracking-wider">
              {currentSimulation
                ? `${currentSimulation.format.toUpperCase()} • ${currentSimulation.width}×${currentSimulation.height} PX`
                : "Display Properties"}
            </span>
          </div>
        </div>
        <IconButton
          variant="neutral-tertiary"
          size="small"
          icon={<FeatherX className="h-4 w-4" />}
          title="Close Inspector"
          onClick={toggleInspector}
        />
      </div>

      {/* Body */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar p-3 space-y-4">
        {currentSimulation ? (
          <>
            {/* 1. Format & Semantics (Compact Segmented Controls) */}
            <div className="rounded-xl border border-neutral-border bg-neutral-0/40 p-3 space-y-2.5 shadow-2xs">
              <span className="text-caption-bold font-caption-bold text-default-font block">
                Slide Format & Layout
              </span>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-neutral-100/70 p-1 border border-neutral-border">
                {(["single", "two", "three"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleFormatChange(fmt)}
                    className={SubframeUtils.twClassNames(
                      "flex items-center justify-center py-1.5 px-2 rounded text-xs font-semibold capitalize transition-all cursor-pointer",
                      currentSimulation.format === fmt
                        ? "bg-neutral-0 text-brand-primary shadow-xs ring-1 ring-neutral-border font-bold"
                        : "text-subtext-color hover:text-default-font"
                    )}
                  >
                    {fmt === "single" ? "Single" : fmt === "two" ? "Two-Line" : "Three-Line"}
                  </button>
                ))}
              </div>

              {/* Simulation Type Selector */}
              <div className="grid grid-cols-3 gap-1 pt-1">
                {(["route", "slogan", "special message"] as const).map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => handleTypeChange(tp)}
                    className={SubframeUtils.twClassNames(
                      "py-1 px-1.5 rounded-md text-[11px] font-medium capitalize truncate text-center border transition-all cursor-pointer",
                      currentSimulation.type === tp
                        ? "bg-brand-500/10 border-brand-500/30 text-brand-primary font-bold"
                        : "border-neutral-border bg-neutral-100/40 text-subtext-color hover:text-default-font"
                    )}
                  >
                    {tp === "route" ? "Route" : tp === "slogan" ? "Slogan" : "Special"}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Quick Copy Slide to Another Signboard */}
            <div className="rounded-xl border border-neutral-border bg-neutral-0/40 p-3 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-caption-bold font-caption-bold text-default-font">
                  Copy Slide to Board
                </span>
                <span className="text-[10px] text-subtext-color font-mono">
                  Slide #{selectedSimulationIndex + 1}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(["front", "side", "rear", "internal"] as const)
                  .filter((b) => b !== selectedTab)
                  .map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleCopyCurrentSlideToBoard(b)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md border border-neutral-border bg-neutral-100/50 hover:bg-brand-50 hover:border-brand-500/30 text-xs font-semibold text-default-font capitalize transition-all cursor-pointer"
                      title={`Copy Slide #${selectedSimulationIndex + 1} to ${b.toUpperCase()} signboard`}
                    >
                      <FeatherCopy className="h-3 w-3 text-brand-primary" />
                      {b}
                    </button>
                  ))}
              </div>
            </div>

            {/* 3. Text Zone Selector (if Two or Three Line Format) */}
            {currentSimulation.format !== "single" && (
              <div className="rounded-xl border border-neutral-border bg-neutral-0/40 p-2 shadow-2xs">
                <span className="text-[11px] font-semibold text-subtext-color block px-1 mb-1.5 uppercase tracking-wider">
                  Select Text Zone to Edit:
                </span>
                <div className="flex items-center gap-1 rounded-lg bg-neutral-100/70 p-1 border border-neutral-border">
                  <button
                    type="button"
                    onClick={() => setActiveTextZone("routeNumber")}
                    className={SubframeUtils.twClassNames(
                      "flex-1 py-1 px-1.5 rounded text-xs font-medium transition-all text-center cursor-pointer truncate",
                      activeTextZone === "routeNumber"
                        ? "bg-neutral-0 text-brand-primary shadow-xs ring-1 ring-neutral-border font-bold"
                        : "text-subtext-color hover:text-default-font"
                    )}
                  >
                    Route #
                  </button>

                  {currentSimulation.format === "two" && (
                    <button
                      type="button"
                      onClick={() => setActiveTextZone("text")}
                      className={SubframeUtils.twClassNames(
                        "flex-1 py-1 px-1.5 rounded text-xs font-medium transition-all text-center cursor-pointer truncate",
                        activeTextZone === "text"
                          ? "bg-neutral-0 text-brand-primary shadow-xs ring-1 ring-neutral-border font-bold"
                          : "text-subtext-color hover:text-default-font"
                      )}
                    >
                      Destination Text
                    </button>
                  )}

                  {currentSimulation.format === "three" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTextZone("upperHalfText")}
                        className={SubframeUtils.twClassNames(
                          "flex-1 py-1 px-1.5 rounded text-xs font-medium transition-all text-center cursor-pointer truncate",
                          activeTextZone === "upperHalfText"
                            ? "bg-brand-500 shadow-xs ring-1 ring-neutral-border font-bold"
                            : "text-subtext-color hover:text-default-font"
                        )}
                      >
                        Upper Line
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTextZone("lowerHalfText")}
                        className={SubframeUtils.twClassNames(
                          "flex-1 py-1 px-1.5 rounded text-xs font-medium transition-all text-center cursor-pointer truncate",
                          activeTextZone === "lowerHalfText"
                            ? "bg-neutral-0 text-brand-primary shadow-xs ring-1 ring-neutral-border font-bold"
                            : "text-subtext-color hover:text-default-font"
                        )}
                      >
                        Lower Line
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 4. Text Properties & Motion Controls */}
            <div className="rounded-xl border border-neutral-border bg-neutral-0/40 p-3 shadow-2xs">
              <span className="text-caption-bold font-caption-bold text-default-font block mb-3">
                Typography & Scroll Motion
              </span>
              <TextPropertiesControls
                textProperty={
                  currentSimulation.format === "single"
                    ? "text"
                    : activeTextZone === "routeNumber"
                    ? isSplitRoute
                      ? "routeNumber1"
                      : "sideText"
                    : activeTextZone
                }
              />
            </div>

            {/* 5. Voice Announcement (PAS Audio) */}
            {currentSimulation.type !== "route" && (
              <div className="rounded-xl border border-neutral-border bg-neutral-0/40 p-3 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-brand-primary">
                    <FeatherMusic className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    Voice Announcement (PAS)
                  </span>
                </div>

                {audiopath || stopTypeAudioFileUrl ? (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant={isPlayingAudio ? "brand-secondary" : "brand-primary"}
                      size="small"
                      className="w-full"
                      onClick={handlePlayAudio}
                      disabled={generatingAudio}
                    >
                      {isPlayingAudio ? "Stop Voice" : "Play Voice Announcement"}
                    </Button>

                    {audiopath && !stopTypeAudioFileUrl && (
                      <div className="flex gap-2">
                        <Button
                          variant="neutral-secondary"
                          size="small"
                          className="flex-1 text-xs"
                          onClick={handleGenerateAudio}
                          loading={generatingAudio}
                          disabled={generatingAudio}
                        >
                          Re-generate
                        </Button>
                        <Button
                          variant="destructive-secondary"
                          size="small"
                          className="flex-1 text-xs"
                          onClick={handleDeleteAudio}
                          disabled={generatingAudio}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="brand-primary"
                    size="small"
                    className="w-full"
                    onClick={handleGenerateAudio}
                    loading={generatingAudio}
                    disabled={generatingAudio}
                  >
                    Synthesize Audio (TTS)
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          /* Empty Inspector State with Quick Add Buttons */
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-neutral-border bg-neutral-0/20 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-primary">
              <FeatherAirplay className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-caption-bold font-caption-bold text-default-font">
                No Slide Selected
              </h4>
              <p className="text-xs text-subtext-color mt-1">
                Select a slide in the sequence below, or add a new slide to configure its LED matrix.
              </p>
            </div>

            {onAddSimulation && (
              <div className="flex flex-col w-full gap-2 pt-2">
                <Button
                  variant="brand-primary"
                  size="small"
                  className="w-full h-8 text-xs font-medium"
                  icon={<FeatherPlus />}
                  onClick={() => onAddSimulation("single")}
                >
                  Add Single-Line Slide
                </Button>
                <Button
                  variant="neutral-secondary"
                  size="small"
                  className="w-full h-8 text-xs font-medium"
                  onClick={() => onAddSimulation("two")}
                >
                  Add Two-Line Route Slide
                </Button>
                <Button
                  variant="neutral-secondary"
                  size="small"
                  className="w-full h-8 text-xs font-medium"
                  onClick={() => onAddSimulation("single", "slogan")}
                >
                  Add Safety Slogan Slide
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
