import React, { useState, useEffect, useRef } from 'react';

export default function EnhancedTextToLEDMatrix({
  initialText = 'Enter your text here',
  initialFontSize = 100,
  initialFontWeight = 'normal',
  initialFontFamily = 'Arial',
  initialLedRows = 16,
  initialBrightnessThreshold = 50,
  onMatrixChange = null,
  availableFontsList = ['Arial', 'Verdana', 'english', 'ramabhadra', 'devanagri'],
  googleFontsList = []
}) {
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [fontWeight, setFontWeight] = useState(initialFontWeight);
  const [fontFamily, setFontFamily] = useState(initialFontFamily);
  const [availableFonts, setAvailableFonts] = useState(availableFontsList);
  const [googleFonts, setGoogleFonts] = useState(googleFontsList);
  const [loadedFonts, setLoadedFonts] = useState({});
  const [ledMatrix, setLedMatrix] = useState('');
  const [ledRows, setLedRows] = useState(initialLedRows);
  const [ledColumns, setLedColumns] = useState(0); // Auto-calculated
  const [brightnessThreshold, setBrightnessThreshold] = useState(initialBrightnessThreshold);
  const [matrixChars, setMatrixChars] = useState({ dark: '#', light: '.' });
  const [contrastEnhanced, setContrastEnhanced] = useState(false);
  const [invert, setInvert] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [matrixPreview, setMatrixPreview] = useState(true);

  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);

 

  // Function to draw text on canvas
  const drawTextOnCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear previous content
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set font properties
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    // Measure text dimensions with proper height calculation
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    
    // Add extra padding for regional languages
    const verticalPadding = fontSize * 0.5;
    const horizontalPadding = 40;

    // Adjust canvas size to fit text
    canvas.width = textWidth + horizontalPadding;
    canvas.height = textHeight + verticalPadding * 2;

    // Need to reset font after canvas resizing
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text centered vertically
    ctx.fillStyle = textColor;
    ctx.fillText(text, horizontalPadding/2, canvas.height/2);
  };

  // Enhanced conversion to LED matrix
  const convertToLEDMatrix = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imgData;

    // Apply contrast enhancement if selected
    if (contrastEnhanced) {
      enhanceContrast(data);
    }

    // Step 1: Find text bounds (crop out background)
    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const isText = invert
          ? brightness >= brightnessThreshold
          : brightness < 255 - brightnessThreshold;

        if (isText) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // Check if any text was found
    if (minX > maxX || minY > maxY) {
      setLedMatrix('No text found in canvas.');
      return;
    }

    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;

    // Step 2: Create a temporary canvas for cropping
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw the cropped region to the temporary canvas
    tempCtx.putImageData(
      ctx.getImageData(minX, minY, cropWidth, cropHeight),
      0,
      0
    );

    // Step 3: Resize to fit into ledRows
    const aspectRatio = cropWidth / cropHeight;
    const targetWidth = Math.round(ledRows * aspectRatio * 1.2);
    setLedColumns(targetWidth);

    // Create final canvas with target dimensions
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = ledRows;
    const finalCtx = finalCanvas.getContext('2d');

    // Draw the resized image
    finalCtx.drawImage(tempCanvas, 0, 0, targetWidth, ledRows);

    // Get pixel data from the resized image
    const finalData = finalCtx.getImageData(0, 0, targetWidth, ledRows).data;

    // Step 4: Convert to LED matrix string
    const matrix = [];
    const binaryMatrix = [];
    for (let y = 0; y < ledRows; y++) {
      let row = '';
      let binaryRow = [];
      for (let x = 0; x < targetWidth; x++) {
        const i = (y * targetWidth + x) * 4;
        const brightness = (finalData[i] + finalData[i + 1] + finalData[i + 2]) / 3;
        const isDark = invert
          ? brightness >= brightnessThreshold
          : brightness < 255 - brightnessThreshold;

        row += isDark ? matrixChars.dark : matrixChars.light;
        binaryRow.push(isDark ? 1 : 0);
      }
      matrix.push(row);
      binaryMatrix.push(binaryRow);
    }

    setLedMatrix(matrix.join('\n'));
    
    // Call the callback with the matrix data if provided
    if (onMatrixChange) {
      onMatrixChange({
        matrix: matrix.join('\n'),
        dimensions: {
          rows: ledRows,
          columns: targetWidth
        },
        binaryMatrix: binaryMatrix
      });
    }
  };

  // Function to enhance contrast in image data
  const enhanceContrast = (data) => {
    let min = 255;
    let max = 0;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      min = Math.min(min, brightness);
      max = Math.max(max, brightness);
    }

    const range = max - min;
    if (range === 0) return;

    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        data[i + j] = ((data[i + j] - min) / range) * 255;
      }
    }
  };

  // Update canvas when text or font properties change
  useEffect(() => {
    drawTextOnCanvas();
  }, [text, fontSize, fontWeight, fontFamily, textColor, backgroundColor]);

  // Convert to LED matrix whenever relevant properties change
  useEffect(() => {
    if (canvasRef.current) {
      convertToLEDMatrix();
    }
  }, [
    text, 
    fontSize, 
    fontWeight, 
    fontFamily, 
    ledRows, 
    brightnessThreshold
  ]);

  // Update state when props change
  useEffect(() => {
    setText(initialText);
    setFontSize(initialFontSize);
    setFontWeight(initialFontWeight);
    setFontFamily(initialFontFamily);
    setLedRows(initialLedRows);
    setBrightnessThreshold(initialBrightnessThreshold);
    setAvailableFonts(availableFontsList);
    setGoogleFonts(googleFontsList);
  }, [
    initialText,
    initialFontSize,
    initialFontWeight,
    initialFontFamily,
    initialLedRows,
    initialBrightnessThreshold,
    availableFontsList,
    googleFontsList
  ]);



  return (
    <div className="hidden">
      {/* Hidden canvas for processing */}
      <canvas
        ref={canvasRef}
        style={{ fontFamily }}
      ></canvas>
      <canvas
        ref={previewCanvasRef}
      ></canvas>
    </div>
  );
}