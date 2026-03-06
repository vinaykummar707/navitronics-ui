"use client";
/*
 * Documentation:
 * Icon Button — https://app.subframe.com/11b10bc240cf/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * PanelHeader — https://app.subframe.com/11b10bc240cf/library?component=PanelHeader_286b22f5-d2e6-41bd-bbab-508f594b21cc
 */

import React from "react";
import { FeatherChevronsDownUp, FeatherX } from "@subframe/core";
import { FeatherChevronsUpDown } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconButton } from "./IconButton";
import useToggleStore from "@/store/useToggleStore";

interface PanelHeaderRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: string;
  className?: string;
}

const PanelHeaderRoot = React.forwardRef<HTMLDivElement, PanelHeaderRootProps>(
  function PanelHeaderRoot(
    { title, className, ...otherProps }: PanelHeaderRootProps,
    ref
  ) {

    const {toggleSimulationSettingsPanel, toggleRouteSettingsPanel, toggleTextSettingsPanel} = useToggleStore()
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex h-12 w-full items-center justify-between border-b border-solid border-neutral-border pl-4 pr-2 py-2",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {title ? (
          <span className="text-caption font-caption text-default-font">
            {title}
          </span>
        ) : null}
        <div className="flex items-center justify-center gap-1">
          <IconButton
            className="h-7 w-7 flex-none"
            disabled={false}
            variant="neutral-primary"
            icon={<FeatherX/>}
            loading={false}
            onClick={() => {
              if(title.includes("Simulation")){
                toggleSimulationSettingsPanel();
              } else if(title.includes("Text")){
                toggleTextSettingsPanel();
              } else if(title.includes("Route")){
                toggleRouteSettingsPanel();
              }
            }}
          />
         
        </div>
      </div>
    );
  }
);

export const PanelHeader = PanelHeaderRoot;
