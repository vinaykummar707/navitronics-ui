"use client";
// @subframe/sync-disable
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FeatherMail,
  FeatherPhone,
  FeatherPlus,
  FeatherUser,
  FeatherSave,
  FeatherImage,
  FeatherX,
} from "@subframe/core";
import * as SubframeUtils from "../utils";

// Import your actual UI components
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { Switch } from "./Switch";
import { TextField } from "./TextField";
import { FeatureToggle } from "./FeatureToggle";
import { IOrganization, organizationCrud } from "@/types/organization";
import { toast } from "react-toastify";

// ----------------------------------------------------------------------
// 1. Zod Validation Schema
// ----------------------------------------------------------------------

const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .regex(
      /^[a-zA-Z0-9\s&.,'_-]+$/,
      "Organization name must contain valid alphanumeric characters",
    )
    .refine(
      (val) => /[a-zA-Z0-9]/.test(val),
      "Organization name must contain alphanumeric characters",
    ),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format",
    ),
  phone: z.string().optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
  PIS: z.boolean().optional(),
  PAS: z.boolean().optional(),
  ITMS: z.boolean().optional(),
  active: z.boolean().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface OrganizationDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  // If provided, we are in "Edit" mode
  initialData?: IOrganization | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateOrganizationDrawerRoot = React.forwardRef<
  HTMLDivElement,
  OrganizationDrawerProps
>(function CreateOrganizationDrawerRoot(
  { className, initialData, onSuccess, onCancel, ...otherProps },
  ref,
) {
  const isEditMode = !!initialData;
  const { useCreate, useUpdate } = organizationCrud;
  const { mutate: createOrganization, isPending: isCreating } = useCreate();
  const { mutate: updateOrganization, isPending: isUpdating } = useUpdate();

  // -- Form Setup --
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      logo: "",
      PIS: false,
      PAS: false,
      ITMS: false,
      active: true,
    },
  });

  // Reset form when initialData changes (e.g. opening edit drawer)
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        logo: initialData.logo || "",
        PIS: initialData.PIS ?? false,
        PAS: initialData.PAS ?? false,
        ITMS: initialData.ITMS ?? false,
        active: initialData.active ?? true,
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        logo: "",
        PIS: false,
        PAS: false,
        ITMS: false,
        active: true,
      });
    }
  }, [initialData, reset]);

  // -- Submit Handler --
  const onSubmit = async (data: OrganizationFormValues) => {
    const trimmedName = data.name.trim();
    const trimmedEmail = data.email?.trim() || null;

    // Check for duplicate name or email before creating/updating
    try {
      let checkQuery = supabase
        .from("organizations")
        .select("id, name, email")
        .eq("deleted", false);

      if (isEditMode && initialData?.id) {
        checkQuery = checkQuery.neq("id", initialData.id);
      }

      const conditions: string[] = [`name.ilike."${trimmedName}"`];
      if (trimmedEmail) {
        conditions.push(`email.ilike."${trimmedEmail}"`);
      }

      const { data: existingOrgs } = await checkQuery.or(conditions.join(","));

      if (existingOrgs && existingOrgs.length > 0) {
        toast.error("The email address or name is already in use");
        return;
      }
    } catch (checkErr) {
      console.warn("Pre-submission uniqueness check warning:", checkErr);
    }

    if (isEditMode && initialData) {
      updateOrganization(
        {
          id: initialData.id,
          payload: {
            id: initialData.id,
            name: trimmedName,
            email: trimmedEmail,
            phone: data.phone?.trim() || null,
            logo: data.logo?.trim() || null,
            PIS: Boolean(data.PIS),
            PAS: Boolean(data.PAS),
            ITMS: Boolean(data.ITMS),
            active: Boolean(data.active),
          },
        },
        {
          onSuccess: () => {
            toast.success("Organization updated successfully");
            reset();
            if (onSuccess) onSuccess();
          },
          onError: (error: any) => {
            if (
              error?.code === "23505" ||
              error?.message?.includes("23505") ||
              error?.details?.includes("already exists") ||
              error?.message?.toLowerCase().includes("unique constraint") ||
              error?.message?.toLowerCase().includes("already exists")
            ) {
              toast.error("The email address or name is already in use");
            } else {
              toast.error(`Failed to update organization: ${error.message}`);
            }
            console.error("Update Error:", error);
          },
        },
      );
    } else {
      createOrganization(
        {
          name: data.name.trim(),
          email: data.email?.trim() || null,
          phone: data.phone?.trim() || null,
          logo: data.logo?.trim() || null,
          PIS: Boolean(data.PIS),
          PAS: Boolean(data.PAS),
          ITMS: Boolean(data.ITMS),
          active: Boolean(data.active),
        },
        {
          onSuccess: () => {
            toast.success("Organization created successfully");
            reset();
            if (onSuccess) onSuccess();
          },
          onError: (error: any) => {
            if (
              error?.code === "23505" ||
              error?.message?.includes("23505") ||
              error?.details?.includes("already exists") ||
              error?.message?.toLowerCase().includes("unique constraint") ||
              error?.message?.toLowerCase().includes("already exists")
            ) {
              toast.error("The email address or name is already in use");
            } else {
              toast.error("Failed to create organization");
            }
            console.error("Creation Error:", error);
          },
        },
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={SubframeUtils.twClassNames(
        "flex h-full w-full sm:w-[480px] max-w-[100vw] flex-col bg-default-background overflow-hidden",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      {/* Fixed Header */}
      <div className="flex flex-none w-full items-start justify-between gap-4 border-b border-neutral-border px-6 py-4 bg-default-background">
        <div className="flex flex-col items-start gap-1">
          <span className="text-heading-3 font-heading-3 text-default-font">
            {isEditMode ? "Edit Organization" : "Create Organization"}
          </span>
          <span className="text-caption font-caption text-subtext-color">
            {isEditMode
              ? "Update details and module access"
              : "Fill in details to create an organization"}
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

      {/* Scrollable Center Fields Section */}
      <div className="flex flex-1 min-h-0 w-full flex-col items-start gap-4 overflow-y-auto px-6 py-5">
        {/* Organization Name */}
        <TextField
          className="h-auto w-full flex-none"
          label={
            <span>
              Organization Name <span className="text-red-500">*</span>
            </span>
          }
          helpText={
            errors.name?.message || "Enter organization name (min 2 characters, e.g. QA)"
          }
          error={!!errors.name}
        >
          <TextField.Input
            placeholder="e.g. QA or Acme Corp"
            {...register("name")}
          />
        </TextField>

        {/* Email ID */}
        <TextField
          className="h-auto w-full flex-none"
          label={
            <span>
              Email ID <span className="text-red-500">*</span>
            </span>
          }
          helpText={errors.email?.message || "Primary work email address"}
          icon={<FeatherMail />}
          error={!!errors.email}
        >
          <TextField.Input
            placeholder="contact@example.com"
            {...register("email")}
          />
        </TextField>

        {/* Phone Number */}
        <TextField
          className="h-auto w-full flex-none"
          label="Phone Number"
          helpText={errors.phone?.message || "Contact phone number (optional)"}
          icon={<FeatherPhone />}
          error={!!errors.phone}
        >
          <TextField.Input
            placeholder="+91 98765 43210"
            {...register("phone")}
          />
        </TextField>

        {/* Logo URL */}
        <TextField
          className="h-auto w-full flex-none"
          label="Logo URL"
          helpText={errors.logo?.message || "URL of the organization's logo (optional)"}
          icon={<FeatherImage />}
          error={!!errors.logo}
        >
          <TextField.Input
            placeholder="https://example.com/logo.png"
            {...register("logo")}
          />
        </TextField>

        <div className="flex w-full flex-col items-start gap-3 border-t border-b border-neutral-border py-3">
          <span className="text-caption-bold font-caption-bold text-default-font">
            Enabled Modules for Organization
          </span>
          <FeatureToggle
            label="PIS"
            description="Passenger Information System"
            toggle={
              <Switch
                checked={watch("PIS")}
                onCheckedChange={(checked) => setValue("PIS", checked)}
              />
            }
          />
          <FeatureToggle
            label="PAS"
            description="Public Address System"
            toggle={
              <Switch
                checked={watch("PAS")}
                onCheckedChange={(checked) => setValue("PAS", checked)}
              />
            }
          />
          <FeatureToggle
            label="ITMS"
            description="Intelligent Transit Management System"
            toggle={
              <Switch
                checked={watch("ITMS")}
                onCheckedChange={(checked) => setValue("ITMS", checked)}
              />
            }
          />

          <FeatureToggle
            label="Active Account"
            description="Enable or disable this organization account"
            toggle={
              <Switch
                checked={watch("active")}
                onCheckedChange={(checked) => setValue("active", checked)}
              />
            }
          />
        </div>
      </div>

      {/* Fixed Footer Actions */}
      <div className="flex flex-none w-full flex-col items-start gap-2 border-t border-neutral-border bg-default-background px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <Button
          className="h-9 w-full flex-none"
          icon={isEditMode ? <FeatherSave /> : <FeatherPlus />}
          disabled={isSubmitting || isCreating || isUpdating}
          loading={isCreating || isUpdating}
          type="submit"
        >
          {isCreating || isUpdating
            ? "Saving..."
            : isEditMode
              ? "Update Organization"
              : "Create Organization"}
        </Button>

        <Button
          className="h-9 w-full flex-none"
          variant="neutral-secondary"
          type="button"
          disabled={isSubmitting || isCreating || isUpdating}
          onClick={(e) => {
            e.preventDefault();
            reset(); // Reset form to initial values
            if (onCancel) onCancel();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
});

export const CreateOrganizationDrawer = CreateOrganizationDrawerRoot;
