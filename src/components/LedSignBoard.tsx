import axiosInstance from "@/config/axios";
import React, { useState, useEffect, useRef, useMemo } from "react";
import EnhancedTextToLEDMatrix from "./TextToLedMatrix";
import { generateLedMatrixFromText } from "./canvasUtility";
import LEDBusBoard from "./FullScreenBoard";
import LedCanvas from "./FullScreenBoard";
import LEDMatrix from "./CanvasText";
import axios from "axios";

import { buildBitmapApiUrl, buildZoneBitmapParams } from "@/services/bitmapService";

const bitmapMemoryCache = new Map<string, string>();

function convertAsciiToArray(ascii?: string): string[] {
  if (!ascii || typeof ascii !== "string") return [];
  return ascii
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function convertScrollTypeToMarqueeDirection(scrollType: any) {
  switch (scrollType) {
    case "Left To Right":
      return "ltr";
    case "Right To Left":
      return "rtl";
    case "Fixed":
      return "none";
    default:
      return "none";
  }
}

function convertPositionToAlignment(position: any) {
  switch (position) {
    case "Left":
      return "start";
    case "Right":
      return "end";
    case "Center":
      return "center";
    default:
      return "center";
  }
}

const LEDBitmapSimulator = ({
  text,
  rows,
  fontFamily,
  cols,
  horizontalSpacing = 9, // Default horizontal spacing between LEDs
  verticalSpacing = 9, // Default vertical spacing between rows
  stopScroll,
  onBitmapTextChange,
  isRouteNumber = false, // Flag to indicate if this is a route number display
  ledColor = "#ffbf00",
}: any) => {
  const safeText = text || {
    text: "",
    fontHeight: 12,
    fontWeight: "Regular",
    scrollType: "Fixed",
    position: "Center",
    scrollSpeed: 1,
    fontSize: 12,
  };

  const [ledSize, setLedSize] = useState(4);
  const [ledSpacing, setLedSpacing] = useState(horizontalSpacing);
  const [rowSpacing, setRowSpacing] = useState(verticalSpacing);
  const [bitmapText, setBitmapText] = useState(safeText?.bitmap || "");
  const [ledMatrix, setLedMatrix] = useState([]);
  const [bgColor, setBgColor] = useState("#000000");
  const [viewportWidth, setViewportWidth] = useState(800);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("left");
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollIntervalRef = useRef(null);
  const [invert, setInvert] = useState(false);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [ledColumns, setLedColumns] = useState(0); // Auto-calculated
  const [widthAspect, setWidthAspect] = useState(1.4); // Auto-calculated
  const [matrixChars, setMatrixChars] = useState({ dark: "#", light: "." });

  // Update spacing when props change
  useEffect(() => {
    setLedSpacing(horizontalSpacing);
  }, [horizontalSpacing]);

  useEffect(() => {
    setRowSpacing(verticalSpacing);
  }, [verticalSpacing]);

  useEffect(() => {
    setViewportWidth(
      Math.min(window.innerWidth - 40, cols * (ledSize + ledSpacing))
    );
  }, [cols, ledSize, ledSpacing]);

  // Process bitmap text into matrix with scrolling support
  const processBitmapText = (text, offset = 0) => {
    if (!text)
      return Array(rows)
        .fill()
        .map(() => Array(cols).fill(0));

    const lines = text.split("\n").filter((line) => line.length > 0);
    const matrix = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      const line = lines[i] || "";

      // Skip if line is empty
      if (line.length === 0) {
        matrix.push(Array(cols).fill(0));
        continue;
      }

      // For each column in the display
      for (let j = 0; j < cols; j++) {
        // Calculate the position in the bitmap text with offset
        const textPos = j + offset;

        // Check if the position is within the bitmap text length
        if (textPos >= 0 && textPos < line.length) {
          row.push(line[textPos] === "#" ? 1 : 0);
        } else {
          // Outside of text bounds, so show empty LED
          row.push(0);
        }
      }

      matrix.push(row);
    }

    return matrix;
  };

  const getApiUrl = () =>
    buildBitmapApiUrl(buildZoneBitmapParams(safeText, { rows, fontFamily, isRouteNumber }));

  const apiUrl = getApiUrl();
  // Cleared text must blank the board instead of keeping the last fetched bitmap on screen.
  const isBlankText = !String(safeText?.text ?? "").trim() && !safeText?.icon;
  // A persisted bitmap is only valid for the render params it was loaded with; any edit must regenerate it.
  const mountApiUrlRef = useRef(apiUrl);
  const storedBitmap =
    !isBlankText && apiUrl === mountApiUrlRef.current && safeText?.bitmap && safeText.bitmap.trim().length > 0
      ? safeText.bitmap
      : "";
  const currentBitmapText = isBlankText
    ? ""
    : storedBitmap || bitmapMemoryCache.get(apiUrl) || bitmapText;

  const pattern = useMemo(() => {
    return convertAsciiToArray(currentBitmapText);
  }, [currentBitmapText]);

  useEffect(() => {
    const controller = new AbortController();

    if (storedBitmap) {
      bitmapMemoryCache.set(apiUrl, storedBitmap);
    }

    if (currentBitmapText && currentBitmapText !== bitmapText) {
      setBitmapText(currentBitmapText);
    }
    if (isBlankText && bitmapText) {
      setBitmapText("");
    }

    const fetchBitmap = async () => {
      try {
        const response = await axios.get(apiUrl, { signal: controller.signal });
        if (response.data) {
          bitmapMemoryCache.set(apiUrl, response.data);
          if (response.data !== currentBitmapText) {
            setBitmapText(response.data);
          }
        }
      } catch (error: any) {
        if (axios.isCancel(error) || error?.name === "CanceledError" || error?.name === "AbortError") {
          return;
        }
      }
    };

    // If we don't have bitmap yet, fetch it with a snappy debounce for typing
    if (!isBlankText && !storedBitmap && !bitmapMemoryCache.has(apiUrl)) {
      const timer = setTimeout(() => {
        fetchBitmap();
      }, 50);
      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    }

    if (safeText?.scrollType === "Left To Right") {
      setIsScrolling(true);
      setScrollDirection("right");
    }
    if (safeText?.scrollType === "Right To Left") {
      setIsScrolling(true);
      setScrollDirection("left");
    }
    if (safeText?.scrollType === "Fixed") {
      setIsScrolling(false);
      setScrollOffset(0);
    }
    setScrollSpeed(safeText?.scrollSpeed || 1);
    if (safeText?.scrollType !== "Fixed") {
      setIsScrolling(stopScroll);
    }

    if (!safeText?.fontSize || safeText.fontSize <= 0) {
      setWidthAspect(0.8);
    } else {
      setWidthAspect(safeText.fontSize);
    }

    return () => {
      controller.abort();
    };
  }, [
    apiUrl,
    safeText?.bitmap,
    safeText?.scrollType,
    safeText?.position,
    safeText?.scrollSpeed,
    safeText?.fontSize,
    safeText?.fontWeight,
    safeText?.fontHeight,
    stopScroll,
  ]);


  useEffect(() => {
    if (!onBitmapTextChange) return;
    if (isBlankText) {
      if (safeText?.bitmap) onBitmapTextChange("");
      return;
    }
    if (currentBitmapText && currentBitmapText !== safeText?.bitmap) {
      onBitmapTextChange(currentBitmapText);
    }
  }, [currentBitmapText, safeText?.bitmap, onBitmapTextChange, isBlankText]);

  return (
    <div className="flex flex-col ">
      {safeText.text && (
        <canvas
          ref={canvasRef}
          className="border border-gray-300 mb-4 hidden"
        ></canvas>
      )}
      <LEDMatrix
        rows={rows}
        columns={cols}
        pattern={pattern}
        marqueeDirection={convertScrollTypeToMarqueeDirection(safeText.scrollType)}
        scrollSpeed={parseInt(String(safeText.scrollSpeed || 1), 10)}
        alignment={convertPositionToAlignment(safeText.position)}
        paused={stopScroll}
        onColor={ledColor}
      />
    </div>
  );
};

export default LEDBitmapSimulator;
