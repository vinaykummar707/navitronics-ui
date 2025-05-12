import { useEffect, useRef } from 'react';

type LedMatrixProps = {
	ledMatrix: number[][];
	ledSize: number;
	ledSpacing: number;
	rowSpacing: number;
	isScrolling: boolean;
};

export default function LedCanvas({
	ledMatrix,
	ledSize,
	ledSpacing,
	rowSpacing,
	isScrolling,
}: LedMatrixProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!canvasRef.current || ledMatrix.length === 0) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Render each LED
		for (let row = 0; row < ledMatrix.length; row++) {
			for (let col = 0; col < ledMatrix[row].length; col++) {
				const x = col * (ledSize + ledSpacing);
				const y = row * (ledSize + rowSpacing);

				ctx.beginPath();
				ctx.arc(x + ledSize / 2, y + ledSize / 2, ledSize / 2, 0, 2 * Math.PI);
				ctx.fillStyle = ledMatrix[row][col] ? '#f59e0b' : '#3f3f46'; // amber-500 or neutral-700
				ctx.fill();
			}
		}
	}, [ledMatrix, ledSize, ledSpacing, rowSpacing]);

	const canvasWidth = ledMatrix[0]?.length * (ledSize + ledSpacing) ?? 0;
	const canvasHeight = ledMatrix.length * (ledSize + rowSpacing);

	return (
		<div className="bg-neutral-900 inline-block">
			<canvas
				ref={canvasRef}
				width={canvasWidth}
				height={canvasHeight}
				style={{
					cursor: isScrolling ? 'default' : 'pointer',
				}}
			/>
		</div>
	);
}
