import { create } from "zustand";


export enum Tab {
  FRONT = "front",
  SIDE = "side",
  REAR = "rear",
  INTERNAL = "internal",
  STOPS = "stops",
}

type TabsStore = {
  selectedTab: Tab;
  setSelectedTab: (value: Tab) => void;
};

const useTabsStore = create<TabsStore>((set) => ({
  // set initial selectedTab value to the first tab from your list
  selectedTab: Tab.FRONT,
  setSelectedTab: (value) => set({ selectedTab: value }),
}));

export default useTabsStore;