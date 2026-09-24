"use client";

import React, { useEffect, useState } from "react";
import {
  FeatherAlertTriangle,
  FeatherCheck,
  FeatherEye,
  FeatherEyeOff,
  FeatherKey,
  FeatherUser,
  FeatherX,
} from "@subframe/core";
import { Drawer } from "./Drawer";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { TextField } from "./TextField";
import { Switch } from "./Switch";
import { useForm, Controller } from "react-hook-form";
import { supabase, supabaseAuthHelper } from "@/supabaseClient";
import { toast } from "react-toastify";
import { ILoggedUser } from "@/types/IUser";

const REGULAR_ROLE_ID = "fd72d0e0-831e-494c-96a5-3e153ab3e2db";

interface CreateRegularCustomerDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ILoggedUser | null;
}

interface FormValues {
  email: string;
  password?: string;
  active: boolean;
  v1_routes: boolean;
  v2_routes: boolean;
  PIS: boolean;
  PAS: boolean;
  ITMS: boolean;
}

export function CreateRegularCustomerDrawer({
  open,
  onClose,
  onSuccess,
  initialData,
}: CreateRegularCustomerDrawerProps) {
  const isEdit = Boolean(initialData && (initialData.id || initialData.user_id));
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      email: initialData?.email || "",
      password: initialData?.password || "",
      active: initialData?.active ?? true,
      v1_routes: initialData?.v1_routes ?? false,
      v2_routes: initialData?.v2_routes ?? true,
      PIS: (initialData as any)?.PIS ?? true,
      PAS: (initialData as any)?.PAS ?? false,
      ITMS: (initialData as any)?.ITMS ?? false,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData && (initialData.id || initialData.user_id)) {
        reset({
          email: initialData.email || "",
          password: initialData.password || "",
          active: initialData.active ?? true,
          v1_routes: initialData.v1_routes ?? false,
          v2_routes: initialData.v2_routes ?? true,
          PIS: (initialData as any)?.PIS ?? true,
          PAS: (initialData as any)?.PAS ?? false,
          ITMS: (initialData as any)?.ITMS ?? false,
        });
      } else {
        reset({
          email: "",
          password: "",
          active: true,
          v1_routes: false,
          v2_routes: true,
          PIS: true,
          PAS: false,
          ITMS: false,
        });
      }
    }
  }, [open, initialData, reset]);

  const handlePasswordReset = async () => {
    if (!initialData?.email) return;
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        initialData.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );
      if (error) throw error;
      toast.success(`Password reset email sent to ${initialData.email}`);
    } catch (err: any) {
      toast.error(`Failed to send password reset: ${err.message}`);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    const basePayload = {
      role_id: REGULAR_ROLE_ID,
      customer_type: "regular" as const,
      organization_id: null,
      region_id: null,
      depot_id: null,
      active: Boolean(values.active),
      v1_routes: Boolean(values.v1_routes),
      v2_routes: Boolean(values.v2_routes),
    };

    if (isEdit && initialData) {
      try {
        const { error: updateError } = await supabase
          .from("users")
          .update(basePayload)
          .eq("id", initialData.id);

        if (updateError) throw updateError;

        toast.success("Regular Customer updated successfully");
        onSuccess();
        onClose();
      } catch (err: any) {
        toast.error(`Update failed: ${err.message || "Unknown error"}`);
      }
      return;
    }

    // CREATE MODE
    if (!values.password || values.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      // 1. Check if user exists in public.users
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", values.email)
        .maybeSingle();

      if (existingUser) {
        toast.error("A user with this email address already exists.");
        return;
      }

      // 2. Sign up user with isolated client
      const { data: signUpData, error: signUpError } =
        await supabaseAuthHelper.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              customer_type: "regular",
              v1_routes: values.v1_routes,
              v2_routes: values.v2_routes,
              PIS: values.PIS,
              PAS: values.PAS,
              ITMS: values.ITMS,
            },
          },
        });

      let userId = signUpData?.user?.id;

      if (signUpError) {
        const errMsg = signUpError.message.toLowerCase();
        if (errMsg.includes("already registered") || errMsg.includes("already exists")) {
          // Re-authenticate to recover userId
          const { data: signInData, error: signInErr } =
            await supabaseAuthHelper.auth.signInWithPassword({
              email: values.email,
              password: values.password,
            });

          if (signInData?.user?.id) {
            userId = signInData.user.id;
          } else {
            toast.error(
              `User exists in auth. ${signInErr?.message ? `(${signInErr.message})` : "Please verify password."}`
            );
            return;
          }
        } else {
          toast.error(`Signup failed: ${signUpError.message}`);
          return;
        }
      } else if (
        signUpData?.user &&
        (!signUpData.user.identities || signUpData.user.identities.length === 0)
      ) {
        // Email enumeration protection: sign in to retrieve ID
        const { data: signInData, error: signInErr } =
          await supabaseAuthHelper.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });

        if (signInData?.user?.id) {
          userId = signInData.user.id;
        } else {
          toast.error(`Authentication error: ${signInErr?.message || "User exists"}`);
          return;
        }
      }

      if (!userId) {
        toast.error("Unable to get authentication user ID");
        return;
      }

      // 3. Insert into public.users
      const { error: insErr } = await supabase.from("users").insert({
        email: values.email,
        user_id: userId,
        password: values.password,
        ...basePayload,
      });

      if (insErr) throw insErr;

      toast.success("Regular Customer created successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`Creation failed: ${err.message || "Unknown error"}`);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(val) => !val && onClose()}>
      <Drawer.Content
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex h-full w-full sm:w-[480px] max-w-[100vw] flex-col bg-default-background overflow-hidden"
        >
          {/* Header */}
          <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-6 py-4 flex-none">
            <div className="flex flex-col gap-0.5">
              <span className="text-heading-3 font-heading-3 text-default-font">
                {isEdit ? "Edit Regular Customer" : "Add Regular Customer"}
              </span>
              <span className="text-caption font-caption text-subtext-color">
                Standalone user account with direct route creation privileges
              </span>
            </div>
            <IconButton
              variant="neutral-tertiary"
              icon={<FeatherX />}
              onClick={onClose}
              type="button"
            />
          </div>

          {/* Body */}
          <div className="flex w-full flex-col gap-5 p-6 overflow-y-auto flex-1">
            {/* Info Banner */}
            <div className="flex items-start gap-3 rounded-lg border border-brand-primary/20 bg-brand-50/60 p-3.5 text-xs text-brand-primary">
              <FeatherUser className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold">Standalone Customer Account</span>
                <span>
                  This user can create and manage their own routes without needing any organizations, regions, or depots.
                </span>
              </div>
            </div>

            {/* Email */}
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  className="w-full"
                  label="Email *"
                  helpText={fieldState.error?.message}
                  error={Boolean(fieldState.error)}
                  icon={<FeatherUser />}
                >
                  <TextField.Input
                    placeholder="customer@example.com"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isEdit}
                  />
                </TextField>
              )}
            />

            {/* Password (only on create or password reset in edit) */}
            {!isEdit ? (
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    className="w-full"
                    label="Password *"
                    helpText={fieldState.error?.message || "Minimum 6 characters"}
                    error={Boolean(fieldState.error)}
                    icon={<FeatherKey />}
                    iconRight={
                      <IconButton
                        size="small"
                        variant="neutral-tertiary"
                        type="button"
                        icon={showPassword ? <FeatherEyeOff /> : <FeatherEye />}
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    }
                  >
                    <TextField.Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </TextField>
                )}
              />
            ) : (
              <div className="flex items-center justify-between rounded-md border border-neutral-border p-3 bg-neutral-50">
                <div className="flex flex-col">
                  <span className="text-caption-bold font-caption-bold text-default-font">
                    Reset Customer Password
                  </span>
                  <span className="text-caption font-caption text-subtext-color">
                    Send a password reset link to customer email
                  </span>
                </div>
                <Button
                  size="small"
                  variant="neutral-secondary"
                  type="button"
                  loading={isResettingPassword}
                  onClick={handlePasswordReset}
                >
                  Send Reset Link
                </Button>
              </div>
            )}

            {/* Module Access (PIS, PAS, ITMS) */}
            <div className="flex flex-col gap-3 rounded-lg border border-neutral-border bg-neutral-50 p-4">
              <span className="text-caption-bold font-caption-bold text-default-font">
                Module Access
              </span>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-caption font-caption text-default-font">
                    PIS (Passenger Information System)
                  </span>
                  <span className="text-caption font-caption text-subtext-color text-[11px]">
                    Display and announcement configurations for passengers
                  </span>
                </div>
                <Controller
                  control={control}
                  name="PIS"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                <div className="flex flex-col">
                  <span className="text-caption font-caption text-default-font">
                    PAS (Public Address System)
                  </span>
                  <span className="text-caption font-caption text-subtext-color text-[11px]">
                    Public audio announcements and voice system
                  </span>
                </div>
                <Controller
                  control={control}
                  name="PAS"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                <div className="flex flex-col">
                  <span className="text-caption font-caption text-default-font">
                    ITMS (Intelligent Transit Management)
                  </span>
                  <span className="text-caption font-caption text-subtext-color text-[11px]">
                    Fleet telemetry and operational management system
                  </span>
                </div>
                <Controller
                  control={control}
                  name="ITMS"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            {/* Route Format Access Toggles */}
            <div className="flex flex-col gap-3 rounded-lg border border-neutral-border bg-neutral-50 p-4">
              <span className="text-caption-bold font-caption-bold text-default-font">
                Route Version Permissions
              </span>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-caption font-caption text-default-font">
                    V1 Routes (Legacy Format)
                  </span>
                  <span className="text-caption font-caption text-subtext-color text-[11px]">
                    Single LED matrix route creation and export
                  </span>
                </div>
                <Controller
                  control={control}
                  name="v1_routes"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                <div className="flex flex-col">
                  <span className="text-caption font-caption text-default-font">
                    V2 Routes (Modern Multi-Screen)
                  </span>
                  <span className="text-caption font-caption text-subtext-color text-[11px]">
                    Front, side, rear, and internal multi-display configurations
                  </span>
                </div>
                <Controller
                  control={control}
                  name="v2_routes"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            {/* Account Status Switch */}
            <div className="flex items-center justify-between rounded-lg border border-neutral-border p-4 bg-neutral-50">
              <div className="flex flex-col">
                <span className="text-caption-bold font-caption-bold text-default-font">
                  Account Active Status
                </span>
                <span className="text-caption font-caption text-subtext-color text-[11px]">
                  Disable to temporarily block customer login
                </span>
              </div>
              <Controller
                control={control}
                name="active"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex w-full items-center justify-end gap-2 border-t border-solid border-neutral-border px-6 py-4 flex-none bg-default-background">
            <Button
              variant="neutral-secondary"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              icon={<FeatherCheck />}
            >
              {isEdit ? "Update Customer" : "Create Customer"}
            </Button>
          </div>
        </form>
      </Drawer.Content>
    </Drawer>
  );
}
