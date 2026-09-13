"use client";
import React, { useState, useRef } from "react";
import {
  FeatherAirplay,
  FeatherCopy,
  FeatherLayers,
  FeatherMusic,
  FeatherRoute,
  FeatherSliders,
  FeatherType,
  FeatherX,
} from "@subframe/core";
import * as SubframeUtils from "../utils";
import { ControlAccordion } from "./ControlAccordion";
import { FormatSelectionControl } from "./FormatSelectionControl";
import { HeightControl } from "./HeightControl";
import { IconWithBackground } from "./IconWithBackground";
import { SelectionCardWithText } from "./SelectionCardWithText";
import { SimulationTypeControl } from "./SimulationTypeControl";
import { WidthControl } from "./WidthControl";
import { RouteConfigurationForm } from "./RouteConfigurationForm";
import { RouteNumberControl } from "./RouteNumberControl";
import { RouteNumberControl1 } from "./RouteNumberControl1";
import { RouteNumberControl2 } from "./RouteNumberControl2";
import { MainTextControl } from "./MainTextControl";
import { UpperHalfTextControl } from "./UpperHalfTextControl";
import { LowerHalfTextControl } from "./LowerHalfTextControl";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import useSimulationStore from "@/store/useSimulationStore";
import useTabsStore from "@/store/useTabsStore";
import useToggleStore from "@/store/useToggleStore";
import { useFormContext } from "react-hook-form";
import { DisplayConfigPostRequest, Simulation } from "@/types/routeConfigV2";
import { generateAudio, handleSloganAudioGeneration } from "@/utils/fetchTTS";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "@/supabaseClient";

type InspectorTab = "route" | "display" | "text";

interface StudioInspectorPanelRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const StudioInspectorPanelRoot = React.forwardRef<
  HTMLDivElement,
  StudioInspectorPanelRootProps
>(function StudioInspectorPanelRoot({ className, ...otherProps }, ref) {
  const [activeTab, setActiveTab] = useState<InspectorTab>("route");
  const { isInspectorOpen, toggleInspector } = useToggleStore();

  const methods = useFormContext<DisplayConfigPostRequest>();
  const { watch, setValue } = methods;

  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore((state) => state.selectedSimulationIndex);

  const simulations: Simulation[] = watch(selectedTab) || [];
  const currentSimulation = simulations[selectedSimulationIndex];

  const { depotId } = useParams<{ depotId: string }>();

  // Audio synthesis state
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const audiopath = watch(`${selectedTab}[${selectedSimulationIndex}].audioFileUrl`);
  const stopTypeAudioFileUrl = watch(`${selectedTab}[${selectedSimulationIndex}].stopTypeAudioFileUrl`);

  // Active section for text settings accordion
  const [activeTextSection, setActiveTextSection] = useState<string | null>("mainText");

  // Copy simulations from active tab to another signboard
  const copySimulations = (destinationTab: string) => {
    const sourceSimulations = simulations;
    const destinationSimulations = watch(destinationTab as any) || [];
    const updated = [...sourceSimulations];
    setValue(destinationTab as any, updated);
    toast.success(`Copied ${sourceSimulations.length} slides to ${destinationTab.toUpperCase()} display!`);
  };

  // Audio loop playback
  const handleLoop = () => {
    if (!audioElementRef.current) return;
    setIsLooping(true);

    if (currentSimulation?.type === "stop" && stopTypeAudioFileUrl) {
      audioElementRef.current.setAttribute("src", stopTypeAudioFileUrl);
      audioElementRef.current
        .play()
        .catch((err) => {
          console.warn("Autoplay prevented:", err);
          setIsLooping(false);
        });
      audioElementRef.current.onended = () => {
        if (!audioElementRef.current) return;
        audioElementRef.current.setAttribute("src", audiopath || "");
        audioElementRef.current
          .play()
          .catch((err) => {
            console.warn("Autoplay prevented:", err);
            setIsLooping(false);
          });
        audioElementRef.current.onended = () => {
          if (!audioElementRef.current) return;
          audioElementRef.current.pause();
          audioElementRef.current.setAttribute("src", "");
          setIsLooping(false);
        };
      };
    } else if (audiopath) {
      audioElementRef.current.setAttribute("src", audiopath);
      audioElementRef.current
        .play()
        .catch((err) => {
          console.warn("Autoplay prevented:", err);
          setIsLooping(false);
        });
      audioElementRef.current.onended = () => {
        if (!audioElementRef.current) return;
        audioElementRef.current.pause();
        audioElementRef.current.setAttribute("src", "");
        setIsLooping(false);
      };
    } else {
      setIsLooping(false);
    }
  };

  const deleteAudioFile = async (fileUrl: string, depId?: string) => {
    const path = fileUrl.split("/").pop();
    if (!path || !depId) return;
    try {
      const { error } = await supabase.storage.from("stops").remove([`${depId}/${path}`]);
      if (error) throw error;
      setValue(`${selectedTab}[${selectedSimulationIndex}].audioFileUrl`, null);
      setValue(`${selectedTab}[${selectedSimulationIndex}].audioFileName`, null);
      toast.success("Audio file deleted");
    } catch (err: any) {
      console.error("Delete audio error:", err);
      toast.error(`Failed to delete audio: ${err.message || err}`);
    }
  };

  const genAudio = async (text?: string, depId?: string) => {
    if (!text || !depId) {
      toast.warning("No text or depot available to generate audio.");
      return;
    }
    try {
      setGeneratingAudio(true);
      toast.info("Generating voice announcement via Sarvam AI...");
      const { fileUrl, fileName } = await handleSloganAudioGeneration(text, depId);
      setValue(`${selectedTab}[${selectedSimulationIndex}].audioFileUrl`, fileUrl);
      setValue(`${selectedTab}[${selectedSimulationIndex}].audioFileName`, fileName);
      toast.success("Voice announcement generated successfully!");
    } catch (err: any) {
      console.error("Error generating audio:", err);
      toast.error(`Audio synthesis failed: ${err?.message || err}`);
    } finally {
      setGeneratingAudio(false);
    }
  };

  if (!isInspectorOpen) return null;

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-88 flex-none flex-col border-l border-solid border-neutral-border bg-sidebar-background shadow-lg overflow-hidden select-none",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {/* Hidden Audio Engine */}
      <audio ref={audioElementRef} className="hidden" />

      {/* Inspector Header */}
      <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border px-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-brand-primary">
            <FeatherSliders className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-caption-bold font-caption-bold text-default-font truncate">
              Studio Inspector
            </span>
            <span className="text-[10px] text-subtext-color truncate uppercase tracking-wider">
              {currentSimulation
                ? `${selectedTab} • Slide #${selectedSimulationIndex + 1} (${currentSimulation.width}×${currentSimulation.height})`
                : `${selectedTab.toUpperCase()} Display Config`}
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

      {/* Segmented Tab Navigation */}
      <div className="flex w-full flex-none border-b border-solid border-neutral-border bg-neutral-0/30 p-1.5 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("route")}
          className={SubframeUtils.twClassNames(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-caption font-medium transition-all cursor-pointer",
            activeTab === "route"
              ? "bg-neutral-100 text-brand-primary shadow-2xs font-semibold ring-1 ring-neutral-border"
              : "text-subtext-color hover:text-default-font hover:bg-neutral-50/50"
          )}
        >
          <FeatherRoute className="h-3.5 w-3.5" />
          <span>Route</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("display")}
          className={SubframeUtils.twClassNames(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-caption font-medium transition-all cursor-pointer",
            activeTab === "display"
              ? "bg-neutral-100 text-brand-primary shadow-2xs font-semibold ring-1 ring-neutral-border"
              : "text-subtext-color hover:text-default-font hover:bg-neutral-50/50"
          )}
        >
          <FeatherAirplay className="h-3.5 w-3.5" />
          <span>Screen</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("text")}
          className={SubframeUtils.twClassNames(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-caption font-medium transition-all cursor-pointer",
            activeTab === "text"
              ? "bg-neutral-100 text-brand-primary shadow-2xs font-semibold ring-1 ring-neutral-border"
              : "text-subtext-color hover:text-default-font hover:bg-neutral-50/50"
          )}
        >
          <FeatherType className="h-3.5 w-3.5" />
          <span>Text</span>
        </button>
      </div>

      {/* Inspector Content Body */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar p-3 space-y-4">
        {/* TAB 1: ROUTE CONFIG */}
        {activeTab === "route" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-neutral-border bg-neutral-0/40 p-3">
              <div className="flex items-center gap-2 mb-3">
                <IconWithBackground
                  variant="brand"
                  size="small"
                  icon={<FeatherRoute />}
                  square={false}
                />
                <div>
                  <h4 className="text-caption-bold font-caption-bold text-default-font">
                    Route Information
                  </h4>
                  <p className="text-[11px] text-subtext-color">
                    Core metadata broadcasted across all bus signboards
                  </p>
                </div>
              </div>
              <RouteConfigurationForm className="w-full" />
            </div>

            {/* Quick Signboard Transfer */}
            <div className="rounded-lg border border-neutral-border bg-neutral-0/40 p-3">
              <div className="flex items-center gap-2 mb-2">
                <IconWithBackground
                  variant="brand"
                  size="small"
                  icon={<FeatherCopy />}
                  square={false}
                />
                <span className="text-caption-bold font-caption-bold text-default-font">
                  Mirror To Other Screens
                </span>
              </div>
              <p className="text-[11px] text-subtext-color mb-2">
                Copy all slides from <strong className="text-brand-primary uppercase">{selectedTab}</strong> to:
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {selectedTab !== "front" && (
                  <SelectionCardWithText title="Front Windshield Sign" onClick={() => copySimulations("front")} />
                )}
                {selectedTab !== "side" && (
                  <SelectionCardWithText title="Side Passenger Sign" onClick={() => copySimulations("side")} />
                )}
                {selectedTab !== "rear" && (
                  <SelectionCardWithText title="Rear Window Sign" onClick={() => copySimulations("rear")} />
                )}
                {selectedTab !== "internal" && (
                  <SelectionCardWithText title="Internal Saloon Sign" onClick={() => copySimulations("internal")} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCREEN & MATRIX CONTROLS */}
        {activeTab === "display" && (
          <div className="flex flex-col gap-3">
            {currentSimulation ? (
              <>
                <div className="rounded-lg border border-neutral-border bg-neutral-0/40 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-caption-bold font-caption-bold text-default-font">
                      Matrix Resolution
                    </span>
                    <span className="text-xs font-mono font-bold text-brand-primary px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                      {currentSimulation.width} × {currentSimulation.height}
                    </span>
                  </div>
                  <HeightControl />
                  <WidthControl />
                </div>

                <div className="rounded-lg border border-neutral-border bg-neutral-0/40 p-3 space-y-3">
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    Slide Format & Semantics
                  </span>
                  <SimulationTypeControl />
                  <FormatSelectionControl />
                </div>

                {/* Audio Announcement Controls */}
                {currentSimulation.type !== "route" && (
                  <div className="rounded-lg border border-neutral-border bg-neutral-0/40 p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <IconWithBackground
                        variant="brand"
                        size="small"
                        icon={<FeatherMusic />}
                        square={false}
                      />
                      <span className="text-caption-bold font-caption-bold text-default-font">
                        Voice Announcement (PAS)
                      </span>
                    </div>

                    {audiopath || stopTypeAudioFileUrl ? (
                      <div className="flex flex-col gap-2">
                        <Button
                          variant={isLooping ? "neutral-secondary" : "brand-primary"}
                          size="medium"
                          className="w-full"
                          onClick={handleLoop}
                          disabled={generatingAudio}
                        >
                          {isLooping ? "Stop Playing" : "Play Announcement"}
                        </Button>

                        {audiopath && !stopTypeAudioFileUrl && (
                          <div className="flex gap-2">
                            <Button
                              variant="neutral-secondary"
                              size="small"
                              className="flex-1"
                              onClick={async () => {
                                await deleteAudioFile(audiopath, depotId);
                                genAudio(currentSimulation?.texts?.text?.text || "", depotId);
                              }}
                              disabled={generatingAudio}
                            >
                              Re-generate
                            </Button>
                            <Button
                              variant="destructive-secondary"
                              size="small"
                              className="flex-1"
                              onClick={() => deleteAudioFile(audiopath, depotId)}
                              disabled={generatingAudio}
                            >
                              Delete Audio
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        variant="brand-primary"
                        size="medium"
                        className="w-full"
                        onClick={() => genAudio(currentSimulation?.texts?.text?.text, depotId)}
                        loading={generatingAudio}
                        disabled={generatingAudio}
                      >
                        Generate Audio (TTS)
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-neutral-border bg-neutral-0/20">
                <FeatherAirplay className="h-8 w-8 text-subtext-color/50 mb-2" />
                <p className="text-caption-bold text-default-font">No Simulation Selected</p>
                <p className="text-xs text-subtext-color mt-1">
                  Click on an LED card in the canvas to adjust its resolution, layout, and voice triggers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TEXT & MOTION CONTROLS */}
        {activeTab === "text" && (
          <div className="flex flex-col gap-3">
            {currentSimulation ? (
              <>
                {(() => {
                  const { format } = currentSimulation;
                  const isSplitRoute = watch("is_split_route");
                  return (
                    <div className="flex flex-col gap-2">
                      {(format === "two" || format === "three") && !isSplitRoute && (
                        <RouteNumberControl
                          open={activeTextSection === "routeNumber"}
                          onOpenChange={(isOpen) => setActiveTextSection(isOpen ? "routeNumber" : null)}
                        />
                      )}
                      {(format === "three" || format === "two") && isSplitRoute && (
                        <>
                          <RouteNumberControl1
                            open={activeTextSection === "routeNumber1"}
                            onOpenChange={(isOpen) => setActiveTextSection(isOpen ? "routeNumber1" : null)}
                          />
                          <RouteNumberControl2
                            open={activeTextSection === "routeNumber2"}
                            onOpenChange={(isOpen) => setActiveTextSection(isOpen ? "routeNumber2" : null)}
                          />
                        </>
                      )}
                      {(format === "single" || format === "two") && (
                        <MainTextControl
                          open={activeTextSection === "mainText"}
                          onOpenChange={(isOpen) => setActiveTextSection(isOpen ? "mainText" : null)}
                        />
                      )}
                      {format === "three" && (
                        <>
                          <UpperHalfTextControl
                            open={activeTextSection === "upperHalf"}
                            onOpenChange={(isOpen) => setActiveTextSection(isOpen ? "upperHalf" : null)}
                          />
                          <LowerHalfTextControl
                            open={activeTextSection === "lowerHalf"}
                            onOpenChange={(isOpen) => setActiveTextSection(isOpen ? "lowerHalf" : null)}
                          />
                        </>
                      )}
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-neutral-border bg-neutral-0/20">
                <FeatherType className="h-8 w-8 text-subtext-color/50 mb-2" />
                <p className="text-caption-bold text-default-font">No Simulation Selected</p>
                <p className="text-xs text-subtext-color mt-1">
                  Select a simulation card to customize text, fonts, scroll velocity, and symbols.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export const StudioInspectorPanel = StudioInspectorPanelRoot;
