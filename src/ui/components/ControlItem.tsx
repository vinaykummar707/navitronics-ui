"use client";
/*
 * Documentation:
 * ControlItem — https://app.subframe.com/11b10bc240cf/library?component=ControlItem_ebd0c198-1eb8-4dce-aa30-043753b381c2
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface ControlItemRootProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const ControlItemRoot = React.forwardRef<HTMLDivElement, ControlItemRootProps>(
  function ControlItemRoot(
    { label, children, className, ...otherProps }: ControlItemRootProps,
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
        {label ? (
          <span className="text-caption font-caption text-default-font">
            {label}
          </span>
        ) : null}
        {children ? (
          <div className="flex w-full items-center justify-center gap-2">
            {children}
          </div>
        ) : null}
      </div>
    );
  }
);

export const ControlItem = ControlItemRoot;
