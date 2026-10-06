"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  FeatherCopy,
  FeatherLayers,
  FeatherRepeat,
  FeatherRoute,
} from "@subframe/core";
import * as SubframeUtils from "../utils";
import { RouteConfigurationForm } from "./RouteConfigurationForm";
import { Button } from "./Button";
import { Select } from "./Select";
import useTabsStore, { Tab } from "@/store/useTabsStore";
import useSimulationStore from "@/store/useSimulationStore";
import { useFormContext } from "react-hook-form";
import { DisplayConfigPostRequest, Simulation } from "@/types/routeConfigV2";
import { toast } from "react-toastify";

const HEIGHT_OPTIONS = [16, 32] as const;
const WIDTH_OPTIONS = [64, 96, 128, 160, 192, 224] as const;

const SIGNBOARD_OPTIONS: { id: "front" | "side" | "rear" | "internal"; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "rear", label: "Rear" },
  { id: "internal", label: "Internal" },
];

interface RouteSpecificationPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const RouteSpecificationPanel = React.forwardRef<
  HTMLDivElement,
  RouteSpecificationPanelProps
>(function RouteSpecificationPanel({ className, ...otherProps }, ref) {
  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore((state) => state.selectedSimulationIndex);
  const { watch, setValue, getValues } = useFormContext<DisplayConfigPostRequest>();

  const isReturn = watch("return");
  const currentSimulations: Simulation[] = watch(selectedTab as any) || [];
  const activeSimulation = currentSimulations[selectedSimulationIndex] || currentSimulations[0];
  const activeWidth = activeSimulation?.width || 128;
  const activeHeight = activeSimulation?.height || 32;

  const destinationBoards = useMemo(
    () => SIGNBOARD_OPTIONS.filter((b) => b.id !== selectedTab),
    [selectedTab]
  );

  const [selectedDestBoard, setSelectedDestBoard] = useState<string>("side");

  useEffect(() => {
    if (selectedDestBoard === selectedTab || !destinationBoards.some((b) => b.id === selectedDestBoard)) {
      if (destinationBoards[0]) {
        setSelectedDestBoard(destinationBoards[0].id);
      }
    }
  }, [selectedTab, destinationBoards, selectedDestBoard]);

  // Invert Source & Destination for Return Route
  const handleInvertEndpoints = () => {
    const src = getValues("source");
    const dest = getValues("destination");
    setValue("source", dest, { shouldDirty: true });
    setValue("destination", src, { shouldDirty: true });
    setValue("return", !isReturn, { shouldDirty: true });
    toast.success(`Swapped Source & Destination for ${!isReturn ? "Return" : "Forward"} Route`);
  };

  // Change matrix height for current signboard
  const handleHeightChange = (newHeight: 16 | 32) => {
    const sims: Simulation[] = getValues(selectedTab as any) || [];
    if (sims.length === 0) {
      toast.info("Add a slide to apply matrix resolution");
      return;
    }
    const updated = sims.map((s) => {
      const texts = s.texts || {};
      const newTexts = { ...texts };
      if (newHeight === 16) {
        Object.keys(newTexts).forEach((k) => {
          const item = (newTexts as any)[k];
          if (item && (item.fontHeight > 16 || !item.fontHeight)) {
            newTexts[k] = { ...item, fontHeight: 16 };
          }
        });
      }
      return { ...s, height: newHeight, texts: newTexts };
    });
    setValue(selectedTab as any, updated, { shouldDirty: true });
    toast.success(`${selectedTab.toUpperCase()} Matrix height set to ${newHeight}px`);
  };

  // Change matrix width for current signboard
  const handleWidthChange = (newWidth: typeof WIDTH_OPTIONS[number]) => {
    const sims: Simulation[] = getValues(selectedTab as any) || [];
    if (sims.length === 0) {
      toast.info("Add a slide to apply matrix resolution");
      return;
    }
    const updated = sims.map((s) => ({ ...s, width: newWidth }));
    setValue(selectedTab as any, updated, { shouldDirty: true });
    toast.success(`${selectedTab.toUpperCase()} Matrix width set to ${newWidth}px`);
  };

  // Copy all simulations from current tab to chosen destination board
  const handleCopyAllToBoard = () => {
    const currentSims = getValues(selectedTab as any) || [];
    if (currentSims.length === 0) {
      toast.warning(`No slides on ${selectedTab.toUpperCase()} to copy.`);
      return;
    }
    if (!selectedDestBoard || selectedDestBoard === selectedTab) {
      toast.error("Please select a valid destination signboard.");
      return;
    }
    const cloned = JSON.parse(JSON.stringify(currentSims));
    setValue(selectedDestBoard as any, cloned, { shouldDirty: true });
    toast.success(
      `Copied all ${currentSims.length} slide(s) from ${selectedTab.toUpperCase()} to ${selectedDestBoard.toUpperCase()}!`
    );
  };

  // Copy single active slide to chosen destination board
  const handleCopySingleSlide = () => {
    const currentSims = getValues(selectedTab as any) || [];
    const activeSlide = currentSims[selectedSimulationIndex] || currentSims[0];
    if (!activeSlide) {
      toast.warning(`No slide on ${selectedTab.toUpperCase()} to copy.`);
      return;
    }
    if (!selectedDestBoard || selectedDestBoard === selectedTab) {
      toast.error("Please select a valid destination signboard.");
      return;
    }
    const destSims = getValues(selectedDestBoard as any) || [];
    const cloned = JSON.parse(JSON.stringify(activeSlide));
    setValue(selectedDestBoard as any, [...destSims, cloned], { shouldDirty: true });
    toast.success(
      `Copied Slide #${selectedSimulationIndex + 1} to ${selectedDestBoard.toUpperCase()} (Total: ${destSims.length + 1} slides)!`
    );
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "relative flex h-full w-[320px] max-w-[85vw] flex-none flex-col border-r border-solid border-neutral-border bg-sidebar-background shadow-md overflow-hidden select-none pb-safe",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {/* Header */}
      <div className="flex h-12 w-full flex-none items-center justify-between border-b border-solid border-neutral-border px-3 bg-neutral-0/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-brand-primary border border-brand-500/20">
            <FeatherRoute className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-caption-bold font-caption-bold text-default-font truncate">
              Route Specification
            </span>
            <span className="text-[10px] text-subtext-color uppercase tracking-wider">
              Transit Metadata
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar p-3 space-y-3.5">
        {/* Core Inputs Form */}
        <div className="rounded-xl border border-neutral-border bg-neutral-100/50 p-3 shadow-2xs">
          <RouteConfigurationForm className="w-full" />
        </div>

        {/* LED Matrix Resolution (Moved to Route Info Panel) */}
        {selectedTab !== Tab.STOPS && (
          <div className="rounded-xl border border-neutral-border bg-neutral-100/50 p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-caption-bold font-caption-bold text-default-font">
                Matrix Resolution
              </span>
              <span className="text-[10px] font-mono font-bold text-brand-primary bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                {activeWidth} × {activeHeight} px
              </span>
            </div>

            {/* Height row */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-subtext-color w-14 flex-none">Height:</span>
              <div className="grid grid-cols-2 gap-1.5 flex-1">
                {HEIGHT_OPTIONS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHeightChange(h)}
                    className={SubframeUtils.twClassNames(
                      "h-7 flex items-center justify-center rounded text-xs font-mono font-bold transition-all border cursor-pointer",
                      activeHeight === h
                        ? "bg-brand-500 border-brand-500 text-neutral-0 shadow-xs"
                        : "border-neutral-border bg-neutral-100 text-subtext-color hover:text-default-font hover:bg-neutral-200"
                    )}
                  >
                    {h} px
                  </button>
                ))}
              </div>
            </div>

            {/* Width grid */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs text-subtext-color w-14 flex-none">Width:</span>
              <div className="grid grid-cols-3 gap-1 flex-1">
                {WIDTH_OPTIONS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleWidthChange(w)}
                    className={SubframeUtils.twClassNames(
                      "h-7 flex items-center justify-center rounded text-xs font-mono font-bold transition-all border cursor-pointer",
                      activeWidth === w
                        ? "bg-brand-500 border-brand-500 text-neutral-0 shadow-xs"
                        : "border-neutral-border bg-neutral-100 text-subtext-color hover:text-default-font hover:bg-neutral-200"
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Signboard Slide Automation & Transfer */}
        {selectedTab !== Tab.STOPS && (
          <div className="rounded-xl border border-neutral-border bg-neutral-100/50 p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-caption-bold font-caption-bold text-default-font">
                Signboard Transfer
              </span>
              <span className="text-[10px] text-subtext-color uppercase tracking-wider font-semibold">
                From {selectedTab}
              </span>
            </div>

            {/* Destination Board Select */}
            <div className="flex flex-col gap-1">
              <span className="text-micro text-subtext-color font-medium">Destination Board:</span>
              <Select
                className="h-8 w-full"
                value={selectedDestBoard}
                onValueChange={(val) => setSelectedDestBoard(val as any)}
                placeholder="Select destination board"
              >
                {destinationBoards.map((b) => (
                  <Select.Item key={b.id} value={b.id}>
                    {b.label} Signboard
                  </Select.Item>
                ))}
              </Select>
            </div>

            {/* Transfer Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="neutral-secondary"
                size="medium"
                className=" w-full justify-start text-xs font-medium px-2.5"
                icon={<FeatherCopy className="h-3.5 w-3.5 text-brand-primary" />}
                onClick={handleCopyAllToBoard}
                title={`Copy all slides from ${selectedTab.toUpperCase()} to ${selectedDestBoard.toUpperCase()}`}
              >
                Copy All Slides ({currentSimulations.length}) to {selectedDestBoard.toUpperCase()}
              </Button>

              <Button
                variant="neutral-secondary"
                size="medium"
                className=" w-full justify-start text-xs font-medium px-2.5"
                icon={<FeatherLayers className="h-3.5 w-3.5 text-brand-primary" />}
                onClick={handleCopySingleSlide}
                title={`Copy active slide #${selectedSimulationIndex + 1} to ${selectedDestBoard.toUpperCase()}`}
              >
                Copy Slide #{selectedSimulationIndex + 1} to {selectedDestBoard.toUpperCase()}
              </Button>
            </div>
          </div>
        )}

        {/* Route Utilities */}
        <div className="rounded-xl border border-neutral-border bg-neutral-100/50 p-3 space-y-2 shadow-2xs">
          <span className="text-caption-bold font-caption-bold text-default-font block mb-0.5">
            Route Utilities
          </span>

          <Button
            variant="neutral-secondary"
            size="small"
            className="h-8.5 w-full justify-start text-xs font-medium px-2.5"
            icon={<FeatherRepeat className="h-3.5 w-3.5 text-brand-primary" />}
            onClick={handleInvertEndpoints}
            title="Swap Origin and Terminus endpoints"
          >
            Invert Source & Destination
          </Button>
        </div>
      </div>
    </div>
  );
});
