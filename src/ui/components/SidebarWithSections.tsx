"use client";
/*
 * Documentation:
 * Sidebar with sections — https://app.subframe.com/11b10bc240cf/library?component=Sidebar+with+sections_f4047c8b-cfb4-4761-b9cf-fbcae8a9b9b5
 */

import React from "react";
import { FeatherCircleDashed } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  selected?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
}

const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(function NavItem(
  {
    icon = <FeatherCircleDashed />,
    children,
    selected = false,
    rightSlot,
    className,
    ...otherProps
  }: NavItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/2713e17b flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-neutral-50 active:bg-neutral-100",
        { "bg-brand-600 hover:bg-brand-500 active:bg-brand-100": selected },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-heading-3 font-heading-3 text-neutral-700",
            { "text-white-default": selected }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {children ? (
        <span
          className={SubframeUtils.twClassNames(
            "line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-neutral-700",
            { "text-white-default": selected }
          )}
        >
          {children}
        </span>
      ) : null}
      {rightSlot ? <div className="flex items-center">{rightSlot}</div> : null}
    </div>
  );
});

interface NavSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  label?: React.ReactNode;
  className?: string;
}

const NavSection = React.forwardRef<HTMLDivElement, NavSectionProps>(
  function NavSection(
    { children, label, className, ...otherProps }: NavSectionProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start gap-1",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex w-full flex-col items-start gap-4 pl-1 pr-3 py-1">
          {label ? (
            <span className="w-full text-caption font-caption text-subtext-color">
              {label}
            </span>
          ) : null}
        </div>
        {children ? (
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-1">
            {children}
          </div>
        ) : null}
      </div>
    );
  }
);

interface SidebarWithSectionsRootProps
  extends React.HTMLAttributes<HTMLElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const SidebarWithSectionsRoot = React.forwardRef<
  HTMLElement,
  SidebarWithSectionsRootProps
>(function SidebarWithSectionsRoot(
  {
    header,
    footer,
    children,
    className,
    ...otherProps
  }: SidebarWithSectionsRootProps,
  ref
) {
  return (
    <nav
      className={SubframeUtils.twClassNames(
        "flex h-full w-60 flex-col items-start border-r border-solid border-neutral-border bg-default-background",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {header ? (
        <div className="flex w-full flex-col items-start gap-4 px-5 pt-6 pb-4">
          {header}
        </div>
      ) : null}
      {children ? (
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-5 pb-6 overflow-auto">
          {children}
        </div>
      ) : null}
      {footer ? (
        <div className="flex w-full items-center gap-4 border-t border-solid border-neutral-border px-5 py-4">
          {footer}
        </div>
      ) : null}
    </nav>
  );
});

export const SidebarWithSections = Object.assign(SidebarWithSectionsRoot, {
  NavItem,
  NavSection,
});
