import axiosInstance from '@/config/axios';
import React, { useState, useEffect, useRef } from 'react';
import EnhancedTextToLEDMatrix from './TextToLedMatrix';
import { generateLedMatrixFromText } from './canvasUtility';
import axios from 'axios';

const LEDBitmapSimulator = ({
	text,
	language,
	fontFamily,
	rows,
	cols,
	horizontalSpacing = 4, // Default horizontal spacing between LEDs
	verticalSpacing = 4, // Default vertical spacing between rows
	stopScroll,
	onBitmapTextChange,
}) => {
	const [ledSize, setLedSize] = useState(6);
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
	const [matrixChars, setMatrixChars] = useState({ dark: '#', light: '.' });

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

	useEffect(() => {
		console.log(text, language);
		const fetchBitmap = async () => {
			try {
				const response = await axios.post(
					'http://194.238.17.52:8000/api/bitmap',
					{
						text: text.text,
						fontPath:
							text.fontWeight === 'normal'
								? `./${language}.ttf`
								: `./${language}-bold.ttf`,
						targetRows: parseInt(text.fontHeight) + 1 ,
						fontWeight: text.fontWeight,
						aspectRatio: text.fontSize,
						thresshold: text.spacing,
						fontFamily: fontFamily,
						fontSize: 300,
					}
				);
				console.log(response);
				setBitmapText(response.data || '');
			} catch (error) {
				console.error('Error fetching bitmap:', error);
			}
		};

		fetchBitmap();

		console.log(text);

		// setBitmapText(
		// 	generateLedMatrixFromText({
		// 		text: text.text,
		// 		fontSize: 100,
		// 		fontWeight: text.fontWeight,
		// 		fontFamily: language,
		// 		brightnessThreshold: text.spacing,

		// 		ledRows: text.fontHeight,
		// 	})
		// );
		// }

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
	}, [
		text,
		text.text,
		language,
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
		// if(bitmapText !== undefined){
		// 		setLedMatrix(processBitmapText(generateLedMatrixFromText({
		// 			text: text.text,
		// fontSize: 100,
		// fontWeight: 'bold',
		// fontFamily: 'english',
		// brightnessThreshold: 50,
		// ledRows: 16,
		// 		})));
		// 	// }
		console.log(bitmapText);
		setLedMatrix(processBitmapText(bitmapText, scrollOffset));
		onBitmapTextChange(bitmapText);
	}, [bitmapText, rows, cols, scrollOffset]);

	// Handle scrolling logic
	useEffect(() => {
		if (isScrolling) {
			// Clear any existing interval
			if (scrollIntervalRef.current) {
				clearInterval(scrollIntervalRef.current);
			}

			// Set up new scrolling interval
			scrollIntervalRef.current = setInterval(() => {
				setScrollOffset((prev) => {
					const direction = scrollDirection === 'left' ? 1 : -1;
					let newOffset = prev + direction;

					// Get the maximum width of any line in the bitmap
					const maxWidth = Math.max(
						...bitmapText.split('\n').map((line) => line.length || 0)
					);

					// Reset offset when text has completely scrolled off screen
					// For left scrolling (text moves right to left)
					if (scrollDirection === 'left' && newOffset > maxWidth + cols) {
						return -cols; // Start with text just off the right edge
					}
					// For right scrolling (text moves left to right)
					else if (scrollDirection === 'right' && newOffset < -maxWidth) {
						return cols; // Start with text just off the left edge
					}

					return newOffset;
				});
			}, scrollSpeed);
		} else if (scrollIntervalRef.current) {
			clearInterval(scrollIntervalRef.current);
			scrollIntervalRef.current = null;
		}

		// Cleanup on unmount
		return () => {
			if (scrollIntervalRef.current) {
				clearInterval(scrollIntervalRef.current);
			}
		};
	}, [isScrolling, scrollDirection, scrollSpeed, bitmapText]);

	const toggleLed = (rowIndex, colIndex) => {
		if (isScrolling) return; // Disable editing while scrolling

		const newMatrix = [...ledMatrix];
		if (newMatrix[rowIndex] && newMatrix[rowIndex][colIndex] !== undefined) {
			newMatrix[rowIndex][colIndex] = newMatrix[rowIndex][colIndex] ? 0 : 1;
			setLedMatrix(newMatrix);

			// Update bitmap text based on the matrix
			const lines = bitmapText.split('\n');
			const updatedLines = [...lines];

			// Ensure we have enough lines
			while (updatedLines.length <= rowIndex) {
				updatedLines.push('.'.repeat(cols));
			}

			// Convert the line to an array, modify it, and convert back to string
			let lineArray = Array.from(updatedLines[rowIndex] || '.'.repeat(cols));
			while (lineArray.length <= colIndex) {
				lineArray.push('.');
			}
			lineArray[colIndex] = newMatrix[rowIndex][colIndex] ? '#' : '.';
			updatedLines[rowIndex] = lineArray.join('');

			setBitmapText(updatedLines.join('\n'));
		}
	};

	// Calculate container width based on LED size
	const containerStyle = {};

	const ledGridStyle = {
		padding: `${rowSpacing * 0}px`,
	};

	return (
		//
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
			{ledMatrix.length > 0 && (
				<div className="bg-neutral-900" style={ledGridStyle}>
					{ledMatrix.map((row, rowIndex) => (
						<div
							key={rowIndex}
							style={{
								height: `${ledSize}px`,
								lineHeight: 0,
								marginBottom: `${rowSpacing}px`, // Apply vertical spacing
							}}
						>
							{row.map((cell, colIndex) => (
								<div
									key={`${rowIndex}-${colIndex}`}
									onClick={() => toggleLed(rowIndex, colIndex)}
									className={`${
										cell ? 'bg-amber-500' : 'bg-neutral-700'
									} rounded-full`}
									style={{
										width: `${ledSize}px`,
										height: `${ledSize}px`,
										display: 'inline-block',
										margin: `0 ${ledSpacing}px 0 0`, // Apply horizontal spacing
										cursor: isScrolling ? 'default' : 'pointer',
									}}
								/>
							))}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default LEDBitmapSimulator;
