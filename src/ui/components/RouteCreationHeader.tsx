"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * RouteCreationHeader — https://app.subframe.com/11b10bc240cf/library?component=RouteCreationHeader_2c1f8c72-5508-4e9b-9575-25f7e76705fb
 */
// @subframe/sync-disable
import React, { useState } from "react";
import {
  FeatherChevronLeft,
  FeatherCloud,
  FeatherDownload,
  FeatherEye,
  FeatherEyeOff,
  FeatherRoute,
  FeatherSliders,
} from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";
import useToggleStore from "@/store/useToggleStore";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { PanelToggleDropdown } from "./PanelToggleDropdown";
import { JsonViewerDialog } from "./JsonViewerDialog";
import RBAC from "@/components/RBAC";
import { IRoute, routeCrud } from "@/types/IRoute";
import { toast } from "react-toastify";
import { Dialog } from "./Dialog";

interface RouteCreationHeaderRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  mode?: "create" | "edit";
}

const RouteCreationHeaderRoot = React.forwardRef<
  HTMLDivElement,
  RouteCreationHeaderRootProps
>(function RouteCreationHeaderRoot(
  { className, mode, ...otherProps }: RouteCreationHeaderRootProps,
  ref,
) {
  const navigate = useNavigate();
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {
    isRoutePanelOpen,
    toggleRoutePanel,
    isInspectorOpen,
    toggleInspector,
  } = useToggleStore();

  const { handleSubmit, getValues, watch, formState } = useFormContext<IRoute>();
  const { useCreate, useUpdate } = routeCrud;
  const { mutate: createRoute, isPending: isCreatingRoute } = useCreate();
  const { mutate: updateRoute, isPending: isUpdatingRoute } = useUpdate();

  // Watch route summary data
  const routeNumber = watch("route_number");
  const isSplitRoute = watch("is_split_route");
  const routeNumber1 = watch("route_number_1");
  const routeNumber2 = watch("route_number_2");
  const source = watch("source");
  const destination = watch("destination");
  const isReturn = watch("return");

  const displayRouteNum = isSplitRoute
    ? `${routeNumber1 || "?"} / ${routeNumber2 || "?"}`
    : routeNumber || "---";

  const handleExportRoute = () => {
    const values = getValues();
    const safeNum = (displayRouteNum || "config").replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `route-v2-${safeNum}.json`;
    const blob = new Blob([JSON.stringify(values, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported route config as ${filename}`);
  };

  const onSubmit: SubmitHandler<IRoute> = async (data) => {
    if (isCreatingRoute || isUpdatingRoute) return;
    if (mode === "edit") {
      updateRoute(
        {
          id: data.id,
          payload: data,
        },
        {
          onSuccess: () => {
            console.log("Route updated successfully:", data);
            toast.success("Route updated successfully");
            setHasBeenSaved(true);
            navigate(-1);
          },
          onError: (error) => {
            console.error("Error updating route:", error);
            toast.error("Error updating route");
          },
        },
      );
    } else {
      createRoute(data, {
        onSuccess: () => {
          console.log("Route created successfully:", data);
          toast.success("Route created successfully");
          setHasBeenSaved(true);
          navigate(-1);
        },
        onError: (error) => {
          console.error("Error creating route:", error);
          toast.error("Error creating route");
        },
      });
    }
  };

  const handleBackClick = () => {
    if (!hasBeenSaved && formState.isDirty) {
      setShowConfirmDialog(true);
    } else {
      navigate(-1);
    }
  };

  const handleConfirmGoBack = () => {
    setShowConfirmDialog(false);
    navigate(-1);
  };

  const handleConfirmSaveAndExit = () => {
    if (isCreatingRoute || isUpdatingRoute) return;
    setShowConfirmDialog(false);
    handleSubmit(onSubmit)();
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex min-h-[52px] w-full items-center justify-between border-b border-solid border-neutral-border bg-sidebar-background px-2.5 sm:px-4 py-1.5 sm:py-2 select-none gap-2 shrink-0 pt-safe",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      {/* Left: Back Action & Live Route Identity */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button
          variant="neutral-secondary"
          size="small"
          className="h-8 text-xs font-medium px-2 sm:px-3"
          icon={<FeatherChevronLeft className="h-3.5 w-3.5" />}
          onClick={handleBackClick}
          title="Return to Routes list"
        >
          <span className="hidden sm:inline">Back</span>
        </Button>

        {formState.isDirty && !hasBeenSaved && (
          <span
            className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0"
            title="Unsaved changes"
          />
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 border-l border-neutral-border pl-2 sm:pl-3 min-w-0">
          <span className="px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-primary font-mono font-bold text-xs tracking-wider shrink-0">
            {displayRouteNum}
          </span>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-default-font font-medium truncate max-w-[180px] lg:max-w-[280px]">
            <span className="truncate">{source || "Origin"}</span>
            <span className="text-brand-primary font-bold">➔</span>
            <span className="truncate">{destination || "Terminus"}</span>
          </div>
          {isReturn && (
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-warning-500/10 text-warning-400 text-[10px] uppercase font-bold tracking-wider shrink-0">
              Return
            </span>
          )}
        </div>
      </div>

      {/* Center Studio Title (Hidden on smaller displays to prevent button collision) */}
      <div className="hidden xl:flex items-center gap-2 px-2 shrink-0">
        <span className="text-caption-bold font-caption-bold text-default-font uppercase tracking-wider text-[11px] text-subtext-color">
          {mode === "edit" ? "Route Editor Studio" : "Route Creation Studio"}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
        <div className="hidden md:inline-flex">
          <Button
            variant="neutral-secondary"
            size="small"
            className="h-8 text-xs font-medium px-2.5 sm:px-3"
            icon={<FeatherDownload className="h-3.5 w-3.5" />}
            onClick={handleExportRoute}
            title="Export route configuration as JSON"
          >
            Export
          </Button>
        </div>

        <div className="hidden lg:inline-flex">
          <RBAC roles={["master"]} features={[]}>
            <JsonViewerDialog
              dialogTitle="Route Configuration JSON"
              buttonLabel="JSON"
              getJsonData={() => getValues()}
            />
          </RBAC>
        </div>

        <Button
          variant={isRoutePanelOpen ? "brand-secondary" : "neutral-secondary"}
          size="small"
          className="h-8 text-xs font-medium px-2 sm:px-3"
          icon={<FeatherRoute className="h-3.5 w-3.5" />}
          onClick={toggleRoutePanel}
          title={isRoutePanelOpen ? "Hide Route Info Panel" : "Show Route Info Panel"}
        >
          <span className="hidden sm:inline">Route Info</span>
          <span className="sm:hidden">Info</span>
        </Button>

        <Button
          variant={isInspectorOpen ? "brand-secondary" : "neutral-secondary"}
          size="small"
          className="h-8 text-xs font-medium px-2 sm:px-3"
          icon={<FeatherSliders className="h-3.5 w-3.5" />}
          onClick={toggleInspector}
          title={isInspectorOpen ? "Hide Slide Inspector" : "Show Slide Inspector"}
        >
          <span className="hidden sm:inline">Slide Inspector</span>
          <span className="sm:hidden">Inspector</span>
        </Button>

        <Button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          variant="brand-primary"
          size="small"
          className="h-8 text-xs font-medium px-2.5 sm:px-3 shadow-xs shrink-0"
          icon={<FeatherCloud className="h-3.5 w-3.5" />}
          disabled={isCreatingRoute || isUpdatingRoute}
          loading={isCreatingRoute || isUpdatingRoute}
        >
          <span>
            {mode === "create"
              ? isCreatingRoute
                ? "Saving..."
                : "Save Route"
              : isUpdatingRoute
                ? "Updating..."
                : "Update Route"}
          </span>
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <Dialog.Content className="flex p-4 sm:p-6 w-[90vw] max-w-[340px] font-sans gap-4 flex-col">
          <h1 className="text-lg font-sans font-bold text-default-font">Unsaved Changes</h1>
          <p className="text-sm text-subtext-color">
            You have unsaved changes. Are you sure you want to go back without
            saving?
          </p>
          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="neutral-secondary"
              className="w-full"
              onClick={() => setShowConfirmDialog(false)}
            >
              Keep Editing
            </Button>
            <Button
              variant="neutral-secondary"
              className="w-full"
              onClick={handleConfirmGoBack}
            >
              Go Back Without Saving
            </Button>
            <Button
              variant="brand-primary"
              className="w-full"
              onClick={handleConfirmSaveAndExit}
            >
              Save and Exit
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
});

export const RouteCreationHeader = RouteCreationHeaderRoot;
