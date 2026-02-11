"use client";
/*
 * Documentation:
 * ControlAccordion — https://app.subframe.com/11b10bc240cf/library?component=ControlAccordion_02fd28eb-e693-4480-aa67-324390fa558c
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * MainTextControl — https://app.subframe.com/11b10bc240cf/library?component=MainTextControl_e4ff4b67-10c4-42bc-9858-9354ca649270
 * TextPropertiesControls — https://app.subframe.com/11b10bc240cf/library?component=TextPropertiesControls_4706f298-d7c0-434c-a1d3-858aec786daf
 */

import React from "react";
import { FeatherTextSize } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { ControlAccordion } from "./ControlAccordion";
import { IconWithBackground } from "./IconWithBackground";
import { TextPropertiesControls } from "./TextPropertiesControls";

interface MainTextControlRootProps
  extends React.ComponentProps<typeof ControlAccordion> {
  className?: string;
}

const MainTextControlRoot = React.forwardRef<
  React.ElementRef<typeof ControlAccordion>,
  MainTextControlRootProps
>(function MainTextControlRoot(
  { className, ...otherProps }: MainTextControlRootProps,
  ref
) {
  return (
    <ControlAccordion
      className={className}
      title="Source-Destination"
      controls={<TextPropertiesControls textProperty="text" />}
      icon={
        <IconWithBackground
          variant="error"
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

export const MainTextControl = MainTextControlRoot;
