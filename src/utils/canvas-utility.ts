// export type ConvertToLEDMatrixOptions = {
// 	text: string;
// 	fontFamily: string;
// 	fontSize?: number;
// 	fontWeight?: string;
// 	textColor?: string;
// 	backgroundColor?: string;
// 	invert?: boolean;
// 	brightnessThreshold?: number;
// 	matrixChars?: { dark: string; light: string };
// 	ledRows?: number;
// 	setLedMatrix?: (matrix: string) => void;
// 	setLedColumns?: (columns: number) => void;
// };

// export const convertToLEDMatrix = (
// 	options: ConvertToLEDMatrixOptions
// ): string | undefined => {
// 	const {
// 		text,
// 		fontFamily,
// 		fontSize = 100,
// 		fontWeight = 'normal',
// 		textColor = '#000',
// 		backgroundColor = '#fff',
// 		invert = false,
// 		brightnessThreshold = 128, // Mid-point threshold
// 		matrixChars = { dark: '#', light: '.' },
// 		ledRows = 16,
// 		setLedMatrix,
// 		setLedColumns,
// 	} = options;

// 	// Create initial canvas
// 	const canvas = document.createElement('canvas');
// 	const ctx = canvas.getContext('2d');
// 	if (!ctx) return;

// 	ctx.imageSmoothingEnabled = false; // Disable anti-aliasing for sharper text

// 	// Set font and measure text
// 	ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
// 	ctx.textBaseline = 'alphabetic'; // Better baseline alignment
// 	const metrics = ctx.measureText(text);
// 	const textWidth = metrics.width;
// 	const textHeight =
// 		metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

// 	// Padding
// 	const verticalPadding = fontSize * 0.5;
// 	const horizontalPadding = 40;

// 	// Set canvas size
// 	canvas.width = Math.ceil(textWidth + horizontalPadding);
// 	canvas.height = Math.ceil(textHeight + verticalPadding * 2);

// 	ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
// 	ctx.textBaseline = 'alphabetic';

// 	// Draw background
// 	ctx.fillStyle = backgroundColor;
// 	ctx.fillRect(0, 0, canvas.width, canvas.height);

// 	// Draw text
// 	ctx.fillStyle = textColor;
// 	ctx.fillText(
// 		text,
// 		horizontalPadding / 2,
// 		verticalPadding + metrics.actualBoundingBoxAscent
// 	);

// 	// Get pixel data
// 	const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// 	const { data, width, height } = imgData;

// 	// Find text bounds
// 	let minX = width,
// 		maxX = 0,
// 		minY = height,
// 		maxY = 0;
// 	for (let y = 0; y < height; y++) {
// 		for (let x = 0; x < width; x++) {
// 			const i = (y * width + x) * 4;
// 			const brightness =
// 				0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]; // gamma-correct brightness
// 			const isText = invert
// 				? brightness >= brightnessThreshold
// 				: brightness < brightnessThreshold;

// 			if (isText) {
// 				minX = Math.min(minX, x);
// 				maxX = Math.max(maxX, x);
// 				minY = Math.min(minY, y);
// 				maxY = Math.max(maxY, y);
// 			}
// 		}
// 	}

// 	if (minX > maxX || minY > maxY) {
// 		setLedMatrix?.('No text found in canvas.');
// 		return;
// 	}

// 	// Add small padding during cropping
// 	const padding = 2;
// 	minX = Math.max(minX - padding, 0);
// 	minY = Math.max(minY - padding, 0);
// 	maxX = Math.min(maxX + padding, width - 1);
// 	maxY = Math.min(maxY + padding, height - 1);

// 	const cropWidth = maxX - minX + 1;
// 	const cropHeight = maxY - minY + 1;

// 	// Create cropped canvas
// 	const tempCanvas = document.createElement('canvas');
// 	tempCanvas.width = cropWidth;
// 	tempCanvas.height = cropHeight;
// 	const tempCtx = tempCanvas.getContext('2d');
// 	if (!tempCtx) return;

// 	tempCtx.imageSmoothingEnabled = false;
// 	tempCtx.putImageData(
// 		ctx.getImageData(minX, minY, cropWidth, cropHeight),
// 		0,
// 		0
// 	);

// 	// Aspect ratio and scaling
// 	const aspectRatio = cropWidth / cropHeight;
// 	const targetWidth = Math.max(1, Math.round(ledRows * aspectRatio));

// 	setLedColumns?.(targetWidth);

// 	const finalCanvas = document.createElement('canvas');
// 	finalCanvas.width = targetWidth;
// 	finalCanvas.height = ledRows;
// 	const finalCtx = finalCanvas.getContext('2d');
// 	if (!finalCtx) return;

// 	finalCtx.imageSmoothingEnabled = false;
// 	finalCtx.drawImage(tempCanvas, 0, 0, targetWidth, ledRows);

// 	// Read final pixels
// 	const finalData = finalCtx.getImageData(0, 0, targetWidth, ledRows).data;

// 	// Build LED matrix
// 	const matrix: string[] = [];
// 	for (let y = 0; y < ledRows; y++) {
// 		let row = '';
// 		for (let x = 0; x < targetWidth; x++) {
// 			const i = (y * targetWidth + x) * 4;
// 			const brightness =
// 				0.299 * finalData[i] +
// 				0.587 * finalData[i + 1] +
// 				0.114 * finalData[i + 2];
// 			const isDark = invert
// 				? brightness >= brightnessThreshold
// 				: brightness < brightnessThreshold;
// 			row += isDark ? matrixChars.dark : matrixChars.light;
// 		}
// 		matrix.push(row);
// 	}

// 	const finalMatrix = matrix.join('\n');
// 	return finalMatrix;
// };

export type ConvertToLEDMatrixOptions = {
	text: string;
	fontFamily: string;
	fontSize?: number;
	fontWeight?: string;
	textColor?: string;
	backgroundColor?: string;
	invert?: boolean;
	brightnessThreshold?: number;
	matrixChars?: { dark: string; light: string };
	ledRows?: number;
	setLedMatrix?: (matrix: string) => void;
	setLedColumns?: (columns: number) => void;
};

export const convertToLEDMatrix = (
	options: ConvertToLEDMatrixOptions
): string | undefined => {
	const {
		text,
		fontFamily,
		fontSize = 100,
		fontWeight = 'normal',
		textColor = '#000',
		backgroundColor = '#fff',
		invert = false,
		brightnessThreshold = 50,
		matrixChars = { dark: '#', light: '.' },
		ledRows=16,
		setLedMatrix,
		setLedColumns,
	} = options;

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
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

	const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const { data, width, height } = imgData;

	let minX = width,
		maxX = 0,
		minY = height,
		maxY = 0;
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
		setLedMatrix?.('No text found in canvas.');
		return;
	}

	const cropWidth = maxX - minX + 1;
	const cropHeight = maxY - minY + 1;

	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = cropWidth;
	tempCanvas.height = cropHeight;
	const tempCtx = tempCanvas.getContext('2d');
	if (!tempCtx) return;

	tempCtx.putImageData(
		ctx.getImageData(minX, minY, cropWidth, cropHeight),
		0,
		0
	);

	const aspectRatio = cropWidth / cropHeight;
	const targetWidth = Math.round(ledRows * aspectRatio * 1.2);

	setLedColumns?.(targetWidth);

	const finalCanvas = document.createElement('canvas');
	finalCanvas.width = targetWidth;
	finalCanvas.height = ledRows;
	const finalCtx = finalCanvas.getContext('2d');
	if (!finalCtx) return;

	finalCtx.drawImage(tempCanvas, 0, 0, targetWidth, ledRows);

	const finalData = finalCtx.getImageData(0, 0, targetWidth, ledRows).data;

	const matrix: string[] = [];
	for (let y = 0; y < ledRows; y++) {
		let row = '';
		for (let x = 0; x < targetWidth; x++) {
			const i = (y * targetWidth + x) * 4;
			const brightness =
				(finalData[i] + finalData[i + 1] + finalData[i + 2]) / 3;
			const isDark = invert
				? brightness >= brightnessThreshold
				: brightness < 255 - brightnessThreshold;

			row += isDark ? matrixChars.dark : matrixChars.light;
		}
		matrix.push(row);
	}

	const finalMatrix = matrix.join('\n');
	return finalMatrix;
};
