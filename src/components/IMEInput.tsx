import { useState } from "react";

const fetchTransliteration = async (text: string, langCode: string = "hi") => {
  try {
    const response = await fetch(
      `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${langCode}-t-i0-und&num=5&ie=utf-8&oe=utf-8&app=customApp`
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

const IMEInput = () => {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    if (value.trim()) {
      const results = await fetchTransliteration(value);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setText(suggestion);
    setSuggestions([]); // Clear suggestions after selection
  };

  return (
    <div className="relative w-64">
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="Type in English..."
        className="border p-2 w-full"
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
