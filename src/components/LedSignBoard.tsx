import axiosInstance from '@/config/axios';
import React, { useState, useEffect, useRef } from 'react';
import EnhancedTextToLEDMatrix from './TextToLedMatrix';
import { generateLedMatrixFromText } from './canvasUtility';
import LEDBusBoard from './FullScreenBoard';
import LedCanvas from './FullScreenBoard';
import LEDMatrix from './CanvasText';
import axios from 'axios';

const LEDBitmapSimulator = ({
	text,
	rows,
	fontFamily,
	cols,
	horizontalSpacing = 9, // Default horizontal spacing between LEDs
	verticalSpacing = 9, // Default vertical spacing between rows
	stopScroll,
	onBitmapTextChange,
}) => {
	const [ledSize, setLedSize] = useState(4);
	const [ledSpacing, setLedSpacing] = useState(horizontalSpacing);
	const [rowSpacing, setRowSpacing] = useState(verticalSpacing);
	const [bitmapText, setBitmapText] = useState('');
	const [ledMatrix, setLedMatrix] = useState([]);
	const [ledColor, setLedColor] = useState('#ff0000');
	const [bgColor, setBgColor] = useState('#000000');
	const [viewportWidth, setViewportWidth] = useState(800);
	const [isScrolling, setIsScrolling] = useState(false);
	const [scrollDirection, setScrollDirection] = useState('left');
	const [scrollSpeed, setScrollSpeed] = useState(5);
	const [scrollOffset, setScrollOffset] = useState(0);
	const scrollIntervalRef = useRef(null);
	const [invert, setInvert] = useState(false);
	const canvasRef = useRef(null);
	const previewCanvasRef = useRef(null);
	const [ledColumns, setLedColumns] = useState(0); // Auto-calculated
	const [widthAspect, setWidthAspect] = useState(1.4); // Auto-calculated
	const [matrixChars, setMatrixChars] = useState({ dark: '#', light: '.' });

	// Function to draw text on canvas
	const drawTextOnCanvas = () => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		// Clear previous content
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Set font properties
		ctx.font = `${text.fontWeight} 100px ${fontFamily}`;

		// Measure text dimensions with proper height calculation
		const metrics = ctx.measureText(text.text);
		const textWidth = metrics.width;
		// Use actualBoundingBoxAscent and actualBoundingBoxDescent for accurate height
		const textHeight =
			metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

		// Add extra padding for regional languages
		const verticalPadding = 100 * 0.4; // Increased padding
		const horizontalPadding = 1;

		// Adjust canvas size to fit text
		canvas.width = textWidth + horizontalPadding;
		canvas.height = textHeight + verticalPadding * 2;

		// Need to reset font after canvas resizing
		ctx.font = `${text.fontWeight} 100px ${fontFamily}`;
		ctx.textBaseline = 'middle'; // Better vertical alignment

		// Draw background
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Draw text centered vertically
		ctx.fillStyle = '#000';
		ctx.imageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;
		ctx.webkitImageSmoothingEnabled = false;
		ctx.msImageSmoothingEnabled = false;
		ctx.fillText(text.text, horizontalPadding / 2, canvas.height / 2);
	};

	// Enhanced conversion to LED matrix
	const convertToLEDMatrix = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const { data, width, height } = imgData;

		// Step 1: Find text bounds (crop out background)
		let minX = width,
			maxX = 0,
			minY = height,
			maxY = 0;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const i = (y * width + x) * 4;
				const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

				// Detect if pixel is text or background based on threshold
				const isText = invert
					? brightness >= text.spacing
					: brightness < 255 - text.spacing;

				if (isText) {
					minX = Math.min(minX, x);
					maxX = Math.max(maxX, x);
					minY = Math.min(minY, y);
					maxY = Math.max(maxY, y);
				}
			}
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
		const targetWidth = Math.round(text.fontHeight * aspectRatio * widthAspect); // Added 20% more width
		setLedColumns(targetWidth);

		// Create final canvas with target dimensions
		const finalCanvas = document.createElement('canvas');
		finalCanvas.width = targetWidth;
		finalCanvas.height = text.fontHeight;
		const finalCtx = finalCanvas.getContext('2d');

		// Draw the resized image
		finalCtx.drawImage(tempCanvas, 0, 0, targetWidth, text.fontHeight);

		// Get pixel data from the resized image
		const finalData = finalCtx.getImageData(
			0,
			0,
			targetWidth,
			text.fontHeight
		).data;

		// Step 4: Convert to LED matrix string
		const matrix = [];
		const binaryMatrix = [];
		for (let y = 0; y < text.fontHeight; y++) {
			let row = '';
			let binaryRow = [];
			for (let x = 0; x < targetWidth; x++) {
				const i = (y * targetWidth + x) * 4;
				const brightness =
					(finalData[i] + finalData[i + 1] + finalData[i + 2]) / 3;
				const isDark = invert
					? brightness >= text.spacing
					: brightness < 255 - text.spacing;

				row += isDark ? matrixChars.dark : matrixChars.light;
				binaryRow.push(isDark ? 1 : 0);
			}
			matrix.push(row);
			binaryMatrix.push(binaryRow);
		}

		setBitmapText(matrix.join('\n'));
	};

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

		const lines = text.split('\n').filter((line) => line.length > 0);
		const matrix = [];

		for (let i = 0; i < rows; i++) {
			const row = [];
			const line = lines[i] || '';

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
					row.push(line[textPos] === '#' ? 1 : 0);
				} else {
					// Outside of text bounds, so show empty LED
					row.push(0);
				}
			}

			matrix.push(row);
		}

		return matrix;
	};

	useEffect(() => {
		const fetchBitmap = async () => {
			try {
				const response = await axios.get(
					`http://65.0.61.187:5288/api/bitmap?text=${
						text.text
					}&height=16&weight=${text.fontWeight === 'bold' ? 'Bold' : 'Regular'}`
				);

				console.log(response);
				setBitmapText(response.data || '');
			} catch (error) {
				console.error('Error fetching bitmap:', error);
			}
		};

		fetchBitmap();

		if (text.scrollType === 'Left To Right') {
			setIsScrolling(true);
			setScrollDirection('right');
		}
		if (text.scrollType === 'Right To Left') {
			setIsScrolling(true);
			setScrollDirection('left');
		}
		if (text.scrollType === 'Fixed') {
			setIsScrolling(false);
			setScrollOffset(0);
		}
		setScrollSpeed(text.scrollSpeed);
		if (text.scrollType !== 'Fixed') {
			setIsScrolling(stopScroll);
		}

		if (text.text.length > 0) {
			drawTextOnCanvas();
			convertToLEDMatrix();
		} else {
			setBitmapText('');
		}
		console.log(text.fontSize);
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
		setLedMatrix(processBitmapText(bitmapText, scrollOffset));
	}, [bitmapText]);

	const convertScrollTypeToMarqueeDirection = (scrollType) => {
		switch (scrollType) {
			case 'Left To Right':
				return 'ltr';
			case 'Right To Left':
				return 'rtl';
			case 'Fixed':
				return 'none';
			default:
				return 'none';
		}
	};

	const convertPositionToAlignment = (position) => {
		switch (position) {
			case 'Left':
				return 'start';
			case 'Right':
				return 'end';
			case 'Center':
				return 'center';
			default:
				return 'center';
		}
	};

	function convertAsciiToArray(ascii: string): string[] {
		return ascii
			.split('\n') // Split into lines
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
