// FontHeightInput.tsx
import React, { useEffect } from "react";

interface FontHeightInputProps {
  value: any;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  bitmap: number;
}

const FontHeightInput: React.FC<FontHeightInputProps> = ({
  value = 1,
  onChange,

  bitmap = 0, // Assuming bitmap is not used in this component
}) => {
  const increase = () => {
    if (bitmap < 15) onChange(parseInt(value) + 1);
  };

  const decrease = () => {
    onChange(parseInt(value) - 1);
  };

  useEffect(() => {
    console.log("FontHeightInput bitmap changed:", bitmap);
    console.log("va bitmap changed:", value);
  }, [bitmap, value]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        Text Height
      </label>
      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={decrease}
          className="px-3 py-2 bg-white border rounded-lg hover:bg-gray-300"
        >
          −
        </button>
        <span className="min-w-[30px] text-center"> {bitmap}</span>
        {bitmap < 15 && (
          <button
            type="button"
            onClick={increase}
            className="px-3 py-2 bg-white border rounded-lg hover:bg-gray-300"
          >
            +
          </button>
        )}
        {bitmap > 15 && (
          <span className="text-xs text-red-500">Height limit reached</span>
        )}
      </div>
    </div>
  );
};

export default FontHeightInput;
