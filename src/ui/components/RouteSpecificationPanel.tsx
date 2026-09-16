"use client";
import React from "react";
import {
  FeatherChevronLeft,
  FeatherCopy,
  FeatherLayers,
  FeatherRepeat,
  FeatherRoute,
  FeatherSliders,
} from "@subframe/core";
import * as SubframeUtils from "../utils";
import { RouteConfigurationForm } from "./RouteConfigurationForm";
import { IconButton } from "./IconButton";
import { Button } from "./Button";
import useToggleStore from "@/store/useToggleStore";
import useTabsStore from "@/store/useTabsStore";
import { useFormContext } from "react-hook-form";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";
import { toast } from "react-toastify";

interface RouteSpecificationPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const RouteSpecificationPanel = React.forwardRef<
  HTMLDivElement,
  RouteSpecificationPanelProps
>(function RouteSpecificationPanel({ className, ...otherProps }, ref) {
  const { isRoutePanelOpen, toggleRoutePanel } = useToggleStore();
  const selectedTab = useTabsStore((state) => state.selectedTab);
  const { watch, setValue, getValues } = useFormContext<DisplayConfigPostRequest>();

  const front = watch("front") || [];
  const side = watch("side") || [];
  const rear = watch("rear") || [];
  const internal = watch("internal") || [];
  const isReturn = watch("return");

  if (!isRoutePanelOpen) return null;

  // Invert Source & Destination for Return Route
  const handleInvertEndpoints = () => {
    const src = getValues("source");
    const dest = getValues("destination");
    setValue("source", dest, { shouldDirty: true });
    setValue("destination", src, { shouldDirty: true });
    setValue("return", !isReturn, { shouldDirty: true });
    toast.success(`Swapped Source & Destination for ${!isReturn ? "Return" : "Forward"} Route`);
  };

  // Mirror slides from current tab to all other signboards
  const handleMirrorToAll = () => {
    const currentSims = getValues(selectedTab as any) || [];
    if (currentSims.length === 0) {
      toast.warning(`No slides on ${selectedTab.toUpperCase()} to mirror.`);
      return;
    }
    ["front", "side", "rear", "internal"].forEach((board) => {
      if (board !== selectedTab) {
        setValue(board as any, [...currentSims], { shouldDirty: true });
      }
    });
    toast.success(`Mirrored ${currentSims.length} slides from ${selectedTab.toUpperCase()} to all signboards!`);
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "fixed xl:relative inset-y-0 left-0 z-40 xl:z-auto flex h-full w-[320px] max-w-[85vw] sm:max-w-[320px] flex-none flex-col border-r border-solid border-neutral-border bg-sidebar-background shadow-2xl xl:shadow-md overflow-hidden select-none pb-safe",
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
        <IconButton
          variant="neutral-tertiary"
          size="small"
          icon={<FeatherChevronLeft className="h-4 w-4" />}
          title="Collapse Route Panel"
          onClick={toggleRoutePanel}
        />
      </div>

      {/* Body */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar p-3 space-y-4">
        {/* Core Inputs Form */}
        <div className="rounded-xl border border-neutral-border bg-neutral-0/40 p-3 shadow-2xs">
          <RouteConfigurationForm className="w-full" />
        </div>

        {/* Route Fleet Overview */}
        <div className="rounded-xl border border-neutral-border bg-neutral-0/40 p-3 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-caption-bold font-caption-bold text-default-font">
              Signboard Loop Stats
            </span>
            <span className="text-[10px] font-mono text-brand-primary bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
              4 Displays
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex h-9 items-center justify-between px-2.5 rounded-lg bg-neutral-100/50 border border-neutral-border/60">
              <span className="text-subtext-color truncate font-medium">Front</span>
              <span className="font-mono font-bold text-default-font whitespace-nowrap ml-1">{front.length} slides</span>
            </div>
            <div className="flex h-9 items-center justify-between px-2.5 rounded-lg bg-neutral-100/50 border border-neutral-border/60">
              <span className="text-subtext-color truncate font-medium">Side</span>
              <span className="font-mono font-bold text-default-font whitespace-nowrap ml-1">{side.length} slides</span>
            </div>
            <div className="flex h-9 items-center justify-between px-2.5 rounded-lg bg-neutral-100/50 border border-neutral-border/60">
              <span className="text-subtext-color truncate font-medium">Rear</span>
              <span className="font-mono font-bold text-default-font whitespace-nowrap ml-1">{rear.length} slides</span>
            </div>
            <div className="flex h-9 items-center justify-between px-2.5 rounded-lg bg-neutral-100/50 border border-neutral-border/60">
              <span className="text-subtext-color truncate font-medium">Internal</span>
              <span className="font-mono font-bold text-default-font whitespace-nowrap ml-1">{internal.length} slides</span>
            </div>
          </div>
        </div>

        {/* Quick Automation Actions */}
        <div className="rounded-xl border border-neutral-border bg-neutral-0/40 p-3 space-y-2 shadow-2xs">
          <span className="text-caption-bold font-caption-bold text-default-font block mb-1">
            Signboard Shortcuts
          </span>

          <Button
            variant="neutral-secondary"
            size="small"
            className="h-9 w-full justify-start text-xs font-medium px-3"
            icon={<FeatherCopy className="h-4 w-4 text-brand-primary" />}
            onClick={handleMirrorToAll}
            title="Copy current signboard slides to Front, Side, Rear, and Internal"
          >
            Mirror {selectedTab.toUpperCase()} to All Signs
          </Button>

          <Button
            variant="neutral-secondary"
            size="small"
            className="h-9 w-full justify-start text-xs font-medium px-3"
            icon={<FeatherRepeat className="h-4 w-4 text-brand-primary" />}
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
