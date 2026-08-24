"use client";
/*
 * Documentation:
 * Accordion — https://app.subframe.com/11b10bc240cf/library?component=Accordion_d2e81e20-863a-4027-826a-991d8910efd9
 * ControlAccordion — https://app.subframe.com/11b10bc240cf/library?component=ControlAccordion_02fd28eb-e693-4480-aa67-324390fa558c
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { Accordion } from "./Accordion";

interface ControlAccordionRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  controls?: React.ReactNode;
  icon?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  className?: string;
}

const ControlAccordionRoot = React.forwardRef<
  HTMLDivElement,
  ControlAccordionRootProps
>(function ControlAccordionRoot(
  {
    title,
    controls,
    icon,
    open,
    onOpenChange,
    defaultOpen = false,
    className,
    ...otherProps
  }: ControlAccordionRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start gap-4 border-b border-solid border-neutral-border px-3 py-3",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <Accordion
        open={open}
        onOpenChange={onOpenChange}
        defaultOpen={defaultOpen}
        trigger={
          <div className="flex w-full items-center gap-2">
            <div className="flex grow shrink-0 basis-0 items-center gap-2">
              {icon ? (
                <div className="flex items-center gap-2">{icon}</div>
              ) : null}
              {title ? (
                <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                  {title}
                </span>
              ) : null}
            </div>
            <Accordion.Chevron />
          </div>
        }
      >
        {controls ? (
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start px-2 pt-3">
            {controls}
          </div>
        ) : null}
      </Accordion>
    </div>
  );
});

export const ControlAccordion = ControlAccordionRoot;
