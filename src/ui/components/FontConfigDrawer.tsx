"use client";
/*
 * Documentation:
 * FontConfigDrawer — https://app.subframe.com/11b10bc240cf/library?component=FontConfigDrawer_006d71c2-63cb-4adb-9833-4f33a5e62eda
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface FontConfigDrawerRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  languageFields?: React.ReactNode;
  sideTextAccordion?: React.ReactNode;
  mainTextAccordion?: React.ReactNode;
  upperHalfTextAccordion?: React.ReactNode;
  lowerHalfTextAccordion?: React.ReactNode;
  routeNumber1Accordion?: React.ReactNode;
  routeNumber2Accordion?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const FontConfigDrawerRoot = React.forwardRef<
  HTMLDivElement,
  FontConfigDrawerRootProps
>(function FontConfigDrawerRoot(
  {
    title,
    description,
    languageFields,
    sideTextAccordion,
    mainTextAccordion,
    upperHalfTextAccordion,
    lowerHalfTextAccordion,
    routeNumber1Accordion,
    routeNumber2Accordion,
    actions,
    className,
    ...otherProps
  }: FontConfigDrawerRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col items-start bg-default-background",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full flex-col items-start gap-4 px-4 py-4">
        <div className="flex flex-col items-start gap-1">
          {title ? (
            <span className="text-heading-3 font-heading-3 text-default-font">
              {title}
            </span>
          ) : null}
          {description ? (
            <span className="text-body font-body text-subtext-color">
              {description}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start px-2 pb-2 no-scrollbar overflow-y-auto">
        <div className="w-full flex-col items-start gap-4 px-4 py-4 ">
          {languageFields ? (
            <div className="flex flex-col items-start gap-4">
              {languageFields}
            </div>
          ) : null}
        </div>
        {sideTextAccordion ? (
          <div className="flex w-full flex-col items-start">
            {sideTextAccordion}
          </div>
        ) : null}
        {mainTextAccordion ? (
          <div className="flex w-full flex-col items-start">
            {mainTextAccordion}
          </div>
        ) : null}
        {upperHalfTextAccordion ? (
          <div className="flex w-full flex-col items-start">
            {upperHalfTextAccordion}
          </div>
        ) : null}
        {lowerHalfTextAccordion ? (
          <div className="flex w-full flex-col items-start">
            {lowerHalfTextAccordion}
          </div>
        ) : null}
        {routeNumber1Accordion ? (
          <div className="flex w-full flex-col items-start">
            {routeNumber1Accordion}
          </div>
        ) : null}
        {routeNumber2Accordion ? (
          <div className="flex w-full flex-col items-start">
            {routeNumber2Accordion}
          </div>
        ) : null}
      </div>
      <div className="flex w-full flex-col items-center gap-2 px-4 py-4">
        <div className="flex w-full flex-col items-center gap-2">
          {actions ? (
            <div className="flex w-full flex-col items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});

export const FontConfigDrawer = FontConfigDrawerRoot;
