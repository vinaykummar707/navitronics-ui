"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * RouteCreationHeader — https://app.subframe.com/11b10bc240cf/library?component=RouteCreationHeader_2c1f8c72-5508-4e9b-9575-25f7e76705fb
 */
// @subframe/sync-disable
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
import { PanelToggleDropdown } from "./PanelToggleDropdown";
import { JsonViewerDialog } from "./JsonViewerDialog";
import RBAC from "@/components/RBAC";
import { IRoute, routeCrud } from "@/types/IRoute";
import { toast } from "react-toastify";

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

  const {
    isSimulationSettingsPanelOpen,
    isTextSettingsPanelOpen,
    isRouteSettingsPanelOpen,
  } = useToggleStore();

  const { handleSubmit, getValues } = useFormContext<IRoute>();
  const { useCreate, useUpdate } = routeCrud;
  const { mutate: createRoute, isPending: isCreatingRoute } = useCreate();
  const { mutate: updateRoute, isPending: isUpdatingRoute } = useUpdate();

  const onSubmit: SubmitHandler<IRoute> = async (data) => {
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
            navigate(-1); // Navigate back after successful update
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
          navigate(-1); // Navigate back after successful creation
        },
        onError: (error) => {
          console.error("Error creating route:", error);
          toast.error("Error creating route");
        },
      });

    }
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-16 w-full items-center justify-between border-b border-solid border-neutral-border px-3 py-2",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-64 flex-none items-center justify-between">
        <Button
          variant="neutral-primary"
          icon={<FeatherChevronLeft />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </div>
      <div className="flex grow shrink-0 basis-0 flex-col items-center gap-2 px-2 py-2">
        <span className="text-body-bold font-body-bold text-default-font">
          Route Creation
        </span>
      </div>
      <div className="flex w-64 flex-none items-center justify-end gap-1">
        <PanelToggleDropdown
          showRoutePanel={isRouteSettingsPanelOpen}
          showSimulationPanel={isSimulationSettingsPanelOpen}
          showTextSettingsPanel={isTextSettingsPanelOpen}
        />
        <RBAC roles={["master"]} features={[]}>
          <JsonViewerDialog
            dialogTitle="Route Configuration"
            buttonLabel="Show JSON"
            jsonContent={JSON.stringify(getValues())}
          />
        </RBAC>
        <Button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          variant="brand-primary"
          icon={<FeatherCloud />}
          disabled={isCreatingRoute || isUpdatingRoute}
        >
          {mode === "create" ? isCreatingRoute ? "Saving Route..." : "Save Route" : isUpdatingRoute ? "Updating Route..." : "Update Route"}
        </Button>
      </div>
    </div>
  );
});

export const RouteCreationHeader = RouteCreationHeaderRoot;
