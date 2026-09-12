import React, { useEffect, useState } from "react";
import { Select } from "@/ui/components/Select";

// Transliteration function using Google Input Tools API
const fetchTransliteration = async (text: string, langCode: string = "hi"): Promise<string[]> => {
  try {
    const baseLangCode = langCode.replace(/\d+$/, "");
    const response = await fetch(
      `https://inputtools.google.com/request?text=${encodeURIComponent(
        text
      )}&itc=${baseLangCode}-t-i0-und&num=5&ie=utf-8&oe=utf-8&app=customApp`
    );
    const data = await response.json();
    if (data[0] === "SUCCESS" && data[1]?.[0]?.[1]) {
      return data[1][0][1]; // array of suggestions
    }
    return [];
  } catch (error) {
    console.error("Transliteration fetch error:", error);
    return [];
  }
};

interface AutoTextGeneratorProps {
  route: any;
  targetLang: string;
  isRouteNumber?: boolean;
  fieldKey?: string;
  text?: string;
  onSelect: (value: string) => void;
}

function generateCombinations(
  route: any,
  isRouteNumber: boolean = false,
  fieldKey?: string,
  text?: string
): string[] {
  if (!route) return [];

  const splitRoute = Boolean(route.splitRoute ?? route.split_route);
  const routeNumber = (route.routeNumber ?? route.route_number ?? "").toString().trim();
  const routeNumber1 = (route.routeNumber1 ?? route.route_number_1 ?? "").toString().trim();
  const routeNumber2 = (route.routeNumber2 ?? route.route_number_2 ?? "").toString().trim();
  const sep = route.separation || "-";
  const source = (route.source || "").toString().trim();
  const destination = (route.destination || "").toString().trim();
  const via = (route.via || "").toString().trim();

  // If this is specifically a route number field (sideText, routeNumber1, routeNumber2)
  if (isRouteNumber) {
    const routeNumberOptions: string[] = [];
    if (splitRoute) {
      const combined = routeNumber1 && routeNumber2 ? `${routeNumber1}/${routeNumber2}` : "";

      if (fieldKey === "routeNumber1") {
        if (routeNumber1) routeNumberOptions.push(routeNumber1);
        if (combined) routeNumberOptions.push(combined);
      } else if (fieldKey === "routeNumber2") {
        if (routeNumber2) routeNumberOptions.push(routeNumber2);
        if (combined) routeNumberOptions.push(combined);
      } else {
        if (combined) routeNumberOptions.push(combined);
        if (routeNumber1) routeNumberOptions.push(routeNumber1);
        if (routeNumber2) routeNumberOptions.push(routeNumber2);
      }
    } else if (routeNumber) {
      routeNumberOptions.push(routeNumber);
    }

    return routeNumberOptions.filter(
      (str, idx, arr) => !!str && arr.indexOf(str) === idx
    );
  }

  // General route text combinations
  const routeNumberOptions: string[] = [];

  if (splitRoute) {
    if (routeNumber1 && routeNumber2) {
      routeNumberOptions.push(`${routeNumber1}/${routeNumber2}`);
    }
    if (routeNumber1) routeNumberOptions.push(routeNumber1);
    if (routeNumber2) routeNumberOptions.push(routeNumber2);
  } else if (routeNumber) {
    routeNumberOptions.push(routeNumber);
  }

  const sourceDest = [source, destination].filter(Boolean).join(` ${sep} `);
  const destSource = [destination, source].filter(Boolean).join(` ${sep} `);

  const rawCombos: string[] = [];

  // Combinations with route numbers
  for (const rn of routeNumberOptions) {
    if (rn) {
      rawCombos.push([rn, sourceDest, via ? `VIA: ${via}` : ""].filter(Boolean).join(" - "));
      rawCombos.push([rn, sourceDest].filter(Boolean).join(" - "));
      rawCombos.push([rn, source].filter(Boolean).join(" - "));
      rawCombos.push([rn, destination].filter(Boolean).join(" - "));
    }
  }

  // Combinations without route number
  if (sourceDest) {
    rawCombos.push([sourceDest, via ? `VIA: ${via}` : ""].filter(Boolean).join(" - "));
    rawCombos.push(sourceDest);
  }
  if (destSource && destSource !== sourceDest) {
    rawCombos.push(destSource);
  }
  if (source) rawCombos.push(source);
  if (destination) rawCombos.push(destination);
  if (via) rawCombos.push(`VIA: ${via}`);

  if (text) rawCombos.push(text);

  // Individual route numbers
  for (const rn of routeNumberOptions) {
    if (rn) rawCombos.push(rn);
  }

  const combos = rawCombos.filter(
    (str, idx, arr) =>
      !!str && str.replace(/-/g, "").trim() !== "" && arr.indexOf(str) === idx
  );
  return combos;
}

const AutoTextGenerator: React.FC<AutoTextGeneratorProps> = ({
  route,
  targetLang,
  isRouteNumber = false,
  fieldKey,
  text,
  onSelect,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const englishCombos = generateCombinations(route, isRouteNumber, fieldKey, text);

  useEffect(() => {
    let isCancelled = false;

    const generateSuggestions = async () => {
      if (!englishCombos.length) {
        setSuggestions([]);
        return;
      }

      if (targetLang === "en" || !targetLang) {
        setSuggestions(englishCombos);
        return;
      }

      setLoading(true);
      try {
        const resultsArr = await Promise.all(
          englishCombos.map((combo) => fetchTransliteration(combo, targetLang))
        );
        if (!isCancelled) {
          const transliterated = resultsArr.map((arr, idx) => arr[0] || englishCombos[idx]);
          const unique = Array.from(new Set([...transliterated, ...englishCombos]));
          setSuggestions(unique);
        }
      } catch (err) {
        if (!isCancelled) {
          setSuggestions(englishCombos);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    generateSuggestions();

    return () => {
      isCancelled = true;
    };
  }, [
    route?.routeNumber,
    route?.route_number,
    route?.routeNumber1,
    route?.route_number_1,
    route?.routeNumber2,
    route?.route_number_2,
    route?.splitRoute,
    route?.split_route,
    route?.source,
    route?.destination,
    route?.via,
    route?.separation,
    targetLang,
    isRouteNumber,
    fieldKey,
    text,
  ]);

  if (!englishCombos.length && !suggestions.length) return null;

  return (
    <Select
      aria-label="Auto Text Generator"
      placeholder={loading ? "Transliterating..." : "Auto Text Suggestions..."}
      onValueChange={(val) => {
        if (val) onSelect(val);
      }}
      className="w-full"
    >
      {loading && (
        <div className="px-3 py-1.5 text-caption font-caption text-neutral-400">
          Transliterating...
        </div>
      )}
      {suggestions.map((combo, idx) => (
        <Select.Item key={`${combo}-${idx}`} value={combo}>
          {combo}
        </Select.Item>
      ))}
    </Select>
  );
};

export default AutoTextGenerator;