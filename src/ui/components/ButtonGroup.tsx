"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * ButtonGroup — https://app.subframe.com/11b10bc240cf/library?component=ButtonGroup_0a1c6dca-052a-4d28-b755-255f51fa70ac
 */

import React from "react";
import { FeatherCheck } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";

interface ButtonGroupRootProps extends React.HTMLAttributes<HTMLDivElement> {
  pis?: boolean;
  pas?: boolean;
  itms?: boolean;
  className?: string;
}

const ButtonGroupRoot = React.forwardRef<HTMLDivElement, ButtonGroupRootProps>(
  function ButtonGroupRoot(
    {
      pis = false,
      pas = false,
      itms = false,
      className,
      ...otherProps
    }: ButtonGroupRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/0a1c6dca flex w-full items-center gap-2",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <Button
          variant={pis ? "brand-secondary" : "neutral-primary"}
          size="small"
          icon={pis ? <FeatherCheck /> : undefined}
        >
          PIS
        </Button>
        <Button
          variant={pas ? "brand-secondary" : "neutral-primary"}
          size="small"
          icon={pas ? <FeatherCheck /> : undefined}
        >
          PAS
        </Button>
        <Button
          variant={itms ? "brand-secondary" : "neutral-primary"}
          size="small"
          icon={itms ? <FeatherCheck /> : undefined}
        >
          ITMS
        </Button>
      </div>
    );
  }
);

export const ButtonGroup = ButtonGroupRoot;
