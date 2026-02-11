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

interface TabsPanelRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const TabsPanelRoot = React.forwardRef<HTMLDivElement, TabsPanelRootProps>(
  function TabsPanelRoot(
    { className, ...otherProps }: TabsPanelRootProps,
    ref,
  ) {
    const { selectedTab, setSelectedTab } = useTabsStore();
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex h-12 w-full flex-col items-start gap-2 border-b border-solid border-neutral-border pl-2",
          className,
        )}
        ref={ref}
        {...otherProps}
      >
        <Tabs className="h-12 w-auto flex-none">
          <Tabs.Item
            active={selectedTab === Tab.FRONT}
            onClick={() => setSelectedTab(Tab.FRONT)}
            icon={<FeatherBusFront />}
          >
            Front
          </Tabs.Item>
          <Tabs.Item
            active={selectedTab === Tab.SIDE}
            onClick={() => setSelectedTab(Tab.SIDE)}
            icon={<FeatherBus />}
          >
            Side
          </Tabs.Item>
          <Tabs.Item
            active={selectedTab === Tab.REAR}
            onClick={() => setSelectedTab(Tab.REAR)}
            icon={<FeatherBusFront />}
          >
            Rear
          </Tabs.Item>
          <Tabs.Item
            active={selectedTab === Tab.INTERNAL}
            onClick={() => setSelectedTab(Tab.INTERNAL)}
            icon={<FeatherRectangleHorizontal />}
          >
            Internal
          </Tabs.Item>
          <Tabs.Item
            active={selectedTab === Tab.STOPS}
            onClick={() => setSelectedTab(Tab.STOPS)}
            icon={<FeatherMapPin />}
          >
            Stops
          </Tabs.Item>
        </Tabs>
      </div>
    );
  },
);

export const TabsPanel = TabsPanelRoot;
