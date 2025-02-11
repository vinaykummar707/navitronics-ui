import React, { useEffect, useState } from "react";

interface LEDScrollerProps {
	rows: number;
	columns: number;
	bitmap: string;
	scrollSpeed?: number; // Pixels per frame (lower = faster)
}

const LEDScroller: React.FC<LEDScrollerProps> = ({
													 rows,
													 columns,
													 bitmap,
													 scrollSpeed = 1, // Adjust speed as needed
												 }) => {
	const bitmapRows = bitmap.trim().split("\n");
	const textWidth = Math.max(...bitmapRows.map((row) => row.length)); // Widest row

	// Center text vertically within the grid
	const paddingTop = Math.floor((rows - bitmapRows.length) / 2);
	const paddingBottom = rows - bitmapRows.length - paddingTop;

	// Build the scrolling text grid with padding
	const textGrid = [
		...Array(paddingTop).fill(".".repeat(textWidth)),
		...bitmapRows.map((row) => row.padEnd(textWidth, ".")),
		...Array(paddingBottom).fill(".".repeat(textWidth)),
	].map((row) => row.split(""));

	// State for horizontal scroll position
	const [offset, setOffset] = useState(0);

	// Animation loop for smooth scrolling
	useEffect(() => {
		let animationFrame: number;
		const animateScroll = () => {
			setOffset((prev) => (prev + scrollSpeed) % (textWidth + columns)); // Wrap text
			animationFrame = requestAnimationFrame(animateScroll);
		};
		animationFrame = requestAnimationFrame(animateScroll);
		return () => cancelAnimationFrame(animationFrame);
	}, [textWidth, columns, scrollSpeed]);

	return (
		<div
			className="relative bg-neutral-900 p-4 rounded-lg overflow-hidden"
			style={{
				width: `${columns * 6}px`,
				height: `${rows * 6}px`,
				display: "grid",
				gridTemplateColumns: `repeat(${columns}, 6px)`,
				gridTemplateRows: `repeat(${rows}, 6px)`,
				gap: "2px",
			}}
		>
			{/* Static Grid Background */}
			<div
				className="absolute inset-0 grid gap-0.5"
				style={{
					gridTemplateColumns: `repeat(${columns}, 6px)`,
					gridTemplateRows: `repeat(${rows}, 6px)`,
				}}
			>
				{Array.from({ length: rows * columns }).map((_, index) => (
					<div key={index} className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
				))}
			</div>

			{/* Scrolling Text Overlay */}
			<div
				className="absolute top-0 left-0 grid gap-0.5"
				style={{
					gridTemplateColumns: `repeat(${columns}, 6px)`,
					gridTemplateRows: `repeat(${rows}, 6px)`,
					transform: `translateX(-${offset}px)`,
					transition: `transform 0.05s linear`, // Smooth transition
				}}
			>
				{textGrid.map((row, rowIndex) => {
					const scrollingRow = [...row, ...Array(columns).fill(".")]; // Extend for smooth looping
					return scrollingRow.slice(offset, offset + columns).map((pixel, colIndex) => (
						<div
							key={`${rowIndex}-${colIndex}`}
							className={`w-1.5 h-1.5 rounded-full ${
								pixel === "#" ? "bg-amber-500" : "bg-transparent"
							}`}
						/>
					));
				})}
			</div>
		</div>
	);
};

export default LEDScroller;
