// import React, { useEffect, useState } from "react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// // Translation function
// const translateText = async (text: string, targetLang: string) => {
//   if (!text || text.trim() === "" || targetLang === "en") return text;
//   try {
//     const formData = new FormData();
//     formData.append("key", "devnagri_086971e80fa111f0a4e142010aa00fc7");
//     formData.append("sentence", text);
//     formData.append("src_lang", "en");
//     formData.append("dest_lang", targetLang);

//     const response = await fetch(
//       "https://api.devnagri.com/machine-translation/v2/translate",
//       {
//         method: "POST",
//         body: formData,
//       }
//     );
//     const data = await response.json();
//     if (data && data.translated_text) {
//       return data.translated_text;
//     } else {
//       throw new Error("Translation failed");
//     }
//   } catch (error) {
//     return text;
//   }
// };

// type Props = {
//   route: any;
//   targetLang: string; // 'en', 'hi', etc.
//   onSelect: (value: string) => void;
// };

// // Helper to generate combinations
// function generateCombinations(route: any): string[] {
//   const combos = [
//     [route.route_number, route.source, route.destination, route.via].filter(Boolean).join(" - "),
//     [route.source, route.destination].filter(Boolean).join(" - "),
//     [route.route_number, route.source].filter(Boolean).join(" - "),
//     [route.route_number, route.destination].filter(Boolean).join(" - "),
//     [route.source, route.via, route.destination].filter(Boolean).join(" - "),
//     [route.route_number, route.source, route.destination].filter(Boolean).join(" - "),
//     [route.destination, route.source].filter(Boolean).join(" - "),
//   ].filter(
//     (str, idx, arr) =>
//       !!str && str.replace(/-/g, "").trim() !== "" &&
//       arr.indexOf(str) === idx
//   );
//   return combos;
// }

// const AutoTextGenerator: React.FC<Props> = ({ route, targetLang, onSelect }) => {
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     let mounted = true;
//     async function updateSuggestions() {
//       setLoading(true);
//       const baseCombos = generateCombinations(route);
//       if (targetLang === "en" || baseCombos.length === 0) {
//         if (mounted) setSuggestions(baseCombos);
//         setLoading(false);
//         return;
//       }
//       // For non-English, translate all combos in parallel
//       try {
//         const results = await Promise.all(
//           baseCombos.map(combo =>
//             translateText(combo, targetLang).then(result => result)
//           )
//         );
//         if (mounted) setSuggestions(results);
//       } catch {
//         if (mounted) setSuggestions(baseCombos);
//       }
//       setLoading(false);
//     }
//     updateSuggestions();
//     return () => { mounted = false; };
//   }, [route, targetLang]);

//   if (!suggestions.length) return null;

//   return (
//     <Select
//       aria-label="Auto Text Generator"
//       value=""
//       disabled={loading}
//       onValueChange={val => onSelect(val)}
//     >
//       <SelectTrigger className="min-w-[130px]">
//         <SelectValue placeholder={loading ? "Loading..." : "Auto Text..."} />
//       </SelectTrigger>
//       <SelectContent>
//         {suggestions.map((combo, idx) => (
//           <SelectItem key={idx} value={combo}>{combo}</SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// };

// export default AutoTextGenerator;
import { Select } from "@/ui/components/Select";
import React, { useEffect, useState } from "react";

// Transliteration function using Google Input Tools API
const fetchTransliteration = async (text: string, langCode: string = "hi") => {
    try {
        const baseLangCode = langCode.replace(/\d+$/, "");
        const response = await fetch(
            `https://inputtools.google.com/request?text=${encodeURIComponent(
                text
            )}&itc=${baseLangCode}-t-i0-und&num=5&ie=utf-8&oe=utf-8&app=customApp`
        );
        const data = await response.json();
        if (data[0] === "SUCCESS") {
            return data[1][0][1]; // array of suggestions
        } else {
            return [];
        }
    } catch (error) {
        return [];
    }
};

type Props = {
    route: any;
    targetLang: string;
    onSelect: (value: string) => void;
};

function generateCombinations(route: any, text: string): string[] {
    const combos = [
        [route.route_number, route.source, route.destination, , route.via].filter(Boolean).join(" - "),
        [route.source, route.destination, route.via].filter(Boolean).join(" - "),
        [route.source, route.destination].filter(Boolean).join(" - "),
        [route.destination, route.source].filter(Boolean).join(" - "),
        [route.source].filter(Boolean).join(""),
        [route.destination].filter(Boolean).join(""),
        [route.via].filter(Boolean).join(""),
        [text].filter(Boolean).join(""),
    ].filter(
        (str, idx, arr) =>
            !!str && str.replace(/-/g, "").trim() !== "" &&
            arr.indexOf(str) === idx
    );
    return combos;
}

const AutoTextGenerator: React.FC<Props> = ({ route, targetLang, onSelect, text }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const englishCombos = generateCombinations(route, text);


    useEffect(() => {        // Reset suggestions when route or targetLang changes
        handleDropdownOpen();
    }, [route, targetLang]);

    // Only transliterate on open
    const handleDropdownOpen = async () => {
        setOpen(true);

        if (targetLang === "en" || !englishCombos.length) {
            setSuggestions(englishCombos);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const resultsArr = await Promise.all(
                englishCombos.map(combo => fetchTransliteration(combo, targetLang))
            );
            // Only take the first suggestion for each combo
            const firstSuggestions = resultsArr.map(arr => arr[0]).filter(Boolean);
            setSuggestions(firstSuggestions.length ? firstSuggestions : englishCombos);
        } catch {
            setSuggestions(englishCombos);
        }

        setLoading(false);
    };

    // Reset on close
    const handleDropdownClose = () => {
        setOpen(false);
        setSuggestions([]);
        setLoading(false);
    };

    if (!englishCombos.length) return null;

    return (
        <Select
            aria-label="Auto Text Generator"
           placeholder={loading ? "Transliterating..." : "Auto Text..."}
            onValueChange={val => onSelect(val)}
            disabled={loading && !suggestions.length}
            className="w-full truncate line-clamp-1"
            
        >
            
            {loading && <div className="px-2 py-1 text-gray-400 text-sm">Transliterating...</div>}
            {(route.route_number &&
                    typeof route.route_number === "string" &&
                    !suggestions.includes(route.route_number)
                ) && (
                    <>
                        <Select.Item value={route.route_number}>
                            {route.route_number}
                        </Select.Item>
                         <Select.Item value={route.route_number_1}>
                            {route.route_number_1}
                        </Select.Item>
                         <Select.Item value={route.route_number_2}>
                            {route.route_number_2}
                        </Select.Item>
                        </>
                        
                    )}
                {suggestions.map((combo, idx) => (
                    <Select.Item key={idx} value={combo}>
                        {combo}
                    </Select.Item>
                ))}
                {/* Add route_number as an option if it's not blank and not in suggestions */}
                
        </Select>
    );
};

export default AutoTextGenerator;