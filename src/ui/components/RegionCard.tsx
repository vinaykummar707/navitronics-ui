"use client";
/*
 * Documentation:
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * RegionCard — https://app.subframe.com/11b10bc240cf/library?component=RegionCard_32c6144d-0deb-4aa2-8485-d3b6ec072ea9
 */

import React from "react";
import { FeatherMapPin } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconWithBackground } from "./IconWithBackground";

interface RegionCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  locationName?: React.ReactNode;
  depotCount?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const RegionCardRoot = React.forwardRef<HTMLDivElement, RegionCardRootProps>(
  function RegionCardRoot(
    {
      icon = <FeatherMapPin />,
      locationName,
      depotCount,
      actions,
      className,
      ...otherProps
    }: RegionCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full items-center justify-between rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-4",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex items-center justify-center gap-4">
          <IconWithBackground
            variant="error"
            size="large-2"
            icon={icon}
            square={false}
          />
          <div className="flex flex-col items-start justify-center">
            {locationName ? (
              <span
                className="text-body-bold font-body-bold text-default-font truncate max-w-[200px]"
                title={typeof locationName === "string" ? locationName : undefined}
              >
                {locationName}
              </span>
            ) : null}
            {depotCount ? (
              <span className="text-caption font-caption text-subtext-color">
                {depotCount}
              </span>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex items-center justify-between">{actions}</div>
        ) : null}
      </div>
    );
  }
);

export const RegionCard = RegionCardRoot;
