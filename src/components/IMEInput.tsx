import {useEffect, useRef, useState} from 'react';

const fetchTransliteration = async (word: string, langCode: string) => {
	try {
		const response = await fetch(
			`https://inputtools.google.com/request?text=${encodeURIComponent(
				word
			)}&itc=${langCode}-t-i0-und&num=5&ie=utf-8&oe=utf-8&app=customApp`
		);
		const data = await response.json();

		if (data[0] === 'SUCCESS') {
			return data[1][0][1]; // Array of suggestions
		} else {
			console.error('Transliteration failed:', data);
			return [];
		}
	} catch (error) {
		console.error('Error fetching transliteration:', error);
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
	const [cursorIndex, setCursorIndex] = useState<number>(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		const selectionStart = e.target.selectionStart || 0;

		onChange(newValue);
		setCursorIndex(selectionStart); // Track cursor position

		// Find the word at the cursor position
		const words = newValue.split(" ");
		let wordStart = 0;
		let wordIndex = -1;

		for (let i = 0; i < words.length; i++) {
			if (selectionStart >= wordStart && selectionStart <= wordStart + words[i].length) {
				wordIndex = i;
				break;
			}
			wordStart += words[i].length + 1; // +1 for spaces
		}

		if (wordIndex === -1 || langCode === "en") {
			setSuggestions([]);
			return;
		}

		const wordAtCursor = words[wordIndex];

		if (wordAtCursor.trim()) {
			const results = await fetchTransliteration(wordAtCursor, langCode);
			setSuggestions([...results, wordAtCursor]); // Add user-typed word at the end
		} else {
			setSuggestions([]);
		}
	};

	const handleSuggestionClick = (suggestion: string) => {
		const words = value.split(" ");
		let wordStart = 0;
		let wordIndex = -1;

		// Find which word is at the cursor position
		for (let i = 0; i < words.length; i++) {
			if (cursorIndex >= wordStart && cursorIndex <= wordStart + words[i].length) {
				wordIndex = i;
				break;
			}
			wordStart += words[i].length + 1;
		}

		if (wordIndex !== -1) {
			words[wordIndex] = suggestion; // Replace only the word at cursor
			const newText = words.join(" ");
			onChange(newText);
			setCursorIndex(wordStart + suggestion.length); // Adjust cursor position
		}

		setSuggestions([]); // Clear suggestions

		// Keep input focused and restore cursor position after clicking a suggestion
		setTimeout(() => {
			if (inputRef.current) {
				inputRef.current.focus();
				inputRef.current.setSelectionRange(cursorIndex, cursorIndex); // Restore cursor position
			}
		}, 0);
	};

	// Hide suggestions when clicking outside
	useEffect(() => {
		// const handleClickOutside = (event: MouseEvent) => {
		// 	if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
		// 		setSuggestions([]);
		// 	}
		// };
		// document.addEventListener("mousedown", handleClickOutside);
		// return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative w-full">
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={handleChange}
				placeholder="Type in English..."
				className="border w-full p-2  rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			/>
			{suggestions.length > 0 && (
				<ul className=" bg-white border w-full mt-1 shadow-md z-50  overflow-y-auto">
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
