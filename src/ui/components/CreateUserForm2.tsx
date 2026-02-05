"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/11b10bc240cf/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * CreateUserForm 2 — https://app.subframe.com/11b10bc240cf/library?component=CreateUserForm+2_a2cdf25d-c984-41d1-b955-47a15392c8b2
 * Select — https://app.subframe.com/11b10bc240cf/library?component=Select_bb88f90b-8c43-4b73-9c2f-3558ce7838f3
 * Text Field — https://app.subframe.com/11b10bc240cf/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 */
// @subframe/sync-disable
import React, { useMemo } from "react";
import { FeatherCheck, FeatherKey, FeatherUser } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { Select } from "./Select";
import { TextField } from "./TextField";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useRegions } from "@/api/region/hooks";
import { useDepots } from "@/api/depot/hooks";
import { useRoles } from "@/api/organization/hooks";
import { useForm, Controller, useWatch } from "react-hook-form";
import { supabase } from "@/supabaseClient";
import { useMutation } from "@apollo/client/react";
import { CREATE_USER } from "@/api/users/queries";

interface FormFields {
  role_id: string;
  region_id?: string;
  depot_id?: string;
  email: string;
  password: string;
  organization_id: string;
}

interface CreateUserForm2RootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onUserCreated?: () => void; // callback after user created

}

const CreateUserForm2Root = React.forwardRef<
  HTMLDivElement,
  CreateUserForm2RootProps
>(function CreateUserForm2Root({ className, onUserCreated, ...otherProps }, ref) {
  // Stores
  const { selectedOrganization } = useOrganizationStore();

  // API hooks
  const { data: rolesData } = useRoles();
  const roles = useMemo(
    () => rolesData?.roles?.filter((role) => role.name !== "master") || [],
    [rolesData]
  );
  const { data: regionData } = useRegions({
    variables: { organization_id: selectedOrganization.id || "" },
  });
  const regions = regionData?.regions || [];

  // Setup form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting }
  } = useForm<FormFields>({
    defaultValues: {
      role_id: "",
      region_id: "",
      depot_id: "",
      email: "",
      password: "",
      organization_id: selectedOrganization.id || "",
    },
  });

  // Watch fields for role-based logic
  const selectedRoleId = useWatch({ control, name: "role_id" });
  const selectedRegionId = useWatch({ control, name: "region_id" });
  const selectedDepotId = useWatch({ control, name: "depot_id" });

  // Get current selected role
  const selectedRole = roles.find((role) => role.id === selectedRoleId);

  // Depots hook based on organization & region
  const { data: depotsData } = useDepots({
    variables: {
      organization_id: selectedOrganization?.id || "",
      region_id: selectedRegionId || "",
    },
    skip: !selectedRegionId, // only fetch when region selected
  });
  const depots = depotsData?.depots || [];

  // Users insert mutation

  // Handle form submit
  const onSubmit = async (data: FormFields) => {
    try {
      // 1. Create user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        
      });
      if (signUpError) throw signUpError;
      const userId = signUpData?.user?.id;
      if (!userId) throw new Error("No userId returned from Supabase");

   
      // 2. Insert user in Hasura users table
      const { data: insertData, error: insertError } = await supabase.from('users').insert([{
        user_id: userId,
        email: data.email,
        role_id: data.role_id,
        organization_id: selectedOrganization.id,
        region_id: data.region_id || null,
        depot_id: data.depot_id || null,
        password: data.password, // Store hashed password in production!
      }]);
      reset();
      if (onUserCreated) onUserCreated();
    } catch (err: any) {
      alert("Error: " + (err?.message || String(err)));
    }
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
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Create User
        </span>
        <span className="text-caption font-caption text-subtext-color">
          Fill in the details below to create a new user
        </span>
      </div>
      <form
        className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          control={control}
          name="role_id"
          render={({ field }) => (
            <Select
              className="h-auto w-full flex-none"
              label="Select Role"
              placeholder="Select"
              {...field}
              value={field.value || ""}
              onValueChange={field.onChange}
            >
              {roles.map((role) => (
                <Select.Item key={role.id} value={role.id}>
                  {role.name}
                </Select.Item>
              ))}
            </Select>
          )}
        />

        {(selectedRole?.name === "region_admin" || selectedRole?.name === "depot_admin") && (
          <Controller
            control={control}
            name="region_id"
            render={({ field }) => (
              <Select
                className="h-auto w-full flex-none"
                label="Select Region"
                placeholder="Select"
                {...field}
                value={field.value || ""}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("depot_id", ""); // Reset depot when region changes
                }}
              >
                {regions.map((region) => (
                  <Select.Item key={region.id} value={region.id}>
                    {region.name}
                  </Select.Item>
                ))}
              </Select>
            )}
          />
        )}

        {selectedRole?.name === "depot_admin" && (
          <Controller
            control={control}
            name="depot_id"
            render={({ field }) => (
              <Select
                className="h-auto w-full flex-none"
                label="Select Depot"
                placeholder="Select"
                {...field}
                value={field.value || ""}
                onValueChange={field.onChange}
              >
                {depots.map((depot) => (
                  <Select.Item key={depot.id} value={depot.id}>
                    {depot.name}
                  </Select.Item>
                ))}
              </Select>
            )}
          />
        )}

        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: { value: /^\S+@\S+$/, message: "Invalid email" },
          }}
          render={({ field, fieldState }) => (
            <TextField
              className="h-auto w-full flex-none"
              label="Email"
              helpText={fieldState.error?.message || ""}
              icon={<FeatherUser />}
              required
            >
              <TextField.Input {...field} placeholder="Ex: Kevin123" />
            </TextField>
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password required",
            minLength: { value: 6, message: "At least 6 characters" },
          }}
          render={({ field, fieldState }) => (
            <TextField
              className="h-auto w-full flex-none"
              label="Password"
              helpText={fieldState.error?.message || "Minimum 6 characters"}
              icon={<FeatherKey />}
              required
            >
              <TextField.Input type="password" {...field} placeholder="" />
            </TextField>
          )}
        />

        <div className="flex w-full flex-col items-start gap-2">
          <Button
            className="h-9 w-full flex-none"
            icon={<FeatherCheck />}
            type="submit"
            disabled={isSubmitting}
          >
            Submit
          </Button>
          <Button
            className="h-9 w-full flex-none"
            variant="neutral-secondary"
            type="button"
            onClick={() => reset()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
});

export const CreateUserForm2 = CreateUserForm2Root;