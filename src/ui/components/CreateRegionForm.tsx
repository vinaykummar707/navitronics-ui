"use client";
// @subframe/sync-disable

import React from "react";
import { useForm } from "react-hook-form";
import { FeatherCheck } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { useCreateRegion, useUpdateRegion } from "@/api/region/hooks";

interface CreateRegionFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  organizationId: string;
  region?: {
    id: string;
    name: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormValues = {
  name: string;
};

const CreateRegionFormRoot = React.forwardRef<
  HTMLDivElement,
  CreateRegionFormProps
>(function CreateRegionFormRoot(
  { className, organizationId, region, onSuccess, onCancel, ...otherProps },
  ref
) {
  // Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<FormValues>({
    defaultValues: { name: region?.name || "" },
  });

  const [createRegion] = useCreateRegion();
  const [updateRegion] = useUpdateRegion();
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const isUpdate = !!region;

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    setSuccessMessage(null);
    try {
      if (isUpdate) {
        await updateRegion({
          variables: {
            id: region!.id,
            name: values.name,
          },
        });
        setSuccessMessage("Region updated successfully.");
      } else {
        await createRegion({
          variables: {
            name: values.name,
            organization_id: organizationId,
          },
        });
        setSuccessMessage("Region created successfully.");
        reset();
      }
      onSuccess && onSuccess();
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  const handleCancel = () => {
    reset(region ? { name: region.name } : { name: "" });
    setSuccessMessage(null);
    setApiError(null);
    onCancel && onCancel();
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col items-start gap-4 bg-default-background px-6 py-6",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
        <div className="flex w-full flex-col items-start gap-1">
          <span className="text-heading-3 font-heading-3 text-default-font">
            {isUpdate ? "Update Region" : "Create Region"}
          </span>
          <span className="text-caption font-caption text-subtext-color">
            {isUpdate
              ? "Edit the details below to update the region"
              : "Fill in the details below to create a new region"}
          </span>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4">
          <TextField
            className="h-auto w-full flex-none"
            label="Region Name"
            helpText="Name of the region"
            icon={<FeatherUser />}
            error={
              errors.name?.message ||
              apiError
            }
          >
            <TextField.Input
              placeholder="Ex: Mumbai"
              {...register("name", { required: "Region name is required" })}
            />
          </TextField>
        </div>
        <div className="flex w-full flex-col items-start gap-2">
          <Button
            className="h-9 w-full flex-none"
            icon={<FeatherCheck />}
            type="submit"
            disabled={isSubmitting}
          >
            {isUpdate ? "Update" : "Submit"}
          </Button>
          <Button
            className="h-9 w-full flex-none"
            variant="neutral-secondary"
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {isSubmitting && (
            <span className="text-sm text-subtext-color">
              {isUpdate ? "Updating region..." : "Creating region..."}
            </span>
          )}
          {successMessage && (
            <span className="text-sm text-green-700">{successMessage}</span>
          )}
        </div>
      </form>
    </div>
  );
});

export const CreateRegionForm = CreateRegionFormRoot;