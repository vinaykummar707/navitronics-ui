"use client";
/*
 * Documentation:
 * SelectionCardWithIcon — https://app.subframe.com/11b10bc240cf/library?component=SelectionCardWithIcon_64c7b5d9-3352-4fca-b812-959e31a628e5
 */

import React from "react";
import { FeatherRectangleHorizontal } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface SelectionCardWithIconRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  selected?: boolean;
  className?: string;
}

const SelectionCardWithIconRoot = React.forwardRef<
  HTMLDivElement,
  SelectionCardWithIconRootProps
>(function SelectionCardWithIconRoot(
  {
    icon = <FeatherRectangleHorizontal />,
    label,
    selected = false,
    className,
    ...otherProps
  }: SelectionCardWithIconRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/64c7b5d9 flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 hover:border hover:border-solid hover:border-neutral-200 hover:bg-neutral-100",
        {
          "border border-solid border-brand-400 bg-brand-50 hover:bg-brand-50":
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
            "text-heading-3 font-heading-3 text-default-font",
            { "text-brand-700": selected }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {label ? (
        <span
          className={SubframeUtils.twClassNames(
            "text-caption font-caption text-default-font",
            { "text-brand-700": selected }
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
});

export const SelectionCardWithIcon = SelectionCardWithIconRoot;
