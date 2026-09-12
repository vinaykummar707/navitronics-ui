import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { TextField } from "@/ui/components/TextField";
import { Select } from "@/ui/components/Select";
import { Switch } from "@/ui/components/Switch";
import { Accordion } from "@/ui/components/Accordion";
import {
  AVAILABLE_LANGUAGES,
  getDefaultScreen,
  type DisplayConfig,
  type Screens,
} from "@/types/v1RouteTypes";
import { FeatherGlobe, FeatherNavigation } from "@subframe/core";

const SEPARATORS = ["-", "/", "->", "<-", "<->"];

const getDefaultScreensForLanguage = (): Screens => ({
  front: getDefaultScreen("three", 16, 96),
  side: getDefaultScreen("three", 16, 96),
  rear: getDefaultScreen("single", 16, 32),
  internal: getDefaultScreen("single", 16, 96),
});

export const V1LeftPanel: React.FC = () => {
  const { register, control, setValue, watch } = useFormContext<DisplayConfig>();

  const splitRoute = Boolean(watch("route.splitRoute"));
  const separator = watch("route.separation") || "-";

  const displayConfig = useWatch({
    control,
    name: "displayConfig",
  }) || {};

  // Get active languages
  const selectedLanguages = Object.keys(displayConfig)
    .concat(Array(3).fill("none"))
    .slice(0, 3);

  const handleLanguageChange = (idx: number, newLang: string) => {
    const newSelectedLanguages = [...selectedLanguages];
    const prevLang = newSelectedLanguages[idx];

    if (prevLang === newLang) return;
    newSelectedLanguages[idx] = newLang;

    const cleanLangs = newSelectedLanguages.filter(
      (l) => l && l !== "none"
    );

    const newDisplayConfig: Record<string, Screens> = {};
    for (const code of cleanLangs) {
      if (displayConfig[code]) {
        newDisplayConfig[code] = displayConfig[code];
      } else {
        newDisplayConfig[code] = getDefaultScreensForLanguage();
      }
    }

    setValue("displayConfig", newDisplayConfig, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-r border-solid border-neutral-border bg-default-background">
      {/* Route Information Accordion */}
      <Accordion defaultOpen={true}>
        <Accordion.Trigger>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <FeatherNavigation className="h-4 w-4" />
            </div>
            <span className="text-body-bold font-body-bold text-default-font">
              Route Information
            </span>
          </div>
        </Accordion.Trigger>
        <Accordion.Content>
          <div className="flex flex-col gap-3 px-3 pb-4 pt-1">
            {/* Split Route Toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="text-caption-bold font-caption-bold text-default-font">
                Split Route
              </span>
              <Switch
                checked={splitRoute}
                onCheckedChange={(checked) =>
                  setValue("route.splitRoute", checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </div>

            {/* Route Numbers */}
            {splitRoute ? (
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Route No 1">
                  <TextField.Input
                    placeholder="e.g. 141A"
                    {...register("route.routeNumber1", {
                      setValueAs: (v) => (v ? v.toUpperCase() : ""),
                    })}
                  />
                </TextField>
                <TextField label="Route No 2">
                  <TextField.Input
                    placeholder="e.g. 141B"
                    {...register("route.routeNumber2", {
                      setValueAs: (v) => (v ? v.toUpperCase() : ""),
                    })}
                  />
                </TextField>
              </div>
            ) : (
              <TextField label="Route Number">
                <TextField.Input
                  placeholder="e.g. 141"
                  {...register("route.routeNumber", {
                    setValueAs: (v) => (v ? v.toUpperCase() : ""),
                  })}
                />
              </TextField>
            )}

            {/* Source */}
            <TextField label="Source">
              <TextField.Input
                placeholder="Start Location"
                {...register("route.source")}
              />
            </TextField>

            {/* Destination */}
            <TextField label="Destination">
              <TextField.Input
                placeholder="End Location"
                {...register("route.destination")}
              />
            </TextField>

            {/* Separator */}
            <Select
              label="Separator"
              value={separator}
              onValueChange={(val) =>
                setValue("route.separation", val, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              {SEPARATORS.map((sep) => (
                <Select.Item key={sep} value={sep}>
                  {sep}
                </Select.Item>
              ))}
            </Select>

            {/* Via */}
            <TextField label="Via">
              <TextField.Input
                placeholder="Via stops / landmark"
                {...register("route.via")}
              />
            </TextField>

            {/* Special Message & Route Display Flags */}
            <div className="flex flex-col gap-2 border-t border-neutral-border pt-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-caption-bold font-caption-bold text-default-font">
                  Show Route (Rt)
                </span>
                <Switch
                  checked={watch("route.showRt") ?? true}
                  onCheckedChange={(checked) =>
                    setValue("route.showRt", checked, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-caption-bold font-caption-bold text-default-font">
                  Show SPM (Special Msg)
                </span>
                <Switch
                  checked={Boolean(watch("route.showSpm"))}
                  onCheckedChange={(checked) =>
                    setValue("route.showSpm", checked, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-caption-bold font-caption-bold text-default-font">
                  Show Both
                </span>
                <Switch
                  checked={Boolean(watch("route.showBoth"))}
                  onCheckedChange={(checked) =>
                    setValue("route.showBoth", checked, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </Accordion.Content>
      </Accordion>

      {/* Languages Selection Accordion */}
      <Accordion defaultOpen={true}>
        <Accordion.Trigger>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
              <FeatherGlobe className="h-4 w-4" />
            </div>
            <span className="text-body-bold font-body-bold text-default-font">
              Language Selection
            </span>
          </div>
        </Accordion.Trigger>
        <Accordion.Content>
          <div className="flex flex-col gap-3 px-3 pb-4 pt-1">
            <span className="text-caption font-caption text-subtext-color">
              Select up to 3 languages to configure for bus displays:
            </span>

            {[0, 1, 2].map((idx) => (
              <Select
                key={idx}
                label={`Language ${idx + 1}`}
                value={selectedLanguages[idx] || "none"}
                onValueChange={(val) => handleLanguageChange(idx, val)}
              >
                <Select.Item value="none">None</Select.Item>
                {AVAILABLE_LANGUAGES.filter(
                  (lang) =>
                    !selectedLanguages.includes(lang.code) ||
                    selectedLanguages[idx] === lang.code
                ).map((lang) => (
                  <Select.Item key={lang.code} value={lang.code}>
                    {lang.label} ({lang.code.toUpperCase()})
                  </Select.Item>
                ))}
              </Select>
            ))}
          </div>
        </Accordion.Content>
      </Accordion>
    </aside>
  );
};
