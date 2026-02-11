"use client";
/*
 * Documentation:
 * ControlAccordion — https://app.subframe.com/11b10bc240cf/library?component=ControlAccordion_02fd28eb-e693-4480-aa67-324390fa558c
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * LowerHalfTextControl — https://app.subframe.com/11b10bc240cf/library?component=LowerHalfTextControl_75976a45-1519-4346-ae23-9dabb5226bf0
 * TextPropertiesControls — https://app.subframe.com/11b10bc240cf/library?component=TextPropertiesControls_4706f298-d7c0-434c-a1d3-858aec786daf
 */

import React from "react";
import { FeatherTextSize } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { ControlAccordion } from "./ControlAccordion";
import { IconWithBackground } from "./IconWithBackground";
import { TextPropertiesControls } from "./TextPropertiesControls";

interface LowerHalfTextControlRootProps
  extends React.ComponentProps<typeof ControlAccordion> {
  className?: string;
}

const LowerHalfTextControlRoot = React.forwardRef<
  React.ElementRef<typeof ControlAccordion>,
  LowerHalfTextControlRootProps
>(function LowerHalfTextControlRoot(
  { className, ...otherProps }: LowerHalfTextControlRootProps,
  ref
) {
  return (
    <ControlAccordion
      className={className}
      title="Lower Half Text"
      controls={<TextPropertiesControls textProperty="lowerHalfText" />}
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

export const LowerHalfTextControl = LowerHalfTextControlRoot;
