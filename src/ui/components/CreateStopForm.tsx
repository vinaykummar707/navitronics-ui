import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FeatherCheck, FeatherMapPin, FeatherPin } from "@subframe/core";
import { Button } from "./Button";
import { TextField } from "./TextField";
import * as SubframeUtils from "../utils";
import { useCreateStop, useUpdateStop } from "@/api/stop/hooks";
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
    formState: { errors },
    reset,
  } = useForm<IStopCreate>({
    defaultValues: {
      depot_id: depotId,
      organization_id: selectedOrganization.id,
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
    // console.log('Form data:', data);
    // try {
    //   let response;
    //   if (initialData) {
    //     // Update existing stop
    //     response = await updateStop({ variables: { ...data, id: initialData.id } });
    //     console.log('Stop updated:', response);
    //   } else {
    //     // Create new stop
    //     response = await createStop({ variables: { ...data, depot_id: props.depotId, organization_id: selectedOrganization?.id } });
    //     console.log('Stop created:', response);
    //   }
    //   props.onSuccess?.();
    // } catch (err) {
    //   console.error('Error submitting stop:', err);
    // }
    if (initialData) {
      delete data.stop_audios;
      updateStop(
        {
          id: data.id,
          payload: data,
        },
        {
          onSuccess: () => {
            console.log("Stop updated successfully:", data);
            toast.success("Stop updated successfully");
            reset();
            onSuccess();
          },
          onError: (error) => {
            console.error("Error updating Stop:", error);
            toast.error("Error updating Stop");
          },
        },
      );
    } else {
      createStop(data, {
        onSuccess: (successResponse) => {
          console.log("Stop created successfully:", successResponse);
          toast.success("Stop created successfully");
          reset();
          onSuccess(successResponse);
        },
        onError: (error) => {
          console.error("Error creating Stop:", error);
          toast.error("Error creating Stop");
        },
      });
    }
  };

  return (
    <form
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col items-start gap-4 bg-default-background px-6 py-6",
        className,
      )}
      ref={ref}
      onSubmit={handleSubmit(onSubmit)}
      {...otherProps}
    >
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Create Stop
        </span>
        <span className="text-caption font-caption text-subtext-color">
          Fill in the details below to create a new Stop
        </span>
      </div>
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4">
        <TextField
          className="h-auto w-full flex-none"
          label="Stop Name"
          error={errors?.name}
          helpText={errors.name ? "Stop name is required" : "Name of the stop"}
          icon={<FeatherMapPin />}
        >
          <TextField.Input
            {...register("name", { required: true })}
            placeholder="Gachibowli"
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Up Latitude"
          error={errors.up_latitude}
          helpText={
            errors.up_latitude ? "Up Latitude is required" : "Upward Latitude"
          }
          icon={<FeatherPin />}
        >
          <TextField.Input
            {...register("up_latitude", { required: true })}
            placeholder="17.3850"
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Up Longitude"
          error={errors.up_longitude}
          helpText={
            errors.up_longitude
              ? "Up Longitude is required"
              : "Upward Longitude"
          }
          icon={<FeatherPin />}
        >
          <TextField.Input
            {...register("up_longitude", { required: true })}
            placeholder="78.4867"
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Down Latitude"
          error={errors.down_latitude}
          helpText={
            errors.down_latitude
              ? "Down Latitude is required"
              : "Return Latitude"
          }
          icon={<FeatherPin />}
        >
          <TextField.Input
            {...register("down_latitude", { required: true })}
            placeholder="17.3850"
          />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Down Longitude"
          error={errors.down_longitude}
          helpText={
            errors.down_longitude
              ? "Down Longitude is required"
              : "Return Longitude"
          }
          icon={<FeatherPin />}
        >
          <TextField.Input
            {...register("down_longitude", { required: true })}
            placeholder="78.4867"
          />
        </TextField>
      </div>
      <div className="flex w-full flex-col items-start gap-2">
        <Button
          className="h-9 w-full flex-none"
          icon={<FeatherCheck />}
          type="submit"
        >
          {isCreatingStop || isUpdatingStop ? "Submitting..." : "Submit"}
        </Button>
        <Button
          onClick={() => props.onCancel?.()}
          className="h-9 w-full flex-none"
          variant="neutral-secondary"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
});

export const CreateStopForm = CreateStopFormRoot;
