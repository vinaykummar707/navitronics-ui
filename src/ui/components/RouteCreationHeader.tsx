"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * RouteCreationHeader — https://app.subframe.com/11b10bc240cf/library?component=RouteCreationHeader_2c1f8c72-5508-4e9b-9575-25f7e76705fb
 */
// @subframe/sync-disable
import React, { useState } from "react";
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
    isSimulationSettingsPanelOpen,
    isTextSettingsPanelOpen,
    isRouteSettingsPanelOpen,
    toggleRouteSettingsPanel,
    toggleSimulationSettingsPanel,
    toggleTextSettingsPanel,
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
            setHasBeenSaved(true);
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
          setHasBeenSaved(true);
          navigate(-1); // Navigate back after successful creation
        },
        onError: (error) => {
          console.error("Error creating route:", error);
          toast.error("Error creating route");
        },
      });
    }
  };

  const handleBackClick = () => {
    if (!hasBeenSaved) {
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
    setShowConfirmDialog(false);
    handleSubmit(onSubmit)();
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-12 w-full items-center justify-between border-b border-solid border-neutral-border px-3 py-2",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-64 flex-none items-center justify-between">
        <Button
          variant="neutral-primary"
          icon={<FeatherChevronLeft />}
          onClick={handleBackClick}
        >
          Back
        </Button>
      </div>
      <div className="flex grow shrink-0 basis-0 flex-col items-center gap-2 px-2 py-2">
        <span className="text-body-bold font-body-bold text-default-font">
          Route Creation
        </span>
      </div>
      <div className="flex items-center justify-end gap-2 flex-wrap">
        <Button
          variant={isSimulationSettingsPanelOpen ? "brand-primary" : "neutral-primary"}
          icon={isSimulationSettingsPanelOpen ? <FeatherEye /> : <FeatherEyeOff />}
          onClick={toggleSimulationSettingsPanel}
          title={isSimulationSettingsPanelOpen ? "Hide Simulation Settings" : "Show Simulation Settings"}
        >
          Simulation Settings
        </Button>
        <Button
          variant={isTextSettingsPanelOpen ? "brand-primary" : "neutral-primary"}
          icon={isTextSettingsPanelOpen ? <FeatherEye /> : <FeatherEyeOff />}
          onClick={toggleTextSettingsPanel}
          title={isTextSettingsPanelOpen ? "Hide Text Settings" : "Show Text Settings"}
        >
          Text Settings
        </Button>
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
          {mode === "create"
            ? isCreatingRoute
              ? "Saving Route..."
              : "Save Route"
            : isUpdatingRoute
              ? "Updating Route..."
              : "Update Route"}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <Dialog.Content className="flex p-4 max-w-[300px] font-sans gap-4 flex-col">
          <h1 className="text-lg font-sans">Unsaved Changes</h1>
          <p>
            You have unsaved changes. Are you sure you want to go back without
            saving?
          </p>
          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="neutral-secondary" className="w-full"
              onClick={() => setShowConfirmDialog(false)}
            >
              Keep Editing
          </Button>
          <Button variant="neutral-secondary" className="w-full" onClick={handleConfirmGoBack}>
            Go Back Without Saving
          </Button>
          <Button variant="brand-primary" className="w-full" onClick={handleConfirmSaveAndExit}>
            Save and Exit
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
});

export const RouteCreationHeader = RouteCreationHeaderRoot;
