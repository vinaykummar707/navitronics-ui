"use client";
/*
 * Documentation:
 * Drawer 2 — https://app.subframe.com/11b10bc240cf/library?component=Drawer+2_efa6a54c-b268-411d-91f5-91454c6bf0f1
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ContentProps
  extends React.ComponentProps<typeof SubframeCore.Drawer.Content> {
  children?: React.ReactNode;
  className?: string;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
  { children, className, ...otherProps }: ContentProps,
  ref
) {
  return children ? (
    <SubframeCore.Drawer.Content asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "flex h-[100dvh] min-h-[100dvh] min-w-[320px] max-w-[100vw] flex-col items-start gap-2 border-l border-solid border-neutral-border bg-default-background z-50 pt-safe pb-safe",
          className
        )}
        ref={ref}
      >
        {children}
      </div>
    </SubframeCore.Drawer.Content>
  ) : null;
});

interface Drawer2RootProps
  extends React.ComponentProps<typeof SubframeCore.Drawer.Root> {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const Drawer2Root = React.forwardRef<HTMLDivElement, Drawer2RootProps>(
  function Drawer2Root(
    { children, className, ...otherProps }: Drawer2RootProps,
    ref
  ) {
    return children ? (
      <SubframeCore.Drawer.Root asChild={true} {...otherProps}>
        <div
          className={SubframeUtils.twClassNames(
            "flex h-[100dvh] min-h-[100dvh] w-full flex-col items-end justify-center gap-2 bg-[#00000066] z-50",
            className
          )}
          ref={ref}
        >
          {children}
        </div>
      </SubframeCore.Drawer.Root>
    ) : null;
  }
);

export const Drawer2 = Object.assign(Drawer2Root, {
  Content,
});
