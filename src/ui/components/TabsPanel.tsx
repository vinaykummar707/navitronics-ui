"use client";
/*
 * Documentation:
 * Tabs — https://app.subframe.com/11b10bc240cf/library?component=Tabs_e1ad5091-8ad8-4319-b1f7-3e47f0256c20
 * TabsPanel — https://app.subframe.com/11b10bc240cf/library?component=TabsPanel_ebc70a28-cb3a-45d5-8906-b6431bea5c62
 */

import React from "react";
import { FeatherBus } from "@subframe/core";
import { FeatherBusFront } from "@subframe/core";
import { FeatherMapPin } from "@subframe/core";
import { FeatherRectangleHorizontal } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Tabs } from "./Tabs";
import useTabsStore, { Tab } from "@/store/useTabsStore";
import useSimulationStore from "@/store/useSimulationStore";
import RBAC from "@/components/RBAC";
import { useFormContext } from "react-hook-form";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";

interface TabsPanelRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const TabsPanelRoot = React.forwardRef<HTMLDivElement, TabsPanelRootProps>(
  function TabsPanelRoot(
    { className, ...otherProps }: TabsPanelRootProps,
    ref,
  ) {
    const { selectedTab, setSelectedTab } = useTabsStore();
    const { watch } = useFormContext<DisplayConfigPostRequest>();

    const front = watch("front") || [];
    const side = watch("side") || [];
    const rear = watch("rear") || [];
    const internal = watch("internal") || [];
    const stops = watch("stops") || [];

    const currentTabSims = watch(selectedTab as any) || [];
    const currentSimIndex = useSimulationStore((state) => state.selectedSimulationIndex);
    const activeSim = currentTabSims[currentSimIndex];

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

        {/* Right Info: Active Signboard & Resolution */}
        <div className="flex items-center gap-2 pr-2">
          {activeSim && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-0/40 border border-neutral-border text-xs">
              <span className="text-[10px] uppercase text-subtext-color font-semibold tracking-wider">
                Matrix
              </span>
              <span className="font-mono font-bold text-brand-primary">
                {activeSim.width} × {activeSim.height}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export const TabsPanel = TabsPanelRoot;
