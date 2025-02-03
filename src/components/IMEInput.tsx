import React, { useState } from "react";
import Sanscript from "@indic-transliteration/sanscript";

const IMEInput: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [selectedLang, setSelectedLang] = useState<"devanagari" | "telugu">("devanagari");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    setConvertedText(Sanscript.t(text, "itrans", selectedLang)); // Convert to Hindi/Telugu
  };

  return (
    <div>
      <h3>Select Language:</h3>
      <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value as "devanagari" | "telugu")}>
        <option value="devanagari">Hindi (Devanagari)</option>
        <option value="telugu">Telugu</option>
        <option value="kannada">Kannada</option>
      </select>

      <h3>Type in English:</h3>
      <input type="text" value={inputText} onChange={handleChange} placeholder="Enter text in English" />

      <h3>Converted Text:</h3>
      <p>{convertedText}</p>
    </div>
  );
};

export default IMEInput;
