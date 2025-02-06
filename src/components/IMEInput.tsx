import { useState } from "react";

const fetchTransliteration = async (text: string, langCode: string) => {
  try {
    const response = await fetch(
      `https://inputtools.google.com/request?text=${encodeURIComponent(
        text
      )}&itc=${langCode}-t-i0-und&num=5&ie=utf-8&oe=utf-8&app=customApp`
    );
    const data = await response.json();

    if (data[0] === "SUCCESS") {
      return data[1][0][1]; // Array of suggestions
    } else {
      console.error("Transliteration failed:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching transliteration:", error);
    return [];
  }
};

interface IMEInputProps {
  langCode: string;
  value: string;
  onChange: (value: string) => void;
}

const IMEInput: React.FC<IMEInputProps> = ({ langCode, value, onChange }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue); // Update form value

    if (newValue.trim()) {
      const results = await fetchTransliteration(newValue, langCode);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion); // Set selected suggestion in the form
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type in English..."
        className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-white border w-full mt-1 shadow-md z-10">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-2 cursor-pointer hover:bg-gray-200"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IMEInput;
