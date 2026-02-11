"use client";
/*
 * Documentation:
 * Accordion — https://app.subframe.com/11b10bc240cf/library?component=Accordion_d2e81e20-863a-4027-826a-991d8910efd9
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * StopDetailsCard — https://app.subframe.com/11b10bc240cf/library?component=StopDetailsCard_b89cf4a1-9cb9-461a-95a5-a9cab69cafa1
 */

import React from "react";
import { FeatherPin } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Accordion } from "./Accordion";
import { IconWithBackground } from "./IconWithBackground";

interface StopDetailsCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  downwardLatitude?: React.ReactNode;
  downwardLongitude?: React.ReactNode;
  upwardLatitude?: React.ReactNode;
  upwardLongitude?: React.ReactNode;
  audioFile?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const StopDetailsCardRoot = React.forwardRef<
  HTMLDivElement,
  StopDetailsCardRootProps
>(function StopDetailsCardRoot(
  {
    icon = <FeatherPin />,
    title,
    downwardLatitude,
    downwardLongitude,
    upwardLatitude,
    upwardLongitude,
    audioFile,
    actions,
    className,
    ...otherProps
  }: StopDetailsCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-neutral-50 shadow-sm",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <Accordion
        trigger={
          <div className="flex w-full items-center gap-2 px-4 py-4">
            <IconWithBackground
              variant="warning"
              size="medium"
              icon={icon}
              square={false}
            />
            {title ? (
              <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                {title}
              </span>
            ) : null}
            <Accordion.Chevron />
          </div>
        }
        defaultOpen={true}
      >
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-6 pb-6">
          <div className="flex w-full items-start gap-2">
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-100 px-4 py-4">
              <span className="text-caption-bold font-caption-bold text-default-font">
                Downward Direction
              </span>
              <div className="flex w-full items-start gap-2">
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                  <span className="text-caption font-caption text-subtext-color">
                    Latitude
                  </span>
                  {downwardLatitude ? (
                    <span className="text-caption font-caption text-default-font">
                      {downwardLatitude}
                    </span>
                  ) : null}
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                  <span className="text-caption font-caption text-subtext-color">
                    Longitude
                  </span>
                  {downwardLongitude ? (
                    <span className="text-caption font-caption text-default-font">
                      {downwardLongitude}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-100 px-4 py-4">
              <span className="text-caption-bold font-caption-bold text-default-font">
                Upward Direction
              </span>
              <div className="flex w-full items-start gap-2">
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                  <span className="text-caption font-caption text-subtext-color">
                    Latitude
                  </span>
                  {upwardLatitude ? (
                    <span className="text-caption font-caption text-default-font">
                      {upwardLatitude}
                    </span>
                  ) : null}
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                  <span className="text-caption font-caption text-subtext-color">
                    Longitude
                  </span>
                  {upwardLongitude ? (
                    <span className="text-caption font-caption text-default-font">
                      {upwardLongitude}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          {audioFile ? (
            <div className="flex w-full flex-col items-start gap-2">
              {audioFile}
            </div>
          ) : null}
          <div className="flex w-full items-center justify-end gap-2">
            <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2">
              {actions ? (
                <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2">
                  {actions}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Accordion>
    </div>
  );
});

export const StopDetailsCard = StopDetailsCardRoot;
