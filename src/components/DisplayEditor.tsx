import React, { useState, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import {
  ensureMin,
  ensureNumber,
  getBitmapColumns,
} from "@/utils/measurements";
import LEDBitmapSimulator from "./LedSignBoard";
import { Button } from "./ui/button";
import useTabsStore from "@/store/useTabsStore";
import { DisplayConfigPostRequest, Simulation } from "@/types/routeConfigV2";
import { useFontFileByLanguage } from "@/utils/getFontFileByLanguage";

interface DisplayEditorProps {
  listIndex: number;
  stopScroll?: boolean;
}

/**
 * Extracted LED Wrapper to prevent re-creation on every parent render
 */
const LEDWrapper = ({ 
  fieldKey, rows, cols, textConfig, isRouteNumber = false, 
  fontFamily, stopScroll, basePath, watch, setValue 
}: any) => {
  const fieldPath = `${basePath}.texts.${fieldKey}`;
  const currentBitmap = watch(`${fieldPath}.bitmap`);

  const handleBitmapChange = useCallback((text: string) => {
    if (text !== currentBitmap) {
      setValue(`${fieldPath}.bitmap`, text);
      setValue(`${fieldPath}.fontWidth`, getBitmapColumns(text));
    }
  }, [currentBitmap, fieldPath, setValue]);

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

export default function DisplayEditor({ listIndex, stopScroll }: DisplayEditorProps) {
  const language = 'en';
  const { selectedTab } = useTabsStore();
  const { watch, setValue } = useFormContext<DisplayConfigPostRequest>();
  const getFontFileByLanguage = useFontFileByLanguage();
  const [isScrollStopped, setIsScrollStopped] = useState(stopScroll);

  const basePath = `${selectedTab}[${listIndex}]`;
  const screenConfig:Simulation = watch(basePath);
  const routeData = watch("is_split_route");

  if (!screenConfig) return null;

  const commonProps = {
    stopScroll: isScrollStopped,
    basePath,
    watch,
    setValue,
  };

// ... existing code ...



// ... rest of code ...

  // Layout Logic for Multi-screen formats
  const renderMultiLayout = () => {
    const splitRoute = watch("is_split_route");
    const sideTextBitmap = watch(`${basePath}.texts.sideText.bitmap`);
    const routeBitmap1 = watch(`${basePath}.texts.routeNumber1.bitmap`);
    const routeBitmap2 = watch(`${basePath}.texts.routeNumber2.bitmap`);

    const routePosition = !splitRoute 
      ? watch(`${basePath}.texts.sideText.position`) 
      : watch(`${basePath}.texts.routeNumber1.position`);

    const leftCols = ensureMin(
      splitRoute 
        ? Math.max(getBitmapColumns(routeBitmap1), getBitmapColumns(routeBitmap2)) 
        : getBitmapColumns(sideTextBitmap),
      96
    );

    const availableWidth = ensureNumber(screenConfig.width, 10) - leftCols;

    return (
      <div className={`flex ${routePosition === "Right" ? "flex-row-reverse" : "flex-row"}`}>
        {splitRoute ? (
          <div className="flex flex-col">
            {["routeNumber1", "routeNumber2"].map((key) => (
              <LEDWrapper
                key={key}
                {...commonProps}
                fieldKey={key}
                rows={(screenConfig.height || 16) / 2}
                cols={leftCols + 1}
                textConfig={screenConfig.texts?.[key]}
                isRouteNumber={true}
                fontFamily={getFontFileByLanguage(language, key, screenConfig.texts?.[key]?.fontHeight)}
                stopScroll={stopScroll}
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
            fontFamily={getFontFileByLanguage(language, "sideText", screenConfig.texts?.sideText?.fontHeight)}
            stopScroll={stopScroll}
          />
        )}

        {screenConfig.format === "two" ? (
          <LEDWrapper
            {...commonProps}
            fieldKey="text"
            rows={screenConfig.height || 16}
            cols={ensureMin(availableWidth, 96)}
            textConfig={screenConfig.texts?.text}
            fontFamily={getFontFileByLanguage(language, "text", screenConfig.texts?.text?.fontHeight)}
            stopScroll={stopScroll}
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
                fontFamily={getFontFileByLanguage(language, key, screenConfig.texts?.[key]?.fontHeight)}
                stopScroll={stopScroll}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col  items-start gap-4">
        {screenConfig.format === "single" ? (
          <LEDWrapper
            {...commonProps}
            fieldKey="text"
            rows={screenConfig.height || 16}
            cols={ensureNumber(screenConfig.width, 96)}
            textConfig={screenConfig.texts?.text}
          fontFamily={getFontFileByLanguage(language, "text", screenConfig.texts?.text?.fontHeight)}
          stopScroll={stopScroll}
          />
        ) : (
          renderMultiLayout()
        )}
      </div>
  );
}
