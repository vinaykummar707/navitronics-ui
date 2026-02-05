"use client";
/*
 * Documentation:
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 */

import React from "react";
import { FeatherCheck } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface IconWithBackgroundRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "brand"
    | "neutral"
    | "error"
    | "success"
    | "warning"
    | "warning-2"
    | "error-2";
  size?: "x-large" | "large" | "medium" | "small" | "x-small" | "large-2";
  icon?: React.ReactNode;
  square?: boolean;
  className?: string;
}

const IconWithBackgroundRoot = React.forwardRef<
  HTMLDivElement,
  IconWithBackgroundRootProps
>(function IconWithBackgroundRoot(
  {
    variant = "brand",
    size = "x-small",
    icon = <FeatherCheck />,
    square = false,
    className,
    ...otherProps
  }: IconWithBackgroundRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/c5d68c0e flex h-5 w-5 items-center justify-center gap-2 rounded-full bg-brand-100",
        {
          "rounded-md": square,
          "h-10 w-10": size === "large-2",
          "h-6 w-6": size === "small",
          "h-8 w-8": size === "medium",
          "h-12 w-12": size === "large",
          "h-16 w-16": size === "x-large",
          "bg-error-500": variant === "error-2",
          "bg-warning-500": variant === "warning-2",
          "bg-warning-100": variant === "warning",
          "bg-success-100": variant === "success",
          "bg-error-100": variant === "error",
          "bg-neutral-100": variant === "neutral",
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "font-['Inter'] text-[10px] font-[400] leading-[12px] text-brand-800",
            {
              "text-heading-2 font-heading-2":
                size === "large-2" || size === "large",
              "text-caption font-caption": size === "small",
              "text-body font-body": size === "medium",
              "text-heading-1 font-heading-1": size === "x-large",
              "text-error-50": variant === "error-2",
              "text-white-default": variant === "warning-2",
              "text-warning-800": variant === "warning",
              "text-success-800": variant === "success",
              "text-error-800": variant === "error",
              "text-neutral-700": variant === "neutral",
            }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
    </div>
  );
});

export const IconWithBackground = IconWithBackgroundRoot;
