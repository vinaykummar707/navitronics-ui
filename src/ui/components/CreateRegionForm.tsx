"use client";
// @subframe/sync-disable

import React from "react";
import { useForm } from "react-hook-form";
import { FeatherCheck, FeatherUser, FeatherX } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { TextField } from "./TextField";
import { IRegion, IRegionCreate, regionCrud } from "@/types/IRegion";
import { checkActiveDuplicate } from "@/hooks/useCrud";
import { toast } from "react-toastify";

interface CreateRegionFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  organizationId: string;
  initialData?: IRegion | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateRegionFormRoot = React.forwardRef<
  HTMLDivElement,
  CreateRegionFormProps
>(function CreateRegionFormRoot(
  { className, organizationId, initialData, onSuccess, onCancel, ...otherProps },
  ref
) {
  // Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<IRegionCreate>({
    defaultValues: { name: initialData?.name || "" },
  });

  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const isEditMode = !!initialData;
  const { useCreate, useUpdate } = regionCrud;
  const { mutate: createRegion, isPending: isCreating } = useCreate();
  const { mutate: updateRegion, isPending: isUpdating } = useUpdate();

  const onSubmit = async (values: IRegionCreate) => {
    setApiError(null);
    const trimmedName = values.name?.trim();
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 50) {
      setError("name", { message: "Region name must be between 2 and 50 characters" });
      return;
    }

    // Pre-submission duplicate check for active regions within this organization
    const isDup = await checkActiveDuplicate(
      "regions",
      "name",
      trimmedName,
      { organization_id: organizationId },
      isEditMode && initialData ? initialData.id : undefined
    );

    if (isDup) {
      const msg = `A region named "${trimmedName}" already exists in this organization.`;
      setApiError(msg);
      toast.error(msg);
      return;
    }

    if (isEditMode && initialData) {
      updateRegion(
        {
          id: initialData.id,
          payload: {
            id: initialData.id,
            name: trimmedName,
            organization_id: organizationId,
          },
        },
        {
          onSuccess: () => {
            toast.success("Region updated successfully");
            reset(); // Reset form after successful update
            if (onSuccess) onSuccess();
          },
          onError: (error: any) => {
            if (error?.code === "23505" || error?.message?.includes("23505")) {
              const msg = `A region named "${trimmedName}" already exists in this organization.`;
              setApiError(msg);
              toast.error(msg);
            } else if (error?.message?.includes("deleted or is no longer accessible")) {
              toast.error("This region was deleted by another user and cannot be updated.");
            } else {
              toast.error(`Failed to update region: ${error.message || "Unknown error"}`);
            }
            console.error("Update Error:", error);
          },
        }
      );
    } else {
      createRegion(
        {
          name: trimmedName,
          organization_id: organizationId,
        },
        {
          onSuccess: () => {
            toast.success("Region created successfully");
            reset(); // Reset form after successful creation
            if (onSuccess) onSuccess();
          },
          onError: (error: any) => {
            if (error?.code === "23505" || error?.message?.includes("23505")) {
              const msg = `A region named "${trimmedName}" already exists in this organization.`;
              setApiError(msg);
              toast.error(msg);
            } else {
              toast.error(`Failed to create region: ${error.message || "Unknown error"}`);
            }
            console.error("Creation Error:", error);
          },
        }
      );
    }
  };

  const handleCancel = () => {
    reset(initialData ? { name: initialData.name } : { name: "" });
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
            {isEditMode ? "Update Region" : "Create Region"}
          </span>
          <span className="text-caption font-caption text-subtext-color">
            {isEditMode
              ? "Edit details to update the region"
              : "Fill in details to create a new region"}
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
              Region Name <span className="text-red-500">*</span>
            </span>
          }
          helpText={errors.name?.message || apiError || "Name of the region"}
          icon={<FeatherUser />}
          error={!!errors.name || !!apiError}
        >
          <TextField.Input
            placeholder="Ex: Mumbai"
            {...register("name", { required: "Region name is required" })}
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
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update Region"
            : "Create Region"}
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
            {isEditMode ? "Updating region..." : "Creating region..."}
          </span>
        )}
        {successMessage && (
          <span className="text-sm text-green-700">{successMessage}</span>
        )}
      </div>
    </form>
  );
});

export const CreateRegionForm = CreateRegionFormRoot;