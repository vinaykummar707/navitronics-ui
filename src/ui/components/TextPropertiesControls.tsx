"use client";
/*
 * Documentation:
 * ControlItem — https://app.subframe.com/11b10bc240cf/library?component=ControlItem_ebd0c198-1eb8-4dce-aa30-043753b381c2
 * Icon Button — https://app.subframe.com/11b10bc240cf/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * SelectionCard — https://app.subframe.com/11b10bc240cf/library?component=SelectionCard_cc47cbb4-bf13-4612-81cd-f7339404f925
 * SelectionCardWithText — https://app.subframe.com/11b10bc240cf/library?component=SelectionCardWithText_ddf3d814-92a8-485d-84fb-a8a0af6dd41e
 * Text Field — https://app.subframe.com/11b10bc240cf/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * TextPropertiesControls — https://app.subframe.com/11b10bc240cf/library?component=TextPropertiesControls_4706f298-d7c0-434c-a1d3-858aec786daf
 */

import React, { useState } from "react";
import {
  FeatherAlignCenter,
  FeatherAlignHCenter,
  FeatherAlignLeft,
  FeatherAlignRight,
  FeatherChevronsLeft,
  FeatherChevronsRight,
  FeatherMinus,
  FeatherPlus,
  FeatherX,
} from "@subframe/core";
import * as SubframeUtils from "../utils";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";
import { Controller, useFormContext } from "react-hook-form";
import useTabsStore from "@/store/useTabsStore";
import useSimulationStore from "@/store/useSimulationStore";
import { ControlItem } from "./ControlItem";
import { IconButton } from "./IconButton";
import AutoTextGenerator from "@/components/AutoTextGenerator";
import { Select } from "./Select";
import { AVAILABLE_LANGUAGES } from "@/constants/defaultRouteValues";
import { getBitmapHeight } from "@/utils/measurements";
import IMEInput from "@/components/IMEInput";
import { useFontHeightForLanguage } from "@/utils/getFontFileByLanguage";
import { Button } from "./Button";
import { MaterialSymbolPicker } from "./MaterialSymbolPicker";

interface TextPropertiesControlsRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  textProperty: string;
}

const TextPropertiesControlsRoot = React.forwardRef<
  HTMLDivElement,
  TextPropertiesControlsRootProps
>(({ className, textProperty, ...otherProps }, ref) => {
  const { setValue, watch, getValues, control } =
    useFormContext<DisplayConfigPostRequest>();
  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulationIndex = useSimulationStore(
    (state) => state.selectedSimulationIndex,
  );
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  if (selectedSimulationIndex < 0) {
    return null;
  }

  const pathBase = `${selectedTab}.${selectedSimulationIndex}.texts.${textProperty}`;
  const selectedSimulationPath = `${selectedTab}.${selectedSimulationIndex}`;

  const isSelected = (field: string, value: string | number) =>
    watch(`${pathBase}.${field}`) === value;
  const handleSelection = (field: string, value: string | number) =>
    setValue(`${pathBase}.${field}`, value);
  const handleIncrement = () => {
    const boardHeight = (getValues(`${selectedSimulationPath}.height`) as number) || 16;
    const isSplit = textProperty === "upperHalfText" || textProperty === "lowerHalfText";
    const maxAllowedHeight = isSplit ? Math.floor(boardHeight / 2) : boardHeight;
    const currentHeight = (getValues(`${pathBase}.fontHeight`) as number) || 16;
    if (currentHeight < maxAllowedHeight) {
      setValue(`${pathBase}.fontHeight`, currentHeight + 1);
    }
  };

  const handleDecrement = () => {
    const currentHeight = (getValues(`${pathBase}.fontHeight`) as number) || 16;
    if (currentHeight > 6) {
      setValue(`${pathBase}.fontHeight`, currentHeight - 1);
    }
  };

  const currentText = watch(`${pathBase}.text`) || "";
  const wordsList = currentText.trim().split(/\s+/).filter(Boolean);
  const wordsCount = wordsList.length;
  const maxWordIndex = Math.max(1, wordsCount > 1 ? wordsCount - 1 : 1);
  const rawWordIndex = Number(watch(`${pathBase}.iconWordIndex`)) || 1;
  const currentWordIndex = Math.min(Math.max(1, rawWordIndex), maxWordIndex);

  const getDefaultFontHeightForLanguage = useFontHeightForLanguage();

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start gap-4",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <ControlItem label="Choose Language">
        <Select
          variant="filled"
          value={watch(`${pathBase}.language`) || "en"}
          onValueChange={(value) => {
            const defaultFontHeight = getDefaultFontHeightForLanguage(value, textProperty);
            setValue(`${pathBase}.fontHeight`, defaultFontHeight);
            setValue(`${pathBase}.language`, value);
          }}
          className="w-full"
        >
          {AVAILABLE_LANGUAGES.map((lang) => (
            <Select.Item key={lang.code} value={lang.code}>
              {lang.label}
            </Select.Item>
          ))}
        </Select>
      </ControlItem>

      <ControlItem label="Text">
        <Controller
          key={`${pathBase}.text`}
          name={`${pathBase}.text`}
          control={control}
          render={({ field }) => <IMEInput langCode={watch(`${pathBase}.language`) || "en"} {...field} />}
        />
      </ControlItem>

      <ControlItem label="Symbol / Icon">
        {watch(`${pathBase}.icon`) ? (
          <div className="flex w-full flex-col gap-2 p-2.5 rounded-md border border-solid border-neutral-border bg-default-background shadow-2xs">
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-primary border border-brand-200 flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl">
                    {watch(`${pathBase}.icon`)}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className="text-body-bold font-body-bold text-default-font text-sm truncate"
                    title={watch(`${pathBase}.icon`)}
                  >
                    {watch(`${pathBase}.icon`)}
                  </span>
                  <span className="text-caption font-caption text-subtext-color text-[11px] truncate">
                    Material Symbol
                  </span>
                </div>
              </div>

              <IconButton
                variant="neutral-secondary"
                size="small"
                icon={<FeatherX />}
                title="Remove Icon"
                onClick={() => setValue(`${pathBase}.icon`, "")}
              />
            </div>

            <Button
              className="w-full justify-center"
              variant="neutral-secondary"
              size="small"
              onClick={() => setIsIconPickerOpen(true)}
            >
              Change Icon
            </Button>
          </div>
        ) : (
          <Button
            className="w-full justify-center h-8 text-xs font-medium border-dashed"
            variant="neutral-secondary"
            size="small"
            onClick={() => setIsIconPickerOpen(true)}
          >
            + Choose Icon
          </Button>
        )}
      </ControlItem>

      <MaterialSymbolPicker
        open={isIconPickerOpen}
        onOpenChange={setIsIconPickerOpen}
        selectedIcon={watch(`${pathBase}.icon`) || ""}
        onSelectIcon={(iconName) => setValue(`${pathBase}.icon`, iconName)}
      />

      {watch(`${pathBase}.icon`) && (
        <>
          <ControlItem label="Icon Placement">
            <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-neutral-100/60 border border-neutral-border w-full">
              {[
                { value: "start", label: "Start" },
                { value: "center", label: "Center" },
                { value: "end", label: "End" },
              ].map((pos) => {
                const currentPos = watch(`${pathBase}.iconPosition`) || "start";
                const active = currentPos === pos.value;
                return (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => {
                      if (pos.value === "center") {
                        const defaultIndex = Math.max(1, Math.floor(wordsCount / 2));
                        setValue(`${pathBase}.iconWordIndex`, defaultIndex);
                      } else {
                        setValue(`${pathBase}.iconWordIndex`, undefined);
                      }
                      handleSelection("iconPosition", pos.value);
                    }}
                    className={SubframeUtils.twClassNames(
                      "h-8 flex items-center justify-center rounded text-xs font-medium transition-all cursor-pointer select-none",
                      active
                        ? "bg-neutral-0 text-brand-primary font-bold shadow-xs ring-1 ring-neutral-border"
                        : "text-subtext-color hover:text-default-font hover:bg-neutral-200/50"
                    )}
                  >
                    <span>{pos.label}</span>
                  </button>
                );
              })}
            </div>
          </ControlItem>

          {watch(`${pathBase}.iconPosition`) === "center" && (
            <ControlItem label="Icon Word Index">
              <div className="flex items-center gap-1.5 w-full">
                <IconButton
                  className="h-8 w-8 flex-none"
                  variant="neutral-secondary"
                  size="small"
                  icon={<FeatherMinus className="h-3.5 w-3.5" />}
                  onClick={() => {
                    if (currentWordIndex > 1) {
                      setValue(`${pathBase}.iconWordIndex`, currentWordIndex - 1);
                    }
                  }}
                  disabled={currentWordIndex <= 1}
                />
                <div className="flex h-8 grow items-center justify-center rounded-lg border border-neutral-border bg-neutral-100/60 px-2">
                  <span className="text-xs font-medium text-default-font truncate">
                    {wordsCount > 1
                      ? `${currentWordIndex} of ${wordsCount} (${wordsList[currentWordIndex - 1] || ""})`
                      : "1 of 1"}
                  </span>
                </div>
                <IconButton
                  className="h-8 w-8 flex-none"
                  variant="neutral-secondary"
                  size="small"
                  icon={<FeatherPlus className="h-3.5 w-3.5" />}
                  onClick={() => {
                    if (currentWordIndex < maxWordIndex) {
                      setValue(`${pathBase}.iconWordIndex`, currentWordIndex + 1);
                    }
                  }}
                  disabled={currentWordIndex >= maxWordIndex}
                />
              </div>
            </ControlItem>
          )}

          <ControlItem label="Icon Spacing">
            <div className="flex items-center gap-1.5 w-full">
              <IconButton
                className="h-8 w-8 flex-none"
                variant="neutral-secondary"
                size="small"
                icon={<FeatherMinus className="h-3.5 w-3.5" />}
                onClick={() => {
                  const cur = watch(`${pathBase}.iconSpacing`) ?? 2;
                  if (cur > 0) setValue(`${pathBase}.iconSpacing`, cur - 1);
                }}
              />
              <div className="flex h-8 grow items-center justify-center rounded-lg border border-neutral-border bg-neutral-100/60 font-mono text-xs text-default-font">
                <span>{watch(`${pathBase}.iconSpacing`) ?? 2} dots</span>
              </div>
              <IconButton
                className="h-8 w-8 flex-none"
                variant="neutral-secondary"
                size="small"
                icon={<FeatherPlus className="h-3.5 w-3.5" />}
                onClick={() => {
                  const cur = watch(`${pathBase}.iconSpacing`) ?? 2;
                  if (cur < 20) setValue(`${pathBase}.iconSpacing`, cur + 1);
                }}
              />
            </div>
          </ControlItem>

          <ControlItem label="Icon Width Scale">
            <div className="flex items-center gap-1.5 w-full">
              <IconButton
                className="h-8 w-8 flex-none"
                variant="neutral-secondary"
                size="small"
                icon={<FeatherMinus className="h-3.5 w-3.5" />}
                onClick={() => {
                  const cur = Number(watch(`${pathBase}.iconWidthScale`) ?? 1.0);
                  if (cur > 0.5)
                    setValue(
                      `${pathBase}.iconWidthScale`,
                      parseFloat((cur - 0.1).toFixed(1)),
                    );
                }}
              />
              <div className="flex h-8 grow items-center justify-center rounded-lg border border-neutral-border bg-neutral-100/60 font-mono text-xs text-default-font">
                <span>{(Number(watch(`${pathBase}.iconWidthScale`) ?? 1.0)).toFixed(1)}x</span>
              </div>
              <IconButton
                className="h-8 w-8 flex-none"
                variant="neutral-secondary"
                size="small"
                icon={<FeatherPlus className="h-3.5 w-3.5" />}
                onClick={() => {
                  const cur = Number(watch(`${pathBase}.iconWidthScale`) ?? 1.0);
                  if (cur < 3.0)
                    setValue(
                      `${pathBase}.iconWidthScale`,
                      parseFloat((cur + 0.1).toFixed(1)),
                    );
                }}
              />
            </div>
          </ControlItem>
        </>
      )}

      <ControlItem label="Auto Text Generator">
        <AutoTextGenerator
          route={watch()}
          text={watch(`${pathBase}.text`)}
          targetLang={watch(`${pathBase}.language`) || "en"}
          onSelect={(value) => setValue(`${pathBase}.text`, value)}
        />
      </ControlItem>

      <ControlItem label="Text Scroll Direction">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-neutral-100/60 border border-neutral-border w-full">
          {[
            { value: "Right To Left", label: "Left", icon: <FeatherChevronsLeft className="h-3.5 w-3.5" /> },
            { value: "Fixed", label: "Static", icon: <FeatherAlignHCenter className="h-3.5 w-3.5" /> },
            { value: "Left To Right", label: "Right", icon: <FeatherChevronsRight className="h-3.5 w-3.5" /> },
          ].map((item) => {
            const active = isSelected("scrollType", item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleSelection("scrollType", item.value)}
                className={SubframeUtils.twClassNames(
                  "h-8 flex items-center justify-center gap-1.5 px-2 rounded text-xs font-medium transition-all cursor-pointer select-none",
                  active
                    ? "bg-neutral-0 text-brand-primary font-bold shadow-xs ring-1 ring-neutral-border"
                    : "text-subtext-color hover:text-default-font hover:bg-neutral-200/50"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </ControlItem>

      <ControlItem label="Text Position">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-neutral-100/60 border border-neutral-border w-full">
          {[
            { value: "Left", label: "Left", icon: <FeatherAlignLeft className="h-3.5 w-3.5" /> },
            { value: "Center", label: "Center", icon: <FeatherAlignCenter className="h-3.5 w-3.5" /> },
            { value: "Right", label: "Right", icon: <FeatherAlignRight className="h-3.5 w-3.5" /> },
          ].map((item) => {
            const active = isSelected("position", item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleSelection("position", item.value)}
                className={SubframeUtils.twClassNames(
                  "h-8 flex items-center justify-center gap-1.5 px-2 rounded text-xs font-medium transition-all cursor-pointer select-none",
                  active
                    ? "bg-neutral-0 text-brand-primary font-bold shadow-xs ring-1 ring-neutral-border"
                    : "text-subtext-color hover:text-default-font hover:bg-neutral-200/50"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </ControlItem>

      <ControlItem label="Text Weight">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-neutral-100/60 border border-neutral-border w-full">
          {[
            { value: "Regular", label: "Regular" },
            { value: "Bold", label: "Bold" },
          ].map((item) => {
            const active = isSelected("fontWeight", item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleSelection("fontWeight", item.value)}
                className={SubframeUtils.twClassNames(
                  "h-8 flex items-center justify-center rounded text-xs font-medium transition-all cursor-pointer select-none",
                  active
                    ? "bg-neutral-0 text-brand-primary font-bold shadow-xs ring-1 ring-neutral-border"
                    : "text-subtext-color hover:text-default-font hover:bg-neutral-200/50"
                )}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </ControlItem>

      <ControlItem label="Text Height">
        <div className="flex items-center gap-1.5 w-full">
          <IconButton
            className="h-8 w-8 flex-none"
            variant="neutral-secondary"
            size="small"
            icon={<FeatherMinus className="h-3.5 w-3.5" />}
            onClick={handleDecrement}
          />
          <div className="flex h-8 grow items-center justify-center rounded-lg border border-neutral-border bg-neutral-100/60 px-2 font-mono text-xs text-default-font">
            <span className="font-bold text-brand-primary mr-1">
              {watch(`${pathBase}.fontHeight`) || 16} px
            </span>
            <span className="text-[10px] text-subtext-color">
              (Bitmap: {getBitmapHeight(watch(`${pathBase}.bitmap`))})
            </span>
          </div>
          <IconButton
            className="h-8 w-8 flex-none"
            variant="neutral-secondary"
            size="small"
            icon={<FeatherPlus className="h-3.5 w-3.5" />}
            onClick={handleIncrement}
          />
        </div>
      </ControlItem>

      <ControlItem label="Scroll Speed">
        <div className="flex flex-col gap-1.5 w-full">
          <div className="grid grid-cols-5 gap-1 p-1 rounded-lg bg-neutral-100/60 border border-neutral-border">
            {[
              { label: "V.Fast", speed: 1 },
              { label: "Fast", speed: 3 },
              { label: "Normal", speed: 4 },
              { label: "Slow", speed: 6 },
              { label: "V.Slow", speed: 9 },
            ].map((item) => {
              const active = isSelected("scrollSpeed", item.speed);
              return (
                <button
                  key={item.speed}
                  type="button"
                  onClick={() => handleSelection("scrollSpeed", item.speed)}
                  title={`${item.label} (Value: ${item.speed})`}
                  className={SubframeUtils.twClassNames(
                    "h-8 flex flex-col items-center justify-center rounded text-[11px] font-medium transition-all cursor-pointer select-none",
                    active
                      ? "bg-brand-500 text-neutral-0 font-bold shadow-xs ring-1 ring-brand-400"
                      : "text-subtext-color hover:text-default-font hover:bg-neutral-200/50"
                  )}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between px-1 text-[10px] text-subtext-color font-mono">
            <span>◄ Fastest (1)</span>
            <span className="text-brand-primary font-semibold">
              Current: {
                watch(`${pathBase}.scrollSpeed`) === 1 ? "Very Fast" :
                watch(`${pathBase}.scrollSpeed`) === 3 ? "Medium Fast" :
                watch(`${pathBase}.scrollSpeed`) === 4 ? "Normal" :
                watch(`${pathBase}.scrollSpeed`) === 6 ? "Slow" :
                watch(`${pathBase}.scrollSpeed`) === 9 ? "Very Slow" :
                `${watch(`${pathBase}.scrollSpeed`) || 4}`
              }
            </span>
            <span>Slowest (9) ►</span>
          </div>
        </div>
      </ControlItem>
    </div>
  );
});

export const TextPropertiesControls = TextPropertiesControlsRoot;
