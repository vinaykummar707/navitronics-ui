"use client";
/*
 * Documentation:
 * Tabs — https://app.subframe.com/11b10bc240cf/library?component=Tabs_e1ad5091-8ad8-4319-b1f7-3e47f0256c20
 * TabsPanel — https://app.subframe.com/11b10bc240cf/library?component=TabsPanel_ebc70a28-cb3a-45d5-8906-b6431bea5c62
 */

import React from "react";
import { FeatherBus } from "@subframe/core";
import { FeatherBusFront } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherColumns2 } from "@subframe/core";
import { FeatherMapPin } from "@subframe/core";
import { FeatherMaximize2 } from "@subframe/core";
import { FeatherMinus } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherRectangleHorizontal } from "@subframe/core";
import { FeatherRows3 } from "@subframe/core";
import { FeatherSpeech } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Tabs } from "./Tabs";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { DropdownMenu } from "./DropdownMenu";
import useTabsStore, { Tab } from "@/store/useTabsStore";
import RBAC from "@/components/RBAC";
import { useFormContext } from "react-hook-form";
import { DisplayConfigPostRequest, SimulationType } from "@/types/routeConfigV2";

interface TabsPanelRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onAddSlide?: (format: string, type?: SimulationType, defaultText?: string) => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onFitToScreen?: () => void;
}

const TabsPanelRoot = React.forwardRef<HTMLDivElement, TabsPanelRootProps>(
  function TabsPanelRoot(
    { className, onAddSlide, zoom, onZoomIn, onZoomOut, onResetZoom, onFitToScreen, ...otherProps }: TabsPanelRootProps,
    ref,
  ) {
    const { selectedTab, setSelectedTab } = useTabsStore();
    const { watch } = useFormContext<DisplayConfigPostRequest>();

    const front = watch("front") || [];
    const side = watch("side") || [];
    const rear = watch("rear") || [];
    const internal = watch("internal") || [];
    const stops = watch("stops") || [];

    const renderCountBadge = (count: number, isActive: boolean) => (
      <span
        className={SubframeUtils.twClassNames(
          "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tracking-tight transition-colors",
          isActive
            ? "bg-brand-500/20 text-brand-primary ring-1 ring-brand-500/30"
            : "bg-neutral-100 text-subtext-color"
        )}
      >
        {count}
      </span>
    );

    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex h-12 w-full items-center justify-between border-b border-solid border-neutral-border bg-sidebar-background px-2 select-none overflow-x-auto no-scrollbar touch-scroll-x gap-2",
          className,
        )}
        ref={ref}
        {...otherProps}
      >
        <Tabs className="h-12 w-auto flex-none flex-nowrap shrink-0">
          <Tabs.Item
            active={selectedTab === Tab.FRONT}
            onClick={() => setSelectedTab(Tab.FRONT)}
            icon={<FeatherBusFront />}
          >
            <div className="flex items-center gap-1.5">
              <span>Front</span>
              {renderCountBadge(front.length, selectedTab === Tab.FRONT)}
            </div>
          </Tabs.Item>
          <Tabs.Item
            active={selectedTab === Tab.SIDE}
            onClick={() => setSelectedTab(Tab.SIDE)}
            icon={<FeatherBus />}
          >
            <div className="flex items-center gap-1.5">
              <span>Side</span>
              {renderCountBadge(side.length, selectedTab === Tab.SIDE)}
            </div>
          </Tabs.Item>
          <Tabs.Item
            active={selectedTab === Tab.REAR}
            onClick={() => setSelectedTab(Tab.REAR)}
            icon={<FeatherBusFront />}
          >
            <div className="flex items-center gap-1.5">
              <span>Rear</span>
              {renderCountBadge(rear.length, selectedTab === Tab.REAR)}
            </div>
          </Tabs.Item>
          <Tabs.Item
            active={selectedTab === Tab.INTERNAL}
            onClick={() => setSelectedTab(Tab.INTERNAL)}
            icon={<FeatherRectangleHorizontal />}
          >
            <div className="flex items-center gap-1.5">
              <span>Internal</span>
              {renderCountBadge(internal.length, selectedTab === Tab.INTERNAL)}
            </div>
          </Tabs.Item>
          <RBAC features={['PAS']} roles={["master", "organization_admin", "region_admin", "depot_admin"]}>
            <Tabs.Item
              active={selectedTab === Tab.STOPS}
              onClick={() => setSelectedTab(Tab.STOPS)}
              icon={<FeatherMapPin />}
            >
              <div className="flex items-center gap-1.5">
                <span>Stops</span>
                {renderCountBadge(stops.length, selectedTab === Tab.STOPS)}
              </div>
            </Tabs.Item>
          </RBAC>
        </Tabs>

        {/* Right Info: Add Slide + Active Signboard Resolution */}
        <div className="flex items-center gap-2 pr-2">
          {onAddSlide && selectedTab !== Tab.STOPS && (
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild>
                <Button
                  variant="brand-primary"
                  size="small"
                  iconRight={<FeatherChevronDown />}
                >
                  Add Slide
                </Button>
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={4}
                  asChild
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherRectangleHorizontal />}
                      onClick={() => onAddSlide("single")}
                    >
                      Single-Line Route
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherColumns2 />}
                      onClick={() => onAddSlide("two")}
                    >
                      Two-Line (Route # + Terminus)
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherRows3 />}
                      onClick={() => onAddSlide("three")}
                    >
                      Three-Line (Route # + Dual Text)
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      icon={<FeatherSpeech />}
                      onClick={() => onAddSlide("single", "slogan", "PLEASE WEAR SEAT BELT")}
                    >
                      Slogan Slide
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          )}
          {zoom !== undefined && (
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-neutral-border bg-sidebar-background p-1 shadow-xs">
              <IconButton
                variant="neutral-secondary"
                size="small"
                icon={<FeatherMinus className="h-3.5 w-3.5" />}
                title="Zoom Out"
                onClick={onZoomOut}
                disabled={zoom <= 10}
              />
              <button
                type="button"
                onClick={onResetZoom}
                className="px-2 py-0.5 text-xs font-mono font-bold text-default-font hover:text-brand-primary min-w-[44px] text-center cursor-pointer"
                title="Reset Zoom to 100%"
              >
                {zoom}%
              </button>
              <IconButton
                variant="neutral-secondary"
                size="small"
                icon={<FeatherPlus className="h-3.5 w-3.5" />}
                title="Zoom In"
                onClick={onZoomIn}
                disabled={zoom >= 175}
              />
              <div className="h-3.5 w-[1px] bg-neutral-border mx-0.5" />
              <Button
                variant="neutral-secondary"
                size="small"
                icon={<FeatherMaximize2 className="h-3.5 w-3.5" />}
                onClick={onFitToScreen}
                title="Fit to Screen"
              >
                Fit
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export const TabsPanel = TabsPanelRoot;
