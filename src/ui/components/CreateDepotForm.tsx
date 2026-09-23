"use client";
// @subframe/sync-disable

import React from "react";
import { useForm } from "react-hook-form";
import { FeatherCheck, FeatherUser, FeatherX } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { TextField } from "./TextField";
import { Select } from "./Select";
import { depotCrud, IDepot } from "@/types/IDepot";
import { checkActiveDuplicate } from "@/hooks/useCrud";
import { toast } from "react-toastify";

interface CreateDepotFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  organizationId: string;
  region_id: string;
  initialData?: IDepot | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormValues = {
  name: string;
  region_id: string;
};

const CreateDepotFormRoot = React.forwardRef<
  HTMLDivElement,
  CreateDepotFormProps
>(function CreateDepotFormRoot(
  { className, organizationId, region_id, initialData, onSuccess, onCancel, ...otherProps },
  ref
) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<IDepot>({
    defaultValues: {
      name: initialData?.name || "",
      region_id: initialData?.region_id || region_id || "",
    },
  });

  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const { useCreate, useUpdate } = depotCrud;
  const { mutate: createDepot, isPending: isCreating } = useCreate();
  const { mutate: updateDepot, isPending: isUpdating } = useUpdate();

  const isUpdate = !!initialData;

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    setSuccessMessage(null);
    const trimmedName = values.name?.trim();
    if (!trimmedName) {
      setError("name", { message: "Depot name is required" });
      return;
    }
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setError("name", { message: "Depot name must be between 2 and 50 characters" });
      return;
    }

    const targetRegionId = values.region_id || region_id;

    // Pre-submission duplicate check for active depots within this region/organization
    const isDup = await checkActiveDuplicate(
      "depots",
      "name",
      trimmedName,
      { region_id: targetRegionId, organization_id: organizationId },
      isUpdate && initialData ? initialData.id : undefined
    );

    if (isDup) {
      const msg = `A depot named "${trimmedName}" already exists in this region.`;
      setApiError(msg);
      toast.error(msg);
      return;
    }

    if (isUpdate && initialData) {
      updateDepot(
        {
          id: initialData.id,
          payload: {
            id: initialData.id,
            name: trimmedName,
            region_id: targetRegionId,
            organization_id: organizationId,
          },
        },
        {
          onSuccess: () => {
            toast.success("Depot updated successfully");
            reset();
            if (onSuccess) onSuccess();
          },
          onError: (error: any) => {
            if (error?.code === "23505" || error?.message?.includes("23505")) {
              const msg = `A depot named "${trimmedName}" already exists in this region.`;
              setApiError(msg);
              toast.error(msg);
            } else if (error?.message?.includes("deleted or is no longer accessible")) {
              toast.error("This depot was deleted by another user and cannot be updated.");
            } else {
              toast.error(`Failed to update depot: ${error.message || "Unknown error"}`);
            }
            console.error("Update Error:", error);
          },
        }
      );
    } else {
      createDepot(
        {
          name: trimmedName,
          region_id: targetRegionId,
          organization_id: organizationId,
        },
        {
          onSuccess: () => {
            toast.success("Depot created successfully");
            reset();
            if (onSuccess) onSuccess();
          },
          onError: (error: any) => {
            if (error?.code === "23505" || error?.message?.includes("23505")) {
              const msg = `A depot named "${trimmedName}" already exists in this region.`;
              setApiError(msg);
              toast.error(msg);
            } else {
              toast.error(`Failed to create depot: ${error.message || "Unknown error"}`);
            }
            console.error("Creation Error:", error);
          },
        }
      );
    }
  };

  const handleCancel = () => {
    reset(
      initialData
        ? { name: initialData.name, region_id: initialData.region_id }
        : { name: "", region_id: "" }
    );
    setSuccessMessage(null);
    setApiError(null);
    if (onCancel) onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={SubframeUtils.twClassNames(
        "flex h-full w-full sm:w-[480px] max-w-[100vw] flex-col bg-default-background overflow-hidden",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {/* Fixed Header */}
      <div className="flex flex-none w-full items-start justify-between gap-4 border-b border-neutral-border px-6 py-4 bg-default-background">
        <div className="flex flex-col items-start gap-1">
          <span className="text-heading-3 font-heading-3 text-default-font">
            {isUpdate ? "Update Depot" : "Create Depot"}
          </span>
          <span className="text-caption font-caption text-subtext-color">
            {isUpdate
              ? "Edit details to update the depot"
              : "Fill in details to create a new depot"}
          </span>
        </div>
        {onCancel && (
          <IconButton
            icon={<FeatherX className="h-4 w-4" />}
            size="small"
            variant="neutral-tertiary"
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            title="Close"
          />
        )}
      </div>

      {/* Scrollable Center Form Body */}
      <div className="flex flex-1 min-h-0 w-full flex-col items-start gap-4 overflow-y-auto px-6 py-5">
        <TextField
          className="h-auto w-full flex-none"
          label={
            <span>
              Depot Name <span className="text-red-500">*</span>
            </span>
          }
          helpText={errors.name?.message || apiError || "Name of the depot"}
          icon={<FeatherUser />}
          error={!!errors.name || !!apiError}
        >
          <TextField.Input
            placeholder="Ex: Mumbai"
            {...register("name", { required: "Depot name is required" })}
          />
        </TextField>
      </div>

      {/* Fixed Footer Actions */}
      <div className="flex flex-none w-full flex-col items-start gap-2 border-t border-neutral-border bg-default-background px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <Button
          className="h-9 w-full flex-none"
          icon={<FeatherCheck />}
          type="submit"
          disabled={isSubmitting || isCreating || isUpdating}
          loading={isCreating || isUpdating}
        >
          {isCreating || isUpdating
            ? isUpdate
              ? "Updating..."
              : "Creating..."
            : isUpdate
            ? "Update Depot"
            : "Create Depot"}
        </Button>
        <Button
          className="h-9 w-full flex-none"
          variant="neutral-secondary"
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting || isCreating || isUpdating}
        >
          Cancel
        </Button>
        {isSubmitting && (
          <span className="text-sm text-subtext-color">
            {isUpdate ? "Updating depot..." : "Creating depot..."}
          </span>
        )}
        {successMessage && (
          <span className="text-sm text-green-700">{successMessage}</span>
        )}
      </div>
    </form>
  );
});

export const CreateDepotForm = CreateDepotFormRoot;