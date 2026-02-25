"use client";
/*
 * Documentation:
 * Avatar — https://app.subframe.com/11b10bc240cf/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 * Badge — https://app.subframe.com/11b10bc240cf/library?component=Badge_97bdb082-1124-4dd7-a335-b14b822d0157
 * OrganizationCard — https://app.subframe.com/11b10bc240cf/library?component=OrganizationCard_bb836b5d-d808-41b9-9cba-a35107cb3078
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";

import Avvvatars from 'avvvatars-react'


interface OrganizationCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: string;
  subtitle?: string;
  isSuspended?: boolean;
  logo2?: string;
  actions?: React.ReactNode;
  features?: React.ReactNode;
  className?: string;
}

const OrganizationCardRoot = React.forwardRef<
  HTMLDivElement,
  OrganizationCardRootProps
>(function OrganizationCardRoot(
  {
    title,
    subtitle,
    isSuspended = false,
    logo2,
    actions,
    features,
    className,
    ...otherProps
  }: OrganizationCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/bb836b5d flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-4",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-start justify-between">
          {logo2 ? <Avatar size="large" variant="brand" image={logo2} square={false}>
            A
          </Avatar> : <Avvvatars style="shape" value={subtitle} size={48} />}
        </div>
        <Badge variant={isSuspended ? "error" : "success"} icon={null} iconRight={null}>
          {isSuspended ? "Suspended" : "Active"}
        </Badge>
      </div>
      <div className="flex w-full items-end justify-between">
        <div className="flex flex-col items-start gap-1">
          {title ? (
            <span className="text-heading-3 font-body-bold text-default-font">
              {title}
            </span>
          ) : null}
          {subtitle ? (
            <span className="text-caption font-caption text-subtext-color">
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-4">
        {features ? (
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
            {features}
          </div>
        ) : null}
        {actions ? (
          <div className="flex items-start justify-between">{actions}</div>
        ) : null}
      </div>
    </div>
  );
});

export const OrganizationCard = OrganizationCardRoot;
