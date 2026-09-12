import type { ScreenFormat } from "@/types/v1RouteTypes";

export function getTextItemsForFormat(
  format: ScreenFormat,
  lang: string,
  tab: string,
  splitRoute: boolean = false
) {
  const base = `displayConfig.${lang}.${tab}.texts`;
  if (format === "single") {
    return [{ label: "Text", name: `${base}.text` }];
  }

  const routeItems = splitRoute
    ? [
        { label: "Route Number 1", name: `${base}.routeNumber1` },
        { label: "Route Number 2", name: `${base}.routeNumber2` },
      ]
    : [{ label: "Route Number", name: `${base}.sideText` }];

  if (format === "two") {
    return [
      { label: "Route Number", name: `${base}.sideText` },
      { label: "Text", name: `${base}.text` },
    ];
  }
  if (format === "three") {
    return [
      ...routeItems,
      { label: "Upper Half Text", name: `${base}.upperHalfText` },
      { label: "Lower Half Text", name: `${base}.lowerHalfText` },
    ];
  }
  return [];
}
