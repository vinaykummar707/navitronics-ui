// import React from 'react';

// interface LEDBoardBitmapProps {
// 	rows: number;
// 	columns: number;
// 	bitmap: string;
// 	scrollSpeed?: number; // Speed in seconds (lower = faster)
// }

// const LEDBoardBitmap: React.FC<LEDBoardBitmapProps> = ({
// 	rows,
// 	columns,
// 	bitmap,
// 	scrollSpeed = 10, // Default scroll speed in seconds
// }) => {
// 	const bitmapRows = bitmap.trim().split('\n');
// 	const textWidth = Math.max(...bitmapRows.map((row) => row.length)); // Find the widest row

// 	// Ensure text is centered vertically
// 	const paddingTop = Math.floor((rows - bitmapRows.length) / 2);
// 	const paddingBottom = rows - bitmapRows.length - paddingTop;

// 	// Create the full grid with empty padding above and below
// 	const fullGrid = [
// 		...Array(paddingTop).fill('.'.repeat(textWidth)), // Empty rows on top
// 		...bitmapRows.map((row) => row.padEnd(textWidth, '.')), // Text rows
// 		...Array(paddingBottom).fill('.'.repeat(textWidth)), // Empty rows on bottom
// 	].map((row) => row.split(''));

// 	// Extend text width for smooth looping
// 	const repeatedGrid = fullGrid
// 		.map((row) => row.join('') + ' '.repeat(columns))
// 		.join('\n');

// 	return (
// 		<div
// 			className="relative overflow-hidden bg-neutral-900 p-4 rounded-lg"
// 			style={{
// 				width: `${columns * 6}px`,
// 				height: `${rows * 6}px`,
// 			}}
// 		>
// 			<div
// 				className="absolute grid gap-0.5"
// 				style={{
// 					gridTemplateColumns: `repeat(${
// 						repeatedGrid.split('\n')[0].length
// 					}, 6px)`,
// 					gridTemplateRows: `repeat(${rows}, 6px)`,
// 					animation: `scrollText ${scrollSpeed}s linear infinite`,
// 					transform: 'translateX(100%)', // Start position
// 					whiteSpace: 'nowrap',
// 					display: 'grid',
// 				}}
// 			>
// 				{/* Render the LED dots */}
// 				{repeatedGrid
// 					.split('\n')
// 					.map((row) => row.split(''))
// 					.flat()
// 					.map((pixel, index) => (
// 						<div
// 							key={index}
// 							className={`w-1.5 h-1.5 rounded-full ${
// 								pixel === '#' ? 'bg-amber-500' : 'bg-neutral-800'
// 							}`}
// 						/>
// 					))}
// 			</div>

// 			{/* Tailwind animation styles */}
// 			<style>
// 				{`
// 				@keyframes scrollText {
// 					from { transform: translateX(100%); }
// 					to { transform: translateX(-100%); }
// 				}
// 				`}
// 			</style>
// 		</div>
// 	);
// };

// export default LEDBoardBitmap;
