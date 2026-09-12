import React, { useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import useTabsStore from "@/store/useTabsStore";
import { ensureMin, ensureNumber, getBitmapColumns } from "@/utils/measurements";
import type { DisplayConfig, Screen } from "@/types/v1RouteTypes";
import LEDBitmapSimulator from "@/components/LedSignBoard";
import { useFontFileByLanguage } from "@/utils/getFontFileByLanguage";
import { Button } from "@/ui/components/Button";
import { FeatherPause, FeatherPlay } from "@subframe/core";

interface V1DisplayEditorProps {
  language: string;
}

/**
 * Extracted LED Simulator Wrapper
 */
const LEDWrapper = ({
  fieldKey,
  rows,
  cols,
  textConfig,
  isRouteNumber = false,
  fontFamily,
  stopScroll,
  basePath,
  watch,
  setValue,
}: any) => {
  const fieldPath = `${basePath}.texts.${fieldKey}`;
  const currentBitmap = watch(`${fieldPath}.bitmap`);

  const handleBitmapChange = useCallback(
    (text: string) => {
      if (text !== currentBitmap) {
        setValue(`${fieldPath}.bitmap`, text, { shouldDirty: true });
        setValue(`${fieldPath}.fontWidth`, getBitmapColumns(text), {
          shouldDirty: true,
        });
      }
    },
    [currentBitmap, fieldPath, setValue]
  );

  return (
    <LEDBitmapSimulator
      stopScroll={stopScroll}
      rows={rows}
      cols={cols}
      text={textConfig}
      isRouteNumber={isRouteNumber}
      fontFamily={fontFamily}
      onBitmapTextChange={handleBitmapChange}
    />
  );
};

export const V1DisplayEditor: React.FC<V1DisplayEditorProps> = ({ language }) => {
  const { selectedTab } = useTabsStore();
  const { watch, setValue } = useFormContext<DisplayConfig>();
  const getFontFileByLanguage = useFontFileByLanguage();
  const [isScrollStopped, setIsScrollStopped] = useState(false);

  const basePath = `displayConfig.${language}.${selectedTab}`;
  const screenConfig = watch(basePath as any) as Screen | undefined;
  const routeData = watch("route");

  if (!screenConfig) return null;

  const commonProps = {
    stopScroll: isScrollStopped,
    basePath,
    watch,
    setValue,
  };

  const renderPlaybackControls = () => (
    <div className="flex items-center gap-2">
      <Button
        size="small"
        variant={isScrollStopped ? "neutral-primary" : "destructive-secondary"}
        icon={isScrollStopped ? <FeatherPlay /> : <FeatherPause />}
        onClick={() => setIsScrollStopped(!isScrollStopped)}
      >
        {isScrollStopped ? "Play Animation" : "Pause Animation"}
      </Button>
      <span className="text-caption font-caption text-subtext-color">
        Board: {selectedTab.toUpperCase()} | Size: {screenConfig.width}x{screenConfig.height}
      </span>
    </div>
  );

  const renderMultiLayout = () => {
    const splitRoute = routeData?.splitRoute;
    const sideTextBitmap = watch(`${basePath}.texts.sideText.bitmap` as any);
    const routeBitmap1 = watch(`${basePath}.texts.routeNumber1.bitmap` as any);
    const routeBitmap2 = watch(`${basePath}.texts.routeNumber2.bitmap` as any);

    const routePosition = splitRoute
      ? screenConfig.format === "three"
        ? watch(`${basePath}.texts.routeNumber1.position` as any) ||
          watch(`${basePath}.texts.routeNumber2.position` as any)
        : watch(`${basePath}.texts.sideText.position` as any)
      : watch(`${basePath}.texts.sideText.position` as any);

    const calculatedCols = splitRoute
      ? screenConfig.format === "three"
        ? Math.max(
            getBitmapColumns(routeBitmap1),
            getBitmapColumns(routeBitmap2)
          )
        : getBitmapColumns(sideTextBitmap)
      : getBitmapColumns(sideTextBitmap);

    const leftCols = calculatedCols > 0 ? calculatedCols : 24;
    const availableWidth = ensureNumber(screenConfig.width, 96) - leftCols;

    return (
      <div
        className={`flex ${
          routePosition === "Right" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {splitRoute ? (
          screenConfig.format === "three" ? (
            <div className="flex flex-col">
              {["routeNumber1", "routeNumber2"].map((key) => (
                <LEDWrapper
                  key={key}
                  {...commonProps}
                  fieldKey={key}
                  rows={
                    screenConfig.format === "two"
                      ? screenConfig.height || 16
                      : (screenConfig.height || 16) / 2
                  }
                  cols={leftCols + 1}
                  textConfig={screenConfig.texts?.[key]}
                  isRouteNumber={true}
                  fontFamily={getFontFileByLanguage(
                    language,
                    key,
                    screenConfig.texts?.[key]?.fontHeight
                  )}
                />
              ))}
            </div>
          ) : (
            <LEDWrapper
              {...commonProps}
              fieldKey="sideText"
              rows={screenConfig.height || 16}
              cols={leftCols + 1}
              textConfig={screenConfig.texts?.sideText}
              isRouteNumber={true}
              fontFamily={getFontFileByLanguage(
                language,
                "sideText",
                screenConfig.texts?.sideText?.fontHeight
              )}
            />
          )
        ) : (
          <LEDWrapper
            {...commonProps}
            fieldKey="sideText"
            rows={screenConfig.height || 16}
            cols={leftCols + 1}
            textConfig={screenConfig.texts?.sideText}
            isRouteNumber={true}
            fontFamily={getFontFileByLanguage(
              language,
              "sideText",
              screenConfig.texts?.sideText?.fontHeight
            )}
          />
        )}

        {screenConfig.format === "two" ? (
          <LEDWrapper
            {...commonProps}
            fieldKey="text"
            rows={screenConfig.height || 16}
            cols={ensureMin(availableWidth, 96)}
            textConfig={screenConfig.texts?.text}
            fontFamily={getFontFileByLanguage(
              language,
              "text",
              screenConfig.texts?.text?.fontHeight
            )}
          />
        ) : (
          <div className="flex flex-col">
            {["upperHalfText", "lowerHalfText"].map((key) => (
              <LEDWrapper
                key={key}
                {...commonProps}
                fieldKey={key}
                rows={(screenConfig.height || 16) / 2}
                cols={ensureMin(availableWidth, 96)}
                textConfig={screenConfig.texts?.[key]}
                fontFamily={getFontFileByLanguage(
                  language,
                  key,
                  screenConfig.texts?.[key]?.fontHeight
                )}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-neutral-border bg-neutral-900 p-4 shadow-sm w-fit max-w-full overflow-x-auto">
      {renderPlaybackControls()}
      <div className="rounded border-2 border-neutral-700 bg-black p-1 shadow-inner overflow-x-auto max-w-full">
        {screenConfig.format === "single" ? (
          <LEDWrapper
            {...commonProps}
            fieldKey="text"
            rows={screenConfig.height || 16}
            cols={ensureNumber(screenConfig.width, 96)}
            textConfig={screenConfig.texts?.text}
            fontFamily={getFontFileByLanguage(
              language,
              "text",
              screenConfig.texts?.text?.fontHeight
            )}
          />
        ) : (
          renderMultiLayout()
        )}
      </div>
    </div>
  );
};
