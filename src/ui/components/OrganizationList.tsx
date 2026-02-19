"use client";
/*
 * Documentation:
 * OrganizationList — https://app.subframe.com/11b10bc240cf/library?component=OrganizationList_edebb62d-51df-4347-a4a9-c48a8d0453e0
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface OrganizationListRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const OrganizationListRoot = React.forwardRef<
  HTMLDivElement,
  OrganizationListRootProps
>(function OrganizationListRoot(
  { children, className, ...otherProps }: OrganizationListRootProps,
  ref
) {
  return children ? (
    <div
      className={SubframeUtils.twClassNames(
        "w-full flex-col items-start gap-2 grid md:grid-cols-2 lg:grid-cols-3",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {children}
    </div>
  ) : null;
});

export const OrganizationList = OrganizationListRoot;
