// import {useEffect, useRef, useState} from 'react';
//
// const fetchTransliteration = async (word: string, langCode: string) => {
// 	try {
// 		const response = await fetch(
// 			`https://inputtools.google.com/request?text=${encodeURIComponent(
// 				word
// 			)}&itc=${langCode}-t-i0-und&num=5&ie=utf-8&oe=utf-8&app=customApp`
// 		);
// 		const data = await response.json();
//
// 		if (data[0] === 'SUCCESS') {
// 			return data[1][0][1]; // Array of suggestions
// 		} else {
// 			console.error('Transliteration failed:', data);
// 			return [];
// 		}
// 	} catch (error) {
// 		console.error('Error fetching transliteration:', error);
// 		return [];
// 	}
// };
//
// interface IMEInputProps {
// 	langCode: string;
// 	value: string;
// 	onChange: (value: string) => void;
// }
//
// const IMEInput: React.FC<IMEInputProps> = ({ langCode, value, onChange }) => {
// 	const [suggestions, setSuggestions] = useState<string[]>([]);
// 	const [cursorIndex, setCursorIndex] = useState<number>(0);
// 	const inputRef = useRef<HTMLInputElement>(null);
//
// 	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
// 		const newValue = e.target.value;
// 		const selectionStart = e.target.selectionStart || 0;
//
// 		onChange(newValue);
// 		setCursorIndex(selectionStart); // Track cursor position
//
// 		// Find the word at the cursor position
// 		const words = newValue.split(" ");
// 		let wordStart = 0;
// 		let wordIndex = -1;
//
// 		for (let i = 0; i < words.length; i++) {
// 			if (selectionStart >= wordStart && selectionStart <= wordStart + words[i].length) {
// 				wordIndex = i;
// 				break;
// 			}
// 			wordStart += words[i].length + 1; // +1 for spaces
// 		}
//
// 		if (wordIndex === -1 || langCode === "en") {
// 			setSuggestions([]);
// 			return;
// 		}
//
// 		const wordAtCursor = words[wordIndex];
//
// 		if (wordAtCursor.trim()) {
// 			const results = await fetchTransliteration(wordAtCursor, langCode);
// 			setSuggestions([...results, wordAtCursor]); // Add user-typed word at the end
// 		} else {
// 			setSuggestions([]);
// 		}
// 	};
//
// 	const handleSuggestionClick = (suggestion: string) => {
// 		replaceWordAtCursor(suggestion);
// 	};
//
// 	// Hide suggestions when clicking outside
// 	useEffect(() => {
// 		// const handleClickOutside = (event: MouseEvent) => {
// 		// 	if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
// 		// 		setSuggestions([]);
// 		// 	}
// 		// };
// 		// document.addEventListener("mousedown", handleClickOutside);
// 		// return () => document.removeEventListener("mousedown", handleClickOutside);
// 	}, []);
//
// 	const replaceWordAtCursor = (suggestion: string) => {
// 		const words = value.split(" ");
// 		let wordStart = 0;
// 		let wordIndex = -1;
//
// 		for (let i = 0; i < words.length; i++) {
// 			if (cursorIndex >= wordStart && cursorIndex <= wordStart + words[i].length) {
// 				wordIndex = i;
// 				break;
// 			}
// 			wordStart += words[i].length + 1;
// 		}
//
// 		if (wordIndex !== -1) {
// 			words[wordIndex] = suggestion;
// 			const newText = words.join(" ");
// 			const newCursorPos = wordStart + suggestion.length + 1; // Move cursor to next position
//
// 			onChange(newText);
// 			setCursorIndex(newCursorPos);
// 		}
//
// 		setSuggestions([]);
//
// 		setTimeout(() => {
// 			if (inputRef.current) {
// 				inputRef.current.focus();
// 				inputRef.current.setSelectionRange(cursorIndex, cursorIndex);
// 			}
// 		}, 0);
// 	};
//
// 	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
// 		if (e.key === " ") {
// 			if (suggestions.length > 0) {
// 				e.preventDefault(); // Prevent space from being added
// 				replaceWordAtCursor(suggestions[0]); // Select the first suggestion
// 			}
// 		}
// 	};
//
// 	return (
// 		<div className="relative w-full">
// 			<input
// 				ref={inputRef}
// 				type="text"
// 				value={value}
// 				onChange={handleChange}
// 				onKeyDown={handleKeyDown}
// 				placeholder="Type in English..."
// 				className="border w-full p-2  rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// 			/>
// 			{suggestions.length > 0 && (
// 				<ul className=" bg-white border w-full mt-1 shadow-md z-50  overflow-y-auto">
// 					{suggestions.map((suggestion, index) => (
// 						<li
// 							key={index}
// 							onClick={() => handleSuggestionClick(suggestion)}
// 							className="p-2 cursor-pointer hover:bg-gray-200"
// 						>
// 							{suggestion}
// 						</li>
// 					))}
// 				</ul>
// 			)}
// 		</div>
// 	);
// };
//
// export default IMEInput;

import { TextField } from "@/ui/components/TextField";
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";

const fetchTransliteration = async (word: string, langCode: string) => {
  if (!word || !word.trim() || langCode === "en" || !langCode) {
    return [];
  }
  try {
    const baseLangCode = langCode.replace(/\d+$/, "");
    const response = await fetch(
      `https://inputtools.google.com/request?text=${encodeURIComponent(
        word.trim()
      )}&itc=${baseLangCode}-t-i0-und&num=5&ie=utf-8&oe=utf-8&app=customApp`
    );
    const data = await response.json();

    if (data[0] === "SUCCESS" && data[1]?.[0]?.[1]) {
      return data[1][0][1]; // Array of suggestions
    }
    return [];
  } catch (error) {
    console.error("Error fetching transliteration:", error);
    return [];
  }
};

interface IMEInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  langCode: string;
  value?: string;
  onChange?: (e: any) => void;
}

const IMEInput = forwardRef<HTMLInputElement, IMEInputProps>(
  ({ langCode, value = "", onChange, ...otherProps }, ref) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [cursorIndex, setCursorIndex] = useState<number>(0);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
      useState<number>(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const selectionStart = e.target.selectionStart || 0;

      if (onChange) onChange(e);
      setCursorIndex(selectionStart);
      setSelectedSuggestionIndex(-1); // Reset selection on new input

    // Find the word at the cursor position
    const words = newValue.split(" ");
    let wordStart = 0;
    let wordIndex = -1;

    for (let i = 0; i < words.length; i++) {
      if (
        selectionStart >= wordStart &&
        selectionStart <= wordStart + words[i].length
      ) {
        wordIndex = i;
        break;
      }
      wordStart += words[i].length + 1;
    }

    if (wordIndex === -1 || langCode === "en" || !newValue.trim()) {
      setSuggestions([]);
      return;
    }

    const wordAtCursor = words[wordIndex];

    if (wordAtCursor && wordAtCursor.trim()) {
      const results = await fetchTransliteration(wordAtCursor, langCode);
      setSuggestions([...results, wordAtCursor]);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    replaceWordAtCursor(suggestion, false);
  };

  // `appendSpace` re-inserts the space the user typed to accept the suggestion.
  const replaceWordAtCursor = (suggestion: string, appendSpace = true) => {
    const words = value.split(" ");
    let wordStart = 0;
    let wordIndex = -1;

    for (let i = 0; i < words.length; i++) {
      if (
        cursorIndex >= wordStart &&
        cursorIndex <= wordStart + words[i].length
      ) {
        wordIndex = i;
        break;
      }
      wordStart += words[i].length + 1;
    }

    let newCursorPos = cursorIndex;
    if (wordIndex !== -1) {
      words[wordIndex] = suggestion;
      if (appendSpace && wordIndex === words.length - 1) words.push("");
      const newText = words.join(" ");
      newCursorPos = wordStart + suggestion.length + (appendSpace ? 1 : 0);

      if (onChange) {
        onChange({ target: { value: newText } } as any);
      }
      setCursorIndex(newCursorPos);
    }

    setSuggestions([]);
    setSelectedSuggestionIndex(-1);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter" && selectedSuggestionIndex !== -1) {
        e.preventDefault();
        replaceWordAtCursor(suggestions[selectedSuggestionIndex], false);
      } else if (e.key === " " && suggestions.length > 0) {
        e.preventDefault();
        replaceWordAtCursor(suggestions[0]); // Auto-select first suggestion
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      {/* <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={(e) => setCursorIndex(e.currentTarget.selectionStart || 0)}
        placeholder="Type in English..."
        className="border w-full p-2  rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      /> */}
      <TextField variant="filled" className="h-9 grow shrink-0 basis-0" label="" helpText="">
        <TextField.Input
          type="text"
          value={value}    
               
          onKeyDown={handleKeyDown}
          onClick={(e) => setCursorIndex(e.currentTarget.selectionStart || 0)}
          onChange={handleChange}
          ref={inputRef}
            className="h-9 w-full flex-none"
            placeholder="Enter your text"
          />
        </TextField>
      {suggestions.length > 0 && langCode !== "en" && (
        <ul className=" bg-default-background text-default-font border-neutral-border rounded-md border w-full mt-2 shadow-md z-50  overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(suggestion);
              }}
              className={`p-2 cursor-pointer rounded text-default-font ${
                selectedSuggestionIndex === index ? "bg-brand-50 text-brand-primary font-semibold" : "hover:bg-neutral-100"
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default IMEInput;
