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

interface SidebarContextType {
  collapsed: boolean;
}

const SidebarContext = React.createContext<SidebarContextType>({
  collapsed: false,
});

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
  const { collapsed } = React.useContext(SidebarContext);
  const titleText = typeof children === "string" ? children : undefined;

  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/2713e17b relative flex cursor-pointer items-center rounded-lg transition-all duration-150 select-none",
        collapsed
          ? "h-11 w-11 justify-center p-0 mx-auto"
          : "w-full gap-2.5 px-3 py-2",
        selected
          ? "bg-brand-primary text-brand-primary-foreground shadow-xs font-semibold"
          : "text-subtext-color hover:bg-neutral-100 hover:text-default-font",
        className
      )}
      ref={ref}
      title={collapsed ? titleText : undefined}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-[18px] transition-transform duration-150 group-hover/2713e17b:scale-110 flex-none",
            selected
              ? "text-brand-primary-foreground"
              : "text-subtext-color group-hover/2713e17b:text-default-font"
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {!collapsed && children ? (
        <span
          className={SubframeUtils.twClassNames(
            "line-clamp-1 grow shrink-0 basis-0 text-body font-body font-medium transition-colors",
            selected
              ? "text-brand-primary-foreground"
              : "text-subtext-color group-hover/2713e17b:text-default-font"
          )}
        >
          {children}
        </span>
      ) : null}
      {!collapsed && rightSlot ? (
        <div className="flex items-center">{rightSlot}</div>
      ) : null}
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
    const { collapsed } = React.useContext(SidebarContext);

    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col",
          collapsed ? "items-center gap-1.5" : "items-start gap-1",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {label ? (
          collapsed ? (
            <div className="w-6 h-px bg-neutral-border my-2 self-center opacity-60" />
          ) : (
            <div className="flex w-full flex-col items-start px-3 pt-3 pb-1">
              <span className="w-full text-micro font-micro-bold text-subtext-color uppercase tracking-wider">
                {label}
              </span>
            </div>
          )
        ) : null}
        {children ? (
          <div
            className={SubframeUtils.twClassNames(
              "flex w-full flex-col",
              collapsed ? "items-center gap-1" : "items-start gap-1"
            )}
          >
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
  collapsed?: boolean;
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
    collapsed = false,
    ...otherProps
  }: SidebarWithSectionsRootProps,
  ref
) {
  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <nav
        className={SubframeUtils.twClassNames(
          "flex h-full flex-col items-start border-r border-solid border-neutral-border bg-sidebar-background transition-[width] duration-300 ease-in-out flex-shrink-0 select-none overflow-hidden",
          collapsed ? "w-[68px]" : "w-60",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {header ? (
          <div
            className={SubframeUtils.twClassNames(
              "flex w-full flex-col items-start transition-[padding] duration-300 ease-in-out  border-neutral-border/40",
              collapsed ? "px-2 pt-3 items-center" : "px-4 pt-4 "
            )}
          >
            {header}
          </div>
        ) : null}
        <div
          className={SubframeUtils.twClassNames(
            "flex w-full grow shrink-0 basis-0 flex-col overflow-y-auto overflow-x-hidden no-scrollbar transition-[padding] duration-300 ease-in-out",
            collapsed ? "px-2 py-3 items-center gap-1.5" : "px-3 py-3 gap-2"
          )}
        >
          {children}
        </div>
        {footer ? (
          <div
            className={SubframeUtils.twClassNames(
              "flex w-full items-center border-t border-solid border-neutral-border transition-[padding] duration-300 ease-in-out",
              collapsed ? "px-2 py-3 justify-center" : "px-4 py-3 gap-3"
            )}
          >
            {footer}
          </div>
        ) : null}
      </nav>
    </SidebarContext.Provider>
  );
});

export const SidebarWithSections = Object.assign(SidebarWithSectionsRoot, {
  NavItem,
  NavSection,
});
