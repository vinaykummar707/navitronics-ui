interface GenerateLedMatrixOptions {
    text?: string;
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
    contrastEnhanced?: boolean;
    brightnessThreshold?: number;
    invert?: boolean;
    ledRows?: number;
    matrixChars?: { dark: string; light: string };
    matrixPreview?: boolean;
    previewCanvas?: HTMLCanvasElement | null;
  }
  
  export function generateLedMatrixFromText(
    options: GenerateLedMatrixOptions
  ): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'Canvas context not available.';
    console.log('====================================');
    console.log(options);
    console.log('====================================');
  
    const {
      text,
      fontSize,
      fontWeight,
      fontFamily,
      textColor = '#000',
      backgroundColor = '#fff',
      contrastEnhanced = false,
      brightnessThreshold = 128,
      invert = false,
      ledRows,
      matrixChars = { dark: '#', light: '.' },
      matrixPreview = false,
      previewCanvas,
    } = options;
  
    // Step 1: Draw text
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const verticalPadding = fontSize * 0.5;
    const horizontalPadding = 40;
  
    canvas.width = textWidth + horizontalPadding;
    canvas.height = textHeight + verticalPadding * 2;
  
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';
  
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    ctx.fillStyle = textColor;
    ctx.fillText(text, horizontalPadding / 2, canvas.height / 2);
  
    // Step 2: Convert to LED matrix
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imgData;
  
    // Enhance contrast
    if (contrastEnhanced) {
      for (let i = 0; i < data.length; i += 4) {
        let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const factor = 2; // or use a dynamic factor
        avg = 128 + (avg - 128) * factor;
        data[i] = data[i + 1] = data[i + 2] = avg;
      }
    }
  
    // Crop bounds
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
  
    if (minX > maxX || minY > maxY) {
      return 'No text found in canvas.';
    }
  
    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;
  
    // Temporary crop canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx?.putImageData(ctx.getImageData(minX, minY, cropWidth, cropHeight), 0, 0);
  
    const aspectRatio = cropWidth / cropHeight;
    const targetWidth = Math.round(ledRows * aspectRatio * 1.2);
  
    // Final canvas
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = ledRows;
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx?.drawImage(tempCanvas, 0, 0, targetWidth, ledRows);
  
    const finalData = finalCtx!.getImageData(0, 0, targetWidth, ledRows).data;
  
    const matrix: string[] = [];
    const binaryMatrix: number[][] = [];
  
    for (let y = 0; y < ledRows; y++) {
      let row = '';
      const binaryRow = [];
      for (let x = 0; x < targetWidth; x++) {
        const i = (y * targetWidth + x) * 4;
        const brightness =
          (finalData[i] + finalData[i + 1] + finalData[i + 2]) / 3;
        const isDark = invert
          ? brightness >= brightnessThreshold
          : brightness < 255 - brightnessThreshold;
  
        row += isDark ? matrixChars.dark : matrixChars.light;
        binaryRow.push(isDark ? 1 : 0);
      }
      matrix.push(row);
      binaryMatrix.push(binaryRow);
    }
  
    // Optional matrix preview
    if (matrixPreview && previewCanvas) {
      const previewCtx = previewCanvas.getContext('2d');
      if (previewCtx) {
        previewCanvas.width = targetWidth;
        previewCanvas.height = ledRows;
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  
        for (let y = 0; y < ledRows; y++) {
          for (let x = 0; x < targetWidth; x++) {
            previewCtx.fillStyle = binaryMatrix[y][x] ? '#000' : '#fff';
            previewCtx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  
    return matrix.join('\n');
  }
  