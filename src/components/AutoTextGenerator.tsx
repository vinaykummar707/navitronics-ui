import React, { useEffect, useState } from "react";
import { Select } from "@/ui/components/Select";

// Transliteration function using Google Input Tools API
const fetchTransliteration = async (text: string, langCode: string = "hi"): Promise<string[]> => {
  if (!text || !text.trim() || langCode === "en" || !langCode) {
    return [];
  }
  try {
    const baseLangCode = langCode.replace(/\d+$/, "");
    const response = await fetch(
      `https://inputtools.google.com/request?text=${encodeURIComponent(
        text.trim()
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
  variant?: "select" | "list";
  onSelect: (value: string) => void;
}

// A suggestion tagged with the category it belongs to, for grouped display
interface RouteCombo {
  value: string;
  category: string;
}

// Fixed display order for suggestion categories in the dropdown
const CATEGORY_ORDER = [
  "Route Number",
  "Combined Format",
  "Route + Destination",
  "Source ⇄ Destination",
  "Via",
  "Current Text",
];

function dedupeCombos(combos: RouteCombo[]): RouteCombo[] {
  const seen = new Set<string>();
  return combos.filter((combo) => {
    if (!combo.value || seen.has(combo.value)) return false;
    seen.add(combo.value);
    return true;
  });
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Route number tokens (e.g. "100", "100/200") that must never be transliterated
function getRouteNumberTokens(route: any): string[] {
  if (!route) return [];

  const splitRoute = Boolean(
    route.splitRoute ?? route.split_route ?? route.is_split_route
  );
  const routeNumber = (route.routeNumber ?? route.route_number ?? "").toString().trim();
  const routeNumber1 = (route.routeNumber1 ?? route.route_number_1 ?? "").toString().trim();
  const routeNumber2 = (route.routeNumber2 ?? route.route_number_2 ?? "").toString().trim();

  const tokens: string[] = [];
  if (splitRoute) {
    if (routeNumber1 && routeNumber2) tokens.push(`${routeNumber1}/${routeNumber2}`);
    if (routeNumber1) tokens.push(routeNumber1);
    if (routeNumber2) tokens.push(routeNumber2);
  } else if (routeNumber) {
    tokens.push(routeNumber);
  }

  return tokens.filter((str, idx, arr) => !!str && arr.indexOf(str) === idx);
}

// Transliterates a combo string while keeping any embedded route number tokens in English
async function transliterateComboPreservingNumbers(
  combo: string,
  targetLang: string,
  routeNumberTokens: string[]
): Promise<string> {
  if (routeNumberTokens.length === 0) {
    const [result] = await fetchTransliteration(combo, targetLang);
    return result || combo;
  }

  const sortedTokens = [...routeNumberTokens].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sortedTokens.map(escapeRegExp).join("|")})`, "g");
  const parts = combo.split(pattern);

  const translatedParts = await Promise.all(
    parts.map(async (part) => {
      if (!part || routeNumberTokens.includes(part)) return part;
      const [result] = await fetchTransliteration(part, targetLang);
      return result || part;
    })
  );

  return translatedParts.join("");
}


function generateCombinations(
  route: any,
  isRouteNumber: boolean = false,
  fieldKey?: string,
  text?: string
): RouteCombo[] {
  if (!route) return [];

  const splitRoute = Boolean(
    route.splitRoute ?? route.split_route ?? route.is_split_route
  );
  const routeNumber = (route.routeNumber ?? route.route_number ?? "").toString().trim();
  const routeNumber1 = (route.routeNumber1 ?? route.route_number_1 ?? "").toString().trim();
  const routeNumber2 = (route.routeNumber2 ?? route.route_number_2 ?? "").toString().trim();
  const sep = route.separation || "-";
  const source = (route.source || "").toString().trim();
  const destination = (route.destination || "").toString().trim();
  const via = (route.via || "").toString().trim();

  // If this is specifically a route number field (sideText, routeNumber1, routeNumber2)
  if (isRouteNumber) {
    const routeNumberOptions: RouteCombo[] = [];
    if (splitRoute) {
      const combined = routeNumber1 && routeNumber2 ? `${routeNumber1}/${routeNumber2}` : "";

      if (fieldKey === "routeNumber1") {
        if (routeNumber1) routeNumberOptions.push({ value: routeNumber1, category: "Route Number" });
        if (combined) routeNumberOptions.push({ value: combined, category: "Combined Format" });
      } else if (fieldKey === "routeNumber2") {
        if (routeNumber2) routeNumberOptions.push({ value: routeNumber2, category: "Route Number" });
        if (combined) routeNumberOptions.push({ value: combined, category: "Combined Format" });
      } else {
        if (combined) routeNumberOptions.push({ value: combined, category: "Combined Format" });
        if (routeNumber1) routeNumberOptions.push({ value: routeNumber1, category: "Route Number" });
        if (routeNumber2) routeNumberOptions.push({ value: routeNumber2, category: "Route Number" });
      }
    } else if (routeNumber) {
      routeNumberOptions.push({ value: routeNumber, category: "Route Number" });
    }

    return dedupeCombos(routeNumberOptions);
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

  const rawCombos: RouteCombo[] = [];

  // Combinations with route numbers
  for (const rn of routeNumberOptions) {
    if (rn) {
      rawCombos.push({
        value: [rn, sourceDest, via ? `VIA: ${via}` : ""].filter(Boolean).join(" - "),
        category: "Route + Destination",
      });
      rawCombos.push({
        value: [rn, sourceDest].filter(Boolean).join(" - "),
        category: "Route + Destination",
      });
      rawCombos.push({
        value: [rn, source].filter(Boolean).join(" - "),
        category: "Route + Destination",
      });
      rawCombos.push({
        value: [rn, destination].filter(Boolean).join(" - "),
        category: "Route + Destination",
      });
    }
  }

  // Combinations without route number
  if (sourceDest) {
    rawCombos.push({
      value: [sourceDest, via ? `VIA: ${via}` : ""].filter(Boolean).join(" - "),
      category: "Source ⇄ Destination",
    });
    rawCombos.push({ value: sourceDest, category: "Source ⇄ Destination" });
  }
  if (destSource && destSource !== sourceDest) {
    rawCombos.push({ value: destSource, category: "Source ⇄ Destination" });
  }
  if (source) rawCombos.push({ value: source, category: "Source ⇄ Destination" });
  if (destination) rawCombos.push({ value: destination, category: "Source ⇄ Destination" });
  if (via) rawCombos.push({ value: `VIA: ${via}`, category: "Via" });

  if (text) rawCombos.push({ value: text, category: "Current Text" });

  // Individual route numbers
  for (const rn of routeNumberOptions) {
    if (rn) rawCombos.push({ value: rn, category: "Route Number" });
  }

  return dedupeCombos(
    rawCombos.filter((combo) => combo.value.replace(/-/g, "").trim() !== "")
  );
}

const AutoTextGenerator: React.FC<AutoTextGeneratorProps> = ({
  route,
  targetLang,
  isRouteNumber = false,
  fieldKey,
  text,
  variant = "select",
  onSelect,
}) => {
  const [suggestions, setSuggestions] = useState<RouteCombo[]>([]);
  const [loading, setLoading] = useState(false);

  const englishCombos = generateCombinations(route, isRouteNumber, fieldKey, text);

  useEffect(() => {
    let isCancelled = false;

    const generateSuggestions = async () => {
      if (!englishCombos.length) {
        setSuggestions([]);
        return;
      }

      // Route number fields must always stay in English, never transliterated
      if (isRouteNumber || targetLang === "en" || !targetLang) {
        setSuggestions(englishCombos);
        return;
      }

      setLoading(true);
      try {
        const routeNumberTokens = getRouteNumberTokens(route);
        const translatedCombos = await Promise.all(
          englishCombos.map(async (combo) => ({
            value: await transliterateComboPreservingNumbers(
              combo.value,
              targetLang,
              routeNumberTokens
            ),
            category: combo.category,
          }))
        );
        if (!isCancelled) {
          setSuggestions(dedupeCombos([...translatedCombos, ...englishCombos]));
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
    route?.is_split_route,
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

  const groupedSuggestions = CATEGORY_ORDER.map((category) => ({
    category,
    items: suggestions.filter((combo) => combo.category === category),
  })).filter((group) => group.items.length > 0);

  if (variant === "list") {
    return (
      <div className="flex flex-col max-h-[360px] overflow-y-auto divide-y divide-neutral-100 pr-1">
        {loading && (
          <div className="px-3 py-2 text-xs text-neutral-500 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warning-400 animate-pulse" />
            Transliterating suggestions...
          </div>
        )}
        {groupedSuggestions.map((group) => (
          <div key={group.category} className="py-1">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-subtext-color">
              {group.category}
            </div>
            <div className="flex flex-col gap-0.5 px-1">
              {group.items.map((combo, idx) => (
                <button
                  key={`${group.category}-${combo.value}-${idx}`}
                  type="button"
                  onClick={() => onSelect(combo.value)}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded-md text-default-font hover:bg-neutral-100 active:bg-neutral-200 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-medium truncate">{combo.value}</span>
                  <span className="text-[10px] text-subtext-color opacity-0 group-hover:opacity-100 flex-none ml-2">
                    Pick ↵
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {!loading && groupedSuggestions.length === 0 && (
          <div className="p-3 text-xs text-subtext-color text-center">
            No suggestions available. Enter route number, source, or destination first.
          </div>
        )}
      </div>
    );
  }

  return (
    <Select
      key={text || "empty"}
      variant="filled"
      aria-label="Auto Text Generator"
      placeholder={loading ? "Transliterating..." : "Select a suggestion..."}
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
      {groupedSuggestions.map((group, groupIdx) => (
        <React.Fragment key={group.category}>
          <div
            className={`px-3 pb-1 pt-2 text-caption-bold font-caption-bold uppercase tracking-wide text-subtext-color ${
              groupIdx > 0 ? "mt-1 border-t border-solid border-neutral-border" : ""
            }`}
          >
            {group.category}
          </div>
          {group.items.map((combo, idx) => (
            <Select.Item key={`${group.category}-${combo.value}-${idx}`} value={combo.value}>
              {combo.value}
            </Select.Item>
          ))}
        </React.Fragment>
      ))}
    </Select>
  );
};

export default AutoTextGenerator;