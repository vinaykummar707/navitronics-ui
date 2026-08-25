"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  FeatherSearch,
  FeatherX,
  FeatherCheck,
  FeatherGrid,
} from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Dialog } from "./Dialog";
import { TextField } from "./TextField";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { Badge } from "./Badge";
import { ToggleGroup } from "./ToggleGroup";
import {
  ALL_MATERIAL_SYMBOLS,
  MaterialSymbolItem,
} from "@/constants/materialSymbols";

interface MaterialSymbolPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIcon?: string;
  onSelectIcon: (iconName: string) => void;
}

const CATEGORIES = [
  "All",
  "Transit",
  "Navigation",
  "Amenities",
  "Alerts",
  "Places",
  "Time",
];

const INITIAL_RENDER_COUNT = 96;
const LOAD_MORE_STEP = 64;

export const MaterialSymbolPicker: React.FC<MaterialSymbolPickerProps> = ({
  open,
  onOpenChange,
  selectedIcon = "",
  onSelectIcon,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset search and scroll when dialog opens
  useEffect(() => {
    if (open) {
      setVisibleCount(INITIAL_RENDER_COUNT);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearch("");
      setSelectedCategory("All");
      setVisibleCount(INITIAL_RENDER_COUNT);
    }
  }, [open]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 120) {
      setVisibleCount((prev) => prev + LOAD_MORE_STEP);
    }
  }, []);

  const filteredSymbols = useMemo(() => {
    let list = ALL_MATERIAL_SYMBOLS;

    if (selectedCategory !== "All") {
      list = list.filter((item) => item.category === selectedCategory);
    }

    const q = search.toLowerCase().trim().replace(/\s+/g, "_");
    if (!q) return list;

    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [search, selectedCategory]);

  const displayedSymbols = useMemo(() => {
    return filteredSymbols.slice(0, visibleCount);
  }, [filteredSymbols, visibleCount]);

  const isExactMatch = useMemo(() => {
    const q = search.toLowerCase().trim().replace(/\s+/g, "_");
    return ALL_MATERIAL_SYMBOLS.some((item) => item.name === q);
  }, [search]);

  const handleSelect = (name: string) => {
    onSelectIcon(name);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="flex w-full max-w-4xl h-[620px] max-h-[90vh] flex-col items-stretch gap-0 rounded-xl border border-solid border-neutral-border bg-default-background p-0 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex w-full flex-none items-center justify-between border-b border-solid border-neutral-border px-6 py-4 bg-default-background">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-primary border border-brand-200 flex-shrink-0">
              <FeatherGrid className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-heading-3 font-heading-3 text-default-font text-base font-semibold">
                Select Material Symbol
              </span>
              <span className="text-caption font-caption text-subtext-color text-xs">
                Choose from {ALL_MATERIAL_SYMBOLS.length.toLocaleString()} Google Material Symbols for LED board
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedIcon && (
              <Badge variant="brand">
                Selected: {selectedIcon}
              </Badge>
            )}
            <IconButton
              variant="neutral-tertiary"
              size="medium"
              icon={<FeatherX />}
              onClick={() => onOpenChange(false)}
            />
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex w-full flex-none flex-col gap-3 border-b border-solid border-neutral-border bg-neutral-50 px-6 py-3.5">
          <div className="flex items-center gap-3 w-full">
            <TextField
              className="flex-1"
              icon={<FeatherSearch className="text-subtext-color" />}
            >
              <TextField.Input
                ref={searchInputRef}
                placeholder="Search across 4,200+ symbols (e.g. bus, train, arrow, wc, hospital, phone, car)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(INITIAL_RENDER_COUNT);
                }}
              />
            </TextField>

            <Button
              variant={selectedIcon ? "destructive-secondary" : "neutral-secondary"}
              size="medium"
              onClick={() => handleSelect("")}
            >
              None (No Icon)
            </Button>
          </div>

          {/* Subframe ToggleGroup Category Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <ToggleGroup
              value={selectedCategory}
              onValueChange={(val) => {
                if (val) {
                  setSelectedCategory(val);
                  setVisibleCount(INITIAL_RENDER_COUNT);
                }
              }}
              className="bg-neutral-200/50 p-0.5 rounded-lg"
            >
              {CATEGORIES.map((category) => (
                <ToggleGroup.Item
                  key={category}
                  value={category}
                  icon={null}
                  className={SubframeUtils.twClassNames(
                    "px-3 py-1 rounded-md text-xs transition-all",
                    selectedCategory === category
                      ? "bg-default-background text-brand-primary shadow-xs font-semibold"
                      : "text-subtext-color hover:text-default-font"
                  )}
                >
                  {category}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>

            <span className="text-xs text-subtext-color font-mono">
              {filteredSymbols.length.toLocaleString()} symbols
            </span>
          </div>
        </div>

        {/* Custom Symbol Bar if searching and not exact match */}
        {search.trim() && !isExactMatch && (
          <div className="flex w-full flex-none items-center justify-between border-b border-solid border-brand-200 bg-brand-50/70 px-6 py-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-brand-primary text-2xl flex-shrink-0">
                {search.trim().toLowerCase().replace(/\s+/g, "_")}
              </span>
              <span className="text-sm font-medium text-brand-900 truncate">
                Use custom icon name:{" "}
                <code className="rounded bg-brand-200/60 px-1.5 py-0.5 font-mono text-xs font-bold text-brand-950">
                  {search.trim().toLowerCase().replace(/\s+/g, "_")}
                </code>
              </span>
            </div>
            <Button
              variant="brand-primary"
              size="small"
              onClick={() =>
                handleSelect(search.trim().toLowerCase().replace(/\s+/g, "_"))
              }
            >
              Select Custom
            </Button>
          </div>
        )}

        {/* Grid List with Infinite Scroll (Fills remaining height consistently) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 w-full overflow-y-auto p-4 scrollbar-thin bg-default-background grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 auto-rows-max"
        >
          {displayedSymbols.map((item) => {
            const isSelected = selectedIcon === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelect(item.name)}
                title={`${item.label} (${item.name})`}
                className={SubframeUtils.twClassNames(
                  "group relative flex flex-col items-center justify-center gap-1.5 rounded-lg border p-2.5 text-center transition-all cursor-pointer hover:scale-105 shadow-2xs h-[76px]",
                  isSelected
                    ? "border-brand-primary bg-brand-50 text-brand-primary ring-2 ring-brand-primary/30"
                    : "border-neutral-border bg-default-background text-default-font hover:border-brand-primary/40 hover:bg-neutral-50"
                )}
              >
                <span
                  className={SubframeUtils.twClassNames(
                    "material-symbols-outlined text-2xl transition-transform group-hover:scale-110",
                    isSelected ? "text-brand-primary" : "text-neutral-700"
                  )}
                >
                  {item.name}
                </span>
                <span className="w-full truncate text-[11px] font-medium leading-tight text-neutral-600 group-hover:text-default-font">
                  {item.name}
                </span>

                {isSelected && (
                  <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-white">
                    <FeatherCheck className="h-2.5 w-2.5" />
                  </div>
                )}
              </button>
            );
          })}

          {displayedSymbols.length === 0 && (
            <div className="col-span-full py-16 text-center text-subtext-color flex flex-col items-center justify-center">
              <p className="text-sm font-medium">No symbols found for "{search}"</p>
              <p className="text-xs mt-1">Try another keyword or category</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex w-full flex-none items-center justify-between border-t border-solid border-neutral-border px-6 py-3 bg-neutral-50">
          <span className="text-xs text-subtext-color">
            Showing {displayedSymbols.length.toLocaleString()} of {filteredSymbols.length.toLocaleString()} symbols
            {displayedSymbols.length < filteredSymbols.length && " (Scroll down to load more)"}
          </span>
          <Button
            variant="neutral-secondary"
            size="medium"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
