import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FeatherCheck, FeatherMapPin, FeatherPin } from "@subframe/core";
import { Button } from "./Button";
import { TextField } from "./TextField";
import * as SubframeUtils from "../utils";
import { useCreateStop, useUpdateStop } from '@/api/stop/hooks';
import { useOrganizationStore } from '@/store/useOrganizationStore';

// @subframe/sync-disable


interface CreateStopFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  depotId: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateStopFormRoot: React.FC<CreateStopFormProps> = React.forwardRef<HTMLDivElement, CreateStopFormProps>((props, ref) => {
  const { className, initialData, ...otherProps } = props;
  const { register, handleSubmit, formState: { errors } ,reset} = useForm();
  const [createStop, { loading, error }] = useCreateStop();
  const [updateStop, { loading: updating }] = useUpdateStop();
  const selectedOrganization = useOrganizationStore((state) => state.selectedOrganization);

    // Set initial form values when initialData is provided
  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = async (data) => {
    console.log('Form data:', data);
    try {
      let response;
      if (initialData) {
        // Update existing stop
        response = await updateStop({ variables: { ...data, id: initialData.id } });
        console.log('Stop updated:', response);
      } else {
        // Create new stop
        response = await createStop({ variables: { ...data, depot_id: props.depotId, organization_id: selectedOrganization?.id } });
        console.log('Stop created:', response);
      }
      props.onSuccess?.();
    } catch (err) {
      console.error('Error submitting stop:', err);
    }
  };

  return (
    <form className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col items-start gap-4 bg-default-background px-6 py-6",
        className
      )} ref={ref} onSubmit={handleSubmit(onSubmit)} {...otherProps}>
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-3 font-heading-3 text-default-font">Create Stop</span>
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
          <TextField.Input {...register('name',{required:true})} placeholder="Gachibowli" />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Up Latitude"
          error={errors.up_latitude?.message}
          helpText="Upward Latitude"
          icon={<FeatherPin />}
        >
          <TextField.Input {...register('up_latitude')} placeholder="17.3850" />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Up Longitude"
          error={errors.up_longitude?.message}
          helpText="Upward Longitude"
          icon={<FeatherPin />}
        >
          <TextField.Input {...register('up_longitude')} placeholder="78.4867" />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Down Latitude"
          error={errors.down_latitude?.message}
          helpText="Return Latitude"
          icon={<FeatherPin />}
        >
          <TextField.Input {...register('down_latitude')} placeholder="17.3850" />
        </TextField>
        <TextField
          className="h-auto w-full flex-none"
          label="Down Longitude"
          error={errors.down_longitude?.message}
          helpText="Return Longitude"
          icon={<FeatherPin />}
        >
          <TextField.Input {...register('down_longitude')} placeholder="78.4867" />
        </TextField>
      </div>
      <div className="flex w-full flex-col items-start gap-2">
        <Button className="h-9 w-full flex-none" icon={<FeatherCheck />} type="submit">
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
        <Button onClick={() => props.onCancel?.()} className="h-9 w-full flex-none" variant="neutral-secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
});

export const CreateStopForm = CreateStopFormRoot;