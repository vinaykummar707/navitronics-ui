import React, { useState, useRef } from "react";
import { fetchTransliteration } from "@/utils/transliteration";
import { Input } from "@/components/ui/input";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface IMEInputProps {
  langCode: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function getWordIndex(value: string, position: number) {
  const words = value.split(" ");
  let wordStart = 0;
  for (let i = 0; i < words.length; i++) {
    if (position >= wordStart && position <= wordStart + words[i].length)
      return { wordIndex: i, wordStart };
    wordStart += words[i].length + 1;
  }
  return { wordIndex: -1, wordStart: 0 };
}

export const IMEInput: React.FC<IMEInputProps> = ({
  langCode,
  value,
  onChange,
  placeholder = "Type in English...",
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cursorIndex, setCursorIndex] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get suggestions when value changes
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const selectionStart = e.target.selectionStart ?? 0;
    onChange(newValue);
    setCursorIndex(selectionStart);
    setSelectedSuggestionIndex(-1);

    // Don't suggest for English or no word at cursor
    const { wordIndex } = getWordIndex(newValue, selectionStart);
    if (wordIndex === -1 || langCode === "en") {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const words = newValue.split(" ");
    const wordAtCursor = words[wordIndex];
    if (wordAtCursor.trim()) {
      const results = await fetchTransliteration(wordAtCursor, langCode);
      setSuggestions([...results, wordAtCursor]);
      setOpen(true);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  };

  // Replace logic
  const replaceWordAtCursor = (suggestion: string) => {
    const words = value.split(" ");
    const { wordIndex, wordStart } = getWordIndex(value, cursorIndex);
    if (wordIndex !== -1) {
      words[wordIndex] = suggestion;
      const newText = words.join(" ");
      const newCursorPos = wordStart + suggestion.length + 1;
      onChange(newText);
      setCursorIndex(newCursorPos);
    }
    setSuggestions([]);
    setOpen(false);
    setSelectedSuggestionIndex(-1);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(cursorIndex, cursorIndex);
      }
    }, 0);
  };

  // Keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (open && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && selectedSuggestionIndex !== -1) {
        e.preventDefault();
        replaceWordAtCursor(suggestions[selectedSuggestionIndex]);
      } else if (e.key === " " && suggestions.length > 0) {
        e.preventDefault();
        replaceWordAtCursor(suggestions[0]);
      }
    }
  };

  // Hide on click outside (manual)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={e => setCursorIndex(e.currentTarget.selectionStart || 0)}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="both"
        aria-controls="ime-suggestions-list"
        aria-activedescendant={
          selectedSuggestionIndex >= 0 && open ? `ime-suggestion-${selectedSuggestionIndex}` : undefined
        }
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
      />
      {open && suggestions.length > 0 && langCode !== "en" && (
        <Command
          className={cn(
            "absolute z-50 mt-1 w-full min-h-50 border bg-background shadow-md",
            "rounded-md"
          )}
          id="ime-suggestions-list"
        >
          <CommandList>
            {suggestions.map((suggestion, index) => (
              <CommandItem
                key={index}
                id={`ime-suggestion-${index}`}
                role="option"
                aria-selected={selectedSuggestionIndex === index}
                onMouseDown={e => {
                  e.preventDefault();
                  replaceWordAtCursor(suggestion);
                }}
                className={cn(
                  selectedSuggestionIndex === index ? "bg-muted text-accent-foreground" : "",
                  "cursor-pointer"
                )}
              >
                {suggestion}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      )}
    </div>
  );
};