import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "@/components/ui/accordion";
import {
  DisplayConfig,
  FontWeight,
  ScreenFormat,
} from "../types/displayConfig";
import { routeService } from "../services/routeService";
import FullScreenBoard from "./FullScreenBoard";
import SideWithSingleTextBoard from "./SideWithSingleTextBoard";
import SideWithTwoTextsBoard from "./SideWithTwoHalfsBoard";
import IMEInput from "./IMEInput";
import GoogleIME from "./IMEInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import LEDBoardBitmap from "./LedSignBoard";
import { Button } from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuItemCommand,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  LuChevronDown,
  LuClipboardCopy,
  LuClipboardPaste,
  LuCopy,
} from "react-icons/lu";
import ScrollingLEDDisplay from "./LedSignBoard";
import LEDBitmapSimulator from "./LedSignBoard";
import axiosInstance from "@/config/axios";
import { toast } from "react-toastify";
import FontHeightInput from "./FontHeightControl";

const SCREEN_TYPES = [
  "Special Messages",
  "front",
  "side",
  "rear",
  "internal",
] as const;
const SCROLL_TYPES = [
  "Left To Right",
  "Right To Left",
  "Fixed",
  // 'Flicker',
] as const;
const POSITIONS = ["Left", "Right", "Center"] as const;
const FORMATS = [
  {
    value: "single",
    label: "Single Line Board",
  },
  {
    value: "two",
    label: "Two Texts Board",
  },
  {
    value: "three",
    label: "Three Texts Board",
  },
] as const;

const FORMATS2 = [
  {
    value: "single",
    label: "Single Line Board",
  },
] as const;

const FONT_WEIGHT = [
  {
    value: "normal",
    label: "Regular",
  },
  {
    value: "bold",
    label: "Bold",
  },
];
const AVAILABLE_LANGUAGES = [
  { code: "as", name: "Assamese", fontFile: "vrinda" },
  { code: "bn", name: "Bengali", fontFile: "vrinda" },
  { code: "bho", name: "Bhojpuri", fontFile: "mangal" },
  { code: "ch", name: "Chattisgarh", fontFile: "krutidev" },
  { code: "en", name: "English", fontFile: "arial" },
  { code: "gu", name: "Gujarati", fontFile: "shruti" },
  { code: "hi", name: "Hindi", fontFile: "mangal" },
  { code: "kn", name: "Kannada", fontFile: "tunga" },
  { code: "ks", name: "Kashmiri", fontFile: "mangal" },
  { code: "kok", name: "Konkani", fontFile: "mangal" },
  { code: "mai", name: "Maithili", fontFile: "mangal" },
  { code: "ml", name: "Malayalam", fontFile: "mangal" },
  { code: "mr", name: "Marathi", fontFile: "mangal" },
  { code: "ne", name: "Nepali", fontFile: "mangal" },
  { code: "or", name: "Odia", fontFile: "Kalinga" },
  { code: "pa", name: "Punjabi", fontFile: "raavi" },
  { code: "sa", name: "Sanskrit", fontFile: "mangal" },
  { code: "sd", name: "Sindhi", fontFile: "mangal" },
  { code: "ta", name: "Tamil", fontFile: "latha" },
  { code: "te", name: "Telugu", fontFile: "gautami" },
  { code: "ur", name: "Urdu", fontFile: "mangal" },
] as const;

const PLACE_HOLDER_OPTIONS2 = [
  {
    value: "source",
    label: "Special Messages",
  },
];

const PLACEHOLDER_OPTIONS = [
  { value: "routeNumber", label: "Route Number" },
  { value: "routeNumber1-routeNumber2", label: "Split Route Number" },
  { value: "routeNumber1", label: "Route Number 1" },
  { value: "routeNumber2", label: "Route Number 2" },
  // { value: 'routeNumber', label: 'Route Number' },
  { value: "source", label: "Source" },
  { value: "destination", label: "Destination" },
  { value: "via", label: "Via" },
  { value: "source-separation-destination", label: "Source - Destination" },
  {
    value: "source-separation-destination-via",
    label: "Source - Destination - via",
  },
  {
    value: "routeNumber-source-separation-destination",
    label: "Route Number - Source - Destination",
  },
  {
    value: "routeNumber1-routeNumber2-source-separation-destination",
    label: "Split Route Number - Source - Destination",
  },
  {
    value: "routeNumber-source-separation-destination-via",
    label: "Route Number - Source - Destination - via",
  },
  {
    value: "routeNumber1-routeNumber2-source-separation-destination-via",
    label: "Split Route Number - Source - Destination - via",
  },
] as const;

const ROUTE_SEPARATORS = [
  { value: "-", label: "Dash (-)" },
  { value: "TO", label: "TO" },
  { value: "⇄", label: "Vice Verca" },
] as const;

const FONT_SIZES = [8, 10, 12, 14, 16] as const;

const getDefaultTextConfig = () => ({
  text: "",
  bitmap: "",
  fontWidth: null,
  scrollType: "",
  position: "",
  scrollSpeed: null,
  fontSize: null,
  fontWeight: "",
  fontHeight: null,
  x_offset: null,
  y_offset: null,
  spacing: null,
});

const getDefaultThreeTextConfig = () => ({
  text: "",
  bitmap: "",
  fontWidth: null,
  scrollType: "",
  position: "",
  scrollSpeed: null,
  fontSize: null,
  fontWeight: "",
  fontHeight: null,
  x_offset: null,
  y_offset: null,
  spacing: null,
});

const getDefaultThreeSideTextConfig = () => ({
  text: "",
  bitmap: "",
  fontWidth: null,
  scrollType: "",
  position: "",
  scrollSpeed: null,
  fontSize: null,
  fontWeight: "",
  fontHeight: null,
  x_offset: null,
  y_offset: null,
  spacing: null,
});

const getFormatTexts = (format: ScreenFormat) => {
  switch (format) {
    case "single":
      return {
        text: getDefaultTextConfig(),
      };
    case "two":
      return {
        sideText: getDefaultTextConfig(),
        routeNumber1: getDefaultTextConfig(),
        routeNumber2: getDefaultTextConfig(),
        text: getDefaultTextConfig(),
      };
    case "three":
      return {
        sideText: { ...getDefaultThreeSideTextConfig() },
        upperHalfText: getDefaultThreeTextConfig(),
        routeNumber1: getDefaultThreeTextConfig(),
        routeNumber2: getDefaultThreeTextConfig(),
        lowerHalfText: getDefaultThreeTextConfig(),
      };
    default:
      return {};
  }
};

const getDefaultScreenConfig = (format: ScreenFormat, isEnglish: boolean) => {
  return {
    format,
    texts: getFormatTexts(format),
  };
};

const getDefaultLanguageConfig = (isEnglish: boolean) => ({
  front: getDefaultScreenConfig("single", isEnglish),
  side: getDefaultScreenConfig("single", isEnglish),
  rear: getDefaultScreenConfig("single", isEnglish),
  internal: getDefaultScreenConfig("single", isEnglish),
});

const generatePlaceholderText = (option: string, routeData: any) => {
  const parts = option.split("-");
  const processRouteNumber = (num: string) => {
    return num ? num.trim() : "";
  };

  const res = parts
    .map((part) => {
      if (part === "via") {
        return `VIA: ${routeData[part]}`;
      }
      if (part.includes("routeNumber")) {
        return processRouteNumber(routeData[part]);
      }
      if (part === "separation" && routeData[part]) {
        return ` ${routeData[part]} `;
      }
      return routeData[part] || "";
    })
    .filter(Boolean)
    .join(option === "routeNumber1-routeNumber2" ? "/" : " ");

  return res;
};

const translateText = async (text: string, targetLang: string) => {
  if (!text || text.trim() === "") return "";

  try {
    // Using Devnagri Translation API v2
    const formData = new FormData();
    formData.append("key", "devnagri_086971e80fa111f0a4e142010aa00fc7");
    formData.append("sentence", text);
    formData.append("src_lang", "en");
    formData.append("dest_lang", targetLang);

    const response = await fetch(
      "https://api.devnagri.com/machine-translation/v2/translate",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    if (data && data.translated_text) {
      return data.translated_text;
    } else {
      throw new Error("Translation failed");
    }
  } catch (error) {
    console.error("Translation error:", error);
    toast.error("Failed to translate text");
    return text;
  }
};

export const DisplayConfigForm: React.FC = () => {
  const [offsetConfigs, setOffsetConfigs] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const { areaId, depotId, isEdit, gotRouteData } = location.state || {};
  const [activeTab, setActiveTab] = useState<
    "route" | "languages" | (typeof SCREEN_TYPES)[number]
  >("route");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // API service functions
  const fetchLanguages = async () => {
    try {
      const response = await axiosInstance.get(`/languages/all`);
      // if (!response.ok) throw new Error('Failed to fetch languages');
      const data = await response.data;
      setOffsetConfigs(data);
      console.log(data);
    } catch (err) {
      console.error("Error fetching languages:", err);
    }
  };

  const createRouteMutation = useMutation({
    mutationFn: routeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      navigate("/home/routes");
      toast.success("Route created successfully!");
    },
    onError: (error) => {
      console.error("Error creating route:", error);
      toast.error("Failed to create route.");
    },
  });

  const updateRouteMutation = useMutation({
    mutationFn: ({ id, data }: { id: any; data: any }) =>
      routeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      navigate("/home/routes");
      toast.success("Route updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating route:", error);
      toast.error("Failed to update route.");
    },
  });

  const handleSave = (data: any) => {
    createRouteMutation.mutate(data);
  };

  const { register, handleSubmit, watch, setValue, control, reset } =
    useForm<DisplayConfig>({
      defaultValues: {
        route: {
          routeNumber: "",
          source: "",
          destination: "",
          via: "",
          splitRoute: false,
          routeNumber1: "",
          routeNumber2: "",
          separation: "-",
          showRt: true,
          showSpm: false,
        },
        displayConfig: {
          en: getDefaultLanguageConfig(true),
        },
        version: "1.0",
        areaId: areaId,
        depotId: depotId,
        specialMessages: [],
      },
    });

  useEffect(() => {
    console.log(isEdit, gotRouteData);

    fetchLanguages();
    if (isEdit && gotRouteData) {
      console.log(Object.keys(gotRouteData.displayConfig));
      setSelectedLanguages(Object.keys(gotRouteData.displayConfig));
      reset(gotRouteData); // ✅ Reset entire form with new data
      // const languages =
    }
  }, [isEdit, gotRouteData, reset]);

  const splitRoute = watch("route.splitRoute");
  const alldisplayconfig = watch("displayConfig");
  const isSpecialMessage = watch("route.showSpm");

  const onNewLanguageAdded = (language: string) => {
    // Extract base code by removing trailing digits
    const baseLangCode = language.replace(/\d+$/, "");

    // Now look up the offset using the base language code
    const selectedOffset = offsetConfigs.find(
      (offset) => offset.code === baseLangCode
    );
    if (!selectedOffset) return;

    const isEnglish = language === "en";

    const sides = {
      front: getDefaultScreenConfig("single", false),
      side: getDefaultScreenConfig("single", false),
      rear: getDefaultScreenConfig("single", false),
      internal: getDefaultScreenConfig("single", false),
    };

    setValue(`displayConfig.${language}`, sides);
    Object.keys(sides).forEach((screenKey) => {
      const texts = sides[screenKey].texts;
      Object.keys(texts).forEach((textKey) => {
        updateTextConfig(
          language,
          screenKey,
          textKey,
          selectedOffset,
          { texts },
          setValue
        );
      });
    });
  };

  const handleFormatChange = (
    screenKey: string,
    language: string,
    newFormat: ScreenFormat
  ) => {
    // Get the selected offset configuration for the current language
    // Extract base code by removing trailing digits
    const baseLangCode = language.replace(/\d+$/, "");

    // Now look up the offset using the base language code
    const selectedOffset = offsetConfigs.find(
      (offset) => offset.code === baseLangCode
    );
    if (!selectedOffset) return;

    // Get current text config
    const currentTexts = watch(`displayConfig.${language}.${screenKey}.texts`);
    const currentText = Object.values(currentTexts || {})[0]?.text || "";

    // Create new texts configuration based on format
    let newTexts = {};
    switch (newFormat) {
      case "single":
        newTexts = { text: getDefaultTextConfig() };
        break;
      case "two":
        newTexts = {
          sideText: getDefaultTextConfig(),
          routeNumber1: getDefaultTextConfig(),
          routeNumber2: getDefaultTextConfig(),
          text: getDefaultTextConfig(),
        };
        break;
      case "three":
        newTexts = {
          sideText: getDefaultThreeSideTextConfig(),
          routeNumber1: getDefaultThreeTextConfig(),
          routeNumber2: getDefaultThreeTextConfig(),
          upperHalfText: getDefaultThreeTextConfig(),
          lowerHalfText: getDefaultThreeTextConfig(),
        };
        break;
    }

    // Update values in the form
    setValue(`displayConfig.${language}.${screenKey}.format`, newFormat);
    setValue(`displayConfig.${language}.${screenKey}.texts`, newTexts);

    // Apply offset updates for each text field
    Object.keys(newTexts).forEach((textKey) => {
      updateTextConfig(
        language,
        screenKey,
        textKey,
        selectedOffset,
        { texts: newTexts },
        setValue
      );
    });
  };

  const handleLanguageChange = (langCode: string) => {
    const newSelectedLangs = selectedLanguages.includes(langCode)
      ? selectedLanguages.filter((lang) => lang !== langCode)
      : [...selectedLanguages, langCode];

    if (newSelectedLangs.length > 0 && newSelectedLangs.length <= 3) {
      setSelectedLanguages(newSelectedLangs);

      // Add configuration for newly added language
      if (!selectedLanguages.includes(langCode)) {
        const isEnglish = langCode === "en";
        setValue(
          `displayConfig.${langCode}`,
          getDefaultLanguageConfig(isEnglish)
        );

        // Initialize specialMessages if undefined
        let specialMessages = watch("specialMessages");
        if (specialMessages === undefined) {
          specialMessages = [];
          setValue("specialMessages", specialMessages);
        }

        // Get the offset config for this language
        const offsetConfig = offsetConfigs.find(
          (offset) => offset.code === langCode
        );
        // Use the text config from offsetConfigs if available, otherwise use default
        const textConfig = offsetConfig?.config?.text || getDefaultTextConfig();

        // Add the new language to each special message with the correct config
        const updatedSpecialMessages = specialMessages.map((message) => ({
          ...message,
          [langCode]: textConfig,
        }));
        setValue("specialMessages", updatedSpecialMessages);
      }

      // Remove configuration for removed language
      if (selectedLanguages.includes(langCode)) {
        const displayConfig = { ...watch("displayConfig") };
        delete displayConfig[langCode];
        setValue("displayConfig", displayConfig);

        // Remove the language from each special message
        const specialMessages = watch("specialMessages") || [];
        const updatedSpecialMessages = specialMessages.map((message) => {
          const { [langCode]: removed, ...rest } = message;
          return rest;
        });
        setValue("specialMessages", updatedSpecialMessages);
      }
    }
  };

  const [selectedPlaceholder, setSelectedPlaceholder] = useState("");
  const [stopScroll, setStopScroll] = useState(false);

  function getBitmapColumns(bitmap: string): number {
    if (bitmap) {
      const lines = bitmap.trim().split("\n");
      return lines.length > 0 ? lines[0].length : 0;
    }
    return 0;
  }

  function getBitmapHeight(bitmap: string): number {
    if (bitmap) {
      console.log("Bitmap:", bitmap);
      const lines = bitmap.trim().split("\n");
      console.log("Lines:", lines);
      return lines.length;
    }
    return 0;
  }

  const handlePlaceholderSelect = async (
    screenKey: string,
    textKey: string,
    language: string,
    option: string
  ) => {
    const routeData = watch("route");
    const generatedText = generatePlaceholderText(option, routeData);
    let upperText;

    if (language === "en") {
      upperText = generatedText;
    } else {
      // Improved regex to better handle separations between numbers and text
      const parts = generatedText.split(/([0-9]+[\/A-Za-z]*|[\/\-⇄]+|\s+)/g);
      const translatedParts = await Promise.all(
        parts.map(async (part) => {
          const trimmedPart = part.trim();
          // Skip empty parts
          if (!trimmedPart) return part;
          // Handle route numbers and special characters
          if (part.match(/[0-9]+[\/A-Za-z]*|[\/\-⇄]+/)) {
            return `${part}`;
          }
          // Translate non-empty text parts
          if (trimmedPart) {
            const res = await fetchTransliteration(trimmedPart, language);
            return res[0] || trimmedPart;
          }
          return part;
        })
      );
      upperText = translatedParts.join(" ").replace(/\s+/g, " ").trim();
    }

    setValue(
      `displayConfig.${language}.${screenKey}.texts.${textKey}.text`,
      upperText
    );
    // setValue(
    // 	`displayConfig.${language}.${screenKey}.texts.${textKey}.bitmap.bitmap`,
    // 	upperText
    // );
  };

  const renderRouteTab = () => (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-xl bold mb-4 text-gray-800">Route Information</h3>
      <div className="flex gap-4 justify-between items-center">
        <div className="flex mb-4 items-center">
          <input
            type="checkbox"
            {...register("route.splitRoute")}
            id="splitRoute"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded uppercase"
          />
          <label
            htmlFor="splitRoute"
            className="ml-2 block text-sm text-gray-900"
          >
            Split Route
          </label>
        </div>
        <div className="flex flex-row gap-4 ">
          <div className="flex mb-4 items-center">
            <input
              type="checkbox"
              {...register("route.showRt")}
              id="isSpecialMessage"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded uppercase"
            />
            <label
              htmlFor="isSpecialMessage"
              className="ml-2 block text-sm text-gray-900"
            >
              Show Route Info
            </label>
          </div>
          <div className="flex mb-4 items-center">
            <input
              type="checkbox"
              {...register("route.showSpm")}
              id="isSpecialMessage"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded uppercase"
            />
            <label
              htmlFor="isSpecialMessage"
              className="ml-2 block text-sm text-gray-900"
            >
              Show Special Messages
            </label>
          </div>
        </div>
      </div>

      {/* Conditional Split Route Fields */}
      {splitRoute && (
        <div className="mt-4 grid grid-cols-1 mb-4 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Route Number 1
            </label>
            <input
              required
              {...register("route.routeNumber1")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter first route number"
              maxLength={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Route Number 2
            </label>
            <input
              required
              {...register("route.routeNumber2")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter second route number"
              maxLength={4}
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!splitRoute && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Route Number
            </label>
            <input
              required
              {...register("route.routeNumber")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter route number"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Source
          </label>
          <input
            required
            {...register("route.source")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={"Enter source location"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Destination
          </label>
          <input
            required
            {...register("route.destination")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter destination location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Via
          </label>
          <input
            {...register("route.via")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Dont add comma for stops use space instead"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Separator
          </label>
          <select
            {...register("route.separation")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {ROUTE_SEPARATORS.map((sep) => (
              <option key={sep.value} value={sep.value}>
                {sep.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderLanguagesTab = () => {
    const handleLanguageSelect = (index: number, langCode: string) => {
      const newSelectedLangs = [...selectedLanguages];
      const baseCode = langCode;

      // Get base codes of other selected languages (excluding current index)
      const otherBaseCodes = newSelectedLangs
        .filter((_, i) => i !== index)
        .filter(Boolean) // remove empty/null
        .map((code) => code.replace(/\d+$/, ""));

      // Count how many times this baseCode already exists
      const count = otherBaseCodes.filter((code) => code === baseCode).length;

      // Add suffix only if it already exists
      const finalLangCode = count === 0 ? baseCode : `${baseCode}${count}`;

      newSelectedLangs[index] = finalLangCode;
      setSelectedLanguages(newSelectedLangs);

      if (langCode === "") {
        const prevLangCode = selectedLanguages[index];
        if (prevLangCode) {
          const displayConfig = { ...watch("displayConfig") };
          delete displayConfig[prevLangCode];
          setValue("displayConfig", displayConfig);
        }
      }
    };

    // Helper to format display name from code (e.g., "en2" → "English (2)")
    const getDisplayName = (code: string): string => {
      const baseCode = code.replace(/\d+$/, "");
      const suffix = code.slice(baseCode.length);
      const lang = AVAILABLE_LANGUAGES.find((l) => l.code === baseCode);
      const name = lang?.name || baseCode;
      return suffix ? `${name} (${suffix})` : name;
    };

    return (
      <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-xl bold mb-4 text-gray-800">Language Selection</h3>
        <div className="mb-4 grid grid-cols-6 gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex flex-col">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Language {index + 1}
              </label>
              <select
                value={selectedLanguages[index] || ""}
                onChange={(e) => handleLanguageSelect(index, e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Language</option>

                {/* Show all base languages */}
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}

                {/* Include current value if it has a suffix and isn't already listed */}
                {(() => {
                  const selectedCode = selectedLanguages[index];
                  const isCustom =
                    selectedCode &&
                    !AVAILABLE_LANGUAGES.find((l) => l.code === selectedCode);
                  return isCustom ? (
                    <option value={selectedCode}>
                      {getDisplayName(selectedCode)}
                    </option>
                  ) : null;
                })()}
              </select>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const fetchTransliteration = async (
    text: string,
    langCode: string = "hi"
  ) => {
    
    try {
      const baseLangCode = langCode.replace(/\d+$/, "");
      console.log("Original langCode:", langCode);
      console.log("Base langCode used:", baseLangCode);
      const response = await fetch(
        `https://inputtools.google.com/request?text=${encodeURIComponent(
          text
        )}&itc=${baseLangCode}-t-i0-und&num=5&ie=utf-8&oe=utf-8&app=customApp`
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

  const [frontBoardCols, setFrontBoardCols] = useState<96 | 160>(160);

  const handleFrontBoardColsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFrontBoardCols(Number(event.target.value) as 96 | 160);
  };

  const getColumnsByBoard = (boardType, format) => {
    switch (boardType) {
      case "front":
        return getFormatByScreen(frontBoardCols, format);
      case "side":
        return getFormatByScreen(96, format);
      case "rear":
        return getFormatByScreen(96, format);
      default:
        return getFormatByScreen(112, format);
    }
  };

  const getFormatByScreen = (cols, format) => {
    switch (format) {
      case "single":
        return cols;
      case "two":
        return cols;
      case "three":
        return cols;
      default:
        return cols;
    }
  };

  const updateSpecialMessageConfig = (
    language: string,
    messageIndex: number,
    selectedOffset: any,
    setValue: any
  ) => {
    // Get the correct text configuration from selectedOffset.config
    const textConfig = selectedOffset?.config?.text || {};

    // Existing values from specialMessages
    const existingValues =
      watch(`specialMessages.${messageIndex}.${language}`) ?? {};

    // Function to check if a field needs to be updated
    const shouldUpdate = (value: any, defaultValue: any) => {
      return value === undefined || value === "" || value === defaultValue;
    };

    // List of fields to update
    const fieldsToUpdate = [
      "fontHeight",
      "x_offset",
      "y_offset",
      "spacing",
      "scrollSpeed",
      "scrollType",
      "fontSize",
      "position",
      "fontWeight",
    ];

    fieldsToUpdate.forEach((field) => {
      const existingValue = existingValues[field];
      const newValue = textConfig[field];

      if (shouldUpdate(existingValue, null)) {
        setValue(
          `specialMessages.${messageIndex}.${language}.${field}`,
          newValue
        );
      }
    });
  };

  // Helper function to check and update values
  const updateTextConfig = (
    language: string,
    screenKey: string,
    textKey: string,
    selectedOffset: any,
    screenConfig: any,
    setValue: any
  ) => {
    console.log("got lang", language);

    // Get the correct text key's configuration from selectedOffset.config
    const textConfig = selectedOffset?.config?.[textKey] || {};

    // Existing values from screenConfig (if any)
    const existingValues = screenConfig?.texts?.[textKey] ?? {};

    // Function to check if a field needs to be updated
    const shouldUpdate = (value: any, defaultValue: any) => {
      return value === undefined || value === "" || value === defaultValue;
    };

    // List of fields to update
    const fieldsToUpdate = [
      "fontHeight",
      "x_offset",
      "y_offset",
      "spacing",
      "scrollSpeed",
      "scrollType",
      "fontSize",
      "position",
      "fontWeight",
    ];

    fieldsToUpdate.forEach((field) => {
      const existingValue = existingValues[field];
      const newValue = textConfig[field];

      if (shouldUpdate(existingValue, null)) {
        setValue(
          `displayConfig.${language}.${screenKey}.texts.${textKey}.${field}`,
          newValue
        );
      }
    });
  };

  // useEffect to apply updates
  useEffect(() => {
    console.log("Selected Languages:", selectedLanguages);
    console.log("alldisplayconfig:", alldisplayconfig);
    if (offsetConfigs.length > 0) {
      selectedLanguages.forEach((language) => {
        const getBaseLangCode = (code: string) => code.replace(/\d+$/, "");

        const selectedOffset = offsetConfigs.find(
          (offset) => offset.code === getBaseLangCode(language)
        );
        if (!selectedOffset) return;

        SCREEN_TYPES.forEach((screenKey) => {
          const displayConfig = watch(`displayConfig.${language}`);
          if (!displayConfig) {
            // Initialize configuration for this language if it doesn't exist
            onNewLanguageAdded(language);
          }
          const screenConfig = watch(`displayConfig.${language}.${screenKey}`);

          if (screenConfig?.texts) {
            Object.keys(screenConfig.texts).forEach((textKey) => {
              updateTextConfig(
                language,
                screenKey,
                textKey,
                selectedOffset,
                screenConfig,
                setValue
              );
            });
          }
        });
      });
    }
  }, [selectedLanguages, offsetConfigs, setValue, watch, alldisplayconfig]);

  const getFontFileByLanguage = (
    lang: string,
    key: string,
    fontHeight: number
  ) => {
    console.log("Font Height:", fontHeight);
    console.log("Language:", lang);
    console.log("Key:", key);

    const langObj = offsetConfigs.find((language) => language.code === lang);
    console.log("Language Object:", langObj);
    if (fontHeight <= 8) {
      return langObj ? langObj.config[key].fontFamily8 : "Arial";
    }
    return langObj ? langObj.config[key].fontFamily16 : "Arial"; // Default to 'Arial' if not found
  };

  const getFontFamilyByLanguage = (language: string) => {
    const langObj = offsetConfigs.find((lang) => lang.code === language);
    return langObj ? langObj.fontFamily : "Arial"; // Default to 'Arial' if not found
  };

  const renderScreenTab = (screenKey: (typeof SCREEN_TYPES)[number]) => {
    const displayConfig = watch("displayConfig");
    const routeData = watch("route");

    return (
      <div className="  bg-whites p-2 rounded-xl">
        <h3 className="text-md font-semibold mb-4 text-gray-900 capitalize">
          {screenKey} Board Configuration
        </h3>

        <AccordionRoot collapsible>
          {selectedLanguages.map((language) => {
            const isEnglish = language === "en";

            // // Initialize configuration for this language if it doesn't exist
            // if (!displayConfig[language]) {
            // 	onNewLanguageAdded(language);
            // }

            console.log("Display Config:", displayConfig);

            const screenConfig = displayConfig[language]?.[screenKey];
            const routePosition =
              screenConfig?.texts?.sideText?.position || "left";
            if (!screenConfig || !screenConfig.texts) return null;

            const baseLangCode = language.replace(/\d+$/, "");
            const suffix = language.slice(baseLangCode.length);

            const lang = AVAILABLE_LANGUAGES.find(
              (l) => l.code === baseLangCode
            );
            const langName = lang
              ? suffix
                ? `${lang.name} (${suffix})`
                : lang.name
              : language.toUpperCase();

            return (
              <AccordionItem
                className="py-2 bg-white rounded-xl  mb-4 border px-4 bg-gray-00   "
                key={language}
                value={language}
              >
                <AccordionItemTrigger>
                  <span className="text-md py-2 font-semibold text-gray-500">
                    {langName}
                  </span>
                </AccordionItemTrigger>
                <AccordionItemContent className="bg-neutral-20  p-2 flex flex-col gap-4 items-start">
                  {/* <span>
										Showing 16 x{' '}
										{getColumnsByBoard(activeTab, screenConfig.format)} Board
									</span> */}
                  <div className="flex  w-full items-center gap-2">
                    {screenKey === "front" && (
                      <div className="flex w-[30%] items-end gap-4">
                        <div className="mb-2 font-semibold">
                          Select Board Width:
                        </div>

                        <select
                          className="border p-1 rounded"
                          value={frontBoardCols}
                          onChange={(e) =>
                            setFrontBoardCols(
                              Number(e.target.value) as 96 | 160
                            )
                          }
                        >
                          <option value={96}>96</option>
                          <option value={160}>160</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => setStopScroll((value) => !value)}
                          className={` ${
                            stopScroll ? "bg-green-500" : "bg-red-500"
                          }  text-red-50 py-2 px-4 text-sm font-medium rounded-md`}
                        >
                          {!stopScroll ? "Pause" : "Play"} Simulation
                        </button>
                      </div>
                    )}

                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Format
                    </label>
                    <select
                      value={screenConfig.format || "single"}
                      onChange={(e) =>
                        handleFormatChange(
                          screenKey,
                          language,
                          e.target.value as ScreenFormat
                        )
                      }
                      className="w-[30%] p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {FORMATS.map((format) => (
                        <option key={format.value} value={format.value}>
                          {format.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col-reverse items-start gap-4">
                    {!isSubmitting && screenConfig.format === "single" && (
                      <div className="p-2   bg-neutral-800  border-2 rounded-xl border-neutral-800">
                        <LEDBitmapSimulator
                          stopScroll={stopScroll}
                          rows={16}
                          cols={getColumnsByBoard(
                            activeTab,
                            screenConfig.format
                          )}
                          text={displayConfig[language][screenKey].texts.text}
                          fontFamily={getFontFileByLanguage(
                            language,
                            "text",
                            displayConfig[language][screenKey].texts.text
                              .fontHeight
                          )}
                          onBitmapTextChange={(text) => {
                            setValue(
                              `displayConfig.${language}.${screenKey}.texts.text.bitmap`,
                              text
                            );

                            setValue(
                              `displayConfig.${language}.${screenKey}.texts.text.fontWidth`,
                              getBitmapColumns(text)
                            );
                          }}
                        />
                      </div>
                    )}

                    {!isSubmitting && screenConfig.format === "two" && (
                      <div className="p-2 bg-neutral-800  border-2 rounded-xl border-neutral-800">
                        <div
                          className={`flex ${
                            routePosition === "Right"
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          {routeData.splitRoute ? (
                            <div className="flex flex-col">
                              <LEDBitmapSimulator
                                stopScroll={stopScroll}
                                rows={8}
                                cols={
                                  Math.max(
                                    getBitmapColumns(
                                      watch(
                                        `displayConfig.${language}.${screenKey}.texts.routeNumber1.bitmap`
                                      )
                                    ),
                                    getBitmapColumns(
                                      watch(
                                        `displayConfig.${language}.${screenKey}.texts.routeNumber2.bitmap`
                                      )
                                    )
                                  ) + 1
                                }
                                text={
                                  displayConfig[language][screenKey].texts
                                    .routeNumber1
                                }
                                fontFamily={getFontFileByLanguage(
                                  language,
                                  "routeNumber1",
                                  displayConfig[language][screenKey].texts
                                    .routeNumber1.fontHeight
                                )}
                                onBitmapTextChange={(text) => {
                                  setValue(
                                    `displayConfig.${language}.${screenKey}.texts.routeNumber1.bitmap`,
                                    text
                                  );

                                  setValue(
                                    `displayConfig.${language}.${screenKey}.texts.routeNumber1.fontWidth`,
                                    getBitmapColumns(text)
                                  );
                                }}
                              />
                              <LEDBitmapSimulator
                                stopScroll={stopScroll}
                                rows={8}
                                cols={
                                  Math.max(
                                    getBitmapColumns(
                                      watch(
                                        `displayConfig.${language}.${screenKey}.texts.routeNumber1.bitmap`
                                      )
                                    ),
                                    getBitmapColumns(
                                      watch(
                                        `displayConfig.${language}.${screenKey}.texts.routeNumber2.bitmap`
                                      )
                                    )
                                  ) + 1
                                }
                                text={
                                  displayConfig[language][screenKey].texts
                                    .routeNumber2
                                }
                                fontFamily={getFontFileByLanguage(
                                  language,
                                  "routeNumber2",
                                  displayConfig[language][screenKey].texts
                                    .routeNumber2.fontHeight
                                )}
                                onBitmapTextChange={(text) => {
                                  setValue(
                                    `displayConfig.${language}.${screenKey}.texts.routeNumber2.bitmap`,
                                    text
                                  );

                                  setValue(
                                    `displayConfig.${language}.${screenKey}.texts.routeNumber2.fontWidth`,
                                    getBitmapColumns(text)
                                  );
                                }}
                              />
                            </div>
                          ) : (
                            <LEDBitmapSimulator
                              stopScroll={stopScroll}
                              rows={16}
                              cols={
                                getBitmapColumns(
                                  watch(
                                    `displayConfig.${language}.${screenKey}.texts.sideText.bitmap`
                                  )
                                ) + 1
                              }
                              text={
                                displayConfig[language][screenKey].texts
                                  .sideText
                              }
                              fontFamily={getFontFileByLanguage(
                                language,
                                "sideText",
                                displayConfig[language][screenKey].texts
                                  .sideText.fontHeight
                              )}
                              onBitmapTextChange={(text) => {
                                setValue(
                                  `displayConfig.${language}.${screenKey}.texts.sideText.bitmap`,
                                  text
                                );

                                setValue(
                                  `displayConfig.${language}.${screenKey}.texts.sideText.fontWidth`,
                                  getBitmapColumns(text)
                                );
                              }}
                            />
                          )}

                          <LEDBitmapSimulator
                            stopScroll={stopScroll}
                            rows={16}
                            cols={
                              getColumnsByBoard(
                                activeTab,
                                screenConfig.format
                              ) -
                              (splitRoute
                                ? Math.max(
                                    getBitmapColumns(
                                      watch(
                                        `displayConfig.${language}.${screenKey}.texts.routeNumber1.bitmap`
                                      )
                                    ),
                                    getBitmapColumns(
                                      watch(
                                        `displayConfig.${language}.${screenKey}.texts.routeNumber2.bitmap`
                                      )
                                    )
                                  )
                                : getBitmapColumns(
                                    watch(
                                      `displayConfig.${language}.${screenKey}.texts.sideText.bitmap`
                                    )
                                  ))
                            }
                            text={displayConfig[language][screenKey].texts.text}
                            fontFamily={getFontFileByLanguage(
                              language,
                              "text",
                              displayConfig[language][screenKey].texts.text
                                .fontHeight
                            )}
                            onBitmapTextChange={(text) => {
                              setValue(
                                `displayConfig.${language}.${screenKey}.texts.text.bitmap`,
                                text
                              );

                              setValue(
                                `displayConfig.${language}.${screenKey}.texts.text.fontWidth`,
                                getBitmapColumns(text)
                              );
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {!isSubmitting && screenConfig.format === "three" && (
                      <div className="p-2 bg-neutral-800  border-2 rounded-xl border-neutral-800">
                        <div
                          className={`flex ${
                            routePosition === "Right"
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          {routeData.splitRoute ? (
                            <div className="flex flex-col">
                              <LEDBitmapSimulator
                                stopScroll={stopScroll}
                                rows={8}
                                cols={
                                  Math.max(
                                    getBitmapColumns(
                                      watch(
                                        `displayConfig.${language}.${screenKey}.texts.routeNumber1.bitmap`
                                      )
                                    ),
                                    getBitmapColumns(
                                      watch(
                                        `displayConfig.${language}.${screenKey}.texts.routeNumber2.bitmap`
                                      )
                                    )
                                  ) + 1
                                }
                                text={
                                  displayConfig[language][screenKey].texts
                                    .routeNumber1
                                }
                                fontFamily={getFontFileByLanguage(
                                  language,
                                  "routeNumber1",
                                  displayConfig[language][screenKey].texts
                                    .routeNumber1.fontHeight
                                )}
                                onBitmapTextChange={(text) => {
                                  setValue(
                                    `displayConfig.${language}.${screenKey}.texts.routeNumber1.bitmap`,
                                    text
                                  );

                                  setValue(
                                    `displayConfig.${language}.${screenKey}.texts.routeNumber1.fontWidth`,
                                    getBitmapColumns(text)
                                  );
                                }}
                              />
                              <LEDBitmapSimulator
                                stopScroll={stopScroll}
                                rows={8}
                                cols={
                                  Math.max(
                                    getBitmapColumns(
                                      watch(
                                        `displayConfig.${language}.${screenKey}.texts.routeNumber1.bitmap`
                                      )
                                    ),
                                    getBitmapColumns(
                                      watch(
                                        `displayConfig.${language}.${screenKey}.texts.routeNumber2.bitmap`
                                      )
                                    )
                                  ) + 1
                                }
                                text={
                                  displayConfig[language][screenKey].texts
                                    .routeNumber2
                                }
                                fontFamily={getFontFileByLanguage(
                                  language,
                                  "routeNumber2",
                                  displayConfig[language][screenKey].texts
                                    .routeNumber2.fontHeight
                                )}
                                onBitmapTextChange={(text) => {
                                  setValue(
                                    `displayConfig.${language}.${screenKey}.texts.routeNumber2.bitmap`,
                                    text
                                  );

                                  setValue(
                                    `displayConfig.${language}.${screenKey}.texts.routeNumber2.fontWidth`,
                                    getBitmapColumns(text)
                                  );
                                }}
                              />
                            </div>
                          ) : (
                            <LEDBitmapSimulator
                              stopScroll={stopScroll}
                              rows={16}
                              cols={
                                getBitmapColumns(
                                  watch(
                                    `displayConfig.${language}.${screenKey}.texts.sideText.bitmap`
                                  )
                                ) + 1
                              }
                              text={
                                displayConfig[language][screenKey].texts
                                  .sideText
                              }
                              fontFamily={getFontFileByLanguage(
                                language,
                                "sideText",
                                displayConfig[language][screenKey].texts
                                  .sideText.fontHeight
                              )}
                              onBitmapTextChange={(text) => {
                                setValue(
                                  `displayConfig.${language}.${screenKey}.texts.sideText.bitmap`,
                                  text
                                );

                                setValue(
                                  `displayConfig.${language}.${screenKey}.texts.sideText.fontWidth`,
                                  getBitmapColumns(text)
                                );
                              }}
                            />
                          )}
                          <div className="flex flex-col">
                            <LEDBitmapSimulator
                              stopScroll={stopScroll}
                              rows={8}
                              cols={
                                getColumnsByBoard(
                                  activeTab,
                                  screenConfig.format
                                ) -
                                getBitmapColumns(
                                  watch(
                                    `displayConfig.${language}.${screenKey}.texts.sideText.bitmap`
                                  )
                                )
                              }
                              text={
                                displayConfig[language][screenKey].texts
                                  .upperHalfText
                              }
                              fontFamily={getFontFileByLanguage(
                                language,
                                "upperHalfText",
                                displayConfig[language][screenKey].texts
                                  .upperHalfText.fontHeight
                              )}
                              onBitmapTextChange={(text) => {
                                setValue(
                                  `displayConfig.${language}.${screenKey}.texts.upperHalfText.bitmap`,
                                  text
                                );

                                setValue(
                                  `displayConfig.${language}.${screenKey}.texts.upperHalfText.fontWidth`,
                                  getBitmapColumns(text)
                                );
                              }}
                            />
                            <LEDBitmapSimulator
                              stopScroll={stopScroll}
                              rows={8}
                              cols={
                                getColumnsByBoard(
                                  activeTab,
                                  screenConfig.format
                                ) -
                                getBitmapColumns(
                                  watch(
                                    `displayConfig.${language}.${screenKey}.texts.sideText.bitmap`
                                  )
                                )
                              }
                              text={
                                displayConfig[language][screenKey].texts
                                  .lowerHalfText
                              }
                              fontFamily={getFontFileByLanguage(
                                language,
                                "lowerHalfText",
                                displayConfig[language][screenKey].texts
                                  .lowerHalfText.fontHeight
                              )}
                              onBitmapTextChange={(text) => {
                                setValue(
                                  `displayConfig.${language}.${screenKey}.texts.lowerHalfText.bitmap`,
                                  text
                                );

                                setValue(
                                  `displayConfig.${language}.${screenKey}.texts.lowerHalfText.fontWidth`,
                                  getBitmapColumns(text)
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2 w-full grid-cols-2">
                    {Object.entries(screenConfig.texts).map(
                      ([textKey, textConfig]) => {
                        if (
                          (!splitRoute && textKey === "routeNumber1") ||
                          (!splitRoute && textKey === "routeNumber2")
                        ) {
                          return null; // Skip rendering for routeNumber1 and routeNumber2 if not splitRoute
                        }

                        if (splitRoute && textKey === "sideText") {
                          return null; // Skip rendering for sideText if splitRoute
                        }
                        return (
                          <div
                            key={`${language}-${textKey}`}
                            className="border p-4   rounded-lg "
                          >
                            <h4 className="font-semibold mb-2 text-gray-700 capitalize">
                              {textKey}
                            </h4>

                            <div className="mb-4 items-start flex gap-2">
                              <MenuRoot
                                onSelect={(e) =>
                                  handlePlaceholderSelect(
                                    screenKey,
                                    textKey,
                                    language,
                                    e.value
                                  )
                                }
                              >
                                <MenuTrigger asChild>
                                  <Button
                                    className="px-3 h-10 bg-white rounded-md border"
                                    size="sm"
                                  >
                                    Select Text To Display
                                    <LuChevronDown />
                                  </Button>
                                </MenuTrigger>
                                <MenuContent>
                                  {PLACEHOLDER_OPTIONS.map((option) => (
                                    <MenuItem value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </MenuContent>
                              </MenuRoot>

                              <Controller
                                key={`${language}-${screenKey}-${textKey}`}
                                name={`displayConfig.${language}.${screenKey}.texts.${textKey}.text`}
                                control={control}
                                render={({ field }) => (
                                  <IMEInput langCode={language} {...field} />
                                )}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const text = watch(
                                    `displayConfig.${language}.${screenKey}.texts.${textKey}.text`
                                  );
                                  navigator.clipboard.writeText(text);
                                  // alert(`${text} copied to clipboard`)
                                }}
                                className="h-10 px-3 bg-white border hover:bg-neutral-200 rounded-md"
                                title="Copy text"
                              >
                                <LuCopy className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const text = watch(
                                    `displayConfig.${language}.${screenKey}.texts.${textKey}.text`
                                  );
                                  const clipboardText =
                                    await navigator.clipboard.readText();
                                  setValue(
                                    `displayConfig.${language}.${screenKey}.texts.${textKey}.text`,
                                    clipboardText
                                  );
                                  // alert(`${text} copied to clipboard`)
                                }}
                                className="h-10 px-3 bg-white border hover:bg-neutral-200 rounded-md"
                                title="Paste text"
                              >
                                <LuClipboardPaste className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="grid grid-cols-5 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Scroll Type
                                </label>
                                <select
                                  {...register(
                                    `displayConfig.${language}.${screenKey}.texts.${textKey}.scrollType`
                                  )}
                                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {SCROLL_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Position
                                </label>
                                <select
                                  {...register(
                                    `displayConfig.${language}.${screenKey}.texts.${textKey}.position`
                                  )}
                                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {POSITIONS.filter(
                                    (pos) =>
                                      !(
                                        textKey.includes("sideText") &&
                                        pos === "Center"
                                      )
                                  ).map((pos) => (
                                    <option key={pos} value={pos}>
                                      {pos}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  {displayConfig[language][screenKey].texts[
                                    textKey
                                  ]?.scrollType === "Fixed"
                                    ? "Duration"
                                    : "Scroll Speed"}
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={10}
                                  {...register(
                                    `displayConfig.${language}.${screenKey}.texts.${textKey}.scrollSpeed`
                                  )}
                                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Font Weight
                                </label>

                                <select
                                  {...register(
                                    `displayConfig.${language}.${screenKey}.texts.${textKey}.fontWeight`
                                  )}
                                  defaultValue={"Regular"}
                                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {FONT_WEIGHT.map((weight) => (
                                    <option
                                      key={weight.value}
                                      value={weight.value}
                                    >
                                      {weight.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Font Height
                                </label>
                                <select
                                  {...register(
                                    `displayConfig.${language}.${screenKey}.texts.${textKey}.fontHeight`
                                  )}
                                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {Array.from(
                                    { length: 11 },
                                    (_, i) => i + 6
                                  ).map((height) => (
                                    <option key={height} value={height}>
                                      {height}
                                    </option>
                                  ))}
                                </select>
                              </div> */}

                              <Controller
                                key={`${language}-${screenKey}-${textKey}-fontHeight`}
                                name={`displayConfig.${language}.${screenKey}.texts.${textKey}.fontHeight`}
                                control={control}
                                render={({ field }) => (
                                  <FontHeightInput
                                    bitmap={getBitmapHeight(
                                      displayConfig[language][screenKey].texts[
                                        textKey
                                      ].bitmap
                                    )}
                                    {...field}
                                  />
                                )}
                              />

                              {/* <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Thresshold
                                </label>
                                <input
                                  type="number"
                                  {...register(
                                    `displayConfig.${language}.${screenKey}.texts.${textKey}.spacing`
                                  )}
                                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div> */}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </AccordionItemContent>
              </AccordionItem>
            );
          })}
        </AccordionRoot>
      </div>
    );
  };

  const renderSpecialMessagesTab = () => {
    const specialMessages = watch("specialMessages") || [];
    const MAX_SPECIAL_MESSAGES = 10;

    const handleAddSpecialMessage = () => {
      if (specialMessages.length >= MAX_SPECIAL_MESSAGES) {
        toast.error(
          `Maximum limit of ${MAX_SPECIAL_MESSAGES} special messages reached`
        );
        return;
      }

      const newMessage = {
        front: {
          show: false,
          repeat: 1,
        },
        side: {
          show: false,
          repeat: 1,
        },
        rear: {
          show: false,
          repeat: 1,
        },
        internal: {
          show: false,
          repeat: 1,
        },
        ...selectedLanguages.reduce((acc, lang) => {
          // Get the offset config for this language
          const offsetConfig = offsetConfigs.find(
            (offset) => offset.code === lang
          );
          // Use the text config from offsetConfigs if available, otherwise use default
          const textConfig =
            offsetConfig?.config?.text || getDefaultTextConfig();
          acc[lang] = { ...textConfig, text: "SPECIAL MESSAGE" };
          return acc;
        }, {}),
      };
      const currentMessages = watch("specialMessages") || [];
      setValue("specialMessages", [...currentMessages, newMessage]);
    };

    const handleDeleteSpecialMessage = (index: number) => {
      const currentMessages = watch("specialMessages") || [];
      const updatedMessages = currentMessages.filter((_, i) => i !== index);
      setValue("specialMessages", updatedMessages);
    };

    const handleScreenToggle = (
      messageIndex: number,
      screen: "front" | "side" | "rear" | "internal"
    ) => {
      const currentMessages = watch("specialMessages") || [];
      const currentValue = currentMessages[messageIndex]?.[screen] || false;
      const updatedMessages = [...currentMessages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        [screen]: !currentValue,
      };
      setValue("specialMessages", updatedMessages);
    };

    return (
      <div className="bg-white p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-semibold text-gray-900">
            Special Messages Configuration
          </h3>
          <button
            type="button"
            onClick={handleAddSpecialMessage}
            disabled={specialMessages.length >= MAX_SPECIAL_MESSAGES}
            className={`px-4 text-sm py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              specialMessages.length >= MAX_SPECIAL_MESSAGES
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-700 text-white"
            }`}
          >
            Add Special Message
          </button>
        </div>

        {specialMessages.map((message, index) => (
          <AccordionRoot multiple key={index} className="mb-4">
            <AccordionItem
              value={`message-${index}`}
              className="bg-white rounded-xl shadow border px-4 py-4"
            >
              <div className="flex justify-between items-center">
                <AccordionItemTrigger>
                  <span className="text-md py-2 font-bold text-gray-900">
                    {!message?.["en"]?.text || message["en"]?.text === ""
                      ? `Special Message ${index + 1}`
                      : message["en"].text}
                  </span>
                </AccordionItemTrigger>
                <button
                  type="button"
                  onClick={() => handleDeleteSpecialMessage(index)}
                  className="p-2 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                  title="Delete message"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <AccordionItemContent>
                <div className="mb-4">
                  <label className="block text-sm   text-gray-600 mb-4">
                    Display On Screens
                  </label>
                  <div className="grid grid-cols-12 gap-4">
                    {["front", "side", "rear", "internal"].map((screen) => (
                      <div className="space-y-4 bg-neutral-100 p-4 rounded-lg border">
                        <div key={screen} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`${index}-${screen}`}
                            checked={watch(
                              `specialMessages.${index}.${screen}.show`
                            )}
                            {...register(
                              `specialMessages.${index}.${screen}.show`
                            )}
                            onChange={() =>
                              handleScreenToggle(
                                index,
                                screen as "front" | "side" | "rear" | "internal"
                              )
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`${index}-${screen}`}
                            className="ml-2 block text-sm text-gray-900 capitalize"
                          >
                            {screen}
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Repeat Count
                          </label>
                          <input
                            type="number"
                            {...register(
                              `specialMessages.${index}.${screen}.repeat`
                            )}
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <AccordionRoot>
                  {selectedLanguages.map((language) => {
                    const baseLangCode = language.replace(/\d+$/, "");
                    const suffix = language.slice(baseLangCode.length);

                    const lang = AVAILABLE_LANGUAGES.find(
                      (l) => l.code === baseLangCode
                    );
                    const langName = lang
                      ? suffix
                        ? `${lang.name} (${suffix})`
                        : lang.name
                      : language.toUpperCase();
                    return (
                      <AccordionItem
                        className="py-2 bg-white rounded-xl shadow mb-4 border px-4"
                        key={language}
                        value={language}
                      >
                        <AccordionItemTrigger>
                          <span className="text-md py-2 font-semibold text-gray-500">
                            {langName}
                          </span>
                        </AccordionItemTrigger>
                        <AccordionItemContent className="bg-neutral-20 flex flex-col items-start p-2">
                          {watch(
                            `specialMessages.${index}.${language}.previewBoard`
                          ) && (
                            <div className="flex items-start gap-2 mb-4">
                              <div className="p-2 bg-neutral-800 border-2  rounded-xl border-neutral-800">
                                <LEDBitmapSimulator
                                  stopScroll={stopScroll}
                                  rows={16}
                                  cols={getColumnsByBoard(
                                    watch(
                                      `specialMessages.${index}.${language}.previewBoard`
                                    ),
                                    "single"
                                  )}
                                  text={watch(
                                    `specialMessages.${index}.${language}`
                                  )}
                                  fontFamily={getFontFileByLanguage(
                                    language,
                                    "text",
                                    16
                                  )}
                                  onBitmapTextChange={(text) => {
                                    setValue(
                                      `specialMessages.${index}.${language}.bitmap`,
                                      text
                                    );

                                    setValue(
                                      `specialMessages.${index}.${language}.fontWidth`,
                                      getBitmapColumns(text)
                                    );
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setStopScroll((value) => !value)}
                                className={` ${
                                  stopScroll ? "bg-green-500" : "bg-red-500"
                                }  text-red-50 py-2 px-4 text-sm font-medium rounded-md`}
                              >
                                {!stopScroll ? "Pause" : "Play"} Simulation
                              </button>
                            </div>
                          )}
                          <div className="grid grid-cols-9 gap-4 items-start">
                            <div className="w-full col-span-9">
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Text
                              </label>
                              <div className="flex gap-2">
                                <Controller
                                  name={`specialMessages.${index}.${language}.text`}
                                  control={control}
                                  render={({ field }) => (
                                    <IMEInput langCode={language} {...field} />
                                  )}
                                />
                                {language !== "en" && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const englishText = watch(
                                        `specialMessages.${index}.en.text`
                                      );
                                      if (
                                        englishText &&
                                        englishText.trim() !== ""
                                      ) {
                                        toast.info(
                                          `Translating to ${
                                            AVAILABLE_LANGUAGES.find(
                                              (l) => l.code === language
                                            )?.name
                                          }...`,
                                          {
                                            autoClose: false,
                                            toastId: `translating-special-${index}-${language}`,
                                          }
                                        );
                                        try {
                                          const translatedText =
                                            await translateText(
                                              englishText,
                                              language
                                            );
                                          setValue(
                                            `specialMessages.${index}.${language}.text`,
                                            translatedText
                                          );
                                          toast.dismiss(
                                            `translating-special-${index}-${language}`
                                          );
                                          toast.success(
                                            `Translated to ${
                                              AVAILABLE_LANGUAGES.find(
                                                (l) => l.code === language
                                              )?.name
                                            }`
                                          );
                                        } catch (error) {
                                          toast.dismiss(
                                            `translating-special-${index}-${language}`
                                          );
                                          toast.error(
                                            `Failed to translate to ${
                                              AVAILABLE_LANGUAGES.find(
                                                (l) => l.code === language
                                              )?.name
                                            }`
                                          );
                                        }
                                      } else {
                                        toast.warning(
                                          "Please enter English text first"
                                        );
                                      }
                                    }}
                                    className="h-10 px-3 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                                    disabled={
                                      !watch(`specialMessages.${index}.en.text`)
                                    }
                                  >
                                    Translate from English
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="w-full col-span-9">
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Preview Board
                              </label>
                              <select
                                value={
                                  watch(
                                    `specialMessages.${index}.${language}.previewBoard`
                                  ) || ""
                                }
                                onChange={(e) =>
                                  setValue(
                                    `specialMessages.${index}.${language}.previewBoard`,
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="">Select Board</option>
                                {["front", "side", "rear", "internal"].map(
                                  (screen) =>
                                    watch(
                                      `specialMessages.${index}.${screen}`
                                    ) && (
                                      <option key={screen} value={screen}>
                                        {screen.charAt(0).toUpperCase() +
                                          screen.slice(1)}{" "}
                                        Board
                                      </option>
                                    )
                                )}
                              </select>
                            </div>

                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Scroll Type
                              </label>
                              <select
                                {...register(
                                  `specialMessages.${index}.${language}.scrollType`
                                )}
                                className="w-full p-2 border rounded-md"
                              >
                                {SCROLL_TYPES.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Position
                              </label>
                              <select
                                {...register(
                                  `specialMessages.${index}.${language}.position`
                                )}
                                className="w-full p-2 border rounded-md"
                              >
                                {POSITIONS.map((pos) => (
                                  <option key={pos} value={pos}>
                                    {pos}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Scroll Speed
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={10}
                                {...register(
                                  `specialMessages.${index}.${language}.scrollSpeed`
                                )}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>
                            {/* <div>
															<label className="block text-sm font-medium text-gray-600 mb-1">
																Font Size
															</label>
															<select
																{...register(
																	`specialMessages.${index}.${language}.fontSize`
																)}
																className="w-full p-2 border rounded-md"
															>
																{FONT_SIZES.map((size) => (
																	<option key={size} value={size}>
																		{size}px
																	</option>
																))}
															</select>
														</div> */}
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Font Weight
                              </label>
                              <select
                                {...register(
                                  `specialMessages.${index}.${language}.fontWeight`
                                )}
                                className="w-full p-2 border rounded-md"
                              >
                                {FONT_WEIGHT.map((weight) => (
                                  <option
                                    key={weight.value}
                                    value={weight.value}
                                  >
                                    {weight.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Width
                              </label>
                              <input
                                type="number"
                                {...register(
                                  `specialMessages.${index}.${language}.fontSize`
                                )}
                                min={0.1}
                                max={2}
                                step={0.1}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>

                            <Controller
                              key={`specialMessages.${index}.${language}.fonteight`}
                              name={`specialMessages.${index}.${language}.fontHeight`}
                              control={control}
                              render={({ field }) => (
                                <FontHeightInput
                                  bitmap={getBitmapHeight(
                                    specialMessages[index][language].bitmap
                                  )}
                                  value={
                                    specialMessages[index][language].bitmap
                                  }
                                  {...field}
                                />
                              )}
                            />

                            {/* <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Font Height
                              </label>
                              <select
                                {...register(
                                  `specialMessages.${index}.${language}.fontHeight`
                                )}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {Array.from(
                                  { length: 11 },
                                  (_, i) => i + 6
                                ).map((height) => (
                                  <option key={height} value={height}>
                                    {height}
                                  </option>
                                ))}
                              </select>
                            </div> */}

                            {/* <div>
															<label className="block text-sm font-medium text-gray-600 mb-1">
																X Offset
															</label>
															<input
																type="number"
																{...register(
																	`specialMessages.${index}.${language}.x_offset`
																)}
																className="w-full p-2 border rounded-md"
															/>
														</div> */}
                            {/* <div>
															<label className="block text-sm font-medium text-gray-600 mb-1">
																Y Offset
															</label>
															<input
																type="number"
																{...register(
																	`specialMessages.${index}.${language}.y_offset`
																)}
																className="w-full p-2 border rounded-md"
															/>
														</div> */}
                            {/* <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Thresshold
                              </label>
                              <input
                                type="number"
                                {...register(
                                  `specialMessages.${index}.${language}.spacing`
                                )}
                                className="w-full p-2 border rounded-md"
                              />
                            </div> */}
                          </div>
                        </AccordionItemContent>
                      </AccordionItem>
                    );
                  })}
                </AccordionRoot>
              </AccordionItemContent>
            </AccordionItem>
          </AccordionRoot>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "route":
        return renderRouteTab();
      case "languages":
        return renderLanguagesTab();
      case "Special Messages":
        return renderSpecialMessagesTab();
      case "front":
        return renderScreenTab("front");
      case "side":
        return renderScreenTab("side");
      case "rear":
        return renderScreenTab("rear");
      case "internal":
        return renderScreenTab("internal");
      default:
        return null;
    }
  };

  const onSubmit = async (data: DisplayConfig) => {
    setIsSubmitting(true);
    try {
      // Create a deep copy of the data to avoid mutating the form state
      const configToSave = JSON.parse(JSON.stringify(data));

      // Ensure specialMessages is an array
      if (!configToSave.specialMessages) {
        configToSave.specialMessages = [];
      }

      console.log(configToSave.id);
      // Create an array with the config object
      if (isEdit) {
        updateRouteMutation.mutate({ id: configToSave.id, data: configToSave });
      } else {
        createRouteMutation.mutate(configToSave);
        console.log("====================================");
        console.log(configToSave);
        console.log("====================================");
      }

      console.log("Configuration saved and downloaded", configToSave);
    } catch (error) {
      console.error("Error processing configuration:", error);
    } finally {
      // setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
          e.preventDefault();
        }
      }}
      className="w-full flex flex-col gap-4 overflow-hidden p-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl bold text-gray-900">Display Configuration</h2>
        {/* <IMEInput /> */}
        {/* <GoogleIME/> */}
        <button
          type="submit"
          className="px-4 text-sm py-2 bg-blue-700 disabled:bg-neutral-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={
            createRouteMutation.isPending || updateRouteMutation.isPending
          }
        >
          {isEdit ? "Update Configuration" : "Save Configuration"}
        </button>
      </div>

      <div className=" border-b border-gray-200">
        <nav className="-mb-px space-x-1 flex ">
          <button
            type="button"
            onClick={() => setActiveTab("route")}
            className={`py-2 px-3 text-left max-w-[120px]   border-b-2 font-medium text-sm ${
              activeTab === "route"
                ? "border-nav_orange bg-white text-nav_blue-500"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Route
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("languages")}
            className={`py-2 px-3 text-left max-w-[120px]   border-b-2 font-medium text-sm ${
              activeTab === "languages"
                ? "border-nav_orange bg-white text-nav_blue-500"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Languages
          </button>
          {SCREEN_TYPES.filter(
            (screenType) =>
              screenType !== "Special Messages" || isSpecialMessage
          ).map((screenType) => (
            <button
              key={screenType}
              type="button"
              onClick={() => setActiveTab(screenType)}
              className={`py-2 px-3 text-left max-w-[160px]  border-b-2 font-medium text-sm capitalize ${
                activeTab === screenType
                  ? "border-nav_orange bg-white text-nav_blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {screenType}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col overflow-auto">{renderTabContent()}</div>
    </form>
  );
};

export default DisplayConfigForm;
