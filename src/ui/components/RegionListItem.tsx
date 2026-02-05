"use client";
/*
 * Documentation:
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * RegionListItem — https://app.subframe.com/11b10bc240cf/library?component=RegionListItem_7c380d79-161b-4bac-90c9-726aa17dbce7
 */

import React from "react";
import { FeatherMapPin } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconWithBackground } from "./IconWithBackground";

interface RegionListItemRootProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  locationName?: React.ReactNode;
  date?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const RegionListItemRoot = React.forwardRef<
  HTMLDivElement,
  RegionListItemRootProps
>(function RegionListItemRoot(
  {
    icon = <FeatherMapPin />,
    locationName,
    date,
    actions,
    className,
    ...otherProps
  }: RegionListItemRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full items-center justify-between rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex grow shrink-0 basis-0 items-center gap-4">
        <IconWithBackground
          className="h-9 w-9 flex-none"
          variant="warning"
          size="large"
          icon={icon}
          square={false}
        />
        <div className="flex grow shrink-0 basis-0 flex-col items-start justify-end gap-1">
          {locationName ? (
            <span className="text-body font-body text-default-font">
              {locationName}
            </span>
          ) : null}
          {date ? (
            <span className="text-caption font-caption text-subtext-color">
              {date}
            </span>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-end gap-2">{actions}</div>
      ) : null}
    </div>
  );
});

export const RegionListItem = RegionListItemRoot;
