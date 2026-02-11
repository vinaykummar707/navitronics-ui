"use client";
/*
 * Documentation:
 * ControlAccordion — https://app.subframe.com/11b10bc240cf/library?component=ControlAccordion_02fd28eb-e693-4480-aa67-324390fa558c
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * RouteNumberControl — https://app.subframe.com/11b10bc240cf/library?component=RouteNumberControl_9619fde6-f09b-47b4-ad50-04123510ad59
 * TextPropertiesControls — https://app.subframe.com/11b10bc240cf/library?component=TextPropertiesControls_4706f298-d7c0-434c-a1d3-858aec786daf
 */

import React from "react";
import { FeatherTextSize } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { ControlAccordion } from "./ControlAccordion";
import { IconWithBackground } from "./IconWithBackground";
import { TextPropertiesControls } from "./TextPropertiesControls";

interface RouteNumberControlRootProps
  extends React.ComponentProps<typeof ControlAccordion> {
  className?: string;
}

const RouteNumberControlRoot = React.forwardRef<
  React.ElementRef<typeof ControlAccordion>,
  RouteNumberControlRootProps
>(function RouteNumberControlRoot(
  { className, ...otherProps }: RouteNumberControlRootProps,
  ref
) {
  return (
    <ControlAccordion
      className={className}
      title="Route Number"
      controls={<TextPropertiesControls textProperty="sideText" />}
      icon={
        <IconWithBackground
          variant="warning"
          size="small"
          icon={<FeatherTextSize />}
          square={false}
        />
      }
      ref={ref}
      {...otherProps}
    />
  );
});

export const RouteNumberControl = RouteNumberControlRoot;
