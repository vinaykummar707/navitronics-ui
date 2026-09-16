import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FeatherSun, FeatherMoon, FeatherMonitor } from "@subframe/core";

interface ThemeToggleProps {
  variant?: "button" | "segmented" | "dropdown-item";
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "button",
  className = "",
  showLabel = false,
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same footprint to prevent layout shift
    if (variant === "segmented") {
      return (
        <div className={`flex items-center rounded-lg border border-neutral-border bg-neutral-100 p-1 gap-1 ${className}`}>
          <div className="h-8 w-24 rounded-md bg-transparent" />
        </div>
      );
    }
    return (
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-border bg-neutral-100/50 text-subtext-color ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    if (theme === "system") {
      setTheme(isDark ? "light" : "dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  if (variant === "segmented") {
    return (
      <div
        className={`inline-flex items-center rounded-lg border border-neutral-border bg-neutral-100 p-1 gap-1 ${className}`}
        role="group"
        aria-label="Theme selection"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-caption font-caption-bold transition-all cursor-pointer ${
            theme === "light"
              ? "bg-default-background text-brand-primary shadow-xs ring-1 ring-neutral-border"
              : "text-subtext-color hover:text-default-font hover:bg-neutral-200/50"
          }`}
          title="Light Mode"
        >
          <FeatherSun className="h-4 w-4" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-caption font-caption-bold transition-all cursor-pointer ${
            theme === "dark"
              ? "bg-default-background text-brand-primary shadow-xs ring-1 ring-neutral-border"
              : "text-subtext-color hover:text-default-font hover:bg-neutral-200/50"
          }`}
          title="Dark Mode"
        >
          <FeatherMoon className="h-4 w-4" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-caption font-caption-bold transition-all cursor-pointer ${
            theme === "system"
              ? "bg-default-background text-brand-primary shadow-xs ring-1 ring-neutral-border"
              : "text-subtext-color hover:text-default-font hover:bg-neutral-200/50"
          }`}
          title="System Preference"
        >
          <FeatherMonitor className="h-4 w-4" />
          <span>System</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-neutral-border bg-default-background px-2.5 text-subtext-color transition-all hover:border-brand-primary/50 hover:bg-neutral-100 hover:text-default-font cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/40 ${className}`}
      title={`Current: ${theme} (${isDark ? "Dark" : "Light"}). Click to switch theme.`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <FeatherMoon className="h-4 w-4 text-brand-primary transition-transform hover:-rotate-12" />
      ) : (
        <FeatherSun className="h-4 w-4 text-amber-500 transition-transform hover:rotate-45" />
      )}
      {showLabel && (
        <span className="text-caption font-caption capitalize text-default-font">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
