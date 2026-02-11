"use client";
/*
 * Documentation:
 * SelectionCardWithText — https://app.subframe.com/11b10bc240cf/library?component=SelectionCardWithText_ddf3d814-92a8-485d-84fb-a8a0af6dd41e
 */

import React from "react";
import { FeatherCheck } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import * as SubframeUtils from "../utils";

interface SelectionCardWithTextRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  selected?: boolean;
  title?: React.ReactNode;
  className?: string;
}

const SelectionCardWithTextRoot = React.forwardRef<
  HTMLDivElement,
  SelectionCardWithTextRootProps
>(function SelectionCardWithTextRoot(
  {
    selected = false,
    title,
    className,
    ...otherProps
  }: SelectionCardWithTextRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/ddf3d814 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-2 py-2 hover:border hover:border-solid hover:border-neutral-200 hover:bg-neutral-100",
        {
          "border border-solid border-brand-400 bg-brand-50 hover:border hover:border-solid hover:border-brand-400 hover:bg-brand-50 active:border active:border-solid active:border-neutral-border":
            selected,
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {selected ? (
        <FeatherCheck
          className={SubframeUtils.twClassNames(
            "hidden text-caption-bold font-caption-bold text-brand-700",
            { "inline-flex": selected }
          )}
        />
      ) : (
        <FeatherPlus
          className={SubframeUtils.twClassNames(
            "hidden text-caption-bold font-caption-bold text-brand-700",
            { "inline-flex": selected }
          )}
        />
      )}
      {title ? (
        <span
          className={SubframeUtils.twClassNames(
            "text-caption font-caption text-default-font",
            { "text-caption-bold font-caption-bold text-brand-700": selected }
          )}
        >
          {title}
        </span>
      ) : null}
    </div>
  );
});

export const SelectionCardWithText = SelectionCardWithTextRoot;
