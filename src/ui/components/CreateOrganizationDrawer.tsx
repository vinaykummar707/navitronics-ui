"use client";
// @subframe/sync-disable
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FeatherMail, FeatherPhone, FeatherPlus, FeatherUser, FeatherSave, FeatherImage } from "@subframe/core";
import * as SubframeUtils from "../utils";

// Import your actual UI components
import { Button } from "./Button";
import { Switch } from "./Switch";
import { TextField } from "./TextField";
import { organizationService } from "@/services/organizationService";
import { FeatureToggle } from "./FeatureToggle";
import { useCreateOrganization, useUpdateOrganization } from "@/api/organization/hooks";
import { Organization } from "@/api/organization/types";
import { organizationCrud } from "@/types/organization";

// ----------------------------------------------------------------------
// 1. Zod Validation Schema
// ----------------------------------------------------------------------

const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  logo: z.string().min(1, "Contact person is required"),
  PIS: z.boolean().optional(),
  PAS: z.boolean().optional(),
  ITMS: z.boolean().optional(),
  active: z.boolean().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

// Types for your API Payloads
interface CreatePayload extends OrganizationFormValues { }

interface EditPayload extends OrganizationFormValues {
  organizationId: string;
  deleted: boolean;
}

interface OrganizationDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  // If provided, we are in "Edit" mode
  initialData?: Organization | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}



const CreateOrganizationDrawerRoot = React.forwardRef<HTMLDivElement, OrganizationDrawerProps>(
  function CreateOrganizationDrawerRoot(
    { className, initialData, onSuccess, onCancel, ...otherProps },
    ref
  ) {
    const isEditMode = !!initialData;
    const { useCreate } = organizationCrud;
    const { mutate: createOrganization, isPending: loading, isError } = useCreate()
    const [updateOrganization, { loading: updating, error: updateError }] = useUpdateOrganization();

    // -- Form Setup --
    const {
      register,
      handleSubmit,
      control,
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
          name: initialData.name,
          email: initialData.email,
          phone: initialData.phone,
          logo: initialData.logo,
          PIS: initialData.PIS ?? false,
          PAS: initialData.PAS ?? false,
          ITMS: initialData.ITMS ?? false,
          active: initialData.active,
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

        await updateOrganization(
          {
            variables: {
              id: initialData.id,
              changes: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                logo: data.logo,
                PIS: data.PIS,
                PAS: data.PAS,
                ITMS: data.ITMS,
                active: data.active,
              }
            }
          });

        onSuccess && onSuccess();

      } else {
        createOrganization(
          {
            name: data.name,
            email: data.email,
            phone: data.phone,
            logo: data.logo,
            PIS: data.PIS,
            PAS: data.PAS,
            ITMS: data.ITMS,
            active: data.active,
          }
        );
        console.log("Form Submitted:", data);
        onSuccess && onSuccess();
      }
    };


    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={SubframeUtils.twClassNames(
          "flex h-full w-full flex-col items-start gap-6 overflow-y-auto bg-default-background px-6 py-6",
          className
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
              ? "Update the details of the existing organization"
              : "Fill in the details below to create a new organization"}
          </span>
        </div>

        {/* Fields Section */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 ">

          {/* Organization Name */}
          <TextField
            className="h-auto w-full flex-none"
            label="Organization Name"
            helpText={errors.name?.message || "Enter the name of your organization"}
            error={!!errors.name}
          // Pass error state style if supported by your TextField
          >
            <TextField.Input
              placeholder="Acme Corporation"
              {...register("name")}
            />
          </TextField>

          {/* Email ID */}
          <TextField
            className="h-auto w-full flex-none"
            label="Email ID"
            helpText={errors.email?.message || "Primary email address"}
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
            helpText={errors.phone?.message || "Contact phone number"}
            icon={<FeatherPhone />}
            error={!!errors.phone}
          >
            <TextField.Input
              placeholder="+1 (555) 000-0000"
              {...register("phone")}
            />
          </TextField>

          {/* Contact Person */}
          <TextField
            className="h-auto w-full flex-none"
            label="Logo URL"
            helpText={errors.logo?.message || "URL of the organization's logo"}
            icon={<FeatherImage />}
            error={!!errors.logo}
          >
            <TextField.Input
              placeholder="https://example.com/logo.png"
              {...register("logo")}
            />
          </TextField>

          <div className="flex w-full flex-col items-start gap-2">
            <FeatureToggle
              label="PIS"
              description="Passenger Information System"
              toggle={<Switch checked={watch("PIS")} onCheckedChange={(checked) => setValue("PIS", checked)} />}
            />
            <FeatureToggle
              label="PAS"
              description="Passenger Information System"
              toggle={<Switch checked={watch("PAS")} onCheckedChange={(checked) => setValue("PAS", checked)} />}
            />
            <FeatureToggle
              label="ITMS"
              description="Passenger Information System"
              toggle={<Switch checked={watch("ITMS")} onCheckedChange={(checked) => setValue("ITMS", checked)} />}
            />

            <FeatureToggle
              label="Active Account"
              description="Enable or disable this organization account"
              toggle={<Switch checked={watch("active")} onCheckedChange={(checked) => setValue("active", checked)} />}
            />




          </div>
        </div>

        {/* Actions Section */}
        <div className="flex w-full flex-col items-start gap-2">
          <Button
            className="h-9 w-full flex-none"
            icon={isEditMode ? <FeatherSave /> : <FeatherPlus />}
            disabled={loading}
            onClick={() => handleSubmit(onSubmit)()} // Trigger submit manually if button is not type="submit"
          >
            {loading
              ? "Saving..."
              : isEditMode ? "Update Organization" : "Create Organization"
            }
          </Button>

          <Button
            className="h-9 w-full flex-none"
            variant="neutral-secondary"
            onClick={(e) => {
              e.preventDefault();
              if (onCancel) onCancel();
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }
);

export const CreateOrganizationDrawer = CreateOrganizationDrawerRoot;
