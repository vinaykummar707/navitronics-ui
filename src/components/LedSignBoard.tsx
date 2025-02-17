import React from 'react';

interface LEDBoardBitmapProps {
	rows: number;
	columns: number;
	bitmap: string; // String representation of the LED grid (# for ON, . for OFF)
}

const LEDBoardBitmap: React.FC<LEDBoardBitmapProps> = ({
	rows,
	columns,
	bitmap,
}) => {
	// Convert the bitmap into an array of rows, ensuring fixed rows & columns
	const bitmapRows = bitmap.trim().split('\n').slice(0, rows); // Trim and limit to specified rows

	// Create a full grid with missing rows padded as empty rows
	const grid = Array.from({ length: rows }, (_, rowIndex) => {
		const row = bitmapRows[rowIndex] || ''; // Get existing row or empty if out of bounds
		return row.padEnd(columns, '.').slice(0, columns).split('');
	});

	return (
		<div
			className="grid gap-0.5 self-start bg-neutral-900 rounded-lg"
			style={{
				gridTemplateColumns: `repeat(${columns}, 6px)`,
				gridTemplateRows: `repeat(${rows}, 6px)`, // Ensure full height with empty rows
			}}
		>
			{grid.flat().map((pixel, index) => (
				<div
					key={index}
					className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
						pixel === '#' ? 'bg-amber-500' : 'bg-neutral-800'
					}`}
				/>
			))}
		</div>
	);
};

export default LEDBoardBitmap;
