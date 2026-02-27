"use client";
/*
 * Documentation:
 * Badge — https://app.subframe.com/11b10bc240cf/library?component=Badge_97bdb082-1124-4dd7-a335-b14b822d0157
 * LanguageDetailsPanel — https://app.subframe.com/11b10bc240cf/library?component=LanguageDetailsPanel_6d1eb0b2-d3f5-49cc-93bf-dc4019d9c358
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { Badge } from "./Badge";

interface LanguageDetailsPanelRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  languageName?: React.ReactNode;
  optionsMenu?: React.ReactNode;
  detailsCards?: React.ReactNode;
  className?: string;
}

const LanguageDetailsPanelRoot = React.forwardRef<
  HTMLDivElement,
  LanguageDetailsPanelRootProps
>(function LanguageDetailsPanelRoot(
  {
    languageName,
    optionsMenu,
    detailsCards,
    className,
    ...otherProps
  }: LanguageDetailsPanelRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col items-start gap-4 px-4 py-4 overflow-auto no-scrollbar",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          {languageName ? (
            <span className="text-heading-2 font-heading-2 text-default-font">
              {languageName}
            </span>
          ) : null}
        </div>
        {optionsMenu ? (
          <div className="flex items-center justify-between">{optionsMenu}</div>
        ) : null}
      </div>
      {detailsCards ? (
        <div className="w-full flex-col items-start gap-2 grid grid-cols-4">
          {detailsCards}
        </div>
      ) : null}
    </div>
  );
});

export const LanguageDetailsPanel = LanguageDetailsPanelRoot;
