import { useState } from 'react';

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
	const [currentWord, setCurrentWord] = useState<string>('');

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		onChange(newValue);

		// Get the last word after the last space
		const words = newValue.split(' ');
		const lastWord = words[words.length - 1];

		setCurrentWord(lastWord);

		// Disable transliteration for English
		if (langCode === 'en' || !lastWord.trim()) {
			setSuggestions([]);
			return;
		}

		if (lastWord.trim()) {
			const results = await fetchTransliteration(lastWord, langCode);
			setSuggestions([...results, lastWord]); // Add user-typed word at the end
		} else {
			setSuggestions([]);
		}
	};

	const handleSuggestionClick = (suggestion: string) => {
		const words = value.split(' ');
		words[words.length - 1] = suggestion; // Replace only the last word
		const newText = words.join(' ');

		onChange(newText);
		setSuggestions([]); // Clear suggestions after selection
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
