"use client";
// @subframe/sync-disable

import React from "react";
import { useForm } from "react-hook-form";
import { FeatherCheck, FeatherUser } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { Select } from "./Select";
import { depotCrud, IDepot } from "@/types/IDepot";
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
    if (isUpdate && initialData) {
      await updateDepot({
        id: initialData.id,
        payload: {
          id: initialData.id,
          name: values.name,
          region_id: values.region_id,
          organization_id: organizationId,
        },
      }, {
        onSuccess: () => {
          toast.success("Depot updated successfully");
          reset();
          if (onSuccess) onSuccess();
        }
        , onError: (error) => {
          toast.error(`Failed to update depot: ${error.message}`);
          console.error("Update Error:", error);
        }
      });
    } else {
      await createDepot({
        name: values.name,
        region_id: values.region_id,
        organization_id: organizationId,
      }, {
        onSuccess: () => {
          toast.success("Depot created successfully");
          reset();
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          toast.error(`Failed to create depot: ${error.message}`);
          console.error("Creation Error:", error);
        }
      });
    }
  };

  const handleCancel = () => {
    reset(initialData
      ? { name: initialData.name, region_id: initialData.region_id }
      : { name: "", region_id: "" });
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
        <div className="flex w-full flex-col items-start gap-2">
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
    </div>
  );
});

export const CreateDepotForm = CreateDepotFormRoot;