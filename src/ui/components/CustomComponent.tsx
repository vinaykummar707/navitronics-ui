"use client";
/*
 * Documentation:
 * Custom Component — https://app.subframe.com/11b10bc240cf/library?component=Custom+Component_662741e4-01f3-4bb5-a909-f60feb1dc4db
 * Select — https://app.subframe.com/11b10bc240cf/library?component=Select_bb88f90b-8c43-4b73-9c2f-3558ce7838f3
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { Select } from "./Select";

interface CustomComponentRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const CustomComponentRoot = React.forwardRef<
  HTMLDivElement,
  CustomComponentRootProps
>(function CustomComponentRoot(
  { className, ...otherProps }: CustomComponentRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start gap-2",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <Select
        className="h-auto w-full flex-none"
        label="Select Organization"
        placeholder="Select"
        helpText=""
      />
    </div>
  );
});

export const CustomComponent = CustomComponentRoot;
