"use client";
/*
 * Documentation:
 * SelectionCard — https://app.subframe.com/11b10bc240cf/library?component=SelectionCard_cc47cbb4-bf13-4612-81cd-f7339404f925
 */

import React from "react";
import { FeatherPlus } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface SelectionCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  icon?: React.ReactNode;
  variant?:
    | "icon-only"
    | "icon-text-horizontal"
    | "icon-text-vertical"
    | "text-only";
  text?: React.ReactNode;
  className?: string;
}

const SelectionCardRoot = React.forwardRef<
  HTMLDivElement,
  SelectionCardRootProps
>(function SelectionCardRoot(
  {
    selected = false,
    icon = <FeatherPlus />,
    variant = "icon-only",
    text,
    className,
    ...otherProps
  }: SelectionCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/cc47cbb4 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-2 py-2 hover:border hover:border-solid hover:border-neutral-200 hover:bg-neutral-100",
        {
          "flex-col flex-nowrap gap-2": variant === "icon-text-vertical",
          "border border-solid border-brand-400 bg-brand-50 hover:border hover:border-solid hover:border-brand-400 hover:bg-brand-50":
            selected,
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-caption font-caption text-default-font",
            { hidden: variant === "text-only", "text-brand-700": selected }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {text ? (
        <span
          className={SubframeUtils.twClassNames(
            "hidden text-caption font-caption text-subtext-color",
            {
              "text-subtext-color inline-flex": variant === "text-only",
              "text-caption font-caption inline-flex":
                variant === "icon-text-vertical" ||
                variant === "icon-text-horizontal",
              "text-brand-700": selected,
            }
          )}
        >
          {text}
        </span>
      ) : null}
    </div>
  );
});

export const SelectionCard = SelectionCardRoot;
