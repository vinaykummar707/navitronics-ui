"use client";
/*
 * Documentation:
 * ControlAccordion — https://app.subframe.com/11b10bc240cf/library?component=ControlAccordion_02fd28eb-e693-4480-aa67-324390fa558c
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * TextPropertiesControls — https://app.subframe.com/11b10bc240cf/library?component=TextPropertiesControls_4706f298-d7c0-434c-a1d3-858aec786daf
 * UpperHalfTextControl — https://app.subframe.com/11b10bc240cf/library?component=UpperHalfTextControl_b90bd228-fb07-4b50-8df6-5bacedd402b3
 */

import React from "react";
import { FeatherTextSize } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { ControlAccordion } from "./ControlAccordion";
import { IconWithBackground } from "./IconWithBackground";
import { TextPropertiesControls } from "./TextPropertiesControls";

interface UpperHalfTextControlRootProps
  extends React.ComponentProps<typeof ControlAccordion> {
  className?: string;
}

const UpperHalfTextControlRoot = React.forwardRef<
  React.ElementRef<typeof ControlAccordion>,
  UpperHalfTextControlRootProps
>(function UpperHalfTextControlRoot(
  { className, ...otherProps }: UpperHalfTextControlRootProps,
  ref
) {
  return (
    <ControlAccordion
      className={className}
      title="Upper Half Text"
      controls={<TextPropertiesControls textProperty="upperHalfText" />}
      icon={
        <IconWithBackground
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

export const UpperHalfTextControl = UpperHalfTextControlRoot;
