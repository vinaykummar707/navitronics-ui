"use client";
// @subframe/sync-disable
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FeatherCheck,
  FeatherEye,
  FeatherEyeOff,
  FeatherKey,
  FeatherMail,
  FeatherUser,
  FeatherX,
} from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { Switch } from "./Switch";
import { TextField } from "./TextField";
import { FeatureToggle } from "./FeatureToggle";
import { ILoggedUser } from "@/types/IUser";
import { supabase, supabaseAuthHelper } from "@/supabaseClient";
import { toast } from "react-toastify";

const GUEST_ROLE_ID = "3fd42bb4-31fd-4f27-9fe9-f2dbb2d77b6c";
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

interface CreateGuestDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  initialData?: ILoggedUser | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormValues {
  name: string;
  email: string;
  password?: string;
  active: boolean;
}

const CreateGuestDrawerRoot = React.forwardRef<
  HTMLDivElement,
  CreateGuestDrawerProps
>(function CreateGuestDrawerRoot(
  { className, initialData, onSuccess, onCancel, ...otherProps },
  ref
) {
  const isEditMode = !!initialData;
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: initialData?.email || "",
      password: "",
      active: initialData?.active ?? true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: "",
        email: initialData.email || "",
        password: "",
        active: initialData.active ?? true,
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        active: true,
      });
    }
  }, [initialData, reset]);

  const handleResetPassword = async () => {
    const targetEmail = initialData?.email;
    if (!targetEmail) {
      toast.error("User email not found");
      return;
    }
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail);
      if (error) {
        toast.error(error.message || "Failed to send reset password email");
      } else {
        toast.success(`Password reset email sent to ${targetEmail}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset password email");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && initialData) {
        const updatePayload: any = {
          active: values.active,
        };

        if (values.password && values.password.trim().length > 0) {
          if (!PASSWORD_REGEX.test(values.password)) {
            toast.error(
              "Password must be at least 8 characters and include uppercase, lowercase, number, and a special character"
            );
            setIsSubmitting(false);
            return;
          }
          updatePayload.password = values.password.trim();
        }

        const { error: updateError } = await supabase
          .from("users")
          .update(updatePayload)
          .eq("id", initialData.id);

        if (updateError) throw updateError;

        toast.success("Guest user updated successfully");
        if (onSuccess) onSuccess();
      } else {
        // Create mode
        const trimmedEmail = values.email.trim();
        if (!values.password || !PASSWORD_REGEX.test(values.password)) {
          toast.error(
            "Password must be at least 8 characters and include uppercase, lowercase, number, and a special character"
          );
          setIsSubmitting(false);
          return;
        }

        // Check if email already in public.users
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", trimmedEmail)
          .maybeSingle();

        if (existingUser) {
          toast.error("A user with this email address already exists.");
          setIsSubmitting(false);
          return;
        }

        const { data: signUpData, error: signUpError } =
          await supabaseAuthHelper.auth.signUp({
            email: trimmedEmail,
            password: values.password,
            options: {
              data: {
                full_name: values.name.trim(),
                is_guest: true,
              },
            },
          });

        let userId = signUpData?.user?.id;

        if (signUpError) {
          const errorMsg = signUpError.message.toLowerCase();
          if (
            errorMsg.includes("already registered") ||
            errorMsg.includes("already exists")
          ) {
            const { data: signInData, error: signInErr } =
              await supabaseAuthHelper.auth.signInWithPassword({
                email: trimmedEmail,
                password: values.password,
              });

            if (signInData?.user?.id) {
              userId = signInData.user.id;
            } else {
              toast.error(
                `User is already registered in authentication. ${signInErr?.message ? `(${signInErr.message})` : "Please verify password or use a different email."}`
              );
              setIsSubmitting(false);
              return;
            }
          } else {
            toast.error(`Signup failed: ${signUpError.message}`);
            setIsSubmitting(false);
            return;
          }
        }

        if (!userId) {
          toast.error("No user ID returned from authentication provider");
          setIsSubmitting(false);
          return;
        }

        const { error: insErr } = await supabase.from("users").insert({
          email: trimmedEmail,
          user_id: userId,
          password: values.password,
          role_id: GUEST_ROLE_ID,
          organization_id: null,
          region_id: null,
          depot_id: null,
          active: Boolean(values.active),
          v1_routes: false,
          v2_routes: true,
        });

        if (insErr) throw insErr;

        toast.success("Guest user created successfully");
        reset();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      toast.error(`Operation failed: ${err.message || "Unknown error"}`);
      console.error("Guest error:", err);
    } finally {
      setIsSubmitting(false);
    }
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
      {/* Header */}
      <div className="flex flex-none w-full items-start justify-between gap-4 border-b border-neutral-border px-6 py-4 bg-default-background">
        <div className="flex flex-col items-start gap-1">
          <span className="text-heading-3 font-heading-3 text-default-font">
            {isEditMode ? "Edit Guest User" : "Create Guest User"}
          </span>
          <span className="text-caption font-caption text-subtext-color">
            {isEditMode
              ? "Update status or reset password for this view-only guest"
              : "Create a view-only guest user with access across the entire hierarchy"}
          </span>
        </div>
        {onCancel && (
          <IconButton
            icon={<FeatherX className="h-4 w-4" />}
            size="small"
            variant="neutral-tertiary"
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
            title="Close"
          />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 w-full flex-col items-start gap-4 overflow-y-auto px-6 py-5">
        <div className="flex w-full items-start gap-3 rounded-md border border-brand-200 bg-brand-50/60 p-3 text-xs text-brand-900">
          <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-200 text-brand-primary font-bold text-micro">
            ℹ
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-brand-900">View-Only Permissions</span>
            <span className="text-brand-700 text-micro">
              Guest users have view-only access across the entire hierarchy. All creation, editing, and deletion buttons are hidden.
            </span>
          </div>
        </div>

        {!isEditMode && (
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField
                className="h-auto w-full flex-none"
                label="Full Name"
                icon={<FeatherUser />}
              >
                <TextField.Input {...field} placeholder="e.g. John Doe" />
              </TextField>
            )}
          />
        )}

        {isEditMode ? (
          <>
            <TextField
              className="h-auto w-full flex-none"
              label={
                <span>
                  Email <span className="text-red-500">*</span>
                </span>
              }
              helpText="Email cannot be changed once created"
              icon={<FeatherMail />}
              disabled
            >
              <TextField.Input
                value={initialData?.email || ""}
                readOnly
                disabled
                className="cursor-not-allowed opacity-75"
              />
            </TextField>

            <div className="flex w-full flex-col gap-3 pt-1">
              <Controller
                control={control}
                name="password"
                rules={{
                  pattern: {
                    value: PASSWORD_REGEX,
                    message:
                      "Must be >= 8 characters with uppercase, lowercase, number, and special character",
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    className="h-auto w-full flex-none"
                    label="Reset Password"
                    helpText={
                      fieldState.error?.message ||
                      "Enter a new password or send a reset link below"
                    }
                    icon={<FeatherKey />}
                    error={!!fieldState.error}
                    iconRight={
                      <button
                        type="button"
                        tabIndex={-1}
                        className="flex items-center justify-center p-0.5 text-subtext-color hover:text-default-font transition-colors cursor-pointer"
                        onClick={() => setShowPassword((prev) => !prev)}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <FeatherEyeOff className="w-4 h-4" />
                        ) : (
                          <FeatherEye className="w-4 h-4" />
                        )}
                      </button>
                    }
                  >
                    <TextField.Input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter new password (optional)"
                    />
                  </TextField>
                )}
              />
              <div className="flex w-full flex-col items-start gap-1">
                <Button
                  className="h-9 w-full flex-none"
                  variant="neutral-secondary"
                  type="button"
                  disabled={isResettingPassword}
                  loading={isResettingPassword}
                  onClick={handleResetPassword}
                >
                  Send Password Reset Link
                </Button>
                <span className="text-caption font-caption text-subtext-color">
                  Sends a password reset email link to {initialData?.email || "user"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: EMAIL_REGEX,
                  message: "Enter a valid email address",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  className="h-auto w-full flex-none"
                  label={
                    <span>
                      Email <span className="text-red-500">*</span>
                    </span>
                  }
                  helpText={fieldState.error?.message || ""}
                  icon={<FeatherMail />}
                  error={!!fieldState.error}
                >
                  <TextField.Input {...field} placeholder="guest@example.com" />
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
                pattern: {
                  value: PASSWORD_REGEX,
                  message:
                    "Must be >= 8 characters with uppercase, lowercase, number, and special character",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  className="h-auto w-full flex-none"
                  label={
                    <span>
                      Password <span className="text-red-500">*</span>
                    </span>
                  }
                  helpText={
                    fieldState.error?.message ||
                    "Min 8 chars with uppercase, lowercase, number & special character"
                  }
                  icon={<FeatherKey />}
                  error={!!fieldState.error}
                  iconRight={
                    <button
                      type="button"
                      tabIndex={-1}
                      className="flex items-center justify-center p-0.5 text-subtext-color hover:text-default-font transition-colors cursor-pointer"
                      onClick={() => setShowPassword((prev) => !prev)}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <FeatherEyeOff className="w-4 h-4" />
                      ) : (
                        <FeatherEye className="w-4 h-4" />
                      )}
                    </button>
                  }
                >
                  <TextField.Input
                    type={showPassword ? "text" : "password"}
                    {...field}
                    placeholder="Enter password"
                  />
                </TextField>
              )}
            />
          </>
        )}

        <div className="flex flex-col w-full border-t border-b border-neutral-border py-3">
          <FeatureToggle
            label="Active Account"
            description="Toggle to activate or deactivate this guest account"
            toggle={
              <Switch
                checked={Boolean(watch("active"))}
                onCheckedChange={(checked) => setValue("active", checked)}
              />
            }
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-none w-full flex-col items-start gap-2 border-t border-neutral-border bg-default-background px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <Button
          className="h-9 w-full flex-none"
          icon={<FeatherCheck />}
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update Guest"
            : "Create Guest"}
        </Button>
        <Button
          className="h-9 w-full flex-none"
          variant="neutral-secondary"
          type="button"
          onClick={() => {
            if (onCancel) onCancel();
            else reset();
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
});

export const CreateGuestDrawer = CreateGuestDrawerRoot;
