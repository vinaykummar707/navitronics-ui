"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  FeatherAlignCenter,
  FeatherAlignLeft,
  FeatherAlignRight,
  FeatherChevronDown,
  FeatherChevronLeft,
  FeatherChevronRight,
  FeatherChevronUp,
  FeatherCloud,
  FeatherColumns2,
  FeatherCopy,
  FeatherDownload,
  FeatherLayers,
  FeatherMaximize2,
  FeatherMinus,
  FeatherMonitor,
  FeatherMusic,
  FeatherPause,
  FeatherPlay,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherRepeat,
  FeatherRotateCw,
  FeatherSearch,
  FeatherShuffle,
  FeatherSliders,
  FeatherSparkle,
  FeatherSpeech,
  FeatherTrash,
  FeatherVolume2,
  FeatherX,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { Select } from "./Select";
import { TextField } from "./TextField";
import { Checkbox } from "./Checkbox";
import { Dialog } from "./Dialog";
import { JsonViewerDialog } from "./JsonViewerDialog";
import { MaterialSymbolPicker } from "./MaterialSymbolPicker";
import DisplayEditor from "@/components/DisplayEditor";
import IMEInput from "@/components/IMEInput";
import AutoTextGenerator from "@/components/AutoTextGenerator";
import RBAC from "@/components/RBAC";
import useTabsStore, { Tab } from "@/store/useTabsStore";
import useSimulationStore from "@/store/useSimulationStore";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { Controller, SubmitHandler, useFormContext } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { IRoute, routeCrud } from "@/types/IRoute";
import { IStopWithAudio, stopCrud } from "@/types/IStop";
import { checkActiveDuplicate } from "@/hooks/useCrud";
import { toast } from "react-toastify";
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_SIMULATION_TYPE,
  getDefaultSingleSimulation,
  getDefaultStopSingleSimulation,
  getDefaultThreeSimulation,
  getDefaultTwoSimulation,
} from "@/constants/defaultRouteValues";
import {
  DisplayConfigPostRequest,
  Simulation,
  SimulationType,
} from "@/types/routeConfigV2";
import { migrateSlidesOnSplitRouteToggle, sanitizeRouteBoards } from "@/utils/simulationUtils";
import { useFontHeightForLanguage, useFontHeightsForLanguage } from "@/utils/getFontFileByLanguage";
import { handleSloganAudioGeneration } from "@/utils/fetchTTS";

const HEIGHT_OPTIONS = [16, 32] as const;
const WIDTH_OPTIONS = [64, 96, 128, 160, 192, 224] as const;

const FONT_HEIGHT_GRID = [
  7, 8, 10, 12, 14, 16, 18,
  20, 22, 24, 26, 28, 30, 32,
];

const BOARD_ITEMS = [
  { id: Tab.FRONT, letter: "F", label: "FRONT" },
  { id: Tab.SIDE, letter: "S", label: "SIDE" },
  { id: Tab.REAR, letter: "R", label: "REAR" },
  { id: Tab.INTERNAL, letter: "I", label: "CABIN" },
  { id: Tab.STOPS, letter: "P", label: "PAS/OP3" },
];

const getFirstTextZone = (split: boolean) => (split ? "routeNumber1" : "routeNumber");

interface ActionTooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

const ActionTooltip: React.FC<ActionTooltipProps> = ({
  content,
  children,
  side = "top",
  align = "center",
}) => {
  if (!content) return children;
  return (
    <SubframeCore.Tooltip.Root delayDuration={150}>
      <SubframeCore.Tooltip.Trigger asChild={true}>
        {children}
      </SubframeCore.Tooltip.Trigger>
      <SubframeCore.Tooltip.Portal>
        <SubframeCore.Tooltip.Content
          side={side}
          align={align}
          sideOffset={5}
          style={{ zIndex: 99999 }}
          asChild={true}
        >
          <div className="z-[99999] px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-white shadow-xl pointer-events-none select-none text-[11px] font-medium leading-tight">
            {content}
          </div>
        </SubframeCore.Tooltip.Content>
      </SubframeCore.Tooltip.Portal>
    </SubframeCore.Tooltip.Root>
  );
};

interface RouteCreationLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  mode?: "create" | "edit";
}

export const RouteCreationLayout = React.forwardRef<HTMLDivElement, RouteCreationLayoutProps>(
  function RouteCreationLayout({ className, mode = "create", ...otherProps }, ref) {
    const navigate = useNavigate();
    const { areaId, depotId } = useParams<{ areaId?: string; depotId?: string }>();
    const { selectedOrganization } = useOrganizationStore();

    // Global Stores
    const { selectedTab, setSelectedTab } = useTabsStore();
    const { selectedSimulationIndex, setSelectedSimulationIndex } = useSimulationStore();

    // React Hook Form
    const methods = useFormContext<DisplayConfigPostRequest & IRoute>();
    const {
      register,
      watch,
      setValue,
      getValues,
      handleSubmit,
      formState,
      setError,
      control,
    } = methods;

    const { useCreate, useUpdate } = routeCrud;
    const { mutate: createRoute, isPending: isCreatingRoute } = useCreate();
    const { mutate: updateRoute, isPending: isUpdatingRoute } = useUpdate();

    // Synchronous Tab Switch Handler to prevent blank frame renders and page blinking
    const handleTabChange = useCallback((newTab: Tab) => {
      if (newTab === selectedTab) return;
      const newTabSims: Simulation[] = getValues(newTab as any) || [];
      const nextIndex = newTabSims.length > 0 ? 0 : -1;
      setSelectedSimulationIndex(nextIndex);
      setSelectedTab(newTab);
    }, [selectedTab, getValues, setSelectedSimulationIndex, setSelectedTab]);

    // Local UI State
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [ledColor, setLedColor] = useState<"#ffbf00" | "#ff2222">("#ffbf00");
    const [zoom, setZoom] = useState<number>(100);
    const [isCycling, setIsCycling] = useState<boolean>(false);
    const [showAutoText, setShowAutoText] = useState(false);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [showCopyDropdown, setShowCopyDropdown] = useState(false);

    // Audio state
    const [generatingAudio, setGeneratingAudio] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);

    // Stops state (for Tab.STOPS)
    const [stopLanguage, setStopLanguage] = useState<string>("en");
    const [stopUpDown, setStopUpDown] = useState<"up" | "down">("up");
    const [selectedStop, setSelectedStop] = useState<IStopWithAudio | null>(null);
    const [selectedStopTypes, setSelectedStopTypes] = useState<string[]>(["next", "arrived"]);

    // Watch Form Values
    const isSplitRoute = watch("is_split_route");
    const routeNumber = watch("route_number");
    const routeNumber1 = watch("route_number_1");
    const routeNumber2 = watch("route_number_2");
    const source = watch("source");
    const destination = watch("destination");
    const via = watch("via");
    const isReturn = watch("return");

    const displayRouteNum = isSplitRoute
      ? `${routeNumber1 || "?"} / ${routeNumber2 || "?"}`
      : routeNumber || "---";

    // Active board simulations with safe index boundary
    const simulations: Simulation[] = watch(selectedTab as any) || [];
    const safeSimulationIndex = simulations.length > 0
      ? Math.min(Math.max(0, selectedSimulationIndex), simulations.length - 1)
      : -1;
    const currentSimulation = safeSimulationIndex >= 0 ? simulations[safeSimulationIndex] : null;

    // Ensure selectedSimulationIndex stays in sync if slides list changes
    useEffect(() => {
      if (!simulations || simulations.length === 0) {
        if (selectedSimulationIndex !== -1) setSelectedSimulationIndex(-1);
      } else if (selectedSimulationIndex >= simulations.length || selectedSimulationIndex < 0) {
        setSelectedSimulationIndex(0);
      }
    }, [simulations.length, selectedSimulationIndex, setSelectedSimulationIndex]);

    // Optimistic format state for instantaneous UI feedback on format switch
    const [optimisticFormat, setOptimisticFormat] = useState<"single" | "two" | "three" | null>(null);

    // Sync optimisticFormat once form store updates
    useEffect(() => {
      if (currentSimulation && optimisticFormat === currentSimulation.format) {
        setOptimisticFormat(null);
      }
    }, [currentSimulation?.format, optimisticFormat]);

    // Reset optimistic format if tab or simulation index changes
    useEffect(() => {
      setOptimisticFormat(null);
    }, [selectedTab, selectedSimulationIndex]);

    const currentFormat: "single" | "two" | "three" =
      optimisticFormat ?? (currentSimulation?.format as any) ?? "two";

    // Active Text Zone selection state
    const [userTextZone, setUserTextZone] = useState<string>("routeNumber");

    // Effective Text Zone derived synchronously on render to prevent cascading re-render flashes
    const activeTextZone = useMemo(() => {
      if (!currentSimulation || currentFormat === "single") return "text";
      if (currentFormat === "three") {
        if (isSplitRoute) {
          if (userTextZone === "routeNumber1" || userTextZone === "routeNumber2") return userTextZone;
        } else {
          if (userTextZone === "routeNumber" || userTextZone === "sideText") return "routeNumber";
        }
        if (userTextZone === "upperHalfText" || userTextZone === "lowerHalfText") return userTextZone;
        return isSplitRoute ? "routeNumber1" : "routeNumber";
      }
      if (isSplitRoute) {
        if (userTextZone === "routeNumber1" || userTextZone === "routeNumber2") return userTextZone;
        return "routeNumber1";
      }
      if (userTextZone === "text") return "text";
      return "routeNumber";
    }, [currentFormat, userTextZone, isSplitRoute, currentSimulation]);

    // Active Text Zone path helper
    const activeTextZoneKey = useMemo(() => {
      if (!currentSimulation || currentFormat === "single") return "text";
      if (activeTextZone === "routeNumber") {
        if (isSplitRoute) return "routeNumber1";
        if (currentSimulation.texts && !currentSimulation.texts.sideText && (currentSimulation.texts as any).routeNumber) {
          return "routeNumber";
        }
        return "sideText";
      }
      if (activeTextZone === "routeNumber1" || activeTextZone === "routeNumber2") {
        return isSplitRoute ? activeTextZone : "sideText";
      }
      return activeTextZone;
    }, [currentSimulation, activeTextZone, isSplitRoute, currentFormat]);

    // Ensure active zone has text configuration initialized
    useEffect(() => {
      if (!currentSimulation || safeSimulationIndex < 0 || !activeTextZoneKey) return;
      const texts = currentSimulation.texts || {};
      const currentZoneConfig = (texts as any)[activeTextZoneKey];
      if (!currentZoneConfig) {
        const fallbackText =
          activeTextZone === "routeNumber"
            ? (watch("route_number") as string) || ""
            : activeTextZone === "routeNumber1"
              ? (watch("route_number_1") as string) || ""
              : activeTextZone === "routeNumber2"
                ? (watch("route_number_2") as string) || ""
                : "";
        setValue(`${selectedTab}[${safeSimulationIndex}].texts.${activeTextZoneKey}`, {
          text: fallbackText,
          language: "en",
          fontHeight: currentFormat === "three" && (activeTextZoneKey === "upperHalfText" || activeTextZoneKey === "lowerHalfText") ? 7 : 14,
          fontWeight: "Bold",
          position: "Center",
          scrollType: "Fixed",
          scrollSpeed: 4,
          bitmap: "",
        }, { shouldDirty: false });
      }
    }, [selectedTab, safeSimulationIndex, activeTextZoneKey, !!currentSimulation?.texts?.[activeTextZoneKey], activeTextZone, setValue, currentFormat]);

    const pathBase = safeSimulationIndex >= 0
      ? `${selectedTab}.${safeSimulationIndex}.texts.${activeTextZoneKey}`
      : "";
    const currentText = pathBase ? (watch(`${pathBase}.text`) as string) || "" : "";
    const currentLanguage = pathBase ? (watch(`${pathBase}.language`) as string) || "en" : "en";
    const currentFontHeight = pathBase ? Number(watch(`${pathBase}.fontHeight`)) || 14 : 14;
    const currentWeight = pathBase ? (watch(`${pathBase}.fontWeight`) as string) || "Regular" : "Regular";
    const currentPosition = pathBase ? (watch(`${pathBase}.position`) as string) || "Center" : "Center";
    const currentScrollType = pathBase ? (watch(`${pathBase}.scrollType`) as string) || "Fixed" : "Fixed";
    const currentSpeed = pathBase ? Number(watch(`${pathBase}.scrollSpeed`)) || 4 : 4;

    const activeWidth = currentSimulation?.width || 160;
    const activeHeight = currentSimulation?.height || 16;
    const currentSimulationType = currentSimulation?.type || "route";

    const audiopath = safeSimulationIndex >= 0 ? (watch(`${selectedTab}[${safeSimulationIndex}].audioFileUrl`) as string) : "";
    const stopTypeAudioFileUrl = safeSimulationIndex >= 0 ? (watch(`${selectedTab}[${safeSimulationIndex}].stopTypeAudioFileUrl`) as string) : "";
    const audioFileName = safeSimulationIndex >= 0 ? (watch(`${selectedTab}[${safeSimulationIndex}].audioFileName`) as string) : "";

    const currentIcon = pathBase ? (watch(`${pathBase}.icon`) as string) || "" : "";
    const currentIconPos = pathBase ? (watch(`${pathBase}.iconPosition`) as string) || "start" : "start";
    const currentIconSpacing = pathBase ? Number(watch(`${pathBase}.iconSpacing`) ?? 2) : 2;
    const currentIconScale = pathBase ? Number(watch(`${pathBase}.iconWidthScale`) ?? 1.0) : 1.0;
    const rawWordIndex = pathBase ? Number(watch(`${pathBase}.iconWordIndex`) ?? 1) : 1;
    const wordsList = currentText.trim().split(/\s+/).filter(Boolean);
    const wordsCount = wordsList.length;
    const maxWordIndex = Math.max(1, wordsCount > 1 ? wordsCount - 1 : 1);
    const currentWordIndex = Math.min(Math.max(1, rawWordIndex), maxWordIndex);

    const maxHeight = currentSimulation?.height || 16;
    const isHalfLine = currentFormat === "three" && (activeTextZoneKey === "upperHalfText" || activeTextZoneKey === "lowerHalfText");
    const maxAllowedFontHeight = isHalfLine ? Math.floor(maxHeight / 2) : maxHeight;

    const availableFontSizes = useMemo(() => {
      const set = new Set([...FONT_HEIGHT_GRID.filter((s) => s <= maxAllowedFontHeight), currentFontHeight]);
      return Array.from(set).filter(Boolean).sort((a, b) => a - b);
    }, [maxAllowedFontHeight, currentFontHeight]);

    // Font heights utility
    const getDefaultFontHeightForLanguage = useFontHeightForLanguage();
    const getConfiguredFontHeightsForLanguage = useFontHeightsForLanguage();

    // Memoize filter object so React Query doesn't cause unnecessary component re-renders
    const stopFilters = useMemo(
      () => ({ depot_id: depotId || "", organization_id: selectedOrganization?.id || "" }),
      [depotId, selectedOrganization?.id]
    );

    // Stops list for datalists & stops tab
    const { data: stopsData } = stopCrud.useList({
      filters: stopFilters,
      orderBy: { column: "created_at", ascending: false },
      skip: !depotId,
    });
    const depotStops = (stopsData?.data as any[]) || [];

    // Auto-Cycle Loop
    useEffect(() => {
      if (!isCycling || simulations.length <= 1) return;
      const interval = setInterval(() => {
        setSelectedSimulationIndex((prev) => (prev + 1) % simulations.length);
      }, 3500);
      return () => clearInterval(interval);
    }, [isCycling, simulations.length, setSelectedSimulationIndex]);

    // Keyboard Shortcuts ('r' for swap/return, 'd' for duplicate)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
          return;
        }
        if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          handleInvertEndpoints();
        } else if (e.key === "d" || e.key === "D") {
          e.preventDefault();
          handleDuplicateSlide();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isReturn]);

    // Invert endpoints
    const handleInvertEndpoints = () => {
      const src = getValues("source");
      const dest = getValues("destination");
      setValue("source", dest, { shouldDirty: true });
      setValue("destination", src, { shouldDirty: true });
      setValue("return", !isReturn, { shouldDirty: true });
      toast.info(`Swapped origin & terminus (${!isReturn ? "Return mode" : "Standard mode"})`);
    };

    // Toggle Split Route
    const handleToggleSplitRoute = (checked: boolean) => {
      setValue("is_split_route", checked, { shouldDirty: true });
      const boards = ["front", "side", "rear", "internal"] as const;
      const routeNumbers = {
        routeNumber: getValues("route_number"),
        routeNumber1: getValues("route_number_1"),
        routeNumber2: getValues("route_number_2"),
      };
      boards.forEach((board) => {
        const slides = getValues(board) || [];
        if (slides.length > 0) {
          const updated = migrateSlidesOnSplitRouteToggle(slides, checked, routeNumbers);
          setValue(board, updated, { shouldDirty: true });
        }
      });
    };

    // Format Change
    const handleFormatChange = (newFormat: "single" | "two" | "three") => {
      if (!currentSimulation || currentFormat === newFormat) return;
      setOptimisticFormat(newFormat);

      const w = currentSimulation.width;
      const h = currentSimulation.height;
      const t = currentSimulation.type;
      const existingTexts: any = currentSimulation.texts || {};

      const routeNum = isSplitRoute
        ? `${getValues("route_number_1") || ""}/${getValues("route_number_2") || ""}`
        : getValues("route_number") || "";
      const routeText = [getValues("source"), getValues("destination"), getValues("via")].filter(Boolean).join(" - ");

      let updatedTexts: any = {};

      if (newFormat === "single") {
        // Reuse existing text config if available (preserves bitmap, fontHeight, weight, language, icon)
        const preservedText = existingTexts.text || existingTexts.upperHalfText;
        updatedTexts = {
          text: preservedText
            ? { ...preservedText, fontHeight: Math.min(preservedText.fontHeight || 14, h) }
            : getDefaultTextConfig(routeText || "Single Route Text"),
        };
      } else if (newFormat === "two") {
        // Destination zone: reuse existing text config
        const preservedDest = existingTexts.text || existingTexts.upperHalfText;
        const destConfig = preservedDest
          ? { ...preservedDest, fontHeight: Math.min(preservedDest.fontHeight || 14, h) }
          : getDefaultTextConfig(routeText);

        if (isSplitRoute) {
          updatedTexts = {
            text: destConfig,
            routeNumber1: existingTexts.routeNumber1 || getDefaultTextConfig(getValues("route_number_1") || "Route 1"),
            routeNumber2: existingTexts.routeNumber2 || getDefaultTextConfig(getValues("route_number_2") || "Route 2"),
          };
        } else {
          updatedTexts = {
            text: destConfig,
            sideText: existingTexts.sideText || getDefaultTextConfig(routeNum),
          };
        }
      } else {
        // Three line format: upper and lower half texts (font height usually floor(h/2) or 7)
        const halfHeight = Math.max(7, Math.floor(h / 2));
        const preservedUpper = existingTexts.upperHalfText || existingTexts.text;
        const upperConfig = preservedUpper
          ? { ...preservedUpper, fontHeight: Math.min(preservedUpper.fontHeight || halfHeight, halfHeight) }
          : getDefaultTextConfig(getValues("source") || "Upper Text");

        const lowerConfig = existingTexts.lowerHalfText
          ? { ...existingTexts.lowerHalfText, fontHeight: Math.min(existingTexts.lowerHalfText.fontHeight || halfHeight, halfHeight) }
          : getDefaultTextConfig(getValues("destination") || getValues("via") || "Lower Text");

        if (isSplitRoute) {
          updatedTexts = {
            upperHalfText: upperConfig,
            lowerHalfText: lowerConfig,
            routeNumber1: existingTexts.routeNumber1 || getDefaultTextConfig(getValues("route_number_1") || "Route 1"),
            routeNumber2: existingTexts.routeNumber2 || getDefaultTextConfig(getValues("route_number_2") || "Route 2"),
          };
        } else {
          updatedTexts = {
            upperHalfText: upperConfig,
            lowerHalfText: lowerConfig,
            sideText: existingTexts.sideText || getDefaultTextConfig(routeNum),
          };
        }
      }

      const updated: Simulation = {
        ...currentSimulation,
        format: newFormat,
        width: w,
        height: h,
        type: t,
        texts: updatedTexts,
      };

      const targetIndex = safeSimulationIndex >= 0 ? safeSimulationIndex : selectedSimulationIndex;
      setValue(`${selectedTab}[${targetIndex}]`, updated, { shouldDirty: true });
      setUserTextZone(newFormat === "single" ? "text" : getFirstTextZone(isSplitRoute));
    };

    // Signboard Dimensions Handlers
    const handleHeightChange = (newHeight: 16 | 32) => {
      const sims: Simulation[] = getValues(selectedTab as any) || [];
      if (sims.length === 0) return;
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
    };

    const handleWidthChange = (newWidth: typeof WIDTH_OPTIONS[number]) => {
      const sims: Simulation[] = getValues(selectedTab as any) || [];
      if (sims.length === 0) return;
      const updated = sims.map((s) => ({ ...s, width: newWidth }));
      setValue(selectedTab as any, updated, { shouldDirty: true });
    };

    // Slide Operations
    const handleAddSlide = (format: "single" | "two" | "three", type: SimulationType = "route") => {
      let newSim: Simulation;
      const routeNum = isSplitRoute
        ? `${getValues("route_number_1") || ""}/${getValues("route_number_2") || ""}`
        : getValues("route_number") || "";
      const routeText = [getValues("source"), getValues("destination"), getValues("via")].filter(Boolean).join(" - ");

      if (format === "single") {
        newSim = getDefaultSingleSimulation(type === "slogan" ? "PLEASE WEAR SEAT BELT - ಸುರಕ್ಷಿತ ಪ್ರಯಾಣ" : routeText || "Single Route Text", type);
      } else if (format === "two") {
        newSim = getDefaultTwoSimulation(routeNum, routeText, type, getValues("route_number_1"), getValues("route_number_2"), isSplitRoute);
      } else {
        newSim = getDefaultThreeSimulation(routeNum, [getValues("source"), getValues("destination")].filter(Boolean).join(" - "), getValues("via") || "", type, getValues("route_number_1"), getValues("route_number_2"), isSplitRoute);
      }

      if (currentSimulation) {
        newSim.height = currentSimulation.height;
        newSim.width = currentSimulation.width;
      }

      const curList: Simulation[] = getValues(selectedTab as any) || [];
      const updatedList = [...curList, newSim];
      setValue(selectedTab as any, updatedList, { shouldDirty: true });
      setSelectedSimulationIndex(updatedList.length - 1);
    };

    const handleDuplicateSlide = (indexToDup?: number) => {
      const idx = typeof indexToDup === "number" ? indexToDup : selectedSimulationIndex;
      const list = getValues(selectedTab as any) || [];
      const target = list[idx];
      if (!target) return;
      const clone = typeof structuredClone === "function" ? structuredClone(target) : JSON.parse(JSON.stringify(target));
      const nextList = [...list, clone];
      setValue(selectedTab as any, nextList, { shouldDirty: true });
      setSelectedSimulationIndex(nextList.length - 1);
      toast.success(`Duplicated Slide #${idx + 1}`);
    };

    const handleMoveSlide = (idx: number, direction: "up" | "down") => {
      const list = [...(getValues(selectedTab as any) || [])];
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return;
      [list[idx], list[targetIdx]] = [list[targetIdx], list[idx]];
      setValue(selectedTab as any, list, { shouldDirty: true });
      setSelectedSimulationIndex(targetIdx);
    };

    const handleRemoveSlide = (idx: number) => {
      const list = [...(getValues(selectedTab as any) || [])];
      list.splice(idx, 1);
      setValue(selectedTab as any, list, { shouldDirty: true });
      setSelectedSimulationIndex(list.length > 0 ? Math.min(idx, list.length - 1) : -1);
    };

    const handleClearAllSlides = () => {
      if (confirm(`Are you sure you want to delete all slides on ${selectedTab.toUpperCase()} display?`)) {
        setValue(selectedTab as any, [], { shouldDirty: true });
        setSelectedSimulationIndex(-1);
      }
    };

    const handleTypeChange = (newType: SimulationType) => {
      if (!currentSimulation) return;
      setValue(`${selectedTab}[${safeSimulationIndex}].type`, newType, { shouldDirty: true });
    };

    const handleCopyAllToBoard = (destBoard: string) => {
      const currentSims = getValues(selectedTab as any) || [];
      if (currentSims.length === 0 || !destBoard || destBoard === selectedTab) return;
      const cloned = JSON.parse(JSON.stringify(currentSims));
      setValue(destBoard as any, cloned, { shouldDirty: true });
      toast.success(`Copied all ${currentSims.length} slides to ${destBoard.toUpperCase()} signboard!`);
    };

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
        const { fileUrl, fileName } = await handleSloganAudioGeneration(textToConvert, depotId);
        setValue(`${selectedTab}[${safeSimulationIndex}].audioFileUrl`, fileUrl, { shouldDirty: true });
        setValue(`${selectedTab}[${safeSimulationIndex}].audioFileName`, fileName, { shouldDirty: true });
        toast.success("Voice announcement generated successfully!");
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
        setValue(`${selectedTab}[${safeSimulationIndex}].audioFileUrl`, null, { shouldDirty: true });
        setValue(`${selectedTab}[${safeSimulationIndex}].audioFileName`, null, { shouldDirty: true });
        toast.info("Audio removed from slide.");
      } catch (err: any) {
        toast.error(`Failed to delete audio: ${err.message || err}`);
      }
    };

    const handleCopySlideToBoard = (destBoard: string) => {
      if (!currentSimulation || destBoard === selectedTab) return;
      const destSims = getValues(destBoard as any) || [];
      const cloned = JSON.parse(JSON.stringify(currentSimulation));
      setValue(destBoard as any, [...destSims, cloned], { shouldDirty: true });
      setShowCopyDropdown(false);
      toast.success(`Slide #${selectedSimulationIndex + 1} copied to ${destBoard.toUpperCase()} signboard!`);
    };

    // Chime Sound (synthetic two-tone bus chime + PAS playback)
    const handlePlayChime = () => {
      const audiopath = watch(`${selectedTab}[${selectedSimulationIndex}].audioFileUrl`);
      const stopTypeAudioFileUrl = watch(`${selectedTab}[${selectedSimulationIndex}].stopTypeAudioFileUrl`);
      const targetUrl = audiopath || stopTypeAudioFileUrl;

      if (targetUrl) {
        const audio = new Audio(targetUrl);
        audio.play().catch(() => { });
        toast.info("Playing PAS voice announcement");
        return;
      }

      // Authentic transit bus chime (Web Audio API)
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(784, now); // G5
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(523.25, now + 0.22); // C5
        gain2.gain.setValueAtTime(0.25, now + 0.22);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.22);
        osc2.stop(now + 0.7);

        toast.info("Transit bus chime triggered");
      } catch (err) {
        console.warn("Chime playback error:", err);
      }
    };

    // Fullscreen toggle
    const handleToggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => { });
      } else {
        document.exitFullscreen().catch(() => { });
      }
    };

    // Export JSON
    const handleExportRoute = () => {
      const values = sanitizeRouteBoards(getValues() as any);
      const safeNum = (displayRouteNum || "config").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `route-v2-${safeNum}.json`;
      const blob = new Blob([JSON.stringify(values, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };

    // Save Submit
    const onSubmit: SubmitHandler<IRoute> = async (data) => {
      if (isCreatingRoute || isUpdatingRoute) return;

      const trimmedRouteNum1 = (data.route_number_1 || "").trim();
      const trimmedRouteNum2 = (data.route_number_2 || "").trim();
      const trimmedRouteNum = data.is_split_route
        ? `${trimmedRouteNum1}-${trimmedRouteNum2}`
        : (data.route_number || "").trim();

      if (data.is_split_route) {
        if (!trimmedRouteNum1 || !trimmedRouteNum2) {
          setError("route_number", { message: "Both Route #1 and Route #2 are required for Split Route" });
          toast.error("Both Route #1 and Route #2 are required for Split Route");
          return;
        }
      } else if (!trimmedRouteNum) {
        setError("route_number", { message: "Route number is required" });
        toast.error("Route number is required");
        return;
      }

      if (trimmedRouteNum) {
        const scopeFilter: Record<string, any> = {};
        if (data.depot_id) {
          scopeFilter.depot_id = data.depot_id;
        } else if (data.created_by) {
          scopeFilter.created_by = data.created_by;
        }

        const isDup = await checkActiveDuplicate(
          "routes",
          "route_number",
          trimmedRouteNum,
          scopeFilter,
          mode === "edit" && data.id ? data.id : undefined
        );

        if (isDup) {
          toast.error(`Route number "${trimmedRouteNum}" is already in use in this depot.`);
          return;
        }
      }

      // Auto-sync via stops to depot
      if (data.via && data.depot_id) {
        try {
          const viaStops = data.via.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
          if (viaStops.length > 0) {
            const { data: existingStops } = await supabase.from("stops").select("name").eq("depot_id", data.depot_id);
            const existingSet = new Set((existingStops || []).map((s) => s.name?.toLowerCase().trim()));
            const newStops = viaStops
              .filter((s) => !existingSet.has(s.toLowerCase()))
              .map((s) => ({ name: s, depot_id: data.depot_id, organization_id: data.organization_id || null }));
            if (newStops.length > 0) {
              await supabase.from("stops").insert(newStops);
            }
          }
        } catch (e) {
          console.warn("Could not auto-sync via stops:", e);
        }
      }

      const cleanedData = sanitizeRouteBoards(data);
      const payload = {
        ...cleanedData,
        route_number: trimmedRouteNum,
        route_number_1: data.is_split_route ? trimmedRouteNum1 : "",
        route_number_2: data.is_split_route ? trimmedRouteNum2 : "",
      };

      if (mode === "edit") {
        updateRoute(
          { id: data.id, payload },
          {
            onSuccess: () => {
              toast.success("Route updated successfully");
              setHasBeenSaved(true);
              navigate(-1);
            },
            onError: (err: any) => {
              toast.error(`Error updating route: ${err.message || "Unknown error"}`);
            },
          }
        );
      } else {
        createRoute(payload, {
          onSuccess: () => {
            toast.success("Route created successfully");
            setHasBeenSaved(true);
            navigate(-1);
          },
          onError: (err: any) => {
            toast.error(`Error creating route: ${err.message || "Unknown error"}`);
          },
        });
      }
    };

    const handleBackClick = () => {
      if (!hasBeenSaved && formState.isDirty) {
        setShowConfirmDialog(true);
      } else {
        navigate(-1);
      }
    };

    // Label for active board
    const currentBoardItem = BOARD_ITEMS.find((b) => b.id === selectedTab) || BOARD_ITEMS[0];
    const formatLabel =
      currentFormat === "two"
        ? "Two Line"
        : currentFormat === "three"
          ? "Three Line"
          : "Single Line";

    return (
      <SubframeCore.Tooltip.Provider delayDuration={150}>
        <div
          className={SubframeUtils.twClassNames(
            "flex h-[100dvh] w-full flex-col bg-default-background overflow-hidden select-none font-sans",
            className
          )}
          ref={ref}
          {...otherProps}
        >
          <audio ref={audioElementRef} className="hidden" />

          {/* ========================================================= */}
          {/* TOP APPLICATION BAR                                      */}
          {/* ========================================================= */}
          <div className="flex h-12 w-full flex-none items-center justify-between border-b border-neutral-border bg-sidebar-background px-4 gap-2 overflow-x-auto no-scrollbar select-none">
            {/* Left: Back & Route Identity */}
            <div className="flex items-center gap-2.5 min-w-0 shrink-0">
              <ActionTooltip content="Return to Routes list" side="bottom">
                <Button
                  variant="neutral-secondary"
                  size="small"
                  className="h-8 text-xs font-medium px-2.5"
                  icon={<FeatherChevronLeft className="h-4 w-4" />}
                  onClick={handleBackClick}
                >
                  Back
                </Button>
              </ActionTooltip>

              <span className="px-2.5 py-1 rounded-md bg-neutral-900 text-white font-mono font-bold text-xs tracking-wider shadow-xs flex-none">
                {displayRouteNum}
              </span>

              <span className="hidden sm:inline-block text-xs font-bold text-default-font uppercase tracking-wide truncate max-w-[140px] md:max-w-[200px] lg:max-w-[280px]">
                {source || "ORIGIN"} ⇄ {destination || "TERMINUS"}
              </span>

              {formState.isDirty && !hasBeenSaved ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-[11px] text-amber-900 font-semibold shrink-0" title="Unsaved changes">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Unsaved
                </span>
              ) : (
                <span className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-900 font-semibold shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Saved
                </span>
              )}
            </div>

            {/* Right: Consolidated Studio Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Amber / Red Color Toggle */}
              <div className="flex items-center h-8 p-0.5 rounded-lg bg-neutral-100 border border-neutral-border">
                <ActionTooltip content="Set signboard LED color to Amber" side="bottom">
                  <button
                    type="button"
                    onClick={() => setLedColor("#ffbf00")}
                    className={SubframeUtils.twClassNames(
                      "h-7 px-2.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                      ledColor === "#ffbf00"
                        ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                        : "text-neutral-600 hover:text-neutral-900"
                    )}
                  >
                    Amber
                  </button>
                </ActionTooltip>
                <ActionTooltip content="Set signboard LED color to Red" side="bottom">
                  <button
                    type="button"
                    onClick={() => setLedColor("#ff2222")}
                    className={SubframeUtils.twClassNames(
                      "h-7 px-2.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                      ledColor === "#ff2222"
                        ? "bg-red-100 text-red-900 border border-red-300 shadow-2xs"
                        : "text-neutral-600 hover:text-neutral-900"
                    )}
                  >
                    Red
                  </button>
                </ActionTooltip>
              </div>

              {/* Pause / Play */}
              <ActionTooltip content={isPaused ? "Resume LED scroll simulation" : "Pause LED scroll simulation"} side="bottom">
                <Button
                  variant="neutral-secondary"
                  size="small"
                  className="h-8 text-xs font-medium px-2.5"
                  icon={isPaused ? <FeatherPlay className="h-3.5 w-3.5" /> : <FeatherPause className="h-3.5 w-3.5" />}
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? "Play" : "Pause"}
                </Button>
              </ActionTooltip>

              {/* Chime */}
              <ActionTooltip content="Test destination arrival chime announcement audio" side="bottom">
                <Button
                  variant="neutral-secondary"
                  size="small"
                  className="h-8 text-xs font-medium px-2.5"
                  icon={<FeatherVolume2 className="h-3.5 w-3.5" />}
                  onClick={handlePlayChime}
                >
                  Chime
                </Button>
              </ActionTooltip>

              {/* JSON Modal */}
              <RBAC roles={["master"]} features={[]}>
                <ActionTooltip content="Inspect and edit raw JSON configuration" side="bottom">
                  <div>
                    <JsonViewerDialog
                      dialogTitle="Route Configuration JSON"
                      buttonLabel="JSON"
                      size="small"
                      buttonClassName="h-8 text-xs font-medium px-2.5"
                      getJsonData={() => sanitizeRouteBoards(getValues() as any)}
                    />
                  </div>
                </ActionTooltip>
              </RBAC>

              {/* Remix */}
              <ActionTooltip content="Auto-generate signboard layouts and route text" side="bottom">
                <Button
                  variant="neutral-secondary"
                  size="small"
                  className="h-8 text-xs font-medium px-2.5"
                  icon={<FeatherShuffle className="h-3.5 w-3.5" />}
                  onClick={() => toast.info("Remix current configuration")}
                >
                  Remix
                </Button>
              </ActionTooltip>

              {/* Device */}
              <ActionTooltip content="Toggle hardware device preview" side="bottom">
                <Button
                  variant="neutral-secondary"
                  size="small"
                  className="h-8 text-xs font-medium px-2.5"
                  icon={<FeatherMonitor className="h-3.5 w-3.5" />}
                  onClick={() => toast.info("Device preview mode")}
                >
                  Device
                </Button>
              </ActionTooltip>

              {/* Sync */}
              <ActionTooltip content="Sync simulation display state" side="bottom">
                <IconButton
                  variant="neutral-secondary"
                  size="small"
                  className="h-8 w-8"
                  icon={<FeatherRotateCw className="h-3.5 w-3.5" />}
                  onClick={() => toast.info("Simulation state synced")}
                />
              </ActionTooltip>

              {/* Fullscreen */}
              <ActionTooltip content="Toggle fullscreen editor view" side="bottom">
                <IconButton
                  variant="neutral-secondary"
                  size="small"
                  className="h-8 w-8"
                  icon={<FeatherMaximize2 className="h-3.5 w-3.5" />}
                  onClick={handleToggleFullscreen}
                />
              </ActionTooltip>

              {/* Save Route Button */}
              <ActionTooltip content={mode === "create" ? "Save new route to database" : "Save updates to route"} side="bottom">
                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  variant="brand-primary"
                  size="small"
                  className="h-8 text-xs font-semibold px-3.5 bg-neutral-900 text-white hover:bg-neutral-800 border-none shadow-xs"
                  disabled={isCreatingRoute || isUpdatingRoute}
                  loading={isCreatingRoute || isUpdatingRoute}
                >
                  {mode === "create" ? "Save Route" : "Update Route"}
                </Button>
              </ActionTooltip>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TOP CANVAS & LED STAGE SECTION                           */}
          {/* ========================================================= */}
          {simulations.length > 0 && currentSimulation && (
            <div className="flex flex-col flex-none w-full border-b border-neutral-border bg-sidebar-background/60 px-4 py-2 shadow-2xs">

              {/* Centered Hardware Bezel LED Screen */}
              <div className="flex flex-col items-center justify-center w-full py-1">
                <div className="flex flex-col items-center w-fit max-w-full rounded-2xl bg-neutral-950 p-3 shadow-xl border border-neutral-800 ring-1 ring-black/70">
                  {/* Hardware Top Monospace Bezel Bar */}
                  <div className="flex w-full items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-[10px] font-mono text-neutral-400 gap-6">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      <span className="uppercase font-bold tracking-wider text-emerald-400">ESC RS-485 • ONLINE</span>
                    </div>
                    <div className="uppercase font-semibold tracking-wider text-neutral-300">
                      {currentBoardItem.label} SIGNBOARD • SLIDE {selectedSimulationIndex + 1} OF {simulations.length || 1}
                    </div>
                    <div className="font-bold text-neutral-400">{activeWidth}×{activeHeight} DOTS</div>
                  </div>

                  {/* Dot Matrix Screen */}
                  <div
                    className="flex items-center justify-center p-2 rounded-lg bg-black overflow-hidden shadow-inner ring-1 ring-black/50"
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "center center",
                      transition: "transform 0.15s ease-out",
                    }}
                  >
                    <DisplayEditor listIndex={safeSimulationIndex} stopScroll={isPaused} ledColor={ledColor} />
                  </div>
                </div>
              </div>

              {/* Stage Bottom Toolbar */}
              <div className="flex items-center justify-between w-full pt-2 text-xs text-neutral-600 border-t border-neutral-border/60">
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <span className="font-semibold text-default-font">{currentBoardItem.label} Signboard</span>
                  <span>•</span>
                  <span className="font-mono">{activeWidth}×{activeHeight} px</span>
                  <span>•</span>
                  <span className="font-mono">Frame #{(selectedSimulationIndex + 1) * 310}</span>
                  <span>•</span>
                  <span className="font-medium">{formatLabel}</span>
                  <span>•</span>

                  {/* Copy Slide to Board dropdown */}
                  <div className="relative inline-block">
                    <ActionTooltip content="Copy active slide configuration to another signboard" side="top">
                      <Button
                        variant="neutral-secondary"
                        size="small"
                        className="h-7 text-xs font-medium px-2.5"
                        icon={<FeatherCopy className="h-3.5 w-3.5" />}
                        onClick={() => setShowCopyDropdown(!showCopyDropdown)}
                      >
                        Copy Slide to Board...
                      </Button>
                    </ActionTooltip>
                    {showCopyDropdown && (
                      <div className="absolute left-0 bottom-8 z-50 w-44 rounded-xl bg-sidebar-background border border-neutral-border shadow-xl p-1">
                        {BOARD_ITEMS.filter((b) => b.id !== selectedTab && b.id !== Tab.STOPS).map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => handleCopySlideToBoard(b.id)}
                            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-left rounded-lg text-default-font hover:bg-neutral-100 transition-colors"
                          >
                            <span className="font-bold text-brand-primary">{b.letter}</span>
                            <span>{b.label} Signboard</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Zoom & Reset */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-600 font-semibold flex items-center gap-1">
                    <FeatherSearch className="h-3.5 w-3.5" /> {zoom}%
                  </span>
                  <ActionTooltip content="Reset display zoom to 100%" side="top">
                    <Button
                      variant="neutral-secondary"
                      size="small"
                      className="h-7 text-xs font-medium px-2.5"
                      onClick={() => setZoom(100)}
                    >
                      Reset
                    </Button>
                  </ActionTooltip>
                </div>
              </div>
            </div>
          )}

          {/* Empty state banner when no slides added to current board */}
          {simulations.length === 0 && (
            <div className="flex flex-1 items-center justify-center p-6 bg-sidebar-background/40 border-b border-neutral-border text-xs">
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="font-semibold text-neutral-800 text-sm">No Slides Added to {currentBoardItem.label} Board</span>
                <span className="text-xs text-neutral-600">Click "+ Add Slide" in the loop panel below to create your first display slide.</span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* BOTTOM MULTI-COLUMN WORKSPACE                            */}
          {/* ========================================================= */}
          <div className="flex w-full overflow-hidden flex-1 min-h-0 border-t border-neutral-border/40">
            {/* ------------------------------------------------------- */}
            {/* RAIL 0: BOARDS SELECTOR                                 */}
            {/* ------------------------------------------------------- */}
            <div className="flex flex-col flex-none w-[72px] items-center justify-between border-r border-neutral-border bg-sidebar-background py-3 select-none">
              <div className="flex flex-col items-center gap-2 w-full px-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-0.5">
                  BOARDS
                </span>
                {BOARD_ITEMS.map((item) => {
                  const isActive = selectedTab === item.id;
                  return (
                    <ActionTooltip key={item.id} content={`Switch to ${item.label} Signboard (${item.letter})`} side="right">
                      <button
                        type="button"
                        onClick={() => handleTabChange(item.id)}
                        className={SubframeUtils.twClassNames(
                          "flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all cursor-pointer",
                          isActive
                            ? "bg-neutral-900 text-white shadow-sm ring-1 ring-neutral-900"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 border border-neutral-border/60"
                        )}
                      >
                        <span className="text-sm font-bold leading-none">{item.letter}</span>
                        <span className="text-[9px] font-bold tracking-tight uppercase mt-1 leading-none">
                          {item.label}
                        </span>
                      </button>
                    </ActionTooltip>
                  );
                })}
              </div>

              <div className="text-[10px] font-mono text-neutral-500 font-semibold tracking-wider">
                V2.0
              </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* COLUMN 1: ROUTE SETUP                                   */}
            {/* ------------------------------------------------------- */}
            <div className="flex flex-col flex-none w-[280px] lg:w-[310px] border-r border-neutral-border bg-sidebar-background overflow-hidden">
              {/* Header */}
              <div className="flex h-11 flex-none items-center justify-between border-b border-neutral-border px-4 bg-sidebar-background">
                <span className="text-sm font-bold text-default-font">Route Setup</span>
                <ActionTooltip content="Swap Origin and Terminus endpoints (Keyboard: R)" side="bottom">
                  <Button
                    variant="neutral-secondary"
                    size="small"
                    className="h-7 text-xs font-medium px-2.5"
                    icon={<FeatherRepeat className="h-3.5 w-3.5" />}
                    onClick={handleInvertEndpoints}
                  >
                    Swap
                  </Button>
                </ActionTooltip>
              </div>

              {/* Form Fields */}
              <div className="flex-1 overflow-y-auto p-4 pb-12 space-y-3">
                {/* Split Route Checkbox */}
                <div className="flex items-center gap-2 pt-0.5 pb-0.5">
                  <Checkbox
                    checked={isSplitRoute}
                    onCheckedChange={handleToggleSplitRoute}
                    label="Split Route (e.g. 101/102)"
                  />
                </div>

                {/* Route Number */}
                {!isSplitRoute ? (
                  <TextField size="small" label="Route No" variant="filled" className="w-full [&>div]:!h-8 [&>div]:!min-h-[32px] [&>span]:text-xs [&>span]:font-semibold [&>span]:text-neutral-700">
                    <TextField.Input placeholder="e.g. 335-E" className="text-xs font-medium" {...register("route_number")} />
                  </TextField>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <TextField size="small" label="Route #1" variant="filled" className="w-full [&>div]:!h-8 [&>div]:!min-h-[32px] [&>span]:text-xs [&>span]:font-semibold [&>span]:text-neutral-700">
                      <TextField.Input placeholder="101" className="text-xs font-medium" {...register("route_number_1")} />
                    </TextField>
                    <TextField size="small" label="Route #2" variant="filled" className="w-full [&>div]:!h-8 [&>div]:!min-h-[32px] [&>span]:text-xs [&>span]:font-semibold [&>span]:text-neutral-700">
                      <TextField.Input placeholder="102" className="text-xs font-medium" {...register("route_number_2")} />
                    </TextField>
                  </div>
                )}

                {/* Source */}
                <TextField size="small" label="Source (Origin)" variant="filled" className="w-full [&>div]:!h-8 [&>div]:!min-h-[32px] [&>span]:text-xs [&>span]:font-semibold [&>span]:text-neutral-700">
                  <TextField.Input
                    placeholder="KEMPEGOWDA BUS STATION"
                    className="text-xs font-medium"
                    list="depot-stops-source-list"
                    {...register("source")}
                  />
                </TextField>
                <datalist id="depot-stops-source-list">
                  {depotStops.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>

                {/* Destination */}
                <TextField size="small" label="Destination (Terminus)" variant="filled" className="w-full [&>div]:!h-8 [&>div]:!min-h-[32px] [&>span]:text-xs [&>span]:font-semibold [&>span]:text-neutral-700">
                  <TextField.Input
                    placeholder="KADUGODI BUS STATION"
                    className="text-xs font-medium"
                    list="depot-stops-dest-list"
                    {...register("destination")}
                  />
                </TextField>
                <datalist id="depot-stops-dest-list">
                  {depotStops.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>

                {/* Via */}
                <TextField size="small" label="Via (Waypoints)" variant="filled" className="w-full [&>div]:!h-8 [&>div]:!min-h-[32px] [&>span]:text-xs [&>span]:font-semibold [&>span]:text-neutral-700">
                  <TextField.Input
                    placeholder="DOMNUR, MARATHAHALLI, HOPE FARM"
                    className="text-xs font-medium"
                    list="depot-stops-via-list"
                    {...register("via")}
                  />
                </TextField>
                <datalist id="depot-stops-via-list">
                  {depotStops.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>

                {/* Route Separator */}
                <TextField size="small" label="Route Separator" variant="filled" className="w-full [&>div]:!h-8 [&>div]:!min-h-[32px] [&>span]:text-xs [&>span]:font-semibold [&>span]:text-neutral-700">
                  <TextField.Input placeholder="-" className="text-xs font-medium" defaultValue="-" />
                </TextField>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center gap-2 p-3 border-t border-neutral-border bg-sidebar-background">
                <ActionTooltip content="Invert Origin and Terminus endpoints (Shortcut: R)" side="top">
                  <Button
                    variant="neutral-secondary"
                    size="small"
                    className="flex-1 text-xs font-medium h-8"
                    icon={<FeatherRotateCw className="h-3.5 w-3.5" />}
                    onClick={handleInvertEndpoints}
                  >
                    Return ('R')
                  </Button>
                </ActionTooltip>
                <ActionTooltip content="Duplicate active slide in current loop (Shortcut: D)" side="top">
                  <Button
                    variant="neutral-secondary"
                    size="small"
                    className="flex-1 text-xs font-medium h-8"
                    icon={<FeatherCopy className="h-3.5 w-3.5" />}
                    onClick={() => handleDuplicateSlide()}
                  >
                    Duplicate ('D')
                  </Button>
                </ActionTooltip>
              </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* COLUMN 2: CONTENT & SETTINGS                            */}
            {/* ------------------------------------------------------- */}
            <div className="flex flex-col flex-none w-[360px] lg:w-[410px] border-r border-neutral-border bg-sidebar-background overflow-hidden">
              {/* Header */}
              <div className="flex h-11 flex-none items-center justify-between border-b border-neutral-border px-4 bg-sidebar-background">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-bold text-default-font">Content & Settings</span>
                  <span className="text-xs font-mono font-semibold text-neutral-600">
                    Slide #{selectedSimulationIndex + 1}/{simulations.length || 1}
                  </span>
                </div>

                {/* Format Presets Icons */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-neutral-100 border border-neutral-border">
                  <ActionTooltip content="Single Line format" side="bottom">
                    <button
                      type="button"
                      onClick={() => handleFormatChange("single")}
                      className={SubframeUtils.twClassNames(
                        "h-6 w-6 flex items-center justify-center rounded transition-all cursor-pointer",
                        currentFormat === "single"
                          ? "bg-neutral-900 text-white shadow-2xs"
                          : "text-neutral-600 hover:text-neutral-900"
                      )}
                    >
                      <span className="h-2.5 w-3.5 rounded-[1px] border border-current" />
                    </button>
                  </ActionTooltip>
                  <ActionTooltip content="Two Line format (Route No + Text)" side="bottom">
                    <button
                      type="button"
                      onClick={() => handleFormatChange("two")}
                      className={SubframeUtils.twClassNames(
                        "h-6 w-6 flex items-center justify-center rounded transition-all cursor-pointer",
                        currentFormat === "two"
                          ? "bg-neutral-900 text-white shadow-2xs"
                          : "text-neutral-600 hover:text-neutral-900"
                      )}
                    >
                      <span className="flex gap-[2px] h-2.5 w-3.5">
                        <span className="w-1.5 h-full rounded-[1px] border border-current" />
                        <span className="w-2 h-full rounded-[1px] border border-current" />
                      </span>
                    </button>
                  </ActionTooltip>
                  <ActionTooltip content="Three Line format (Route No + Upper & Lower Line)" side="bottom">
                    <button
                      type="button"
                      onClick={() => handleFormatChange("three")}
                      className={SubframeUtils.twClassNames(
                        "h-6 w-6 flex items-center justify-center rounded transition-all cursor-pointer",
                        currentFormat === "three"
                          ? "bg-neutral-900 text-white shadow-2xs"
                          : "text-neutral-600 hover:text-neutral-900"
                      )}
                    >
                      <span className="flex flex-col gap-[1.5px] h-2.5 w-3.5">
                        <span className="w-full h-1 rounded-[1px] border border-current" />
                        <span className="w-full h-1 rounded-[1px] border border-current" />
                      </span>
                    </button>
                  </ActionTooltip>
                </div>
              </div>

              {/* Content Body */}
              {!currentSimulation ? (
                <div className="flex flex-col items-center justify-center flex-1 p-6 text-center text-subtext-color">
                  <FeatherLayers className="h-8 w-8 text-neutral-400 mb-2" />
                  <span className="text-xs font-semibold text-neutral-800">No Slide Selected</span>
                  <span className="text-[11px] text-neutral-600 mt-1 max-w-[220px]">
                    Add a slide to this signboard loop from the right panel to configure content and appearance.
                  </span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                  {/* Zone Sub-Tabs (Route No | Text | Upper Line | Lower Line) */}
                  {currentSimulation && currentFormat !== "single" && (
                    <div className="flex items-center gap-4 border-b border-neutral-200/80 w-full px-0.5">
                      {isSplitRoute ? (
                        <>
                          <ActionTooltip content="Switch to Route #1 zone editor" side="top">
                            <button
                              type="button"
                              onClick={() => setUserTextZone("routeNumber1")}
                              className={SubframeUtils.twClassNames(
                                "pb-1.5 text-xs font-semibold transition-all cursor-pointer truncate -mb-px",
                                activeTextZone === "routeNumber1"
                                  ? "border-b-2 border-neutral-900 text-neutral-900 font-bold"
                                  : "border-b-2 border-transparent text-neutral-600 hover:text-neutral-900"
                              )}
                            >
                              Route #1
                            </button>
                          </ActionTooltip>
                          <ActionTooltip content="Switch to Route #2 zone editor" side="top">
                            <button
                              type="button"
                              onClick={() => setUserTextZone("routeNumber2")}
                              className={SubframeUtils.twClassNames(
                                "pb-1.5 text-xs font-semibold transition-all cursor-pointer truncate -mb-px",
                                activeTextZone === "routeNumber2"
                                  ? "border-b-2 border-neutral-900 text-neutral-900 font-bold"
                                  : "border-b-2 border-transparent text-neutral-600 hover:text-neutral-900"
                              )}
                            >
                              Route #2
                            </button>
                          </ActionTooltip>
                        </>
                      ) : (
                        <ActionTooltip content="Switch to Route Number zone editor" side="top">
                          <button
                            type="button"
                            onClick={() => setUserTextZone("routeNumber")}
                            className={SubframeUtils.twClassNames(
                              "pb-1.5 text-xs font-semibold transition-all cursor-pointer truncate -mb-px",
                              activeTextZone === "routeNumber"
                                ? "border-b-2 border-neutral-900 text-neutral-900 font-bold"
                                : "border-b-2 border-transparent text-neutral-600 hover:text-neutral-900"
                            )}
                          >
                            Route No
                          </button>
                        </ActionTooltip>
                      )}

                      {currentFormat === "two" && (
                        <ActionTooltip content="Switch to Destination Text zone editor" side="top">
                          <button
                            type="button"
                            onClick={() => setUserTextZone("text")}
                            className={SubframeUtils.twClassNames(
                              "pb-1.5 text-xs font-semibold transition-all cursor-pointer truncate -mb-px",
                              activeTextZone === "text"
                                ? "border-b-2 border-neutral-900 text-neutral-900 font-bold"
                                : "border-b-2 border-transparent text-neutral-600 hover:text-neutral-900"
                            )}
                          >
                            Text
                          </button>
                        </ActionTooltip>
                      )}

                      {currentFormat === "three" && (
                        <>
                          <ActionTooltip content="Switch to Upper Line zone editor" side="top">
                            <button
                              type="button"
                              onClick={() => setUserTextZone("upperHalfText")}
                              className={SubframeUtils.twClassNames(
                                "pb-1.5 text-xs font-semibold transition-all cursor-pointer truncate -mb-px",
                                activeTextZone === "upperHalfText"
                                  ? "border-b-2 border-neutral-900 text-neutral-900 font-bold"
                                  : "border-b-2 border-transparent text-neutral-600 hover:text-neutral-900"
                              )}
                            >
                              Upper Line
                            </button>
                          </ActionTooltip>
                          <ActionTooltip content="Switch to Lower Line zone editor" side="top">
                            <button
                              type="button"
                              onClick={() => setUserTextZone("lowerHalfText")}
                              className={SubframeUtils.twClassNames(
                                "pb-1.5 text-xs font-semibold transition-all cursor-pointer truncate -mb-px",
                                activeTextZone === "lowerHalfText"
                                  ? "border-b-2 border-neutral-900 text-neutral-900 font-bold"
                                  : "border-b-2 border-transparent text-neutral-600 hover:text-neutral-900"
                              )}
                            >
                              Lower Line
                            </button>
                          </ActionTooltip>
                        </>
                      )}
                    </div>
                  )}

                  {/* SECTION 1: TEXT CONTENT */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                      <span>Text Content</span>
                      <span className="font-mono text-neutral-500 font-medium">{currentText.length} chars</span>
                    </div>

                    <Controller
                      name={`${pathBase}.text` as any}
                      control={control}
                      render={({ field }) => (
                        <IMEInput
                          langCode={currentLanguage}
                          className="w-full text-xs font-medium h-8"
                          {...field}
                        />
                      )}
                    />

                    {/* Quick tools row (Language | Auto Text | Add Icon) */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <Select
                        variant="filled"
                        size="small"
                        value={currentLanguage}
                        onValueChange={(val) => {
                          const nextHeight = getDefaultFontHeightForLanguage(val, activeTextZoneKey);
                          setValue(`${pathBase}.fontHeight`, nextHeight);
                          setValue(`${pathBase}.language`, val);
                        }}
                        className="h-8 flex-1 [&_button]:text-xs [&_button]:font-medium"
                      >
                        {AVAILABLE_LANGUAGES.map((l) => (
                          <Select.Item key={l.code} value={l.code}>
                            {l.label}
                          </Select.Item>
                        ))}
                      </Select>

                      <SubframeCore.Popover.Root open={showAutoText} onOpenChange={setShowAutoText}>
                        <ActionTooltip content="Auto-generate destination variations & translations" side="top">
                          <SubframeCore.Popover.Trigger asChild>
                            <Button
                              variant={showAutoText ? "brand-secondary" : "neutral-secondary"}
                              size="small"
                              className="h-8 text-xs font-medium px-2.5"
                              icon={<FeatherSparkle className="h-3.5 w-3.5 text-amber-500" />}
                            >
                              Auto Text
                            </Button>
                          </SubframeCore.Popover.Trigger>
                        </ActionTooltip>
                        <SubframeCore.Popover.Portal>
                          <SubframeCore.Popover.Content
                            side="bottom"
                            align="start"
                            sideOffset={6}
                            collisionPadding={16}
                            style={{ zIndex: 99999 }}
                            className="z-[99999] w-80 max-h-[420px] rounded-xl bg-white dark:bg-neutral-900 border border-neutral-border shadow-2xl p-2 flex flex-col font-sans"
                          >
                            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-border px-1">
                              <span className="text-xs font-bold text-default-font uppercase tracking-wide flex items-center gap-1.5">
                                <FeatherSparkle className="h-3.5 w-3.5 text-amber-500" />
                                Auto-Text Suggestions
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowAutoText(false)}
                                className="text-neutral-500 hover:text-neutral-900 p-1 rounded cursor-pointer"
                              >
                                <FeatherX className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <AutoTextGenerator
                              variant="list"
                              route={getValues()}
                              text={currentText}
                              targetLang={currentLanguage}
                              onSelect={(value) => {
                                setValue(`${pathBase}.text`, value, { shouldDirty: true });
                                setShowAutoText(false);
                              }}
                            />
                          </SubframeCore.Popover.Content>
                        </SubframeCore.Popover.Portal>
                      </SubframeCore.Popover.Root>

                      <ActionTooltip content="Select and insert transit symbol icon" side="top">
                        <Button
                          variant="neutral-secondary"
                          size="small"
                          className="h-8 text-xs font-medium px-2.5"
                          icon={<span className="text-sm">☺</span>}
                          onClick={() => setIsIconPickerOpen(true)}
                        >
                          Add Icon
                        </Button>
                      </ActionTooltip>
                    </div>

                    {/* Selected Icon Settings Panel (Single-card row format) */}
                    {currentIcon && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100 border border-neutral-200 mt-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-lg text-neutral-900 flex-none">
                            {currentIcon}
                          </span>
                          <span className="text-xs font-mono font-bold text-neutral-900 truncate max-w-[90px]">
                            {currentIcon}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center p-0.5 rounded bg-neutral-200/70">
                            {(["start", "center", "end"] as const).map((pos) => {
                              const posLabels = {
                                start: "Align icon before text",
                                center: "Place icon in middle of text",
                                end: "Align icon after text",
                              };
                              return (
                                <ActionTooltip key={pos} content={posLabels[pos]} side="top">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setValue(`${pathBase}.iconPosition`, pos, { shouldDirty: true });
                                      if (pos === "center") {
                                        setValue(`${pathBase}.iconWordIndex`, Math.max(1, Math.floor(wordsCount / 2)), { shouldDirty: true });
                                      }
                                    }}
                                    className={SubframeUtils.twClassNames(
                                      "px-2 py-0.5 rounded text-xs font-medium capitalize transition-all cursor-pointer",
                                      currentIconPos === pos
                                        ? "bg-white text-neutral-900 font-bold shadow-2xs"
                                        : "text-neutral-600 hover:text-neutral-900"
                                    )}
                                  >
                                    {pos}
                                  </button>
                                </ActionTooltip>
                              );
                            })}
                          </div>

                          <ActionTooltip content="Choose different icon symbol" side="top">
                            <Button
                              variant="neutral-secondary"
                              size="small"
                              className="h-7 text-xs px-2.5 font-medium"
                              onClick={() => setIsIconPickerOpen(true)}
                            >
                              Change
                            </Button>
                          </ActionTooltip>
                          <ActionTooltip content="Remove icon from slide" side="top">
                            <IconButton
                              variant="neutral-secondary"
                              size="small"
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 flex-none"
                              icon={<FeatherX className="h-3.5 w-3.5" />}
                              onClick={() => setValue(`${pathBase}.icon`, "", { shouldDirty: true })}
                            />
                          </ActionTooltip>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Material Symbol Picker Modal */}
                  <MaterialSymbolPicker
                    open={isIconPickerOpen}
                    onOpenChange={setIsIconPickerOpen}
                    selectedIcon={watch(`${pathBase}.icon`) || ""}
                    onSelectIcon={(iconName) => setValue(`${pathBase}.icon`, iconName, { shouldDirty: true })}
                  />

                  {/* SECTION 2: TYPOGRAPHY & ALIGNMENT (Figma-style formatting toolbar) */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-border/60">
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                      <span>Typography & Alignment</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Font Size Select Dropdown */}
                      <Select
                        variant="filled"
                        size="small"
                        value={String(currentFontHeight)}
                        onValueChange={(val) => {
                          const size = Number(val);
                          if (!isNaN(size) && size <= maxAllowedFontHeight) {
                            setValue(`${pathBase}.fontHeight`, size, { shouldDirty: true });
                          }
                        }}
                        className="h-8 flex-1 [&_button]:text-xs [&_button]:font-mono [&_button]:font-bold"
                      >
                        {availableFontSizes.map((size) => (
                          <Select.Item key={size} value={String(size)}>
                            {size} px Size
                          </Select.Item>
                        ))}
                      </Select>

                      {/* Bold Toggle */}
                      <ActionTooltip content={currentWeight === "Bold" ? "Bold active (click to set Regular)" : "Set font weight to Bold"} side="top">
                        <button
                          type="button"
                          onClick={() => setValue(`${pathBase}.fontWeight`, currentWeight === "Bold" ? "Regular" : "Bold", { shouldDirty: true })}
                          className={SubframeUtils.twClassNames(
                            "h-8 w-8 flex items-center justify-center rounded-md border text-xs font-bold transition-all cursor-pointer shrink-0",
                            currentWeight === "Bold"
                              ? "bg-neutral-900 border-neutral-900 text-white shadow-2xs"
                              : "border-neutral-border bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
                          )}
                        >
                          B
                        </button>
                      </ActionTooltip>

                      {/* Alignment Segmented Control */}
                      <div className="flex items-center h-8 p-0.5 rounded-md bg-neutral-100 border border-neutral-border shrink-0">
                        {[
                          { id: "Left", icon: <FeatherAlignLeft className="h-3.5 w-3.5" />, tip: "Align text to Left" },
                          { id: "Center", icon: <FeatherAlignCenter className="h-3.5 w-3.5" />, tip: "Align text to Center" },
                          { id: "Right", icon: <FeatherAlignRight className="h-3.5 w-3.5" />, tip: "Align text to Right" },
                        ].map((pos) => (
                          <ActionTooltip key={pos.id} content={pos.tip} side="top">
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setValue(`${pathBase}.position`, pos.id, { shouldDirty: true })}
                              className={SubframeUtils.twClassNames(
                                "h-7 px-2.5 flex items-center justify-center rounded transition-all cursor-pointer",
                                currentPosition === pos.id
                                  ? "bg-neutral-900 text-white shadow-2xs"
                                  : "text-neutral-600 hover:text-neutral-900"
                              )}
                            >
                              {pos.icon}
                            </button>
                          </ActionTooltip>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: MOTION & SPEED (Side-by-side segmented controls) */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-border/60">
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-neutral-700">
                      <span>Scroll Motion</span>
                      <span>Scroll Speed</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Direction */}
                      <div className="flex items-center h-8 p-0.5 rounded-md bg-neutral-100 border border-neutral-border">
                        {[
                          { id: "Right To Left", label: "« Left", tip: "Scroll right-to-left" },
                          { id: "Fixed", label: "Fixed", tip: "Static display without scrolling" },
                          { id: "Left To Right", label: "Right »", tip: "Scroll left-to-right" },
                        ].map((dir) => (
                          <ActionTooltip key={dir.id} content={dir.tip} side="top">
                            <button
                              type="button"
                              onClick={() => setValue(`${pathBase}.scrollType`, dir.id, { shouldDirty: true })}
                              className={SubframeUtils.twClassNames(
                                "flex-1 h-7 rounded text-xs font-medium transition-all cursor-pointer text-center leading-none",
                                currentScrollType === dir.id
                                  ? "bg-neutral-900 text-white font-bold shadow-2xs"
                                  : "text-neutral-600 hover:text-neutral-900"
                              )}
                            >
                              {dir.label}
                            </button>
                          </ActionTooltip>
                        ))}
                      </div>

                      {/* Speed */}
                      <div className="flex items-center h-8 p-0.5 rounded-md bg-neutral-100 border border-neutral-border">
                        {[
                          { val: 6, label: "Slow", tip: "Slow scroll speed (6 frames)" },
                          { val: 4, label: "Normal", tip: "Normal scroll speed (4 frames)" },
                          { val: 1, label: "Fast", tip: "Fast scroll speed (1 frame)" },
                        ].map((spd) => {
                          const active =
                            (spd.label === "Fast" && currentSpeed <= 2) ||
                            (spd.label === "Normal" && currentSpeed > 2 && currentSpeed <= 5) ||
                            (spd.label === "Slow" && currentSpeed > 5);
                          return (
                            <ActionTooltip key={spd.label} content={spd.tip} side="top">
                              <button
                                type="button"
                                onClick={() => setValue(`${pathBase}.scrollSpeed`, spd.val, { shouldDirty: true })}
                                className={SubframeUtils.twClassNames(
                                  "flex-1 h-7 rounded text-xs font-medium transition-all cursor-pointer text-center leading-none",
                                  active
                                    ? "bg-neutral-900 text-white font-bold shadow-2xs"
                                    : "text-neutral-600 hover:text-neutral-900"
                                )}
                              >
                                {spd.label}
                              </button>
                            </ActionTooltip>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: SIGNBOARD DIMENSIONS (Height segmented + Width dropdown) */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-border/60">
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-neutral-700">
                      <span>Signboard Height</span>
                      <span>Signboard Width</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Height segmented control */}
                      <div className="flex items-center h-8 p-0.5 rounded-md bg-neutral-100 border border-neutral-border">
                        {HEIGHT_OPTIONS.map((h) => (
                          <ActionTooltip key={h} content={`Set signboard height to ${h} pixels`} side="top">
                            <button
                              type="button"
                              onClick={() => handleHeightChange(h)}
                              className={SubframeUtils.twClassNames(
                                "flex-1 h-7 rounded text-xs font-mono font-bold transition-all cursor-pointer text-center leading-none",
                                activeHeight === h
                                  ? "bg-neutral-900 text-white shadow-2xs"
                                  : "text-neutral-600 hover:text-neutral-900"
                              )}
                            >
                              {h} px
                            </button>
                          </ActionTooltip>
                        ))}
                      </div>

                      {/* Width Select Dropdown */}
                      <Select
                        variant="filled"
                        size="small"
                        value={String(activeWidth)}
                        onValueChange={(val) => handleWidthChange(Number(val) as any)}
                        className="h-8 [&_button]:text-xs [&_button]:font-mono [&_button]:font-bold"
                      >
                        {WIDTH_OPTIONS.map((w) => (
                          <Select.Item key={w} value={String(w)}>
                            {w} px Width
                          </Select.Item>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* SECTION 5: VOICE ANNOUNCEMENT (PAS) */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-border/60">
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                      <span className="flex items-center gap-1.5">
                        <FeatherVolume2 className="h-3.5 w-3.5 text-amber-500" />
                        Voice Announcement (PAS)
                      </span>
                      {audioFileName && (
                        <span className="font-mono text-neutral-600 font-medium text-xs truncate max-w-[150px]" title={audioFileName}>
                          {audioFileName}
                        </span>
                      )}
                    </div>

                    {(audiopath || stopTypeAudioFileUrl) ? (
                      <div className="flex items-center gap-2">
                        <ActionTooltip content={isPlayingAudio ? "Stop announcement audio playback" : "Play announcement audio preview"} side="top">
                          <Button
                            variant={isPlayingAudio ? "brand-secondary" : "neutral-secondary"}
                            size="small"
                            className="flex-1 h-8 text-xs font-medium"
                            icon={<FeatherVolume2 className={SubframeUtils.twClassNames("h-3.5 w-3.5", isPlayingAudio ? "text-amber-500 animate-pulse" : "")} />}
                            onClick={handlePlayAudio}
                          >
                            {isPlayingAudio ? "Stop Audio" : "Play Announcement"}
                          </Button>
                        </ActionTooltip>
                        {audiopath && !stopTypeAudioFileUrl && (
                          <ActionTooltip content="Delete voice announcement" side="top">
                            <IconButton
                              variant="neutral-secondary"
                              size="small"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 flex-none"
                              icon={<FeatherTrash className="h-3.5 w-3.5" />}
                              onClick={handleDeleteAudio}
                            />
                          </ActionTooltip>
                        )}
                      </div>
                    ) : (
                      <ActionTooltip content="Synthesize voice announcement audio from current text" side="top">
                        <Button
                          variant="brand-primary"
                          size="small"
                          className="w-full h-8 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800"
                          icon={<FeatherSparkle className="h-3.5 w-3.5 text-amber-400" />}
                          disabled={generatingAudio || !currentText.trim()}
                          onClick={handleGenerateAudio}
                        >
                          {generatingAudio ? "Generating..." : "Generate Audio (TTS)"}
                        </Button>
                      </ActionTooltip>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ------------------------------------------------------- */}
            {/* COLUMN 3: SLIDES LOOP                                   */}
            {/* ------------------------------------------------------- */}
            <div className="flex flex-col flex-1 min-w-[340px] bg-default-background overflow-hidden">
              {/* Header */}
              <div className="flex h-11 flex-none items-center justify-between border-b border-neutral-border px-4 bg-sidebar-background">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-bold text-default-font">Slides Loop</span>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-border font-mono text-[11px] font-bold">
                    {simulations.length} Slides
                  </span>
                  <span className="text-xs text-neutral-600 font-mono truncate hidden sm:inline">
                    • {currentBoardItem.label} Signboard ({activeWidth}×{activeHeight})
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <ActionTooltip content={isCycling ? "Stop slide cycling animation" : "Cycle through all slides in loop"} side="bottom">
                    <Button
                      variant={isCycling ? "brand-primary" : "neutral-secondary"}
                      size="small"
                      className={SubframeUtils.twClassNames(
                        "h-7 text-xs font-medium px-2.5",
                        isCycling ? "bg-neutral-900 text-white" : ""
                      )}
                      icon={<FeatherRotateCw className={SubframeUtils.twClassNames("h-3 w-3", isCycling ? "animate-spin" : "")} />}
                      onClick={() => setIsCycling(!isCycling)}
                    >
                      Cycle Loop
                    </Button>
                  </ActionTooltip>

                  <SubframeCore.DropdownMenu.Root>
                    <ActionTooltip content="Add a new slide to this signboard loop" side="bottom">
                      <SubframeCore.DropdownMenu.Trigger asChild>
                        <Button
                          variant="brand-primary"
                          size="small"
                          className="h-7 text-xs font-semibold px-2.5 bg-neutral-900 text-white hover:bg-neutral-800"
                          icon={<FeatherPlus className="h-3 w-3" />}
                        >
                          Add Slide
                        </Button>
                      </SubframeCore.DropdownMenu.Trigger>
                    </ActionTooltip>
                    <SubframeCore.DropdownMenu.Portal>
                      <SubframeCore.DropdownMenu.Content
                        side="bottom"
                        align="end"
                        className="z-50 min-w-[200px] rounded-xl border border-neutral-border bg-sidebar-background p-1 shadow-xl"
                      >
                        <button
                          type="button"
                          onClick={() => handleAddSlide("two")}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left rounded-lg text-default-font hover:bg-neutral-100 cursor-pointer"
                        >
                          <FeatherColumns2 className="h-3.5 w-3.5 text-brand-primary" />
                          <span>Add Two-Line Route</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSlide("single")}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left rounded-lg text-default-font hover:bg-neutral-100 cursor-pointer"
                        >
                          <FeatherLayers className="h-3.5 w-3.5 text-brand-primary" />
                          <span>Add Single-Line Route</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSlide("three")}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left rounded-lg text-default-font hover:bg-neutral-100 cursor-pointer"
                        >
                          <FeatherLayers className="h-3.5 w-3.5 text-brand-primary" />
                          <span>Add Three-Line Route</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSlide("single", "slogan")}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left rounded-lg text-default-font hover:bg-neutral-100 cursor-pointer"
                        >
                          <FeatherSpeech className="h-3.5 w-3.5 text-amber-500" />
                          <span>Add Slogan / Announcement</span>
                        </button>
                      </SubframeCore.DropdownMenu.Content>
                    </SubframeCore.DropdownMenu.Portal>
                  </SubframeCore.DropdownMenu.Root>

                  {simulations.length > 0 && (
                    <SubframeCore.DropdownMenu.Root>
                      <ActionTooltip content="Copy all slides to another signboard display" side="bottom">
                        <SubframeCore.DropdownMenu.Trigger asChild>
                          <Button
                            variant="neutral-secondary"
                            size="small"
                            className="h-7 text-xs font-medium px-2.5"
                            icon={<FeatherCopy className="h-3 w-3" />}
                          >
                            Copy All
                          </Button>
                        </SubframeCore.DropdownMenu.Trigger>
                      </ActionTooltip>
                      <SubframeCore.DropdownMenu.Portal>
                        <SubframeCore.DropdownMenu.Content
                          side="bottom"
                          align="end"
                          className="z-50 min-w-[170px] rounded-xl border border-neutral-border bg-sidebar-background p-1 shadow-xl"
                        >
                          <span className="px-2 py-1 text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
                            Copy All Slides To:
                          </span>
                          {BOARD_ITEMS.filter((b) => b.id !== selectedTab && b.id !== Tab.STOPS).map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => handleCopyAllToBoard(b.id)}
                              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-left rounded-lg text-default-font hover:bg-neutral-100 cursor-pointer"
                            >
                              <span className="w-4 text-center font-bold text-[11px] text-neutral-700">{b.letter}</span>
                              <span>{b.label} Display</span>
                            </button>
                          ))}
                        </SubframeCore.DropdownMenu.Content>
                      </SubframeCore.DropdownMenu.Portal>
                    </SubframeCore.DropdownMenu.Root>
                  )}

                  <ActionTooltip content="Delete all slides from current signboard loop" side="bottom">
                    <Button
                      variant="neutral-secondary"
                      size="small"
                      className="h-7 text-xs font-medium px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                      icon={<FeatherTrash className="h-3 w-3" />}
                      onClick={handleClearAllSlides}
                    >
                      Clear All
                    </Button>
                  </ActionTooltip>
                </div>
              </div>

              {/* Special Generator for Stops Tab */}
              {selectedTab === Tab.STOPS && (
                <div className="flex flex-col gap-2 p-3 bg-brand-50/50 border-b border-brand-200/50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Select
                      value={stopLanguage}
                      size="small"
                      onValueChange={setStopLanguage}
                      className="h-8 w-28 [&_button]:text-xs"
                    >
                      {AVAILABLE_LANGUAGES.map((l) => (
                        <Select.Item key={l.code} value={l.code}>
                          {l.label}
                        </Select.Item>
                      ))}
                    </Select>
                    <Select
                      value={stopUpDown}
                      size="small"
                      onValueChange={(v: any) => setStopUpDown(v)}
                      className="h-8 w-36 [&_button]:text-xs"
                    >
                      <Select.Item value="up">Forward (Up)</Select.Item>
                      <Select.Item value="down">Return (Down)</Select.Item>
                    </Select>
                    {depotStops.length > 0 && (
                      <Select
                        placeholder="Select Stop"
                        size="small"
                        value={selectedStop?.id || ""}
                        onValueChange={(id) => setSelectedStop(depotStops.find((s) => s.id === id) || null)}
                        className="h-8 flex-1 min-w-[140px] [&_button]:text-xs"
                      >
                        {depotStops.map((s) => (
                          <Select.Item key={s.id} value={s.id}>
                            {s.name}
                          </Select.Item>
                        ))}
                      </Select>
                    )}
                    <ActionTooltip content="Generate stop announcement slides for selected stop types" side="bottom">
                      <Button
                        variant="brand-primary"
                        size="small"
                        className="h-8 text-xs font-medium px-3 bg-neutral-900 text-white hover:bg-neutral-800"
                        disabled={!selectedStop || selectedStopTypes.length === 0}
                        onClick={() => {
                          if (!selectedStop || selectedStopTypes.length === 0) return;
                          const newSims = selectedStopTypes.map((stopType) => {
                            const text = `${stopType.toUpperCase()} STOP: ${selectedStop.name.toUpperCase()}`;
                            return getDefaultStopSingleSimulation(text, "stop", stopType as any, selectedStop, stopLanguage, stopUpDown);
                          });
                          const curList: Simulation[] = getValues(selectedTab as any) || [];
                          const updatedList = [...curList, ...newSims];
                          setValue(selectedTab as any, updatedList, { shouldDirty: true });
                          setSelectedSimulationIndex(updatedList.length - 1);
                        }}
                      >
                        Generate Stop Slide
                      </Button>
                    </ActionTooltip>
                  </div>

                  {/* Stop types checkboxes */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] font-semibold text-neutral-700">Stop Types:</span>
                    {["current", "next", "coming", "arrived"].map((st) => {
                      const checked = selectedStopTypes.includes(st);
                      return (
                        <label key={st} className="flex items-center gap-1.5 text-xs text-neutral-800 font-medium cursor-pointer capitalize">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStopTypes((prev) => [...prev, st]);
                              } else {
                                setSelectedStopTypes((prev) => prev.filter((x) => x !== st));
                              }
                            }}
                            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 h-3.5 w-3.5"
                          />
                          {st}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Slides Loop Card Stack */}
              <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3">
                {simulations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-neutral-border bg-sidebar-background my-8">
                    <span className="text-sm font-semibold text-default-font mb-1">No Slides in Loop Sequence</span>
                    <p className="text-xs text-neutral-600 mb-4 max-w-xs">
                      Add your first destination slide to start the signboard playback loop.
                    </p>
                    <ActionTooltip content="Create first destination slide" side="top">
                      <Button
                        variant="brand-primary"
                        size="small"
                        className="h-8 text-xs font-medium px-3 bg-neutral-900 text-white hover:bg-neutral-800"
                        onClick={() => handleAddSlide("two")}
                      >
                        + Add Two-Line Route
                      </Button>
                    </ActionTooltip>
                  </div>
                ) : (
                  simulations.map((sim, index) => {
                    const isSelected = index === selectedSimulationIndex;
                    const format = sim.format || "two";
                    const simType = sim.type || "route";
                    const w = sim.width || activeWidth;
                    const h = sim.height || activeHeight;

                    // Texts
                    const routeNumText = isSplitRoute
                      ? `${sim.texts?.routeNumber1?.text || ""}/${sim.texts?.routeNumber2?.text || ""}`
                      : sim.texts?.sideText?.text || sim.texts?.routeNumber?.text || routeNumber || "";
                    const destText = sim.texts?.text?.text || "";
                    const singleText = sim.texts?.text?.text || "";

                    return (
                      <div
                        key={`${selectedTab}_slide_${index}`}
                        onClick={() => setSelectedSimulationIndex(index)}
                        className={SubframeUtils.twClassNames(
                          "flex flex-col rounded-xl border p-3 cursor-pointer transition-all shadow-xs",
                          isSelected
                            ? "bg-sidebar-background border-neutral-900 ring-2 ring-neutral-900 shadow-md"
                            : "bg-sidebar-background border-neutral-border hover:border-neutral-400 hover:shadow-sm"
                        )}
                      >
                        {/* Slide Card Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-border">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-neutral-900 text-white font-mono font-bold text-xs">
                              #{index + 1}
                            </span>
                            <span className="text-xs font-bold text-neutral-900 capitalize">
                              {format === "two" ? "Two Line" : format === "three" ? "Three Line" : "Single Line"}
                            </span>
                            <span className="text-xs text-neutral-600 capitalize font-medium">• {simType}</span>
                            <span className="text-xs font-mono text-neutral-600 font-medium">• {w}×{h}</span>
                            {sim.audioFileUrl && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                                <FeatherVolume2 className="h-2.5 w-2.5" /> PAS Audio
                              </span>
                            )}
                          </div>

                          {/* Reorder & Action Buttons */}
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <ActionTooltip content="Move slide up in playback sequence" side="top">
                              <IconButton
                                variant="neutral-secondary"
                                size="small"
                                className="h-7 w-7 text-neutral-700 hover:text-neutral-900"
                                icon={<FeatherChevronUp className="h-3.5 w-3.5" />}
                                disabled={index === 0}
                                onClick={() => handleMoveSlide(index, "up")}
                              />
                            </ActionTooltip>
                            <ActionTooltip content="Move slide down in playback sequence" side="top">
                              <IconButton
                                variant="neutral-secondary"
                                size="small"
                                className="h-7 w-7 text-neutral-700 hover:text-neutral-900"
                                icon={<FeatherChevronDown className="h-3.5 w-3.5" />}
                                disabled={index === simulations.length - 1}
                                onClick={() => handleMoveSlide(index, "down")}
                              />
                            </ActionTooltip>
                            <ActionTooltip content="Duplicate this slide" side="top">
                              <IconButton
                                variant="neutral-secondary"
                                size="small"
                                className="h-7 w-7 text-neutral-700 hover:text-neutral-900"
                                icon={<FeatherCopy className="h-3.5 w-3.5" />}
                                onClick={() => handleDuplicateSlide(index)}
                              />
                            </ActionTooltip>
                            <ActionTooltip content="Delete this slide from loop" side="top">
                              <IconButton
                                variant="neutral-secondary"
                                size="small"
                                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                icon={<FeatherTrash className="h-3.5 w-3.5" />}
                                onClick={() => handleRemoveSlide(index)}
                              />
                            </ActionTooltip>
                          </div>
                        </div>

                        {/* Slide Card Body Zones */}
                        {format === "two" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Route Number Zone */}
                            <div className="flex flex-col p-2.5 rounded-lg bg-neutral-100/60 border border-neutral-border">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-0.5">
                                ROUTE NUMBER ZONE
                              </span>
                              <span className="text-xs font-mono font-bold text-neutral-900 truncate">
                                {routeNumText || "—"}
                              </span>
                              <span className="text-[10px] text-neutral-600 font-mono mt-1 truncate">
                                Font: {sim.texts?.sideText?.fontHeight || 14}px • {sim.texts?.sideText?.position || "Center"} • {sim.texts?.sideText?.scrollType || "Fixed"}
                              </span>
                            </div>

                            {/* Destination Text Zone */}
                            <div className="flex flex-col p-2.5 rounded-lg bg-neutral-100/60 border border-neutral-border">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-0.5">
                                DESTINATION TEXT ZONE
                              </span>
                              <span className="text-xs font-semibold text-neutral-900 truncate">
                                {destText || "—"}
                              </span>
                              <span className="text-[10px] text-neutral-600 font-mono mt-1 truncate">
                                Font: {sim.texts?.text?.fontHeight || 14}px ({sim.texts?.text?.fontWeight || "Bold"}) • Scroll: {sim.texts?.text?.scrollType || "Right To Left"} • Lang: {(sim.texts?.text?.language || "en").toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ) : format === "single" ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-col p-2.5 rounded-lg bg-neutral-100/60 border border-neutral-border">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-0.5">
                                DESTINATION TEXT ZONE
                              </span>
                              <span className="text-xs font-semibold text-neutral-900 truncate">
                                {singleText || "—"}
                              </span>
                              <span className="text-[10px] text-neutral-600 font-mono mt-1 truncate">
                                Font: {sim.texts?.text?.fontHeight || 14}px ({sim.texts?.text?.fontWeight || "Bold"}) • Scroll: {sim.texts?.text?.scrollType || "Right To Left"} • Lang: {(sim.texts?.text?.language || "en").toUpperCase()}
                              </span>
                            </div>

                            {sim.audioFileUrl && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-50 border border-amber-300 text-xs text-amber-900 font-mono">
                                <FeatherVolume2 className="h-3 w-3 text-amber-600 flex-none" />
                                <span className="truncate">
                                  TTS: {sim.texts?.text?.text} ({sim.audioFileName || "audio.mp3"})
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="flex flex-col p-2 rounded-lg bg-neutral-100/60 border border-neutral-border">
                              <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider">ROUTE ZONE</span>
                              <span className="text-xs font-mono font-bold text-neutral-900 truncate">{routeNumText || "—"}</span>
                            </div>
                            <div className="flex flex-col p-2 rounded-lg bg-neutral-100/60 border border-neutral-border">
                              <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider">UPPER LINE</span>
                              <span className="text-xs font-medium text-neutral-900 truncate">{sim.texts?.upperHalfText?.text || "—"}</span>
                            </div>
                            <div className="flex flex-col p-2 rounded-lg bg-neutral-100/60 border border-neutral-border">
                              <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider">LOWER LINE</span>
                              <span className="text-xs font-medium text-neutral-900 truncate">{sim.texts?.lowerHalfText?.text || "—"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Confirmation Dialog on Unsaved Exit */}
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <Dialog.Content className="flex p-6 w-[90vw] max-w-[360px] font-sans gap-4 flex-col bg-sidebar-background rounded-2xl">
              <h1 className="text-base font-bold text-default-font">Unsaved Changes</h1>
              <p className="text-xs text-neutral-600">
                You have unsaved changes. Are you sure you want to go back without saving?
              </p>
              <div className="flex flex-col gap-2 w-full pt-2">
                <Button
                  variant="neutral-secondary"
                  size="small"
                  className="w-full h-8 text-xs font-medium"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Keep Editing
                </Button>
                <Button
                  variant="neutral-secondary"
                  size="small"
                  className="w-full h-8 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    navigate(-1);
                  }}
                >
                  Go Back Without Saving
                </Button>
                <Button
                  variant="brand-primary"
                  size="small"
                  className="w-full h-8 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    handleSubmit(onSubmit)();
                  }}
                >
                  Save and Exit
                </Button>
              </div>
            </Dialog.Content>
          </Dialog>
        </div>
      </SubframeCore.Tooltip.Provider>
    );
  }
);
