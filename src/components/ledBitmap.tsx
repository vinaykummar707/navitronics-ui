import React from 'react';

const LEDBoardBitmap = ({ bitmap }: { bitmap: string }) => {
	// Convert the bitmap string into a 2D array
	const grid = bitmap
		.trim()
		.split('\n')
		.map((row) => row.split(''));

	return (
		<div
			className="grid gap-x-0.5 gap-y-0.5 p-4 bg-neutral-900 rounded-lg"
			style={{ gridTemplateColumns: `repeat(${grid[0].length}, 6px)` }}
		>
			{grid.flat().map((pixel, index) => (
				<div
					key={index}
					className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
						pixel === '#'
							? 'bg-amber-500'
							: 'bg-neutral-800'
					}`}
				/>
			))}
		</div>
	);
};

export default LEDBoardBitmap;
