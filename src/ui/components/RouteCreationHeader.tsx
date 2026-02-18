"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * RouteCreationHeader — https://app.subframe.com/11b10bc240cf/library?component=RouteCreationHeader_2c1f8c72-5508-4e9b-9575-25f7e76705fb
 */

import React from "react";
import { FeatherChevronLeft, FeatherEyeOff } from "@subframe/core";
import { FeatherCloud } from "@subframe/core";
import { FeatherDownload } from "@subframe/core";
import { FeatherEye } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";
import useToggleStore from "@/store/useToggleStore";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";

interface RouteCreationHeaderRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  mode?: "create" | "edit";
}

const RouteCreationHeaderRoot = React.forwardRef<
  HTMLDivElement,
  RouteCreationHeaderRootProps
>(function RouteCreationHeaderRoot(
  { className, mode, ...otherProps }: RouteCreationHeaderRootProps,
  ref
) {

  const navigate = useNavigate();

  const { toggleSimulationSettingsPanel, toggleTextSettingsPanel, isSimulationSettingsPanelOpen, isTextSettingsPanelOpen, toggleRouteSettingsPanel, isRouteSettingsPanelOpen } = useToggleStore();

  const { handleSubmit } = useFormContext<DisplayConfigPostRequest>();

  const onSubmit: SubmitHandler<DisplayConfigPostRequest> = async (data) => {
  if (mode === "edit") {
    // This branch handles the update operation
    const { error } = await supabase.from("routes").update(data).eq("id", data.id);
    if (error) {
      console.error("Error updating route:", error);
    } else {
      console.log("Route updated successfully:", data);
      navigate(-1); // Navigate back after successful update
    }
  } else {
    // This branch handles the insert operation
    const { error } = await supabase.from("routes").insert([data]);
    if (error) {
      console.error("Error saving route:", error);
    } else {
      console.log("Route saved successfully:", data);
      navigate(-1); // Navigate back after successful save
    }
  }
};

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-16 w-full items-center justify-between border-b border-solid border-neutral-border px-3 py-2",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-64 flex-none items-center justify-between">
        <Button  variant="neutral-secondary" icon={<FeatherChevronLeft />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      <div className="flex grow shrink-0 basis-0 flex-col items-center gap-2 px-2 py-2">
        <span className="text-body-bold font-body-bold text-default-font">
          Route Creation
        </span>
      </div>
      <div className="flex w-64 flex-none items-center justify-end gap-1">
        <Button variant="neutral-secondary" icon={isRouteSettingsPanelOpen ? <FeatherEyeOff /> : <FeatherEye />} onClick={toggleRouteSettingsPanel}>
          Route Settings
        </Button>
        <Button variant="neutral-secondary" icon={isSimulationSettingsPanelOpen ? <FeatherEyeOff /> : <FeatherEye />} onClick={toggleSimulationSettingsPanel}>
          Simulation Settings
        </Button>
        <Button variant="neutral-secondary" icon={isTextSettingsPanelOpen ? <FeatherEyeOff /> : <FeatherEye />} onClick={toggleTextSettingsPanel}>
          Text Settings
        </Button>

        <Button type="submit" onClick={handleSubmit(onSubmit)} variant="brand-secondary-2" icon={<FeatherCloud />}>
          {mode === "create" ? "Create Route" : "Update Route"}
        </Button>
      </div>
    </div>
  );
});

export const RouteCreationHeader = RouteCreationHeaderRoot;
