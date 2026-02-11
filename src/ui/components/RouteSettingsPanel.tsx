"use client";
/*
 * Documentation:
 * ControlAccordion — https://app.subframe.com/11b10bc240cf/library?component=ControlAccordion_02fd28eb-e693-4480-aa67-324390fa558c
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * PanelHeader — https://app.subframe.com/11b10bc240cf/library?component=PanelHeader_286b22f5-d2e6-41bd-bbab-508f594b21cc
 * RouteConfigurationForm — https://app.subframe.com/11b10bc240cf/library?component=RouteConfigurationForm_e8e925aa-55b1-4bf5-a6ca-b26d8de92bf6
 * RouteSettingsPanel — https://app.subframe.com/11b10bc240cf/library?component=RouteSettingsPanel_3c29757f-eb43-4b44-a993-fa6a60e8cd92
 */

import React from "react";
import { FeatherRoute } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { ControlAccordion } from "./ControlAccordion";
import { IconWithBackground } from "./IconWithBackground";
import { PanelHeader } from "./PanelHeader";
import { RouteConfigurationForm } from "./RouteConfigurationForm";

interface RouteSettingsPanelRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const RouteSettingsPanelRoot = React.forwardRef<
  HTMLDivElement,
  RouteSettingsPanelRootProps
>(function RouteSettingsPanelRoot(
  { className, ...otherProps }: RouteSettingsPanelRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col items-start overflow-y-auto",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <PanelHeader title="Route Settings" />
      <ControlAccordion
        title="Route Information"
        controls={
          <RouteConfigurationForm className="h-auto w-full flex-none" />
        }
        icon={
          <IconWithBackground
            variant="error"
            size="small"
            icon={<FeatherRoute />}
            square={false}
          />
        }
      />
    </div>
  );
});

export const RouteSettingsPanel = RouteSettingsPanelRoot;
