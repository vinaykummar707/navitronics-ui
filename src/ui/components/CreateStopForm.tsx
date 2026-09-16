import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FeatherCheck, FeatherMapPin, FeatherPin } from "@subframe/core";
import { Button } from "./Button";
import { TextField } from "./TextField";
import * as SubframeUtils from "../utils";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { IStop, IStopCreate, stopCrud } from "@/types/IStop";
import { toast } from "react-toastify";

// @subframe/sync-disable

interface CreateStopFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  depotId: string;
  initialData?: any;
  onSuccess?: (stop?: IStop) => void;
  onCancel?: () => void;
}

const CreateStopFormRoot: React.FC<CreateStopFormProps> = React.forwardRef<
  HTMLDivElement,
  CreateStopFormProps
>((props, ref) => {
  const {
    className,
    initialData,
    onSuccess,
    onCancel,
    depotId,
    ...otherProps
  } = props;
  const selectedOrganization = useOrganizationStore(
    (state) => state.selectedOrganization,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<IStopCreate>({
    defaultValues: {
      depot_id: depotId,
      organization_id: selectedOrganization?.id || "",
      down_latitude: "",
      down_longitude: "",
      name: "",
      up_latitude: "",
      up_longitude: "",
    },
  });
  const { mutate: createStop, isPending: isCreatingStop } =
    stopCrud.useCreate();
  const { mutate: updateStop, isPending: isUpdatingStop } =
    stopCrud.useUpdate();

  // Set initial form values when initialData is provided
  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const mode = !!initialData;

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      organization_id: data.organization_id || selectedOrganization?.id || "",
      depot_id: depotId,
    };

    if (initialData) {
      delete payload.stop_audios;
      updateStop(
        {
          id: payload.id,
          payload: payload,
        },
        {
          onSuccess: () => {
            console.log("Stop updated successfully:", payload);
            toast.success("Stop updated successfully");
            reset();
            onSuccess?.();
          },
          onError: (error) => {
            console.error("Error updating Stop:", error);
            toast.error(`Error updating Stop: ${error.message || "Unknown error"}`);
          },
        },
      );
    } else {
      createStop(payload, {
        onSuccess: (successResponse) => {
          console.log("Stop created successfully:", successResponse);
          toast.success("Stop created successfully");
          reset();
          onSuccess?.(successResponse);
        },
        onError: (error) => {
          console.error("Error creating Stop:", error);
          toast.error(`Error creating Stop: ${error.message || "Unknown error"}`);
        },
      });
    }
  };

  return (
    <form
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col items-start gap-4 bg-default-background px-4 py-4 sm:px-6 sm:py-6 overflow-y-auto",
        className,
      )}
      ref={ref}
      onSubmit={handleSubmit(onSubmit)}
      {...otherProps}
    >
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-3 font-heading-3 text-default-font">
          {mode ? "Edit Stop" : "Create Stop"}
        </span>
        <span className="text-caption font-caption text-subtext-color">
          {mode
            ? "Update the stop and coordinate details below"
            : "Fill in the details below to create a new Stop"}
        </span>
      </div>
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4">
        <TextField
          className="h-auto w-full flex-none"
          label={
            <span>
              Stop Name <span className="text-red-500">*</span>
            </span>
          }
          error={!!errors?.name}
          helpText={errors.name?.message || "Name of the stop"}
          icon={<FeatherMapPin />}
        >
          <TextField.Input
            {...register("name", { required: "Stop name is required" })}
            placeholder="Gachibowli"
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label={
            <span>
              Up Latitude <span className="text-red-500">*</span>
            </span>
          }
          error={!!errors.up_latitude}
          helpText={
            errors.up_latitude?.message || "Upward Latitude (-90 to 90)"
          }
          icon={<FeatherPin />}
        >
          <TextField.Input
            {...register("up_latitude", {
              required: "Up Latitude is required",
              validate: (val) => {
                const num = parseFloat(String(val));
                if (isNaN(num)) return "Must be a valid number";
                if (num < -90 || num > 90) return "Latitude must be between -90 and 90";
                return true;
              },
            })}
            placeholder="17.3850"
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label={
            <span>
              Up Longitude <span className="text-red-500">*</span>
            </span>
          }
          error={!!errors.up_longitude}
          helpText={
            errors.up_longitude?.message || "Upward Longitude (-180 to 180)"
          }
          icon={<FeatherPin />}
        >
          <TextField.Input
            {...register("up_longitude", {
              required: "Up Longitude is required",
              validate: (val) => {
                const num = parseFloat(String(val));
                if (isNaN(num)) return "Must be a valid number";
                if (num < -180 || num > 180) return "Longitude must be between -180 and 180";
                return true;
              },
            })}
            placeholder="78.4867"
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label={
            <span>
              Down Latitude <span className="text-red-500">*</span>
            </span>
          }
          error={!!errors.down_latitude}
          helpText={
            errors.down_latitude?.message || "Return Latitude (-90 to 90)"
          }
          icon={<FeatherPin />}
        >
          <TextField.Input
            {...register("down_latitude", {
              required: "Down Latitude is required",
              validate: (val) => {
                const num = parseFloat(String(val));
                if (isNaN(num)) return "Must be a valid number";
                if (num < -90 || num > 90) return "Latitude must be between -90 and 90";
                return true;
              },
            })}
            placeholder="17.3850"
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label={
            <span>
              Down Longitude <span className="text-red-500">*</span>
            </span>
          }
          error={!!errors.down_longitude}
          helpText={
            errors.down_longitude?.message || "Return Longitude (-180 to 180)"
          }
          icon={<FeatherPin />}
        >
          <TextField.Input
            {...register("down_longitude", {
              required: "Down Longitude is required",
              validate: (val) => {
                const num = parseFloat(String(val));
                if (isNaN(num)) return "Must be a valid number";
                if (num < -180 || num > 180) return "Longitude must be between -180 and 180";
                return true;
              },
            })}
            placeholder="78.4867"
          />
        </TextField>
      </div>
      <div className="flex w-full flex-col items-start gap-2">
        <Button
          className="h-9 w-full flex-none"
          icon={<FeatherCheck />}
          type="submit"
          disabled={isCreatingStop || isUpdatingStop || isSubmitting}
          loading={isCreatingStop || isUpdatingStop}
        >
          {isCreatingStop || isUpdatingStop ? "Submitting..." : mode ? "Update Stop" : "Create Stop"}
        </Button>
        <Button
          onClick={() => props.onCancel?.()}
          className="h-9 w-full flex-none"
          variant="neutral-secondary"
          type="button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
});

export const CreateStopForm = CreateStopFormRoot;
