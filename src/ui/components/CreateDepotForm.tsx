"use client";
// @subframe/sync-disable

import React from "react";
import { useForm } from "react-hook-form";
import { FeatherCheck, FeatherUser } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { useCreateDepot, useUpdateDepot } from "@/api/depot/hooks";
import { Select } from "./Select";



interface CreateDepotFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  organizationId: string;
  region_id: string;
  depot?: {
    id: string;
    name: string;
    region_id: string;
  };
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
  { className, organizationId, region_id, depot, onSuccess, onCancel, ...otherProps },
  ref
) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      name: depot?.name || "",
      region_id: depot?.region_id || region_id || "",
    },
  });

  const [createDepot] = useCreateDepot();
  const [updateDepot] = useUpdateDepot();
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const isUpdate = !!depot;

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    setSuccessMessage(null);
    try {
      if (isUpdate) {
        await updateDepot({
          variables: {
            id: depot!.id,
            name: values.name,
          },
        });
        setSuccessMessage("Depot updated successfully.");
      } else {
        await createDepot({
          variables: {
            name: values.name,
            organization_id: organizationId,
            region_id: values.region_id,
          },
        });
        setSuccessMessage("Depot created successfully.");
        reset({ name: "", region_id: "" });
      }
      onSuccess && onSuccess();
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  const handleCancel = () => {
    reset(depot
      ? { name: depot.name, region_id: depot.region_id }
      : { name: "", region_id: "" });
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
            {isUpdate ? "Update Depot" : "Create Depot"}
          </span>
          <span className="text-caption font-caption text-subtext-color">
            {isUpdate
              ? "Edit the details below to update the depot"
              : "Fill in the details below to create a new depot"}
          </span>
        </div>
        
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4">
          <TextField
            className="h-auto w-full flex-none"
            label="Depot Name"
            helpText="Name of the depot"
            icon={<FeatherUser />}
            error={errors.name?.message || apiError}
          >
            <TextField.Input
              placeholder="Ex: Mumbai"
              {...register("name", { required: "Depot name is required" })}
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
              {isUpdate ? "Updating depot..." : "Creating depot..."}
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

export const CreateDepotForm = CreateDepotFormRoot;