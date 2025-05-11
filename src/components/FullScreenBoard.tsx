import React, { useState, useEffect, useRef } from 'react';

type LEDBoardConfig = {
	rows: number;
	cols: number;
	scrollSpeed: number;
	direction: 'left' | 'right';
	interval: number;
	gap: number;
	mode: 'scroll' | 'fixed' | 'flicker';
	fixedPosition: number;
	flickerProbability: number;
};

type LEDBusBoardProps = {
	config: LEDBoardConfig;
	data: string;
	isRunning?: boolean;
};

export default function LEDBusBoard({
	config,
	data,
	isRunning = true,
}: LEDBusBoardProps) {
	const [parsedLedData, setParsedLedData] = useState<number[][]>([]);
	const [scrollOffset, setScrollOffset] = useState(0);
	const [inGap, setInGap] = useState(false);
	const [flickerSeed, setFlickerSeed] = useState(Math.random());

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number | null>(null);
	const lastFrameTimeRef = useRef<number>(0);
	const gapStartTimeRef = useRef<number | null>(null);

	const ledSize = 6;

	useEffect(() => {
		const lines = data.split('\n');
		const matrix = lines.map((line) =>
			Array.from(line).map((char) => (char === '#' ? 1 : 0))
		);
		if (config.gap > 0) {
			const withGap = matrix.map((row) => [
				...row,
				...Array(config.gap).fill(0),
			]);
			setParsedLedData(withGap);
		} else {
			setParsedLedData(matrix);
		}
	}, [data, config.gap]);

	const handleConfigChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setConfig((prev) => ({
			...prev,
			[name]: name === 'direction' || name === 'mode' ? value : Number(value),
		}));
	};

	useEffect(() => {
		if (!isRunning || config.mode === 'fixed') return;

		const dataWidth = parsedLedData[0]?.length || 0;
		if (dataWidth === 0) return;

		const tick = (timestamp: number) => {
			if (
				!lastFrameTimeRef.current ||
				timestamp - lastFrameTimeRef.current >= config.interval
			) {
				lastFrameTimeRef.current = timestamp;

				if (config.mode === 'flicker') {
					setFlickerSeed(Math.random());
				} else {
					if (inGap) {
						if (!gapStartTimeRef.current) {
							gapStartTimeRef.current = timestamp;
						} else if (
							timestamp - gapStartTimeRef.current >=
							config.gap * config.interval
						) {
							setInGap(false);
							gapStartTimeRef.current = null;
							setScrollOffset(0);
						}
					} else {
						setScrollOffset((prev) => {
							const increment = config.scrollSpeed;
							const newOffset =
								config.direction === 'left'
									? prev + increment
									: prev - increment;
							if (Math.abs(newOffset) >= dataWidth * ledSize) {
								if (config.gap > 0) setInGap(true);
								return 0;
							}
							return newOffset;
						});
					}
				}
			}

			animationRef.current = requestAnimationFrame(tick);
		};

		animationRef.current = requestAnimationFrame(tick);

		return () => {
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
		};
	}, [isRunning, config, parsedLedData, inGap]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		const totalWidth = config.cols * ledSize;
		const totalHeight = config.rows * ledSize;

		canvas.width = totalWidth;
		canvas.height = totalHeight;

		ctx!.fillStyle = '#000';
		ctx!.fillRect(0, 0, totalWidth, totalHeight);

		if (inGap && config.mode !== 'fixed') return;

		const visibleRows = Math.min(parsedLedData.length, config.rows);
		const dataWidth = parsedLedData[0]?.length || 0;

		for (let row = 0; row < visibleRows; row++) {
			for (let col = 0; col < config.cols; col++) {
				let dataCol;

				if (config.mode === 'fixed') {
					dataCol = config.fixedPosition + col;
				} else {
					const offsetCol = Math.floor(scrollOffset / ledSize);

					if (config.direction === 'left') {
						dataCol = offsetCol + col;
					} else {
						dataCol = dataWidth - (offsetCol + config.cols - col);
					}
				}

        while (dataCol >= dataWidth) dataCol -= dataWidth;
				while (dataCol < 0) dataCol += dataWidth;

				let isOn = parsedLedData[row]?.[dataCol] === 1;

				if (config.mode === 'flicker' && isOn) {
					const thisLedRandom =
						Math.sin(row * 100 + col + flickerSeed * 1000) * 0.5 + 0.5;
					isOn = thisLedRandom > config.flickerProbability;
				}

				ctx!.fillStyle = isOn ? '#f00' : '#300';
				ctx!.beginPath();
				ctx!.arc(
					col * ledSize + ledSize / 2,
					row * ledSize + ledSize / 2,
					ledSize / 2 - 1,
					0,
					Math.PI * 2
				);
				ctx!.fill();

				if (isOn) {
					ctx!.shadowBlur = 5;
					ctx!.shadowColor = '#f00';
					ctx!.beginPath();
					ctx!.arc(
						col * ledSize + ledSize / 2,
						row * ledSize + ledSize / 2,
						ledSize / 2 - 2,
						0,
						Math.PI * 2
					);
					ctx!.fill();
					ctx!.shadowBlur = 0;
				}
			}
		}
	}, [scrollOffset, config, parsedLedData, inGap]);

	const toggleRunning = () => {
		setIsRunning((prev) => !prev);
		if (inGap) {
			setInGap(false);
			gapStartTimeRef.current = null;
		}
	};

	return (
		<div className="">
			<canvas
				ref={canvasRef}
				className=""
				style={{ display: 'block', imageRendering: 'pixelated' }}
			/>
		</div>
	);
}
