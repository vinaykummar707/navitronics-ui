"use client";
/*
 * Documentation:
 * LanguageItem — https://app.subframe.com/11b10bc240cf/library?component=LanguageItem_58acd692-5122-4dd9-a5e3-55125d6b15b1
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface LanguageItemRootProps extends React.HTMLAttributes<HTMLDivElement> {
  language?: React.ReactNode;
  code?: React.ReactNode;
  className?: string;
}

const LanguageItemRoot = React.forwardRef<
  HTMLDivElement,
  LanguageItemRootProps
>(function LanguageItemRoot(
  { language, code, className, ...otherProps }: LanguageItemRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full items-center gap-3 rounded-md bg-neutral-100 px-4 py-3",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex grow shrink-0 basis-0 flex-col items-start">
        {language ? (
          <span className="text-body-bold font-body-bold text-default-font">
            {language} - {code}
          </span>
        ) : null}
        
      </div>
    </div>
  );
});

export const LanguageItem = LanguageItemRoot;
