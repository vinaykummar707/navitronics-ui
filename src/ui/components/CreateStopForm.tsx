import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FeatherCheck, FeatherMapPin, FeatherPin, FeatherVolume2 } from "@subframe/core";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { Select } from "./Select";
import * as SubframeUtils from "../utils";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { IStop, IStopCreate, stopCrud } from "@/types/IStop";
import { checkActiveDuplicate } from "@/hooks/useCrud";
import { toast } from "react-toastify";

// @subframe/sync-disable

interface CreateStopFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  depotId: string;
  initialData?: any;
  onSuccess?: (stop?: IStop, nameChanged?: boolean, voice?: string) => void;
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
    setError,
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
  const [selectedVoice, setSelectedVoice] = React.useState<string>("meera");

  const onSubmit = async (data: any) => {
    const trimmedName = data.name?.trim();
    if (!trimmedName) {
      setError("name", { message: "Stop name is required" });
      return;
    }

    // Pre-submission duplicate check for active stops within this depot
    const isDup = await checkActiveDuplicate(
      "stops",
      "name",
      trimmedName,
      { depot_id: depotId },
      initialData ? initialData.id : undefined
    );

    if (isDup) {
      const msg = `A stop named "${trimmedName}" already exists in this depot.`;
      toast.error(msg);
      return;
    }

    const payload = {
      ...data,
      name: trimmedName,
      down_latitude: data.down_latitude ? String(data.down_latitude).trim() : null,
      down_longitude: data.down_longitude ? String(data.down_longitude).trim() : null,
      up_latitude: data.up_latitude ? String(data.up_latitude).trim() : null,
      up_longitude: data.up_longitude ? String(data.up_longitude).trim() : null,
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
          onSuccess: (updatedResponse) => {
            console.log("Stop updated successfully:", payload);
            toast.success("Stop updated successfully");
            reset();
            const result = updatedResponse || payload;
            const nameChanged = initialData.name?.trim().toLowerCase() !== payload.name?.trim().toLowerCase();
            onSuccess?.(result, nameChanged, selectedVoice);
          },
          onError: (error: any) => {
            console.error("Error updating Stop:", error);
            if (error?.code === "23505" || error?.message?.includes("23505")) {
              toast.error(`A stop named "${trimmedName}" already exists in this depot.`);
            } else if (error?.message?.includes("deleted or is no longer accessible")) {
              toast.error("This stop was deleted by another user and cannot be updated.");
            } else {
              toast.error(`Error updating Stop: ${error.message || "Unknown error"}`);
            }
          },
        },
      );
    } else {
      createStop(payload, {
        onSuccess: (successResponse) => {
          console.log("Stop created successfully:", successResponse);
          toast.success("Stop created successfully");
          reset();
          onSuccess?.(successResponse, false, selectedVoice);
        },
        onError: (error: any) => {
          console.error("Error creating Stop:", error);
          if (error?.code === "23505" || error?.message?.includes("23505")) {
            toast.error(`A stop named "${trimmedName}" already exists in this depot.`);
          } else {
            toast.error(`Error creating Stop: ${error.message || "Unknown error"}`);
          }
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

        <Select
          className="h-auto w-full flex-none"
          label={
            <span className="flex items-center gap-1.5">
              <FeatherVolume2 className="h-3.5 w-3.5 text-neutral-500" />
              Announcement Voice
            </span>
          }
          value={selectedVoice}
          onValueChange={(val) => setSelectedVoice(val)}
        >
          <Select.Item value="meera">Female Voice (Meera - Natural)</Select.Item>
          <Select.Item value="arvind">Male Voice (Arvind - Clear)</Select.Item>
        </Select>
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
