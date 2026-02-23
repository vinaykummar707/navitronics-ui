import * as SubframeCore from "@subframe/core";

export const twClassNames = SubframeCore.createTwClassNames([
  "text-caption",
  "text-caption-bold",
  "text-body",
  "text-body-bold",
  "text-heading-3",
  "text-heading-2",
  "text-heading-1",
  "text-monospace-body",
  "text-heading",
]);

export function getInitials(title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal): import("react").ReactNode {
  if (typeof title === "number" || typeof title === "boolean") {
    return title.toString().charAt(0).toUpperCase();
  } else if (typeof title === "string") {
    return title.charAt(0).toUpperCase();
  } else {
    return "?";
  }
}
