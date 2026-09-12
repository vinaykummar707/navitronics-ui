import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import useTabsStore, { Tab } from "@/store/useTabsStore";
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_SCREEN_HEIGHTS,
  DEFAULT_SCREEN_WIDTHS,
  FontWeights,
  getDefaultScreen,
  getDefaultTextsForFormat,
  Positions,
  SCROLL_SPEED_PRESETS,
  ScreenFormats,
  ScrollTypes,
  type DisplayConfig,
  type Screen,
  type ScreenFormat,
  type ScreenHeight,
  type ScreenWidth,
} from "@/types/v1RouteTypes";
import { Accordion } from "@/ui/components/Accordion";
import { Select } from "@/ui/components/Select";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import IMEInput from "@/components/IMEInput";
import AutoTextGenerator from "@/components/AutoTextGenerator";
import { getTextItemsForFormat } from "./getTextItemsForFormat";
import { getBitmapHeight } from "@/utils/measurements";
import { toast } from "react-toastify";
import {
  FeatherCopy,
  FeatherPlus,
  FeatherX,
  FeatherType,
  FeatherCheck,
} from "@subframe/core";

const BOARD_SIDES = [Tab.FRONT, Tab.SIDE, Tab.REAR, Tab.INTERNAL] as const;
type BoardSide = typeof BOARD_SIDES[number];

// ============================================================================
// SUBCOMPONENT: Copy All To Other Boards (Across All Languages)
// ============================================================================
const CopyAllSection: React.FC<{
  selectedTab: BoardSide;
  activeLanguages: string[];
}> = ({ selectedTab, activeLanguages }) => {
  const { getValues, setValue } = useFormContext<DisplayConfig>();
  const [selectedBoards, setSelectedBoards] = useState<BoardSide[]>([]);

  const availableTargets = BOARD_SIDES.filter((side) => side !== selectedTab);

  const toggleBoard = (board: BoardSide) => {
    setSelectedBoards((prev) =>
      prev.includes(board) ? prev.filter((b) => b !== board) : [...prev, board]
    );
  };

  const handleCopyToAllLanguages = () => {
    if (selectedBoards.length === 0) return;
    const allConfigs = getValues("displayConfig") || {};

    let copiedCount = 0;
    Object.keys(allConfigs).forEach((langCode) => {
      const langBoards = allConfigs[langCode];
      if (langBoards && langBoards[selectedTab]) {
        const fromData = langBoards[selectedTab];
        selectedBoards.forEach((target) => {
          setValue(
            `displayConfig.${langCode}.${target}` as any,
            JSON.parse(JSON.stringify(fromData)),
            { shouldDirty: true }
          );
        });
        copiedCount++;
      }
    });

    toast.success(
      `Simulation properties copied to ${selectedBoards.length} board(s) across ${copiedCount} language(s).`
    );
    setSelectedBoards([]);
  };

  return (
    <div className="border-b border-neutral-border p-3 flex flex-col gap-2.5 bg-neutral-50/50">
      <div className="flex items-center justify-between">
        <span className="text-caption-bold font-caption-bold text-default-font">
          Copy All To Other Board(s)
        </span>
        <span className="text-[11px] text-subtext-color">
          (All {activeLanguages.length} Langs)
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Target Board Badges / Selectors */}
        <div className="flex flex-wrap gap-1.5">
          {availableTargets.map((board) => {
            const isSelected = selectedBoards.includes(board);
            return (
              <button
                key={board}
                type="button"
                onClick={() => toggleBoard(board)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-caption font-caption transition-colors border cursor-pointer ${
                  isSelected
                    ? "bg-brand-50 border-brand-500 text-brand-800 font-semibold"
                    : "bg-default-background border-neutral-border text-subtext-color hover:bg-neutral-100"
                }`}
              >
                {isSelected ? (
                  <FeatherCheck className="h-3 w-3 text-brand-600" />
                ) : (
                  <FeatherPlus className="h-3 w-3 opacity-60" />
                )}
                {board.charAt(0).toUpperCase() + board.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Selected Badges with X */}
        {selectedBoards.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {selectedBoards.map((board) => (
              <span
                key={board}
                className="inline-flex items-center gap-1 rounded bg-brand-100/70 px-2 py-0.5 text-[11px] font-medium text-brand-800 border border-brand-200"
              >
                {board.charAt(0).toUpperCase() + board.slice(1)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBoard(board);
                  }}
                  className="hover:text-error-600 cursor-pointer ml-0.5"
                  aria-label={`Remove ${board}`}
                >
                  <FeatherX className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <Button
          size="small"
          variant="brand-primary"
          icon={<FeatherCopy />}
          disabled={selectedBoards.length === 0}
          onClick={handleCopyToAllLanguages}
        >
          {selectedBoards.length > 0
            ? `Copy to ${selectedBoards.length} Board(s)`
            : "Select target board(s)"}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// SUBCOMPONENT: Copy Single Simulation (For Current Language)
// ============================================================================
const CopySingleBoardSection: React.FC<{
  lang: string;
  current: BoardSide;
}> = ({ lang, current }) => {
  const { getValues, setValue } = useFormContext<DisplayConfig>();
  const [target, setTarget] = useState<BoardSide | "">("");

  const availableTargets = BOARD_SIDES.filter((side) => side !== current);

  const handleCopy = () => {
    if (!target) return;
    const fromData = getValues(`displayConfig.${lang}.${current}` as any);
    if (!fromData) return;

    setValue(
      `displayConfig.${lang}.${target}` as any,
      JSON.parse(JSON.stringify(fromData)),
      { shouldDirty: true }
    );
    toast.success(
      `Simulation copied to "${target.toUpperCase()}" board for ${lang.toUpperCase()}.`
    );
    setTarget("");
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-neutral-200 bg-neutral-50/50 p-2.5">
      <span className="text-caption-bold font-caption-bold text-default-font">
        Copy This Simulation
      </span>
      <div className="flex flex-col gap-1.5">
        <Select
          label="Target Board"
          value={target}
          onValueChange={(val) => setTarget(val as BoardSide)}
        >
          {availableTargets.map((side) => (
            <Select.Item key={side} value={side}>
              {side.charAt(0).toUpperCase() + side.slice(1)} Board
            </Select.Item>
          ))}
        </Select>
        <Button
          size="small"
          variant="neutral-secondary"
          icon={<FeatherCopy />}
          disabled={!target}
          onClick={handleCopy}
        >
          Copy Simulation
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const V1RightPanel: React.FC = () => {
  const { selectedTab } = useTabsStore();
  const { register, control, setValue, watch } = useFormContext<DisplayConfig>();

  const displayConfig = useWatch({
    control,
    name: "displayConfig",
  }) || {};

  const routeData = useWatch({
    control,
    name: "route",
  }) || ({} as any);

  const splitRoute = Boolean(routeData?.splitRoute);
  const activeLanguages = Object.keys(displayConfig);

  const getLanguageLabel = (code: string) => {
    return AVAILABLE_LANGUAGES.find((l) => l.code === code)?.label || code.toUpperCase();
  };

  const handleFormatChange = (lang: string, nextFormat: ScreenFormat) => {
    const formatField = `displayConfig.${lang}.${selectedTab}.format` as const;
    const textsField = `displayConfig.${lang}.${selectedTab}.texts` as const;

    setValue(formatField as any, nextFormat, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue(textsField as any, getDefaultTextsForFormat(nextFormat, splitRoute), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if (activeLanguages.length === 0) {
    return (
      <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-solid border-neutral-border bg-default-background p-4">
        <div className="text-center text-subtext-color py-8">
          <span className="text-body font-body">No languages selected.</span>
          <p className="text-caption text-subtext-color mt-1">
            Please choose languages from the Left Panel to configure boards.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-solid border-neutral-border bg-default-background">
      {/* Header */}
      <div className="border-b border-neutral-border px-4 py-3 bg-neutral-50 flex-none flex items-center justify-between">
        <span className="text-body-bold font-body-bold text-default-font uppercase">
          {selectedTab} Board Settings
        </span>
      </div>

      {/* Copy Board Properties Section Across All Languages */}
      <CopyAllSection
        selectedTab={selectedTab as BoardSide}
        activeLanguages={activeLanguages}
      />

      {/* Languages List / Settings */}
      <div className="flex flex-col overflow-y-auto">
        {activeLanguages.map((langCode) => {
          const basePath = `displayConfig.${langCode}.${selectedTab}`;
          const screenConfig = watch(basePath as any) as Screen | undefined;

          // If this board has not been added for this language yet
          if (!screenConfig) {
            return (
              <div
                key={langCode}
                className="flex flex-col gap-2.5 border-b border-neutral-border p-4 bg-neutral-50/30"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-caption-bold font-caption-bold text-neutral-700 uppercase text-[10px]">
                    {langCode}
                  </span>
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    {getLanguageLabel(langCode)} ({selectedTab.toUpperCase()})
                  </span>
                </div>
                <Button
                  size="small"
                  variant="neutral-secondary"
                  icon={<FeatherPlus />}
                  onClick={() => {
                    setValue(
                      basePath as any,
                      getDefaultScreen("single"),
                      { shouldDirty: true, shouldValidate: true }
                    );
                  }}
                >
                  Add {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Config
                </Button>
              </div>
            );
          }

          const currentFormat: ScreenFormat = screenConfig.format || "single";
          const currentHeight: ScreenHeight = screenConfig.height || 16;
          const currentWidth: ScreenWidth = screenConfig.width || 96;

          // Filter format options: English gets single, two, three; others get single, two
          const filteredFormats =
            langCode === "en"
              ? ScreenFormats
              : ScreenFormats.filter((fmt) => fmt === "single" || fmt === "two");

          const textItems = getTextItemsForFormat(
            currentFormat,
            langCode,
            selectedTab,
            splitRoute
          );

          return (
            <Accordion key={langCode} defaultOpen={true}>
              <Accordion.Trigger>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-caption-bold font-caption-bold text-brand-700 uppercase text-[10px]">
                    {langCode}
                  </span>
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    {getLanguageLabel(langCode)} Configuration
                  </span>
                </div>
              </Accordion.Trigger>

              <Accordion.Content>
                <div className="flex flex-col gap-4 px-3 pb-4 pt-1">
                  {/* Screen Dimensions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      label="Height"
                      value={String(currentHeight)}
                      onValueChange={(val) =>
                        setValue(
                          `${basePath}.height` as any,
                          Number(val) as ScreenHeight,
                          { shouldDirty: true, shouldValidate: true }
                        )
                      }
                    >
                      {DEFAULT_SCREEN_HEIGHTS.map((h) => (
                        <Select.Item key={h} value={String(h)}>
                          {h} px
                        </Select.Item>
                      ))}
                    </Select>

                    <Select
                      label="Width"
                      value={String(currentWidth)}
                      onValueChange={(val) =>
                        setValue(
                          `${basePath}.width` as any,
                          Number(val) as ScreenWidth,
                          { shouldDirty: true, shouldValidate: true }
                        )
                      }
                    >
                      {DEFAULT_SCREEN_WIDTHS.map((w) => (
                        <Select.Item key={w} value={String(w)}>
                          {w} px
                        </Select.Item>
                      ))}
                    </Select>
                  </div>

                  {/* Format Selector */}
                  <Select
                    label="Choose Simulation Format"
                    value={currentFormat}
                    onValueChange={(val) =>
                      handleFormatChange(langCode, val as ScreenFormat)
                    }
                  >
                    {filteredFormats.map((fmt) => (
                      <Select.Item key={fmt} value={fmt}>
                        {fmt.charAt(0).toUpperCase() + fmt.slice(1)} Screen
                      </Select.Item>
                    ))}
                  </Select>

                  {/* Copy Controls for this simulation */}
                  <CopySingleBoardSection
                    lang={langCode}
                    current={selectedTab as BoardSide}
                  />

                  {/* Text Properties Section */}
                  <div className="flex flex-col gap-3 pt-2">
                    <span className="text-caption-bold font-caption-bold text-default-font border-t border-neutral-border pt-2">
                      Text Properties
                    </span>

                    {textItems.map(({ label, name: fieldPrefix }) => {
                      const fieldParts = fieldPrefix.split(".");
                      const fieldKey = fieldParts[fieldParts.length - 1];
                      const isRouteNumberField =
                        (fieldKey === "sideText" ||
                          fieldKey === "routeNumber1" ||
                          fieldKey === "routeNumber2") &&
                        (currentFormat === "two" || currentFormat === "three");

                      const currentText =
                        watch(`${fieldPrefix}.text` as any) || "";
                      const currentScrollSpeed =
                        watch(`${fieldPrefix}.scrollSpeed` as any) ?? 1;
                      const currentScrollType =
                        watch(`${fieldPrefix}.scrollType` as any) || "Fixed";
                      const currentPosition =
                        isRouteNumberField && watch(`${fieldPrefix}.position` as any) === "Center"
                          ? "Left"
                          : watch(`${fieldPrefix}.position` as any) || "Left";
                      const currentFontWeight =
                        watch(`${fieldPrefix}.fontWeight` as any) || "Regular";
                      const currentBitmap =
                        watch(`${fieldPrefix}.bitmap` as any) || "";

                      const allowedPositions = isRouteNumberField
                        ? Positions.filter((p) => p !== "Center")
                        : Positions;

                      return (
                        <Accordion key={fieldPrefix} defaultOpen={true}>
                          <Accordion.Trigger>
                            <div className="flex items-center gap-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-50 text-indigo-700">
                                <FeatherType className="h-3 w-3" />
                              </div>
                              <span className="text-caption-bold font-caption-bold text-default-font">
                                {label}
                              </span>
                            </div>
                          </Accordion.Trigger>

                          <Accordion.Content>
                            <div className="flex flex-col gap-3 rounded-md border border-neutral-200 bg-neutral-50/50 p-2.5">
                              {/* Text input with IME & AutoText */}
                              <div className="flex flex-col gap-1.5">
                                <span className="text-caption font-caption text-subtext-color">
                                  Text
                                </span>
                                <IMEInput
                                  langCode={langCode}
                                  value={currentText}
                                  onChange={(val) =>
                                    setValue(
                                      `${fieldPrefix}.text` as any,
                                      val?.target?.value !== undefined ? val.target.value : val,
                                      { shouldDirty: true, shouldValidate: true }
                                    )
                                  }
                                />
                                <AutoTextGenerator
                                  route={routeData}
                                  targetLang={langCode}
                                  isRouteNumber={isRouteNumberField}
                                  fieldKey={fieldKey}
                                  onSelect={(val) =>
                                    setValue(`${fieldPrefix}.text` as any, val, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    })
                                  }
                                />
                              </div>

                              {/* Font Height & Bitmap Height Indicator */}
                              <div className="flex flex-col gap-1">
                                <TextField label="Font Height">
                                  <TextField.Input
                                    type="number"
                                    placeholder="12"
                                    {...register(`${fieldPrefix}.fontHeight` as any, {
                                      valueAsNumber: true,
                                    })}
                                  />
                                </TextField>
                                <span className="text-[11px] font-caption text-subtext-color">
                                  Bitmap Height: {getBitmapHeight(currentBitmap)}
                                </span>
                              </div>

                              {/* Scroll Speed & Scroll Type: Hidden for Route Number fields */}
                              {!isRouteNumberField && (
                                <div className="grid grid-cols-2 gap-2">
                                  <Select
                                    label="Scroll Speed"
                                    value={String(currentScrollSpeed)}
                                    onValueChange={(val) =>
                                      setValue(
                                        `${fieldPrefix}.scrollSpeed` as any,
                                        Number(val),
                                        { shouldDirty: true }
                                      )
                                    }
                                  >
                                    {SCROLL_SPEED_PRESETS.map((p) => (
                                      <Select.Item key={p.value} value={String(p.value)}>
                                        {p.label}
                                      </Select.Item>
                                    ))}
                                  </Select>

                                  <Select
                                    label="Scroll Type"
                                    value={currentScrollType}
                                    onValueChange={(val) =>
                                      setValue(
                                        `${fieldPrefix}.scrollType` as any,
                                        val as any,
                                        { shouldDirty: true }
                                      )
                                    }
                                  >
                                    {ScrollTypes.map((st) => (
                                      <Select.Item key={st} value={st}>
                                        {st}
                                      </Select.Item>
                                    ))}
                                  </Select>
                                </div>
                              )}

                              {/* Controls row 2: Position & Font Weight */}
                              <div className="grid grid-cols-2 gap-2">
                                <Select
                                  label="Position"
                                  value={currentPosition}
                                  onValueChange={(val) =>
                                    setValue(
                                      `${fieldPrefix}.position` as any,
                                      val as any,
                                      { shouldDirty: true }
                                    )
                                  }
                                >
                                  {allowedPositions.map((pos) => (
                                    <Select.Item key={pos} value={pos}>
                                      {pos}
                                    </Select.Item>
                                  ))}
                                </Select>

                                <Select
                                  label="Weight"
                                  value={currentFontWeight}
                                  onValueChange={(val) =>
                                    setValue(
                                      `${fieldPrefix}.fontWeight` as any,
                                      val as any,
                                      { shouldDirty: true }
                                    )
                                  }
                                >
                                  {FontWeights.map((fw) => (
                                    <Select.Item key={fw} value={fw}>
                                      {fw}
                                    </Select.Item>
                                  ))}
                                </Select>
                              </div>
                            </div>
                          </Accordion.Content>
                        </Accordion>
                      );
                    })}
                  </div>
                </div>
              </Accordion.Content>
            </Accordion>
          );
        })}
      </div>
    </aside>
  );
};
