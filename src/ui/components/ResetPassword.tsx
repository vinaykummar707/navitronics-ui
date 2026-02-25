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
import { supabase } from "@/supabaseClient";
interface CreateRegionFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormValues = {
  email: string;
};

const ResetPasswordFormRoot = React.forwardRef<
  HTMLDivElement,
  CreateRegionFormProps
>(function CreateRegionFormRoot(
  { className,  onSuccess, onCancel, ...otherProps },
  ref
) {
  // Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: { email: "" },
  });


  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);



  const onSubmit = async (values) => {
    try {
      // reset password with supabase
      const { error } = await supabase.auth.resetPasswordForEmail(values.email);
      if (error) {
        toast.error(error.message || "An error occurred while resetting password.");
        return;
      } else {
        toast.success("Password reset email sent successfully!");
        onSuccess();
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while resetting password.");
    }
  };


  const handleCancel = () => {
    reset({ email: "" });
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
            Reset Password
          </span>
          <span className="text-caption font-caption text-subtext-color">
            Enter your email to reset your password
              
          </span>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4">
          <TextField
            className="h-auto w-full flex-none"
            label="Email"
            helpText="Enter your email address"
            icon={<FeatherUser />}
            error={
              errors.email?.message ||
              apiError
            }
          >
            <TextField.Input
              placeholder="Ex: user@example.com"
              {...register("email", { required: "Email is required" })}
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
            Reset Password
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
          
        </div>
      </form>
    </div>
  );
});

export const ResetPasswordForm = ResetPasswordFormRoot;