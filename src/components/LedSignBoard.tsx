import axiosInstance from "@/config/axios";
import React, { useState, useEffect, useRef } from "react";
import EnhancedTextToLEDMatrix from "./TextToLedMatrix";
import { generateLedMatrixFromText } from "./canvasUtility";
import LEDBusBoard from "./FullScreenBoard";
import LedCanvas from "./FullScreenBoard";
import LEDMatrix from "./CanvasText";
import axios from "axios";

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
}) => {
  const [ledSize, setLedSize] = useState(4);
  const [ledSpacing, setLedSpacing] = useState(horizontalSpacing);
  const [rowSpacing, setRowSpacing] = useState(verticalSpacing);
  const [bitmapText, setBitmapText] = useState("");
  const [ledMatrix, setLedMatrix] = useState([]);
  const [ledColor, setLedColor] = useState("#ff0000");
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

  const addPaddingPropertiesInUrl = () => {
    if (!isRouteNumber) {
      return `https://bitmap.navitronix.in/api/bitmap?text=${
        text.text ? text.text : " "
      }&height=${text.fontHeight}&weight=${
        text.fontWeight === "bold" ? "Bold" : "Regular"
      }&family=${fontFamily}`;
    } 
    return `https://bitmap.navitronix.in/api/bitmap?text=${
      text.text ? text.text : " "
    }&height=${text.fontHeight}&weight=${
      text.fontWeight === "bold" ? "Bold" : "Regular"
    }&family=${fontFamily}&padding=true&pleft=${text.position === "Left" ? 1 : 2}&pright=${
      text.position === "Right" ? 1 : 2
    }`;
  };

  useEffect(() => {
    console.log(text);
    setBitmapText("");

    const fetchBitmap = async () => {
      try {
        // Use the function to get the URL with padding properties if needed
        const url = addPaddingPropertiesInUrl();
        console.log("Fetching bitmap from URL:", url);
        const response = await axios.get(
          url
        );
        console.log(response);
        const lines = response.data.trim().split("\n");
        // if(lines.length <= 16) {
        setBitmapText(response.data || "");
        // }
      } catch (error) {
        setBitmapText("");
        console.error("Error fetching bitmap:", error);
      }
    };

    fetchBitmap();

    if (text.scrollType === "Left To Right") {
      setIsScrolling(true);
      setScrollDirection("right");
    }
    if (text.scrollType === "Right To Left") {
      setIsScrolling(true);
      setScrollDirection("left");
    }
    if (text.scrollType === "Fixed") {
      setIsScrolling(false);
      setScrollOffset(0);
    }
    setScrollSpeed(text.scrollSpeed);
    if (text.scrollType !== "Fixed") {
      setIsScrolling(stopScroll);
    }

    if (text.fontSize <= 0) {
      setWidthAspect(0.8);
    } else {
      setWidthAspect(text.fontSize);
    }
  }, [
    text,
    text.text,
    text.scrollType,
    text.position,
    text.scrollSpeed,
    text.fontSize,
    text.fontWeight,
    text.fontHeight,
    text.fontfile,
    text.x_offset,
    text.y_offset,
    text.spacing,
    stopScroll,
  ]);

  useEffect(() => {
    console.log("Bitmap Text Updated:", bitmapText);
    setLedMatrix(processBitmapText(bitmapText, scrollOffset));
  }, [bitmapText]);

  const convertScrollTypeToMarqueeDirection = (scrollType) => {
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
  };

  const convertPositionToAlignment = (position) => {
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
  };

  function convertAsciiToArray(ascii: string): string[] {
    return ascii
      .split("\n") // Split into lines
      .map((line) => line.trim()) // Optionally trim whitespace
      .filter((line) => line.length > 0); // Remove empty lines
  }

  useEffect(() => {
    console.log(bitmapText);
    onBitmapTextChange(bitmapText);
  }, [bitmapText]);

  return (
    <div className="flex flex-col ">
      {text.text && (
        <canvas
          ref={canvasRef}
          className="border border-gray-300 mb-4 hidden"
        ></canvas>
      )}
      {/* <pre className="bg-gray-900 text-amber-400 p-2 rounded overflow-auto font-mono text-sm whitespace-pre">
				{bitmapText}
			</pre> */}
      <LEDMatrix
        rows={rows}
        columns={cols}
        pattern={convertAsciiToArray(bitmapText)}
        marqueeDirection={convertScrollTypeToMarqueeDirection(text.scrollType)}
        scrollSpeed={parseInt(text.scrollSpeed)}
        alignment={convertPositionToAlignment(text.position)}
        paused={stopScroll}
      />
    </div>
  );
};

export default LEDBitmapSimulator;
