"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  FeatherSearch,
  FeatherChevronDown,
  FeatherX,
  FeatherCheck,
} from "@subframe/core";
import * as SubframeUtils from "../utils";
import { TextField } from "./TextField";
import {
  ALL_MATERIAL_SYMBOLS,
  POPULAR_TRANSIT_SYMBOLS,
  MaterialSymbolItem,
} from "@/constants/materialSymbols";

interface IconSelectProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

const INITIAL_RENDER_COUNT = 60;
const LOAD_MORE_STEP = 50;

export const IconSelect: React.FC<IconSelectProps> = ({
  value = "",
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Reset search and visible items when dropdown opens/closes
  useEffect(() => {
    if (isOpen) {
      setVisibleCount(INITIAL_RENDER_COUNT);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch("");
      setVisibleCount(INITIAL_RENDER_COUNT);
    }
  }, [isOpen]);

  // Handle scroll to load more items
  const handleScroll = useCallback(() => {
    if (!listContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 80) {
      setVisibleCount((prev) => prev + LOAD_MORE_STEP);
    }
  }, []);

  const selectedItem = useMemo(() => {
    if (!value) return null;
    return (
      ALL_MATERIAL_SYMBOLS.find((item) => item.name === value) || {
        name: value,
        label: value,
        category: "Custom",
      }
    );
  }, [value]);

  const filteredSymbols = useMemo(() => {
    const q = search.toLowerCase().trim().replace(/\s+/g, "_");
    if (!q) {
      return ALL_MATERIAL_SYMBOLS;
    }
    return ALL_MATERIAL_SYMBOLS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(search.toLowerCase().trim()) ||
        (item.category && item.category.toLowerCase().includes(search.toLowerCase().trim()))
    );
  }, [search]);

  const isExactMatch = useMemo(() => {
    const q = search.toLowerCase().trim().replace(/\s+/g, "_");
    return ALL_MATERIAL_SYMBOLS.some((item) => item.name === q);
  }, [search]);

  const handleSelect = (name: string) => {
    onChange(name);
    setIsOpen(false);
  };

  const displayedSymbols = useMemo(() => {
    return filteredSymbols.slice(0, visibleCount);
  }, [filteredSymbols, visibleCount]);

  return (
    <div
      className={SubframeUtils.twClassNames(
        "relative flex w-full flex-col",
        className
      )}
      ref={dropdownRef}
    >
      {/* Select Trigger */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={SubframeUtils.twClassNames(
          "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-3 py-2 hover:border-neutral-300 transition-colors shadow-2xs",
          {
            "border-brand-primary ring-1 ring-brand-primary": isOpen,
          }
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedItem ? (
            <>
              <span className="material-symbols-outlined text-brand-primary text-xl flex-shrink-0">
                {selectedItem.name}
              </span>
              <span className="text-body font-body text-default-font truncate">
                {selectedItem.label}{" "}
                <span className="text-caption font-caption text-subtext-color">
                  ({selectedItem.name})
                </span>
              </span>
            </>
          ) : (
            <span className="text-body font-body text-subtext-color truncate">
              None (No Symbol)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={0}
              className="flex h-5 w-5 items-center justify-center rounded-full text-subtext-color hover:bg-neutral-100 hover:text-default-font cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              title="Clear icon"
            >
              <FeatherX className="h-3.5 w-3.5" />
            </span>
          )}
          <FeatherChevronDown
            className={SubframeUtils.twClassNames(
              "h-4 w-4 text-subtext-color transition-transform",
              {
                "rotate-180 text-default-font": isOpen,
              }
            )}
          />
        </div>
      </div>

      {/* Inline Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 flex w-full flex-col overflow-hidden rounded-md border border-solid border-neutral-border bg-default-background shadow-lg">
          {/* Search Box */}
          <div className="border-b border-solid border-neutral-border p-2 bg-neutral-50 flex flex-col gap-1">
            <TextField
              className="w-full"
              icon={<FeatherSearch className="text-subtext-color" />}
            >
              <TextField.Input
                ref={searchInputRef}
                placeholder="Search across 4,200+ Material Symbols..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(INITIAL_RENDER_COUNT);
                }}
              />
            </TextField>
            <div className="flex items-center justify-between px-1 text-[11px] text-subtext-color font-caption">
              <span>{filteredSymbols.length.toLocaleString()} symbols available</span>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-brand-primary hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listContainerRef}
            onScroll={handleScroll}
            className="max-h-72 overflow-y-auto p-1 flex flex-col gap-0.5 scrollbar-thin"
          >
            {/* None Option */}
            <div
              onClick={() => handleSelect("")}
              className={SubframeUtils.twClassNames(
                "group flex h-8.5 w-full cursor-pointer items-center justify-between rounded-md px-3 hover:bg-neutral-100 transition-colors",
                {
                  "bg-brand-50 text-brand-700 font-medium": !value,
                }
              )}
            >
              <span className="text-body font-body text-subtext-color">
                None (No Symbol)
              </span>
              {!value && (
                <FeatherCheck className="h-4 w-4 text-brand-600 inline-flex" />
              )}
            </div>

            {/* Custom typed symbol option if not empty and not exact match */}
            {search.trim() && !isExactMatch && (
              <div
                onClick={() =>
                  handleSelect(
                    search.trim().toLowerCase().replace(/\s+/g, "_")
                  )
                }
                className="group flex h-9 w-full cursor-pointer items-center justify-between rounded-md px-3 bg-brand-50/50 hover:bg-brand-100 transition-colors border border-dashed border-brand-200 my-0.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-brand-primary text-xl flex-shrink-0">
                    {search.trim().toLowerCase().replace(/\s+/g, "_")}
                  </span>
                  <span className="text-body-bold font-body-bold text-brand-900 text-xs truncate">
                    Use symbol: "{search.trim().toLowerCase().replace(/\s+/g, "_")}"
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-brand-200/60 text-brand-800 px-1.5 py-0.5 rounded">
                  Select
                </span>
              </div>
            )}

            {/* Filtered Symbols */}
            {displayedSymbols.map((item) => {
              const isSelected = value === item.name;
              return (
                <div
                  key={item.name}
                  onClick={() => handleSelect(item.name)}
                  className={SubframeUtils.twClassNames(
                    "group flex h-9 w-full cursor-pointer items-center justify-between rounded-md px-3 hover:bg-neutral-100 transition-colors",
                    {
                      "bg-brand-50 text-brand-700 font-medium": isSelected,
                    }
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-default-font text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                      {item.name}
                    </span>
                    <span className="text-body font-body text-default-font truncate">
                      {item.label}
                    </span>
                    <span className="text-caption font-caption text-subtext-color text-xs truncate">
                      ({item.name})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.category && item.category !== "Material Symbol" && (
                      <span className="text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded uppercase font-medium">
                        {item.category}
                      </span>
                    )}
                    {isSelected && (
                      <FeatherCheck className="h-4 w-4 text-brand-600 inline-flex flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}

            {displayedSymbols.length < filteredSymbols.length && (
              <div className="py-2 text-center text-caption font-caption text-subtext-color">
                Scroll to load more ({displayedSymbols.length} of {filteredSymbols.length.toLocaleString()})...
              </div>
            )}

            {filteredSymbols.length === 0 && !search.trim() && (
              <div className="py-4 text-center text-caption font-caption text-subtext-color">
                No symbols available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
