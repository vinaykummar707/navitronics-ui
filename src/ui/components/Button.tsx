"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ButtonRootProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  variant?:
    | "brand-primary"
    | "brand-secondary"
    | "brand-tertiary"
    | "neutral-primary"
    | "neutral-secondary"
    | "neutral-tertiary"
    | "destructive-primary"
    | "destructive-secondary"
    | "destructive-tertiary"
    | "inverse"
    | "brand-secondary-2"
    | "option-1"
    | "neutral-secondary-2"
    | "neutral-primary-2";
  size?: "large" | "medium" | "small";
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const ButtonRoot = React.forwardRef<HTMLButtonElement, ButtonRootProps>(
  function ButtonRoot(
    {
      disabled = false,
      variant = "brand-primary",
      size = "medium",
      children,
      icon = null,
      iconRight = null,
      loading = false,
      className,
      type = "button",
      ...otherProps
    }: ButtonRootProps,
    ref
  ) {
    return (
      <button
        className={SubframeUtils.twClassNames(
          "group/3b777358 flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border-none bg-brand-600 px-4 text-left hover:bg-brand-500 active:bg-brand-600 disabled:cursor-default disabled:bg-neutral-200 hover:disabled:cursor-default hover:disabled:bg-neutral-200 active:disabled:cursor-default active:disabled:bg-neutral-200",
          {
            "h-6 w-auto flex-row flex-nowrap gap-1 px-2 py-0": size === "small",
            "h-10 w-auto px-4 py-0": size === "large",
            "border border-solid border-neutral-border bg-transparent hover:bg-neutral-200 active:bg-neutral-100":
              variant === "neutral-primary-2",
            "bg-default-background hover:bg-neutral-50 active:bg-default-background":
              variant === "neutral-secondary-2",
            "border border-solid border-brand-primary bg-brand-50 hover:bg-brand-100 active:bg-brand-50":
              variant === "brand-secondary-2",
            "bg-transparent hover:bg-[#ffffff29] active:bg-[#ffffff3d]":
              variant === "inverse",
            "bg-transparent hover:bg-error-50 active:bg-error-100":
              variant === "destructive-tertiary",
            "bg-error-50 hover:bg-error-100 active:bg-error-50":
              variant === "destructive-secondary",
            "bg-error-600 hover:bg-error-500 active:bg-error-600":
              variant === "destructive-primary",
            "bg-transparent hover:bg-neutral-100 active:bg-neutral-200":
              variant === "neutral-tertiary",
            "border border-solid border-neutral-border bg-default-background hover:bg-neutral-50 active:bg-default-background":
              variant === "neutral-secondary",
            "bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-100":
              variant === "neutral-primary",
            "bg-transparent hover:bg-brand-50 active:bg-brand-100":
              variant === "brand-tertiary",
            "bg-brand-50 hover:bg-brand-100 active:bg-brand-50":
              variant === "brand-secondary",
          },
          className
        )}
        ref={ref}
        type={type}
        disabled={disabled}
        {...otherProps}
      >
        {icon ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "text-body font-body text-black group-disabled/3b777358:text-neutral-400",
              {
                hidden: loading,
                "text-heading-3 font-heading-3": size === "large",
                "text-neutral-700":
                  variant === "neutral-primary-2" ||
                  variant === "neutral-secondary-2" ||
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-brand-700":
                  variant === "brand-secondary-2" ||
                  variant === "brand-tertiary" ||
                  variant === "brand-secondary",
                "text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
              }
            )}
          >
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        <div
          className={SubframeUtils.twClassNames(
            "hidden h-4 w-4 flex-none items-center justify-center gap-2",
            { flex: loading, "h-3 w-3 flex-none": size === "small" }
          )}
        >
          <SubframeCore.Loader
            className={SubframeUtils.twClassNames(
              "font-['Inter'] text-[12px] font-[400] leading-[20px] text-black group-disabled/3b777358:text-neutral-400",
              {
                "text-caption font-caption": size === "small",
                "text-neutral-700":
                  variant === "neutral-primary-2" ||
                  variant === "neutral-secondary-2" ||
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-brand-700":
                  variant === "brand-secondary-2" ||
                  variant === "brand-tertiary" ||
                  variant === "brand-secondary",
                "text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
              }
            )}
          />
        </div>
        {children ? (
          <span
            className={SubframeUtils.twClassNames(
              "whitespace-nowrap text-body-bold font-body-bold text-black group-disabled/3b777358:text-neutral-400",
              {
                hidden: loading,
                "text-caption-bold font-caption-bold": size === "small",
                "text-neutral-700":
                  variant === "neutral-primary-2" ||
                  variant === "neutral-secondary-2" ||
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-brand-700":
                  variant === "brand-secondary-2" ||
                  variant === "brand-tertiary" ||
                  variant === "brand-secondary",
                "text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
              }
            )}
          >
            {children}
          </span>
        ) : null}
        {iconRight ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "text-body font-body text-black group-disabled/3b777358:text-neutral-400",
              {
                "text-heading-3 font-heading-3": size === "large",
                "text-neutral-700":
                  variant === "neutral-primary-2" ||
                  variant === "neutral-secondary-2" ||
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-brand-700":
                  variant === "brand-secondary-2" ||
                  variant === "brand-tertiary" ||
                  variant === "brand-secondary",
                "text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
              }
            )}
          >
            {iconRight}
          </SubframeCore.IconWrapper>
        ) : null}
      </button>
    );
  }
);

export const Button = ButtonRoot;
