"use client";
/*
 * Documentation:
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * TextDetailsCard — https://app.subframe.com/11b10bc240cf/library?component=TextDetailsCard_2a4b614e-de93-452a-ae4f-11b677c52738
 */

import React from "react";
import { FeatherAlignLeft } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconWithBackground } from "./IconWithBackground";

interface TextDetailsCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  items?: React.ReactNode;
  className?: string;
}

const TextDetailsCardRoot = React.forwardRef<
  HTMLDivElement,
  TextDetailsCardRootProps
>(function TextDetailsCardRoot(
  {
    icon = <FeatherAlignLeft />,
    title,
    items,
    className,
    ...otherProps
  }: TextDetailsCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start gap-3 rounded-lg border border-solid border-neutral-border bg-neutral-50 px-4 py-4",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full capitalize items-center gap-2">
        <IconWithBackground variant="brand" size="x-small" icon={icon} />
        {title ? (
          <span className="text-heading-3 font-heading-3 text-default-font">
            {title}
          </span>
        ) : null}
      </div>
      {items ? (
        <div className="flex w-full flex-col items-start">{items}</div>
      ) : null}
    </div>
  );
});

export const TextDetailsCard = TextDetailsCardRoot;
