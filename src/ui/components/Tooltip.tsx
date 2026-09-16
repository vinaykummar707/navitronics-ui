"use client";
/*
 * Documentation:
 * Tooltip — https://app.subframe.com/11b10bc240cf/library?component=Tooltip_ccebd1e9-f6ac-4737-8376-0dfacd90c9f3
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface TooltipRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const TooltipRoot = React.forwardRef<HTMLDivElement, TooltipRootProps>(
  function TooltipRoot(
    { children, className, ...otherProps }: TooltipRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-sidebar-background px-2.5 py-1.5 shadow-lg",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {children ? (
          <span className="text-caption font-caption text-default-font">
            {children}
          </span>
        ) : null}
      </div>
    );
  }
);

export const Tooltip = TooltipRoot;
