// FontHeightInput.tsx
import React from 'react';

interface FontHeightInputProps {
	value: any;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
}

const FontHeightInput: React.FC<FontHeightInputProps> = ({
	value = 1,
	onChange,
	min = 1,
	max = 100,
}) => {
	const increase = () => {
		if (parseInt(value) < max) onChange(parseInt(value) + 1);
	};

	const decrease = () => {
		if (parseInt(value) > min) onChange(parseInt(value) - 1);
	};

	return (
		<div>
			<label className="block text-sm font-medium text-gray-600 mb-1">
				Text Size
			</label>
			<div className="flex items-center space-x-1">
				<button
					type="button"
					onClick={decrease}
					className="px-3 py-2 bg-white border rounded-lg hover:bg-gray-300"
				>
					−
				</button>
				{/* <span className="min-w-[30px] text-center">{value}</span> */}
				<button
					type="button"
					onClick={increase}
					className="px-3 py-2 bg-white border rounded-lg hover:bg-gray-300"
				>
					+
				</button>
			</div>
		</div>
	);
};

export default FontHeightInput;
