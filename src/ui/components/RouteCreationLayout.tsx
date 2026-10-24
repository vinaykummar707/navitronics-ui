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
  FeatherMusic,
  FeatherPause,
  FeatherPlay,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherRepeat,
  FeatherRotateCw,
  FeatherSearch,
  FeatherSliders,
  FeatherSparkle,
  FeatherSpeech,
  FeatherMic2,
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
  getDefaultTextConfig,
  getDefaultStopSingleSimulation,
  getDefaultThreeSimulation,
  getDefaultTwoSimulation,
  stopStates,
} from "@/constants/defaultRouteValues";
import {
  DEFAULT_SIMULATION_HEIGHTS,
  DEFAULT_SIMULATION_WIDTHS,
  DisplayConfigPostRequest,
  FONT_WEIGHTS,
  FontWeight,
  Position,
  ScrollType,
  Simulation,
  SimulationFormat,
  SimulationType,
  TextConfig,
} from "@/types/routeConfigV2";
import {
  getRoutePresetZoneText,
  isAutoRouteZoneText,
  joinSourceDestination,
  migrateSlidesOnSplitRouteToggle,
  ROUTE_SEPARATOR_OPTIONS,
  RouteFieldValues,
  sanitizeRouteBoards,
  syncSlidesWithRouteFields,
} from "@/utils/simulationUtils";
import { useFontFileByLanguage, useFontHeightForLanguage, useFontHeightsForLanguage } from "@/utils/getFontFileByLanguage";
import { fillMissingSlideBitmaps } from "@/services/bitmapService";

const HEIGHT_OPTIONS = DEFAULT_SIMULATION_HEIGHTS;
const WIDTH_OPTIONS = DEFAULT_SIMULATION_WIDTHS;

// Zones rendered at half board height by DisplayEditor.
const isHalfHeightZone = (format: SimulationFormat | undefined, key: string) =>
  format !== "single" &&
  (key === "routeNumber1" || key === "routeNumber2" || (format === "three" && (key === "upperHalfText" || key === "lowerHalfText")));

// Clamps zone font heights to a board height, clearing bitmaps that must be regenerated.
const fitSimulationToHeight = (s: Simulation, newHeight: number): Simulation => {
  const newTexts: Record<string, any> = { ...(s.texts || {}) };
  Object.keys(newTexts).forEach((k) => {
    const item = newTexts[k];
    if (!item) return;
    const maxFont = isHalfHeightZone(s.format, k) ? Math.floor(newHeight / 2) : newHeight;
    if (!item.fontHeight || item.fontHeight > maxFont) {
      newTexts[k] = { ...item, fontHeight: maxFont, bitmap: "" };
    }
  });
  return { ...s, height: newHeight as Simulation["height"], texts: newTexts as Simulation["texts"] };
};

const FONT_HEIGHT_GRID = [
  7, 8, 10, 12, 14, 16, 18,
  20, 22, 24, 26, 28, 30, 32,
];

const BOARD_ITEMS = [
  { id: Tab.FRONT, letter: "F", label: "FRONT" },
  { id: Tab.SIDE, letter: "S", label: "SIDE" },
  { id: Tab.REAR, letter: "R", label: "REAR" },
  { id: Tab.INTERNAL, letter: "I", label: "IN BUS" },
];

const getBoardLabel = (board: string) =>
  BOARD_ITEMS.find((b) => b.id === board)?.label ?? board.toUpperCase();

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
          <div className="z-[99999] px-2.5 py-1 rounded-md bg-sidebar-background border border-neutral-border text-default-font shadow-lg pointer-events-none select-none text-[11px] font-medium leading-tight">
            {content}
          </div>
        </SubframeCore.Tooltip.Content>
      </SubframeCore.Tooltip.Portal>
    </SubframeCore.Tooltip.Root>
  );
};

interface ToggleOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  tip?: string;
  disabled?: boolean;
}

interface ToggleGroupProps<T extends string | number> {
  value: T | undefined;
  options: readonly ToggleOption<T>[];
  onChange: (value: T) => void;
  columns?: number;
}

function ToggleGroup<T extends string | number>({ value, options, onChange, columns }: ToggleGroupProps<T>) {
  return (
    <div
      className="grid gap-1 w-full p-1 rounded-lg bg-neutral-100"
      style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const button = (
          <button
            type="button"
            disabled={opt.disabled}
            aria-pressed={active}
            onClick={() => !active && onChange(opt.value)}
            className={SubframeUtils.twClassNames(
              "h-7 px-1 flex items-center justify-center rounded-md text-xs transition-all cursor-pointer truncate",
              active
                ? "bg-brand-primary text-brand-primary-foreground font-semibold shadow-sm"
                : "text-subtext-color hover:text-default-font",
              opt.disabled ? "opacity-35 cursor-not-allowed hover:text-subtext-color" : ""
            )}
          >
            {opt.label}
          </button>
        );
        return opt.tip ? (
          <ActionTooltip key={String(opt.value)} content={opt.tip} side="top">
            {button}
          </ActionTooltip>
        ) : (
          <React.Fragment key={String(opt.value)}>{button}</React.Fragment>
        );
      })}
    </div>
  );
}

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-3">
    <span className="w-24 flex-none text-xs font-medium text-neutral-800">{label}</span>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

const NumberField: React.FC<{
  value: number | "" | undefined;
  min: number;
  max: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: number | undefined) => void;
}> = ({ value, min, max, step, placeholder, disabled, onChange }) => (
  <input
    type="number"
    min={min}
    max={max}
    step={step}
    placeholder={placeholder}
    disabled={disabled}
    value={value ?? ""}
    onChange={(e) => {
      const raw = e.target.value;
      onChange(raw === "" ? undefined : Math.min(Math.max(min, Number(raw) || min), max));
    }}
    className="h-9 w-full rounded-lg bg-neutral-100 px-3 text-xs font-mono text-neutral-900 outline-none focus:ring-1 focus:ring-neutral-400 disabled:opacity-40"
  />
);

const SCROLL_SPEED_TOGGLES = [
  { value: 6, label: "Slow", tip: "Slow scroll speed" },
  { value: 4, label: "Normal", tip: "Normal scroll speed" },
  { value: 1, label: "Fast", tip: "Fast scroll speed" },
] as const;

// Maps any stored speed onto the nearest of the three UI presets (lower value = faster).
const toSpeedPreset = (speed: number) => (speed <= 2 ? 1 : speed <= 5 ? 4 : 6);

const SLIDE_BOARDS = ["front", "side", "rear", "internal"] as const;
const ROUTE_SYNC_FIELDS: string[] = ["route_number", "route_number_1", "route_number_2", "source", "destination", "via", "separation"];

// Split-route number zones are half height, so icons render too small there and are not offered.
const isSplitRouteNumberZone = (key: string) => key === "routeNumber1" || key === "routeNumber2";

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
      clearErrors,
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
    const submitLockRef = useRef(false);
    const [isPreparingSubmit, setIsPreparingSubmit] = useState(false);
    const releaseSubmitLock = useCallback(() => {
      submitLockRef.current = false;
      setIsPreparingSubmit(false);
    }, []);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [ledColor, setLedColor] = useState<"#ffbf00" | "#ff2222">("#ffbf00");
    // null = auto-fit the LED board to the stage width (legacy SignboardCanvasStage behaviour, 40–100%).
    const [manualZoom, setManualZoom] = useState<number | null>(null);
    const [fitZoom, setFitZoom] = useState<number>(100);
    const zoom = manualZoom ?? fitZoom;
    const [ledStageEl, setLedStageEl] = useState<HTMLDivElement | null>(null);
    const [ledMatrixEl, setLedMatrixEl] = useState<HTMLDivElement | null>(null);
    const [ledMatrixSize, setLedMatrixSize] = useState<{ width: number; height: number } | null>(null);
    const [isCycling, setIsCycling] = useState<boolean>(false);
    const [showAutoText, setShowAutoText] = useState(false);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    useEffect(() => {
      if (!ledStageEl || !ledMatrixEl || typeof ResizeObserver === "undefined") return;
      // Bezel padding/borders around the matrix: p-3 + border + inner p-2 on both sides.
      const BEZEL_CHROME_PX = 42;
      const measure = () => {
        // offsetWidth/Height ignore the scale transform, so this is the board's natural size.
        const width = ledMatrixEl.offsetWidth;
        const height = ledMatrixEl.offsetHeight;
        setLedMatrixSize((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
        const available = ledStageEl.clientWidth - BEZEL_CHROME_PX;
        if (width > 0 && available > 0) {
          setFitZoom(Math.min(100, Math.max(40, Math.floor((available / width) * 100))));
        }
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(ledStageEl);
      observer.observe(ledMatrixEl);
      return () => observer.disconnect();
    }, [ledStageEl, ledMatrixEl]);

    // Stops state (for Tab.STOPS)
    const [stopLanguage, setStopLanguage] = useState<string>("en");
    const [stopUpDown, setStopUpDown] = useState<"up" | "down">("up");
    const [selectedStop, setSelectedStop] = useState<IStopWithAudio | null>(null);
    const [selectedStopTypes, setSelectedStopTypes] = useState<(typeof stopStates)[number][]>(["next"]);

    // Watch Form Values
    const isSplitRoute = watch("is_split_route");
    const routeNumber = watch("route_number");
    const routeNumber1 = watch("route_number_1");
    const routeNumber2 = watch("route_number_2");
    const source = watch("source");
    const destination = watch("destination");
    const via = watch("via");
    const separation = watch("separation");
    const isReturn = watch("return");

    const displayRouteNum = isSplitRoute
      ? `${routeNumber1 || "?"} / ${routeNumber2 || "?"}`
      : routeNumber || "---";

    // Keep existing slides in step with Route Setup edits (only zones still showing auto text).
    useEffect(() => {
      const pickRouteFields = (values: object | undefined): RouteFieldValues => {
        const fields = (values || {}) as Record<string, unknown>;
        const read = (key: string) => (typeof fields[key] === "string" ? (fields[key] as string) : "");
        return {
          routeNumber: read("route_number"),
          routeNumber1: read("route_number_1"),
          routeNumber2: read("route_number_2"),
          source: read("source"),
          destination: read("destination"),
          via: read("via"),
          separation: read("separation"),
        };
      };
      let prevFields = pickRouteFields(getValues());
      const subscription = watch((values, { name }) => {
        const nextFields = pickRouteFields(values);
        const prev = prevFields;
        prevFields = nextFields;
        // Form resets (edit-mode load) have no field name and must not rewrite the loaded slides.
        if (!name || !ROUTE_SYNC_FIELDS.includes(name)) return;
        SLIDE_BOARDS.forEach((board) => {
          const { slides, changed } = syncSlidesWithRouteFields(getValues(board) || [], prev, nextFields);
          if (changed) {
            setValue(board, slides as (DisplayConfigPostRequest & IRoute)[typeof board], { shouldDirty: true });
          }
        });
      });
      return () => subscription.unsubscribe();
    }, [watch, getValues, setValue]);

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
        if (userTextZone === "routeNumber1" || userTextZone === "routeNumber2" || userTextZone === "text") return userTextZone;
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
          fontHeight: currentFormat === "three" && (activeTextZoneKey === "upperHalfText" || activeTextZoneKey === "lowerHalfText") ? 8 : 16,
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
    // Zone paths are built at runtime and can't be checked against the form type, so field names are checked instead.
    const watchZoneField = <K extends keyof TextConfig>(field: K) =>
      (pathBase ? (watch as unknown as (name: string) => unknown)(`${pathBase}.${field}`) : undefined) as TextConfig[K] | undefined;
    const setZoneField = <K extends keyof TextConfig>(field: K, value: TextConfig[K] | undefined) =>
      (setValue as unknown as (name: string, value: unknown, options: { shouldDirty: boolean }) => void)(
        `${pathBase}.${field}`,
        value,
        { shouldDirty: true }
      );
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

    const currentIcon = pathBase ? (watch(`${pathBase}.icon`) as string) || "" : "";
    const iconsAllowed = !isSplitRouteNumberZone(activeTextZoneKey);
    const currentIconPos = pathBase ? (watch(`${pathBase}.iconPosition`) as string) || "start" : "start";
    const currentIconSpacing = pathBase ? Number(watch(`${pathBase}.iconSpacing`) ?? 2) : 2;
    const currentIconScale = pathBase ? Number(watch(`${pathBase}.iconWidthScale`) ?? 1.0) : 1.0;
    const rawWordIndex = pathBase ? Number(watch(`${pathBase}.iconWordIndex`) ?? 1) : 1;
    const wordsList = currentText.trim().split(/\s+/).filter(Boolean);
    const wordsCount = wordsList.length;
    const maxWordIndex = Math.max(1, wordsCount > 1 ? wordsCount - 1 : 1);
    const currentWordIndex = Math.min(Math.max(1, rawWordIndex), maxWordIndex);

    const maxHeight = currentSimulation?.height || 16;
    const isHalfLine = isHalfHeightZone(currentFormat, activeTextZoneKey);
    const maxAllowedFontHeight = isHalfLine ? Math.floor(maxHeight / 2) : maxHeight;

    // Font heights utility
    const getDefaultFontHeightForLanguage = useFontHeightForLanguage();
    const getConfiguredFontHeightsForLanguage = useFontHeightsForLanguage();
    const getFontFileByLanguage = useFontFileByLanguage();

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

    // Auto-preview: steps the LED board through every slide in the loop.
    useEffect(() => {
      if (!isCycling || simulations.length <= 1) return;
      const interval = setInterval(() => {
        setSelectedSimulationIndex((prev) => (prev + 1) % simulations.length);
      }, 3500);
      return () => clearInterval(interval);
    }, [isCycling, simulations.length, setSelectedSimulationIndex]);

    // Keyboard shortcut: 'r' toggles the return trip
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
          return;
        }
        if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          handleReturnRoute();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isReturn]);

    // Swap: only exchanges origin and terminus.
    const handleSwapEndpoints = () => {
      const src = getValues("source");
      const dest = getValues("destination");
      setValue("source", dest, { shouldDirty: true });
      setValue("destination", src, { shouldDirty: true });
      toast.info("Swapped Source and Destination (trip direction unchanged)");
    };

    // Return: toggles the return-trip flag, flipping the direction (endpoints and via order) with it.
    const handleReturnRoute = () => {
      const src = getValues("source");
      const dest = getValues("destination");
      const viaStops = (getValues("via") || "").split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      setValue("source", dest, { shouldDirty: true });
      setValue("destination", src, { shouldDirty: true });
      if (viaStops.length > 1) {
        setValue("via", viaStops.reverse().join(", "), { shouldDirty: true });
      }
      setValue("return", !isReturn, { shouldDirty: true });
      toast.info(!isReturn ? "Return trip: direction reversed" : "Outbound trip: direction restored");
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
      const oldFormat = currentSimulation.format;
      const existingTexts: Record<string, any> = currentSimulation.texts || {};
      const routeValues: RouteFieldValues = {
        routeNumber: getValues("route_number") || "",
        routeNumber1: getValues("route_number_1") || "",
        routeNumber2: getValues("route_number_2") || "",
        source: getValues("source") || "",
        destination: getValues("destination") || "",
        via: getValues("via") || "",
        separation: getValues("separation") || "",
      };
      const halfRows = Math.floor(h / 2);
      const defaultFontHeight = getDefaultTextConfig().fontHeight || 14;
      const isRouteSlide = !t || t === "route";

      // Builds a zone for the new format from the first matching old zone, keeping its styling.
      // Auto-generated text is replaced by the new format's preset; manually edited text is kept.
      // Slogan / special message text is never replaced with Route Setup text.
      const buildZone = (targetKey: string, sourceKeys: string[]) => {
        const preset = isRouteSlide ? getRoutePresetZoneText(newFormat, targetKey, routeValues) ?? "" : "";
        const sourceKey = sourceKeys.find((key) => existingTexts[key]);
        const targetIsHalf = isHalfHeightZone(newFormat, targetKey);
        const maxRows = targetIsHalf ? Math.max(7, halfRows) : h;
        if (!sourceKey) {
          const created = getDefaultTextConfig(preset);
          return { ...created, fontHeight: Math.min(created.fontHeight || defaultFontHeight, maxRows) };
        }

        let cfg = existingTexts[sourceKey];
        if (isRouteSlide && cfg.text !== preset && isAutoRouteZoneText(oldFormat, sourceKey, cfg.text, routeValues)) {
          cfg = { ...cfg, text: preset, bitmap: "" };
        }

        let fontHeight = Math.min(cfg.fontHeight || Math.min(defaultFontHeight, maxRows), maxRows);
        // A half-height zone (three-line) moving to a full-height zone gets the full default height back
        // unless the user picked a smaller font on purpose.
        if (!targetIsHalf && isHalfHeightZone(oldFormat, sourceKey) && (!cfg.fontHeight || cfg.fontHeight >= halfRows)) {
          fontHeight = Math.min(defaultFontHeight, h);
        }
        // Changing the font height invalidates the stored bitmap.
        return fontHeight === cfg.fontHeight ? cfg : { ...cfg, fontHeight, bitmap: "" };
      };

      const routeNumberZones = isSplitRoute
        ? {
            routeNumber1: existingTexts.routeNumber1 || getDefaultTextConfig(getRoutePresetZoneText(newFormat, "routeNumber1", routeValues)),
            routeNumber2: existingTexts.routeNumber2 || getDefaultTextConfig(getRoutePresetZoneText(newFormat, "routeNumber2", routeValues)),
          }
        : {
            sideText: existingTexts.sideText || getDefaultTextConfig(getRoutePresetZoneText(newFormat, "sideText", routeValues)),
          };

      let updatedTexts: Record<string, any>;
      if (newFormat === "single") {
        updatedTexts = { text: buildZone("text", ["text", "upperHalfText"]) };
      } else if (newFormat === "two") {
        updatedTexts = { text: buildZone("text", ["text", "upperHalfText"]), ...routeNumberZones };
      } else {
        updatedTexts = {
          upperHalfText: buildZone("upperHalfText", ["upperHalfText", "text"]),
          lowerHalfText: buildZone("lowerHalfText", ["lowerHalfText"]),
          ...routeNumberZones,
        };
      }

      const updated: Simulation = {
        ...currentSimulation,
        format: newFormat,
        width: w,
        height: h,
        type: t,
        texts: updatedTexts as Simulation["texts"],
      };

      const targetIndex = safeSimulationIndex >= 0 ? safeSimulationIndex : selectedSimulationIndex;
      setValue(`${selectedTab}.${targetIndex}` as any, updated, { shouldDirty: true });
      setUserTextZone(newFormat === "single" ? "text" : getFirstTextZone(isSplitRoute));
    };

    // Signboard Dimensions Handlers
    const handleHeightChange = (newHeight: 16 | 32) => {
      const sims: Simulation[] = getValues(selectedTab as any) || [];
      if (sims.length === 0) return;
      const updated = sims.map((s) => fitSimulationToHeight(s, newHeight));
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
      const sourceDestination = joinSourceDestination(getValues("source"), getValues("destination"), getValues("separation"));
      const routeText = [sourceDestination, getValues("via")].filter(Boolean).join(" - ");

      if (format === "single") {
        const singlePreset =
          type === "slogan"
            ? "PLEASE WEAR SEAT BELT - ಸುರಕ್ಷಿತ ಪ್ರಯಾಣ"
            : type === "special message"
              ? "THIS IS A SPECIAL MESSAGE SIMULATION"
              : routeText || "Single Route Text";
        newSim = getDefaultSingleSimulation(singlePreset, type);
      } else if (format === "two") {
        newSim = getDefaultTwoSimulation(routeNum, routeText, type, getValues("route_number_1"), getValues("route_number_2"), isSplitRoute);
      } else {
        newSim = getDefaultThreeSimulation(routeNum, sourceDestination, getValues("via") || "", type, getValues("route_number_1"), getValues("route_number_2"), isSplitRoute);
      }

      if (currentSimulation) {
        newSim.height = currentSimulation.height;
        newSim.width = currentSimulation.width;
      }
      newSim = fitSimulationToHeight(newSim, newSim.height);

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
      if (confirm(`Are you sure you want to delete all slides on ${getBoardLabel(selectedTab)} display?`)) {
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
      toast.success(`Copied all ${currentSims.length} slides to ${getBoardLabel(destBoard)} signboard!`);
    };

    const handleCopySlideToBoard = (destBoard: string) => {
      if (!currentSimulation || destBoard === selectedTab) return;
      const destSims: Simulation[] = getValues(destBoard as any) || [];
      let cloned: Simulation = JSON.parse(JSON.stringify(currentSimulation));
      // Match the destination board's dimensions so its slides stay uniform.
      const destDims = destSims[0];
      if (destDims?.width && destDims?.height) {
        if (cloned.height !== destDims.height) cloned = fitSimulationToHeight(cloned, destDims.height);
        cloned = { ...cloned, width: destDims.width };
      }
      setValue(destBoard as any, [...destSims, cloned], { shouldDirty: true });
      toast.success(`Slide #${selectedSimulationIndex + 1} copied to ${getBoardLabel(destBoard)} signboard!`);
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
      // The ref blocks re-entry synchronously; mutation isPending only flips after the async pre-checks below.
      if (submitLockRef.current || isCreatingRoute || isUpdatingRoute) return;
      submitLockRef.current = true;
      setIsPreparingSubmit(true);
      let handedOffToMutation = false;
      try {
        const trimmedRouteNum1 = (data.route_number_1 || "").trim();
        const trimmedRouteNum2 = (data.route_number_2 || "").trim();
        const separator = (data.separation || "").trim() || "-";
        // Word separators ("to", "vice versa") need spaces around them to stay readable.
        const routeNumberJoiner = /^[a-z]/i.test(separator) ? ` ${separator} ` : separator;
        const trimmedRouteNum = data.is_split_route
          ? `${trimmedRouteNum1}${routeNumberJoiner}${trimmedRouteNum2}`
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

          // Outbound and return trips of the same route may share a route number.
          const isReturnTrip = Boolean(data.return);
          const isDup = await checkActiveDuplicate(
            "routes",
            "route_number",
            trimmedRouteNum,
            scopeFilter,
            mode === "edit" && data.id ? data.id : undefined,
            (query) => (isReturnTrip ? query.eq("return", true) : query.not("return", "is", true))
          );

          if (isDup) {
            toast.error(
              `A ${isReturnTrip ? "return" : "outbound"} route with number "${trimmedRouteNum}" already exists in this depot.`
            );
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

        const cleanedData: Record<string, any> = sanitizeRouteBoards(data);
        // Slides that were never shown in the preview (or were updated from Route Setup) have no bitmap yet.
        const bitmapResults = await Promise.all(
          SLIDE_BOARDS.map((board) =>
            fillMissingSlideBitmaps(cleanedData[board], {
              isSplitRoute: Boolean(data.is_split_route),
              getFontFamily: getFontFileByLanguage,
            })
          )
        );
        let missingBitmaps = 0;
        SLIDE_BOARDS.forEach((board, i) => {
          if (Array.isArray(cleanedData[board])) cleanedData[board] = bitmapResults[i].slides;
          missingBitmaps += bitmapResults[i].failed;
        });
        if (missingBitmaps > 0) {
          toast.warning(`${missingBitmaps} slide text bitmap(s) could not be generated. Open those slides to regenerate them.`);
        }

        const payload = {
          ...cleanedData,
          route_number: trimmedRouteNum,
          route_number_1: data.is_split_route ? trimmedRouteNum1 : "",
          route_number_2: data.is_split_route ? trimmedRouteNum2 : "",
          separation: separator,
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
                toast.error(
                  err?.code === "23505"
                    ? `Route number "${trimmedRouteNum}" is already used by another route in this depot.`
                    : `Error updating route: ${err.message || "Unknown error"}`
                );
              },
              onSettled: releaseSubmitLock,
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
              toast.error(
                err?.code === "23505"
                  ? `Route number "${trimmedRouteNum}" is already used by another route in this depot.`
                  : `Error creating route: ${err.message || "Unknown error"}`
              );
            },
            onSettled: releaseSubmitLock,
          });
        }
        handedOffToMutation = true;
      } finally {
        if (!handedOffToMutation) releaseSubmitLock();
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

              <span className="px-2.5 py-1 rounded-md bg-brand-primary text-brand-primary-foreground font-mono font-bold text-xs tracking-wider shadow-xs flex-none">
                {displayRouteNum}
              </span>

              <span className="hidden sm:inline-block text-xs font-bold text-default-font uppercase tracking-wide truncate max-w-[140px] md:max-w-[200px] lg:max-w-[280px]">
                {source || "ORIGIN"} ⇄ {destination || "TERMINUS"}
              </span>

              {formState.isDirty && !hasBeenSaved ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-warning-50 border border-warning-300 text-[11px] text-warning-800 font-semibold shrink-0" title="Unsaved changes">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning-500 animate-pulse" /> Unsaved
                </span>
              ) : (
                <span className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success-50 border border-success-300 text-[11px] text-success-800 font-semibold shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-success-500" /> Saved
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
                        ? "bg-warning-100 text-warning-800 border border-warning-300 shadow-2xs"
                        : "text-subtext-color hover:text-default-font"
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
                        ? "bg-error-100 text-error-800 border border-error-300 shadow-2xs"
                        : "text-subtext-color hover:text-default-font"
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
                  className="h-8 text-xs font-semibold px-3.5 border-none shadow-xs"
                  disabled={isPreparingSubmit || isCreatingRoute || isUpdatingRoute}
                  loading={isPreparingSubmit || isCreatingRoute || isUpdatingRoute}
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
              <div ref={setLedStageEl} className="flex flex-col items-center justify-center w-full py-1">
                <div className="flex flex-col items-center w-fit max-w-full rounded-2xl bg-slate-950 p-3 shadow-xl border border-slate-800 ring-1 ring-black/70">
                  {/* Hardware Top Monospace Bezel Bar */}
                 

                  {/* Dot Matrix Screen */}
                  <div className="flex items-center justify-center p-2 rounded-lg bg-black overflow-hidden shadow-inner ring-1 ring-black/50">
                    {/* Sized to the scaled board so zooming out actually frees up layout space. */}
                    <div
                      style={ledMatrixSize ? {
                        width: (ledMatrixSize.width * zoom) / 100,
                        height: (ledMatrixSize.height * zoom) / 100,
                        transition: "width 0.15s ease-out, height 0.15s ease-out",
                      } : undefined}
                    >
                      <div
                        ref={setLedMatrixEl}
                        className="w-max"
                        style={{
                          transform: `scale(${zoom / 100})`,
                          transformOrigin: "top left",
                          transition: "transform 0.15s ease-out",
                        }}
                      >
                        <DisplayEditor listIndex={safeSimulationIndex} stopScroll={isPaused} ledColor={ledColor} />
                      </div>
                    </div>
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
                </div>

                {/* Right Zoom & Reset */}
                <div className="flex items-center gap-2">
                  <IconButton
                    variant="neutral-tertiary"
                    size="small"
                    className="h-7 w-7"
                    icon={<FeatherMinus className="h-3.5 w-3.5" />}
                    disabled={zoom <= 10}
                    onClick={() => setManualZoom(Math.max(10, zoom - 15))}
                  />
                  <span className="font-mono text-xs text-neutral-600 font-semibold flex items-center gap-1">
                    <FeatherSearch className="h-3.5 w-3.5" /> {zoom}%
                  </span>
                  <IconButton
                    variant="neutral-tertiary"
                    size="small"
                    className="h-7 w-7"
                    icon={<FeatherPlus className="h-3.5 w-3.5" />}
                    disabled={zoom >= 175}
                    onClick={() => setManualZoom(Math.min(175, zoom + 15))}
                  />
                  <ActionTooltip content="Reset display zoom to fit the available width" side="top">
                    <Button
                      variant="neutral-secondary"
                      size="small"
                      className="h-7 text-xs font-medium px-2.5"
                      onClick={() => setManualZoom(null)}
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
            <div className="flex flex-none items-center justify-center p-6 bg-sidebar-background/40 border-b border-neutral-border text-xs">
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
                            ? "bg-brand-primary text-brand-primary-foreground shadow-sm ring-1 ring-brand-primary"
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
                <ActionTooltip content="Correct a data-entry mix-up: swaps the Source and Destination text only. Via order and trip direction are unchanged." side="bottom">
                  <Button
                    variant="neutral-secondary"
                    size="small"
                    className="h-7 text-xs font-medium px-2.5"
                    icon={<FeatherRepeat className="h-3.5 w-3.5" />}
                    onClick={handleSwapEndpoints}
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
                  <TextField
                    size="small"
                    label={<span>Route No <span className="text-red-500">*</span></span>}
                    variant="filled"
                    error={!!formState.errors.route_number}
                    helpText={formState.errors.route_number?.message as string | undefined}
                    className="w-full [&>div]:!h-8 [&>div]:!min-h-[32px] [&>span]:text-xs [&>span]:font-semibold [&>span]:text-neutral-700"
                  >
                    <TextField.Input
                      placeholder="e.g. 335-E"
                      className="text-xs font-medium"
                      {...register("route_number", {
                        onChange: () => formState.errors.route_number && clearErrors("route_number"),
                      })}
                    />
                  </TextField>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <TextField
                      size="small"
                      label={<span>Route #1 <span className="text-red-500">*</span></span>}
                      variant="filled"
                      error={!!formState.errors.route_number}
                      className="w-full [&>div]:!h-8 [&>div]:!min-h-[32px] [&>span]:text-xs [&>span]:font-semibold [&>span]:text-neutral-700"
                    >
                      <TextField.Input
                        placeholder="e.g. 101"
                        className="text-xs font-medium"
                        {...register("route_number_1", {
                          onChange: () => formState.errors.route_number && clearErrors("route_number"),
                        })}
                      />
                    </TextField>
                    <TextField
                      size="small"
                      label={<span>Route #2 <span className="text-red-500">*</span></span>}
                      variant="filled"
                      error={!!formState.errors.route_number}
                      className="w-full [&>div]:!h-8 [&>div]:!min-h-[32px] [&>span]:text-xs [&>span]:font-semibold [&>span]:text-neutral-700"
                    >
                      <TextField.Input
                        placeholder="e.g. 102"
                        className="text-xs font-medium"
                        {...register("route_number_2", {
                          onChange: () => formState.errors.route_number && clearErrors("route_number"),
                        })}
                      />
                    </TextField>
                    {formState.errors.route_number && (
                      <span className="col-span-2 text-[11px] text-error-600">
                        {formState.errors.route_number.message as string}
                      </span>
                    )}
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
                <Select
                  variant="filled"
                  size="small"
                  label="Route Separator"
                  value={separation || "-"}
                  onValueChange={(val) => setValue("separation", val, { shouldDirty: true })}
                  className="w-full [&>span]:text-xs [&>span]:font-semibold [&>span]:text-neutral-700 [&_button]:text-xs [&_button]:font-medium"
                >
                  {[...ROUTE_SEPARATOR_OPTIONS, ...(separation && !(ROUTE_SEPARATOR_OPTIONS as readonly string[]).includes(separation) ? [separation] : [])].map((opt) => (
                    <Select.Item key={opt} value={opt}>
                      {opt}
                    </Select.Item>
                  ))}
                </Select>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center gap-2 p-3 border-t border-neutral-border bg-sidebar-background">
                <ActionTooltip
                  content={
                    isReturn
                      ? "This route is saved as the RETURN trip. Click to switch back to the outbound trip (reverses Source, Destination and Via again). Shortcut: R"
                      : "Make this the RETURN trip of the route: reverses Source, Destination and the Via stop order, and saves the route marked as a return trip. Shortcut: R"
                  }
                  side="top"
                >
                  <Button
                    variant={isReturn ? "brand-primary" : "neutral-secondary"}
                    size="small"
                    className="flex-1 text-xs font-medium h-8"
                    icon={<FeatherRotateCw className="h-3.5 w-3.5" />}
                    onClick={handleReturnRoute}
                  >
                    {isReturn ? "Return Trip: ON" : "Make Return Trip (R)"}
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
                <div className="flex flex-col flex-1 min-h-0">
                  {/* Zone Sub-Tabs (Route No | Text | Upper Line | Lower Line) stay frozen while the rest scrolls */}
                  {currentSimulation && currentFormat !== "single" && (
                    <div className="flex flex-none items-center gap-4 border-b border-neutral-200/80 w-full px-4 pt-3 bg-sidebar-background">
                      {isSplitRoute ? (
                        <>
                          <ActionTooltip content="Switch to Route #1 zone editor" side="top">
                            <button
                              type="button"
                              onClick={() => setUserTextZone("routeNumber1")}
                              className={SubframeUtils.twClassNames(
                                "pb-1.5 text-xs font-semibold transition-all cursor-pointer truncate -mb-px",
                                activeTextZone === "routeNumber1"
                                  ? "border-b-2 border-brand-primary text-brand-primary font-bold"
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
                                  ? "border-b-2 border-brand-primary text-brand-primary font-bold"
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
                                ? "border-b-2 border-brand-primary text-brand-primary font-bold"
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
                                ? "border-b-2 border-brand-primary text-brand-primary font-bold"
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
                                  ? "border-b-2 border-brand-primary text-brand-primary font-bold"
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
                                  ? "border-b-2 border-brand-primary text-brand-primary font-bold"
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

                  <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 no-scrollbar">
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
                          const nextHeight = Math.min(getDefaultFontHeightForLanguage(val, activeTextZoneKey), maxAllowedFontHeight);
                          setValue(`${pathBase}.fontHeight`, nextHeight, { shouldDirty: true });
                          setValue(`${pathBase}.language`, val, { shouldDirty: true });
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
                              icon={<FeatherSparkle className="h-3.5 w-3.5 text-warning-500" />}
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
                            className="z-[99999] w-80 max-h-[420px] rounded-xl bg-sidebar-background border border-neutral-border shadow-2xl p-2 flex flex-col font-sans"
                          >
                            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-border px-1">
                              <span className="text-xs font-bold text-default-font uppercase tracking-wide flex items-center gap-1.5">
                                <FeatherSparkle className="h-3.5 w-3.5 text-warning-500" />
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

                      {iconsAllowed && (
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
                      )}
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
                          {iconsAllowed && (
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
                          )}
                          <ActionTooltip content="Remove icon from slide" side="top">
                            <IconButton
                              variant="destructive-secondary"
                              size="small"
                              className="h-7 w-7 flex-none"
                              icon={<FeatherX className="h-3.5 w-3.5" />}
                              onClick={() => setValue(`${pathBase}.icon`, "", { shouldDirty: true })}
                            />
                          </ActionTooltip>
                        </div>
                      </div>
                    )}
                  </div>

                    {currentIcon && iconsAllowed && (
                      <div className="space-y-2">
                        <SettingRow label="Icon Position">
                          <ToggleGroup<"start" | "center" | "end">
                            value={currentIconPos as "start" | "center" | "end"}
                            onChange={(pos) => {
                              setZoneField("iconPosition", pos);
                              // The bitmap API gives iconWordIndex precedence over iconPosition, so it must be cleared outside "center".
                              setZoneField("iconWordIndex", pos === "center" ? Math.max(1, Math.floor(wordsCount / 2)) : undefined);
                            }}
                            options={[
                              { value: "start", label: "Start", tip: "Place icon before text" },
                              { value: "center", label: "Middle", tip: "Place icon between words" },
                              { value: "end", label: "End", tip: "Place icon after text" },
                            ]}
                          />
                        </SettingRow>
                        {currentIconPos === "center" && (
                          <SettingRow label="After Word">
                            <ToggleGroup<number>
                              value={currentWordIndex}
                              columns={Math.min(maxWordIndex, 7)}
                              onChange={(v) => setZoneField("iconWordIndex", v)}
                              options={Array.from({ length: maxWordIndex }, (_, i) => ({
                                value: i + 1,
                                label: `${i + 1}`,
                                tip: wordsList[i] ? `After "${wordsList[i]}"` : undefined,
                              }))}
                            />
                          </SettingRow>
                        )}
                        <SettingRow label="Icon Spacing">
                          <ToggleGroup<number>
                            value={currentIconSpacing}
                            onChange={(v) => setZoneField("iconSpacing", v)}
                            options={[0, 1, 2, 3, 4, 6].map((v) => ({ value: v, label: `${v}` }))}
                          />
                        </SettingRow>
                        <SettingRow label="Icon Width">
                          <ToggleGroup<number>
                            value={currentIconScale}
                            onChange={(v) => setZoneField("iconWidthScale", v)}
                            options={[0.75, 1, 1.25, 1.5, 2].map((v) => ({ value: v, label: `${v}×` }))}
                          />
                        </SettingRow>
                      </div>
                    )}

                  {/* Material Symbol Picker Modal */}
                  <MaterialSymbolPicker
                    open={isIconPickerOpen}
                    onOpenChange={setIsIconPickerOpen}
                    selectedIcon={watch(`${pathBase}.icon`) || ""}
                    onSelectIcon={(iconName) => setValue(`${pathBase}.icon`, iconName, { shouldDirty: true })}
                  />

                  {/* SIGNBOARD & TYPOGRAPHY SETTINGS */}
                  <div className="space-y-2.5   border-neutral-border/60">
                    <SettingRow label="Text Height">
                      {(() => {
                        // Sizes above the zone's max are hidden; the current size stays so the selection is visible.
                        const sizes = Array.from(new Set([...FONT_HEIGHT_GRID, currentFontHeight]))
                          .filter((size) => size <= maxAllowedFontHeight || size === currentFontHeight)
                          .sort((a, b) => a - b);
                        return (
                          <ToggleGroup<number>
                            value={currentFontHeight}
                            columns={Math.min(7, sizes.length)}
                            onChange={(size) => setZoneField("fontHeight", size)}
                            options={sizes.map((size) => ({ value: size, label: size }))}
                          />
                        );
                      })()}
                    </SettingRow>

                    <SettingRow label="Text Weight">
                      <ToggleGroup<FontWeight>
                        value={currentWeight as FontWeight}
                        onChange={(w) => setZoneField("fontWeight", w)}
                        options={FONT_WEIGHTS.map((w) => ({ value: w, label: w }))}
                      />
                    </SettingRow>

                    <SettingRow label="Text Alignment">
                      <ToggleGroup<Position>
                        value={currentPosition as Position}
                        onChange={(p) => setZoneField("position", p)}
                        options={[
                          { value: "Left", label: <FeatherAlignLeft className="h-3.5 w-3.5" />, tip: "Align left" },
                          { value: "Center", label: <FeatherAlignCenter className="h-3.5 w-3.5" />, tip: "Align center" },
                          { value: "Right", label: <FeatherAlignRight className="h-3.5 w-3.5" />, tip: "Align right" },
                        ]}
                      />
                    </SettingRow>

                    <SettingRow label="Scroll Direction">
                      <ToggleGroup<ScrollType>
                        value={currentScrollType as ScrollType}
                        onChange={(s) => setZoneField("scrollType", s)}
                        options={[
                          { value: "Right To Left", label: <span className="text-sm leading-none">«</span>, tip: "Scroll right to left" },
                          { value: "Fixed", label: <span className="text-sm leading-none tracking-tighter">⠿</span>, tip: "Fixed (no scrolling)" },
                          { value: "Left To Right", label: <span className="text-sm leading-none">»</span>, tip: "Scroll left to right" },
                        ]}
                      />
                    </SettingRow>

                    <SettingRow label="Scroll Speed">
                      <ToggleGroup<number>
                        value={toSpeedPreset(currentSpeed)}
                        onChange={(v) => setZoneField("scrollSpeed", v)}
                        options={SCROLL_SPEED_TOGGLES.map((s) => ({
                          ...s,
                          disabled: currentScrollType === "Fixed",
                        }))}
                      />
                    </SettingRow>

                    <SettingRow label="Change Slide Format">
                      <ToggleGroup<SimulationFormat>
                        value={currentFormat}
                        onChange={handleFormatChange}
                        options={[
                          { value: "single", label: "Single", tip: "Single line text" },
                          { value: "two", label: "Two Line", tip: "Route number + text" },
                          { value: "three", label: "Three Line", tip: "Route number + upper & lower lines" },
                        ]}
                      />
                    </SettingRow>
                  </div>

                  {/* ADVANCED RENDERING */}
                  <details className="pt-2 border-t border-neutral-border/60">
                    <summary className="text-xs font-semibold text-neutral-700 cursor-pointer select-none">
                      Advanced Rendering
                    </summary>
                    <div className="space-y-2.5 pt-2.5">
                      <SettingRow label="Vertical Align">
                        <ToggleGroup<"Top" | "Center" | "Bottom">
                          value={watchZoneField("vAlign") || "Center"}
                          onChange={(v) => setZoneField("vAlign", v)}
                          options={[
                            { value: "Top", label: "Top" },
                            { value: "Center", label: "Center" },
                            { value: "Bottom", label: "Bottom" },
                          ]}
                        />
                      </SettingRow>

                      <SettingRow label="Auto Fit">
                        <ToggleGroup<"off" | "on">
                          value={watchZoneField("autoFit") ? "on" : "off"}
                          onChange={(v) => setZoneField("autoFit", v === "on")}
                          options={[
                            { value: "off", label: "Off" },
                            { value: "on", label: "On", tip: "Shrink text to fit the zone width" },
                          ]}
                        />
                      </SettingRow>

                      <SettingRow label="Threshold">
                        <NumberField
                          min={0}
                          max={255}
                          placeholder="Auto (0–255)"
                          value={watchZoneField("threshold")}
                          onChange={(v) => setZoneField("threshold", v)}
                        />
                      </SettingRow>

                      <SettingRow label="Space Width">
                        <NumberField
                          min={0}
                          max={16}
                          placeholder="Auto (px)"
                          value={watchZoneField("spaceWidth")}
                          onChange={(v) => setZoneField("spaceWidth", v)}
                        />
                      </SettingRow>
                    </div>
                  </details>
                </div>
                </div>
              )}
            </div>

            {/* ------------------------------------------------------- */}
            {/* COLUMN 3: SLIDES LOOP                                   */}
            {/* ------------------------------------------------------- */}
            <div className="flex flex-col flex-1 min-w-[340px] bg-default-background overflow-hidden">
              {/* Header */}
              <div className="flex min-h-11 flex-none flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-neutral-border px-4 py-1.5 bg-sidebar-background">
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
                  <ActionTooltip
                    content={isCycling ? "Stop the automatic slide preview" : "Preview the loop: the LED board steps through each slide automatically (3.5s per slide)"}
                    side="bottom"
                  >
                    <Button
                      variant={isCycling ? "brand-primary" : "neutral-secondary"}
                      size="small"
                      className="h-7 text-xs font-medium px-2.5"
                      icon={isCycling ? <FeatherPause className="h-3 w-3" /> : <FeatherPlay className="h-3 w-3" />}
                      disabled={!isCycling && simulations.length <= 1}
                      onClick={() => setIsCycling(!isCycling)}
                    >
                      {isCycling ? "Stop Playing" : "Play Slides"}
                    </Button>
                  </ActionTooltip>

                  <SubframeCore.DropdownMenu.Root>
                    <ActionTooltip content="Add a new slide to this signboard loop" side="bottom">
                      <SubframeCore.DropdownMenu.Trigger asChild>
                        <Button
                          variant="brand-primary"
                          size="small"
                          className="h-7 text-xs font-semibold px-2.5"
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
                          onClick={() => handleAddSlide("single")}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left rounded-lg text-default-font hover:bg-neutral-100 cursor-pointer"
                        >
                          <FeatherLayers className="h-3.5 w-3.5 text-brand-primary" />
                          <span>Add Single-Line Route</span>
                        </button>
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
                          <FeatherSpeech className="h-3.5 w-3.5 text-warning-500" />
                          <span>Add Slogan / Announcement</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSlide("single", "special message")}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left rounded-lg text-default-font hover:bg-neutral-100 cursor-pointer"
                        >
                          <FeatherMic2 className="h-3.5 w-3.5 text-warning-500" />
                          <span>Add Special Message</span>
                        </button>
                      </SubframeCore.DropdownMenu.Content>
                    </SubframeCore.DropdownMenu.Portal>
                  </SubframeCore.DropdownMenu.Root>

                  {simulations.length > 0 && currentSimulation && (
                    <SubframeCore.DropdownMenu.Root>
                      <ActionTooltip content="Copy the selected slide to another signboard" side="bottom">
                        <SubframeCore.DropdownMenu.Trigger asChild>
                          <Button
                            variant="neutral-secondary"
                            size="small"
                            className="h-7 text-xs font-medium px-2.5"
                            icon={<FeatherCopy className="h-3 w-3" />}
                          >
                            Copy Slide
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
                            Copy Slide #{safeSimulationIndex + 1} To:
                          </span>
                          {BOARD_ITEMS.filter((b) => b.id !== selectedTab && b.id !== Tab.STOPS).map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => handleCopySlideToBoard(b.id)}
                              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-left rounded-lg text-default-font hover:bg-neutral-100 cursor-pointer"
                            >
                              <span className="w-4 text-center font-bold text-[11px] text-neutral-700">{b.letter}</span>
                              <span>{b.label} Signboard</span>
                            </button>
                          ))}
                        </SubframeCore.DropdownMenu.Content>
                      </SubframeCore.DropdownMenu.Portal>
                    </SubframeCore.DropdownMenu.Root>
                  )}

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
                      variant="destructive-secondary"
                      size="small"
                      className="h-7 text-xs font-medium px-2.5"
                      icon={<FeatherTrash className="h-3 w-3" />}
                      onClick={handleClearAllSlides}
                    >
                      Clear All
                    </Button>
                  </ActionTooltip>
                </div>
              </div>

              {/* Board size: one setting for the whole signboard, not per slide */}
              <div className="flex flex-none flex-wrap items-center gap-x-6 gap-y-2 border-b border-neutral-border bg-sidebar-background/60 px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                  {currentBoardItem.label} Board Size
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-800">Height</span>
                  <div className="w-28">
                    <ToggleGroup<number>
                      value={activeHeight}
                      onChange={(h) => handleHeightChange(h as (typeof HEIGHT_OPTIONS)[number])}
                      options={HEIGHT_OPTIONS.map((h) => ({ value: h, label: h, disabled: simulations.length === 0, tip: "Applies to all slides on this board" }))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-800">Width</span>
                  <div className="w-72">
                    <ToggleGroup<number>
                      value={activeWidth}
                      onChange={(w) => handleWidthChange(w as (typeof WIDTH_OPTIONS)[number])}
                      options={WIDTH_OPTIONS.map((w) => ({ value: w, label: w, disabled: simulations.length === 0, tip: "Applies to all slides on this board" }))}
                    />
                  </div>
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
                        className="h-8 text-xs font-medium px-3"
                        disabled={!selectedStop || selectedStopTypes.length === 0}
                        onClick={() => {
                          if (!selectedStop || selectedStopTypes.length === 0) return;
                          const newSims = selectedStopTypes.map((stopType) => {
                            const text = `${stopType.toUpperCase()} STOP: ${selectedStop.name.toUpperCase()}`;
                            return getDefaultStopSingleSimulation(text, "stop", stopType, selectedStop, stopLanguage, stopUpDown);
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
                    {stopStates.map((st) => {
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
                            className="rounded border-neutral-300 accent-brand-600 focus:ring-brand-primary h-3.5 w-3.5"
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
                            ? "bg-sidebar-background border-brand-primary ring-2 ring-brand-primary shadow-md"
                            : "bg-sidebar-background border-neutral-border hover:border-neutral-400 hover:shadow-sm"
                        )}
                      >
                        {/* Slide Card Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-border">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <span className={SubframeUtils.twClassNames(
                              "px-2 py-0.5 rounded font-mono font-bold text-xs",
                              isSelected ? "bg-brand-primary text-brand-primary-foreground" : "bg-neutral-200 text-default-font"
                            )}>
                              #{index + 1}
                            </span>
                            <span className="text-xs font-bold text-neutral-900 capitalize">
                              {format === "two" ? "Two Line" : format === "three" ? "Three Line" : "Single Line"}
                            </span>
                            <span className="text-xs text-neutral-600 capitalize font-medium">• {simType}</span>
                            <span className="text-xs font-mono text-neutral-600 font-medium">• {w}×{h}</span>
                            {sim.audioFileUrl && (
                              <span className="px-1.5 py-0.5 rounded bg-warning-100 border border-warning-300 text-warning-800 text-[10px] font-bold flex items-center gap-1">
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
                                variant="destructive-secondary"
                                size="small"
                                className="h-7 w-7"
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
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-warning-50 border border-warning-300 text-xs text-warning-800 font-mono">
                                <FeatherVolume2 className="h-3 w-3 text-warning-600 flex-none" />
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
                  variant="destructive-secondary"
                  size="small"
                  className="w-full h-8 text-xs font-medium"
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
                  className="w-full h-8 text-xs font-medium"
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
