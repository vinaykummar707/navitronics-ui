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
import { SelectionCard } from "./SelectionCard";
import { SelectionCardWithText } from "./SelectionCardWithText";
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
  const pathBase = `${selectedTab}.${selectedSimulationIndex}.texts.${textProperty}`;
  const selectedSimulationPath = `${selectedTab}.${selectedSimulationIndex}`;

  const isSelected = (field: string, value: string | number) =>
    watch(`${pathBase}.${field}`) === value;
  const handleSelection = (field: string, value: string | number) =>
    setValue(`${pathBase}.${field}`, value);
  const handleIncrement = () => {
    const currentBitmapHeight = getBitmapHeight(
      getValues(`${pathBase}.bitmap`),
    );
    const currentHeight = (getValues(`${pathBase}.fontHeight`) as number) || 16;
    const targetFontHeight = (getValues(`${selectedSimulationPath}.height`) as number) === 16 ? 16 : 32;
    if (currentBitmapHeight < targetFontHeight) {
      setValue(`${pathBase}.fontHeight`, currentHeight + 1);
    }
  };

  const handleDecrement = () => {
    const currentBitmapHeight = getBitmapHeight(
      getValues(`${pathBase}.bitmap`),
    );
    const currentHeight = (getValues(`${pathBase}.fontHeight`) as number) || 16;
    if (currentBitmapHeight > 6 && currentHeight > 6) {
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
            className="w-full justify-center h-10 border-dashed"
            variant="neutral-secondary"
            size="medium"
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
            <div className="flex grow shrink-0 basis-0 items-center justify-center gap-1 w-full">
              <SelectionCardWithText
                title="Start"
                onClick={() => {
                  setValue(`${pathBase}.iconWordIndex`, undefined);
                  handleSelection("iconPosition", "start");
                }}
                selected={
                  watch(`${pathBase}.iconPosition`) === "start" ||
                  !watch(`${pathBase}.iconPosition`)
                }
              />
              <SelectionCardWithText
                title="Center"
                onClick={() => {
                  const defaultIndex = Math.max(1, Math.floor(wordsCount / 2));
                  setValue(`${pathBase}.iconWordIndex`, defaultIndex);
                  handleSelection("iconPosition", "center");
                }}
                selected={watch(`${pathBase}.iconPosition`) === "center"}
              />
              <SelectionCardWithText
                title="End"
                onClick={() => {
                  setValue(`${pathBase}.iconWordIndex`, undefined);
                  handleSelection("iconPosition", "end");
                }}
                selected={watch(`${pathBase}.iconPosition`) === "end"}
              />
            </div>
          </ControlItem>

          {watch(`${pathBase}.iconPosition`) === "center" && (
            <ControlItem label="Icon Word Index">
              <div className="flex grow shrink-0 basis-0 items-center justify-end gap-1 self-stretch">
                <IconButton
                  className="h-9 w-9 flex-none"
                  variant="neutral-primary"
                  size="medium"
                  icon={<FeatherMinus />}
                  onClick={() => {
                    if (currentWordIndex > 1) {
                      setValue(`${pathBase}.iconWordIndex`, currentWordIndex - 1);
                    }
                  }}
                  disabled={currentWordIndex <= 1}
                />
                <div className="flex h-9 grow shrink-0 basis-0 flex-col items-center justify-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-2">
                  <span className="text-caption font-caption text-subtext-color truncate">
                    {wordsCount > 1
                      ? `${currentWordIndex} of ${wordsCount} (${wordsList[currentWordIndex - 1] || ""})`
                      : ""}
                  </span>
                </div>
                <IconButton
                  className="h-9 w-9 flex-none"
                  variant="neutral-primary"
                  size="medium"
                  icon={<FeatherPlus />}
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
            <div className="flex grow shrink-0 basis-0 items-center justify-end gap-1 self-stretch">
              <IconButton
                className="h-9 w-9 flex-none"
                variant="neutral-primary"
                size="medium"
                icon={<FeatherMinus />}
                onClick={() => {
                  const cur = watch(`${pathBase}.iconSpacing`) ?? 2;
                  if (cur > 0) setValue(`${pathBase}.iconSpacing`, cur - 1);
                }}
              />
              <div className="flex h-9 grow shrink-0 basis-0 flex-col items-center justify-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background">
                <span className="text-caption font-caption text-subtext-color">
                  {watch(`${pathBase}.iconSpacing`) ?? 2} dots
                </span>
              </div>
              <IconButton
                className="h-9 w-9 flex-none"
                variant="neutral-primary"
                size="medium"
                icon={<FeatherPlus />}
                onClick={() => {
                  const cur = watch(`${pathBase}.iconSpacing`) ?? 2;
                  if (cur < 20) setValue(`${pathBase}.iconSpacing`, cur + 1);
                }}
              />
            </div>
          </ControlItem>

          <ControlItem label="Icon Width Scale">
            <div className="flex grow shrink-0 basis-0 items-center justify-end gap-1 self-stretch">
              <IconButton
                className="h-9 w-9 flex-none"
                variant="neutral-primary"
                size="medium"
                icon={<FeatherMinus />}
                onClick={() => {
                  const cur = Number(watch(`${pathBase}.iconWidthScale`) ?? 1.0);
                  if (cur > 0.5)
                    setValue(
                      `${pathBase}.iconWidthScale`,
                      parseFloat((cur - 0.1).toFixed(1)),
                    );
                }}
              />
              <div className="flex h-9 grow shrink-0 basis-0 flex-col items-center justify-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background">
                <span className="text-caption font-caption text-subtext-color">
                  {(Number(watch(`${pathBase}.iconWidthScale`) ?? 1.0)).toFixed(1)}x
                </span>
              </div>
              <IconButton
                className="h-9 w-9 flex-none"
                variant="neutral-primary"
                size="medium"
                icon={<FeatherPlus />}
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
        <div className="flex grow shrink-0 basis-0 items-center justify-center gap-1.5 grid grid-cols-3 w-full">
          <SelectionCard
            icon={<FeatherChevronsLeft className="w-4 h-4" />}
            variant="icon-text-vertical"
            onClick={() => handleSelection("scrollType", "Right To Left")}
            selected={isSelected("scrollType", "Right To Left")}
          />
          <SelectionCard
            icon={<FeatherAlignHCenter className="w-4 h-4" />}
            variant="icon-text-vertical"
            onClick={() => handleSelection("scrollType", "Fixed")}
            selected={isSelected("scrollType", "Fixed")}
          />
          <SelectionCard
            icon={<FeatherChevronsRight className="w-4 h-4" />}
            variant="icon-text-vertical"
            onClick={() => handleSelection("scrollType", "Left To Right")}
            selected={isSelected("scrollType", "Left To Right")}
          />
        </div>
      </ControlItem>

      <ControlItem label="Text Position">
        <div className="flex grow shrink-0 basis-0 items-center justify-center gap-1 w-full">
          <SelectionCard
            icon={<FeatherAlignLeft />}
            text="Left"
            onClick={() => handleSelection("position", "Left")}
            selected={isSelected("position", "Left")}
          />
          <SelectionCard
            icon={<FeatherAlignCenter />}
            text="Center"
            onClick={() => handleSelection("position", "Center")}
            selected={isSelected("position", "Center")}
          />
          <SelectionCard
            icon={<FeatherAlignRight />}
            text="Right"
            onClick={() => handleSelection("position", "Right")}
            selected={isSelected("position", "Right")}
          />
        </div>
      </ControlItem>

      <ControlItem label="Text Weight">
        <div className="flex grow shrink-0 basis-0 items-center justify-center gap-1 w-full">
          <SelectionCardWithText
            title="Regular"
            onClick={() => handleSelection("fontWeight", "Regular")}
            selected={isSelected("fontWeight", "Regular")}
          />
          <SelectionCardWithText
            title="Bold"
            onClick={() => handleSelection("fontWeight", "Bold")}
            selected={isSelected("fontWeight", "Bold")}
          />
        </div>
      </ControlItem>

      <ControlItem label="Text Height">
        <div className="flex grow shrink-0 basis-0 items-center justify-end gap-1 self-stretch">
          <IconButton
            className="h-9 w-9 flex-none"
            variant="neutral-primary"
            size="medium"
            icon={<FeatherMinus />}
            onClick={handleDecrement}
          />
          <div className="flex h-9 grow shrink-0 basis-0 flex-col items-center justify-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background">
            <span className="text-caption font-caption text-subtext-color">
              {getValues(`${pathBase}.fontHeight`)} (Bitmap/
              {getBitmapHeight(getValues(`${pathBase}.bitmap`))})
            </span>
          </div>
          <IconButton
            className="h-9 w-9 flex-none"
            variant="neutral-primary"
            size="medium"
            icon={<FeatherPlus />}
            onClick={handleIncrement}
          />
        </div>
      </ControlItem>

      <ControlItem label="Scroll Speed">
        <div className="grow shrink-0 basis-0 items-center justify-center gap-1 grid grid-cols-1 w-full">
          <SelectionCardWithText
            title="Very Fast"
            onClick={() => handleSelection("scrollSpeed", 1)}
            selected={isSelected("scrollSpeed", 1)}
          />
          <SelectionCardWithText
            title="Medium Fast"
            onClick={() => handleSelection("scrollSpeed", 3)}
            selected={isSelected("scrollSpeed", 3)}
          />
          <SelectionCardWithText
            title="Normal"
            onClick={() => handleSelection("scrollSpeed", 4)}
            selected={isSelected("scrollSpeed", 4)}
          />
          <SelectionCardWithText
            title="Slow"
            onClick={() => handleSelection("scrollSpeed", 6)}
            selected={isSelected("scrollSpeed", 6)}
          />
          <SelectionCardWithText
            title="Very Slow"
            onClick={() => handleSelection("scrollSpeed", 9)}
            selected={isSelected("scrollSpeed", 9)}
          />
        </div>
      </ControlItem>
    </div>
  );
});

export const TextPropertiesControls = TextPropertiesControlsRoot;
