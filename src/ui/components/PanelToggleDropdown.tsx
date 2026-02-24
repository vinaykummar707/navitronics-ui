"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Dropdown Menu — https://app.subframe.com/11b10bc240cf/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Panel Toggle Dropdown — https://app.subframe.com/11b10bc240cf/library?component=Panel+Toggle+Dropdown_cbe1c4c6-931a-45df-8842-e955e1f4e451
 */

import React from "react";
import { FeatherAirplay } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherRoute } from "@subframe/core";
import { FeatherType } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { DropdownMenu } from "./DropdownMenu";
import useToggleStore from "@/store/useToggleStore";

interface PanelToggleDropdownRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  showRoutePanel?: boolean;
  showSimulationPanel?: boolean;
  showTextSettingsPanel?: boolean;

  className?: string;
}

const PanelToggleDropdownRoot = React.forwardRef<
  HTMLDivElement,
  PanelToggleDropdownRootProps
>(function PanelToggleDropdownRoot(
  {
    showRoutePanel = false,
    showSimulationPanel = false,
    showTextSettingsPanel = false,
    className,
    ...otherProps
  }: PanelToggleDropdownRootProps,
  ref
) {

  const { toggleRouteSettingsPanel, toggleSimulationSettingsPanel, toggleTextSettingsPanel } = useToggleStore();

  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/cbe1c4c6 flex flex-col items-start gap-2",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <SubframeCore.DropdownMenu.Root>
        <SubframeCore.DropdownMenu.Trigger asChild={true}>
          <Button
            variant="neutral-secondary"
            iconRight={<FeatherChevronDown />}
          >
            Toggle Panels
          </Button>
        </SubframeCore.DropdownMenu.Trigger>
        <SubframeCore.DropdownMenu.Portal>
          <SubframeCore.DropdownMenu.Content
            side="bottom"
            align="end"
            sideOffset={4}
            asChild={true}
          >
            <DropdownMenu>
              <div  className="flex h-8 w-full flex-none items-center gap-2 rounded-md px-3 cursor-pointer hover:bg-neutral-100 active:bg-neutral-50" onClick={toggleRouteSettingsPanel}>
                <FeatherRoute className="text-body font-body text-default-font" />
                <span className="grow shrink-0 basis-0 text-body font-body text-default-font">
                  Route Panel
                </span>
                <FeatherCheck
                  className={SubframeUtils.twClassNames(
                    "hidden text-body font-body text-brand-600",
                    { flex: showRoutePanel }
                  )}
                />
              </div>
              <div className="flex h-8 w-full flex-none items-center gap-2 rounded-md px-3 cursor-pointer hover:bg-neutral-100 active:bg-neutral-50" onClick={toggleSimulationSettingsPanel}>
                <FeatherAirplay className="text-body font-body text-default-font" />
                <span className="grow shrink-0 basis-0 text-body font-body text-default-font">
                  Simulation Panel
                </span>
                <FeatherCheck
                  className={SubframeUtils.twClassNames(
                    "hidden text-body font-body text-brand-600",
                    { flex: showSimulationPanel }
                  )}
                />
              </div>
              <div className="flex h-8 w-full flex-none items-center gap-2 rounded-md px-3 cursor-pointer hover:bg-neutral-100 active:bg-neutral-50" onClick={toggleTextSettingsPanel}>
                <FeatherType className="text-body font-body text-default-font" />
                <span className="grow shrink-0 basis-0 text-body font-body text-default-font">
                  Text Settings Panel
                </span>
                <FeatherCheck
                  className={SubframeUtils.twClassNames(
                    "hidden text-body font-body text-brand-600",
                    { flex: showTextSettingsPanel }
                  )}
                />
              </div>
            </DropdownMenu>
          </SubframeCore.DropdownMenu.Content>
        </SubframeCore.DropdownMenu.Portal>
      </SubframeCore.DropdownMenu.Root>
    </div>
  );
});

export const PanelToggleDropdown = PanelToggleDropdownRoot;
