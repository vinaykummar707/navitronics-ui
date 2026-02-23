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
import { IRegion, IRegionCreate, regionCrud } from "@/types/IRegion";
import { toast } from "react-toastify";
interface CreateRegionFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  organizationId: string;
  initialData?: IRegion | null;
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
  { className, organizationId, initialData, onSuccess, onCancel, ...otherProps },
  ref
) {
  // Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<IRegionCreate>({
    defaultValues: { name: initialData?.name || "" },
  });


  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

    const isEditMode = !!initialData;
    const { useCreate, useUpdate } = regionCrud;
    const { mutate: createRegion, isPending: loading } = useCreate();
    const { mutate: updateRegion } = useUpdate();

  const onSubmit = async (values: IRegionCreate) => {
    if (isEditMode && initialData) {
      await updateRegion({
        id: initialData.id,
        payload: {
          id: initialData.id,
          name: values.name,
          organization_id: organizationId,
        },
      }, {
        onSuccess: () => {
          toast.success("Region updated successfully");
          reset(); // Reset form after successful update
          if (onSuccess) onSuccess();
        }
        , onError: (error) => {
          toast.error(`Failed to update region: ${error.message}`);
          console.error("Update Error:", error);
        }
      });
    } else {
      await createRegion({
        name: values.name,
        organization_id: organizationId,
        // Add other fields if necessary
      }, {
        onSuccess: () => {
          toast.success("Region created successfully");
          reset(); // Reset form after successful creation
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          toast.error(`Failed to create region: ${error.message}`);
          console.error("Creation Error:", error);
        }
      });
     
    };
  };
  const handleCancel = () => {
    reset(initialData ? { name: initialData.name } : { name: "" });
    setSuccessMessage(null);
    setApiError(null);
    onCancel();
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
            {isEditMode ? "Update Region" : "Create Region"}
          </span>
          <span className="text-caption font-caption text-subtext-color">
            {isEditMode
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
            {isEditMode ? "Update" : "Submit"}
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
              {isEditMode ? "Updating region..." : "Creating region..."}
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