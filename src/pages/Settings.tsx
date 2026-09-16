import React from "react";
import { useTheme } from "next-themes";
import {
  FeatherSun,
  FeatherMoon,
  FeatherMonitor,
  FeatherCheck,
  FeatherShield,
  FeatherType,
  FeatherEye,
} from "@subframe/core";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import useLoggedUserStore from "@/store/useLoggedUserStore";

export const Settings: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const user = useLoggedUserStore((state) => state.user);

  const themeOptions = [
    {
      id: "light",
      name: "Light Mode",
      description: "Clean, high-contrast daylight theme with crisp slate typography.",
      icon: <FeatherSun className="h-5 w-5 text-amber-500" />,
      previewClass: "bg-white border-slate-200 text-slate-900",
      accentClass: "bg-sky-500",
    },
    {
      id: "dark",
      name: "Dark Mode",
      description: "Deep cosmic slate theme with electric cyan accents and low eye strain.",
      icon: <FeatherMoon className="h-5 w-5 text-cyan-400" />,
      previewClass: "bg-[#0f1522] border-slate-800 text-slate-100",
      accentClass: "bg-cyan-400",
    },
    {
      id: "system",
      name: "System Default",
      description: "Automatically synchronizes with your device's operating system preference.",
      icon: <FeatherMonitor className="h-5 w-5 text-subtext-color" />,
      previewClass: "bg-gradient-to-r from-white to-[#0f1522] border-neutral-border text-default-font",
      accentClass: "bg-brand-primary",
    },
  ];

  return (
    <div className="flex h-full w-full flex-col items-start gap-6 overflow-y-auto pb-10">
      {/* Page Header */}
      <div className="flex w-full flex-col items-start gap-1">
        <h1 className="w-full text-heading-2 font-heading-2 text-default-font">
          Settings & Preferences
        </h1>
        <p className="text-body font-body text-subtext-color">
          Customize your interface appearance, accessibility, and display preferences.
        </p>
      </div>

      {/* Appearance Section */}
      <div className="flex w-full flex-col gap-4 rounded-xl border border-neutral-border bg-sidebar-background p-6 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FeatherEye className="h-5 w-5 text-brand-primary" />
            <h2 className="text-heading-3 font-heading-3 text-default-font">
              Appearance & Theme
            </h2>
          </div>
          <p className="text-caption font-caption text-subtext-color">
            Choose how Navitronix RMS looks for you. Preferences are saved automatically.
          </p>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {themeOptions.map((option) => {
            const isSelected = theme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                className={`relative flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-brand-primary bg-brand-50/40 ring-2 ring-brand-primary/30 shadow-sm"
                    : "border-neutral-border bg-default-background hover:border-neutral-300 hover:bg-neutral-100/50"
                }`}
              >
                {/* Active checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-brand-primary-foreground shadow-xs">
                    <FeatherCheck className="h-3 w-3 stroke-[3]" />
                  </div>
                )}

                {/* Preview Mini Box */}
                <div
                  className={`flex h-16 w-full items-center justify-between rounded-md border p-3 shadow-inner ${option.previewClass}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${option.accentClass}`} />
                    <div className="h-2 w-12 rounded bg-current opacity-40" />
                  </div>
                  <div className="h-4 w-4 rounded bg-current opacity-20" />
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span className="text-caption-bold font-caption-bold text-default-font">
                      {option.name}
                    </span>
                  </div>
                  <p className="text-micro font-micro text-subtext-color">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Typography & Accessibility Standard Card */}
      <div className="flex w-full flex-col gap-4 rounded-xl border border-neutral-border bg-sidebar-background p-6 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FeatherType className="h-5 w-5 text-brand-primary" />
            <h2 className="text-heading-3 font-heading-3 text-default-font">
              Accessibility & Typography Hierarchy
            </h2>
          </div>
          <p className="text-caption font-caption text-subtext-color">
            Standardized type scales and WCAG AA compliant contrast ratios active on this system.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="flex flex-col gap-1.5 rounded-lg border border-neutral-border bg-default-background p-3.5">
            <span className="text-micro font-micro-bold text-subtext-color uppercase tracking-wider">
              Micro Scale (11px)
            </span>
            <span className="text-micro font-micro text-default-font">
              Status tags, timestamps & metadata badges
            </span>
            <Badge variant="brand">Active Micro Badge</Badge>
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg border border-neutral-border bg-default-background p-3.5">
            <span className="text-micro font-micro-bold text-subtext-color uppercase tracking-wider">
              Caption Scale (13px)
            </span>
            <span className="text-caption font-caption text-default-font">
              Form field labels, table headers & tooltips
            </span>
            <span className="text-caption-bold font-caption-bold text-brand-primary">
              Sample Bold Caption
            </span>
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg border border-neutral-border bg-default-background p-3.5">
            <span className="text-micro font-micro-bold text-subtext-color uppercase tracking-wider">
              Body Scale (15px)
            </span>
            <span className="text-body font-body text-default-font">
              Primary content, table rows, and dialogue text
            </span>
            <span className="text-body-bold font-body-bold text-default-font">
              Sample Body Text
            </span>
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg border border-neutral-border bg-default-background p-3.5">
            <span className="text-micro font-micro-bold text-subtext-color uppercase tracking-wider">
              WCAG AA Contrast
            </span>
            <div className="flex items-center gap-1 text-success-800 text-caption font-caption-bold">
              <FeatherShield className="h-4 w-4" />
              <span>Compliant (&gt; 4.5:1)</span>
            </div>
            <span className="text-micro font-micro text-subtext-color">
              Active mode: <strong>{resolvedTheme}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Account & Session Info */}
      <div className="flex w-full flex-col gap-3 rounded-xl border border-neutral-border bg-sidebar-background p-6 shadow-xs">
        <h2 className="text-heading-3 font-heading-3 text-default-font">
          Current Session Information
        </h2>
        <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-4 text-caption font-caption">
          <div className="flex flex-col gap-0.5">
            <span className="text-subtext-color">User Account</span>
            <span className="font-semibold text-default-font">{user?.email || "N/A"}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-subtext-color">Assigned Role</span>
            <span className="font-semibold text-default-font capitalize">
              {user?.role?.name?.replace("_", " ") || "User"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-subtext-color">Application</span>
            <span className="font-semibold text-default-font">Navitronix RMS v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
