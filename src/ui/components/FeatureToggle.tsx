"use client";
/*
 * Documentation:
 * FeatureToggle — https://app.subframe.com/11b10bc240cf/library?component=FeatureToggle_037a3ab5-57f0-4e88-af9f-70634deb448f
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface FeatureToggleRootProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  toggle?: React.ReactNode;
  className?: string;
}

const FeatureToggleRoot = React.forwardRef<
  HTMLDivElement,
  FeatureToggleRootProps
>(function FeatureToggleRoot(
  {
    label,
    description,
    toggle,
    className,
    ...otherProps
  }: FeatureToggleRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full items-center gap-4 border border-solid rounded-md border-neutral-border px-3 py-2",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex grow shrink-0 basis-0 flex-col items-center gap-1">
        {label ? (
          <span className="w-full text-caption-bold font-caption-bold text-default-font">
            {label}
          </span>
        ) : null}
        {description ? (
          <span className="w-full text-caption font-caption text-subtext-color">
            {description}
          </span>
        ) : null}
      </div>
      {toggle ? <div className="flex items-center gap-4">{toggle}</div> : null}
    </div>
  );
});

export const  FeatureToggle = FeatureToggleRoot;
