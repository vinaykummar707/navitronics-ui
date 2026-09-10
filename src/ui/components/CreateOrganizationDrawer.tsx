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
} from "@subframe/core";
import * as SubframeUtils from "../utils";

// Import your actual UI components
import { Button } from "./Button";
import { Switch } from "./Switch";
import { TextField } from "./TextField";
import { organizationService } from "@/services/organizationService";
import { FeatureToggle } from "./FeatureToggle";
import { IOrganization, organizationCrud } from "@/types/organization";
import { toast } from "react-toastify";

// ----------------------------------------------------------------------
// 1. Zod Validation Schema
// ----------------------------------------------------------------------

const organizationSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email format"),
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
    if (isEditMode && initialData) {
      updateOrganization(
        {
          id: initialData.id,
          payload: {
            id: initialData.id,
            name: data.name.trim(),
            email: data.email?.trim() || null,
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
          onError: (error) => {
            toast.error(`Failed to update organization: ${error.message}`);
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
          onError: (error) => {
            toast.error("Failed to create organization");
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
        "flex h-full w-full flex-col items-start gap-6 overflow-y-auto bg-default-background px-6 py-6",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      {/* Header Section */}
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-3 font-heading-3 text-default-font">
          {isEditMode ? "Edit Organization" : "Create Organization"}
        </span>
        <span className="text-caption font-caption text-subtext-color">
          {isEditMode
            ? "Update the details and module access of the existing organization"
            : "Fill in the details below to create a new organization with module permissions"}
        </span>
      </div>

      {/* Fields Section */}
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 ">
        {/* Organization Name */}
        <TextField
          className="h-auto w-full flex-none"
          label="Organization Name *"
          helpText={
            errors.name?.message || "Enter organization name (min 1 character, e.g. QA)"
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
          label="Email ID *"
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

      {/* Actions Section */}
      <div className="flex w-full flex-col items-start gap-2">
        <Button
          className="h-9 w-full flex-none"
          icon={isEditMode ? <FeatherSave /> : <FeatherPlus />}
          disabled={isSubmitting || isCreating || isUpdating}
          loading={isCreating || isUpdating}
          onClick={() => handleSubmit(onSubmit)()} // Trigger submit manually if button is not type="submit"
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
