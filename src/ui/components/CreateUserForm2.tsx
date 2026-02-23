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
import { UserDetails } from "@/api/users/types";
import { FeatureToggle } from "./FeatureToggle";
import { Switch } from "./Switch";
import useAuthStore from "@/store/authStore";
import {
  ILoggedUser,
  IUser,
  IUserCreate,
  loggedUserCrud,
  userCrud,
} from "@/types/IUser";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { depotCrud } from "@/types/IDepot";
import { regionCrud } from "@/types/IRegion";
import { toast } from "react-toastify";

interface CreateUserForm2RootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onUserCreated?: () => void; // callback after user created
  initialData?: ILoggedUser | null; // <-- Add initialData for edit
  onCancel?: () => void; // callback for cancel
}

const CreateUserForm2Root = React.forwardRef<
  HTMLDivElement,
  CreateUserForm2RootProps
>(function CreateUserForm2Root(
  { className, onUserCreated, initialData, onCancel, ...otherProps },
  ref,
) {
  // Stores
  const { selectedOrganization } = useOrganizationStore();
  const user = useLoggedUserStore((state) => state.user); // Get user details

  // Add editMode flag
  const isEditMode = !!initialData;

  // API hooks
  const { data: rolesData } = useRoles();
  const roles = useMemo(() => {
    if (user?.role?.name === "master") {
      return rolesData?.roles || [];
    } else {
      // For non-master users, filter out master role
      return rolesData?.roles.filter((role) => role.name !== "master") || [];
    }
  }, [rolesData, user?.role?.name]);

  // Setup form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<ILoggedUser>({
    defaultValues: {
      role_id: initialData?.role?.id || null,
      region_id: initialData?.region?.id || null,
      depot_id: initialData?.depot?.id || null,
      email: initialData?.email || "",
      password: initialData?.password || "",
      organization_id: initialData?.organization?.id || null,
      user_id: initialData?.user_id || "",
      active: initialData?.active ?? true,
    },
  });

  // Watch fields for role-based logic
  const selectedRoleId = useWatch({ control, name: "role_id" });
  const selectedRegionId = useWatch({ control, name: "region_id" });
  const selectedDepotId = useWatch({ control, name: "depot_id" });

  // Get current selected role
  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const { useList: useDepotList } = depotCrud;
  const { useList: useRegionList } = regionCrud;

  // Depots hook based on organization & region
  const { data: depotsData } = useDepotList({
    filters: {
      organization_id: selectedOrganization?.id || "",
      region_id: selectedRegionId || null,
    },
  });
  const depots = depotsData?.data || [];

  // Regions hook based on organization
  const { data: regionsData } = useRegionList({
    filters: {
      organization_id: selectedOrganization?.id || "",
    },
  });
  const regions = regionsData?.data || [];

  const { useCreate, useUpdate } = loggedUserCrud;

  const { mutate: createUser, isPending: creating } = useCreate();
  const { mutate: updateUser, isPending: updating } = useUpdate();

  // in useEffect watch to selected role if role changes reset region and depot
  React.useEffect(() => {
    // If role is changed to one that doesn't need region/depot, reset them
    if (
      selectedRole?.name !== "region_admin" &&
      selectedRole?.name !== "depot_admin"
    ) {
      setValue("region_id", null);
      setValue("depot_id", null);
    } else if (selectedRole?.name === "region_admin") {
      // If role is region_admin, reset depot
      setValue("depot_id", null);
    }
  }, [selectedRole?.name, selectedRoleId, setValue]);

  // Handle form submit
  const onSubmit = async (data: ILoggedUser) => {
    if (isEditMode && initialData) {
      // ------------- UPDATE user ---------------
      await updateUser(
        {
          id: initialData.id,
          payload: {
            id: initialData.id,
            role_id: data.role_id,
            region_id: data.region_id || null,
            depot_id: data.depot_id || null,
            organization_id: data.organization
              ? data.organization_id
              : initialData.organization?.id || null,
            active: data.active,
          },
        },
        {
          onSuccess: () => {
            toast.success("User updated successfully");
            reset(); // Reset form after successful update
            if (onUserCreated) onUserCreated();
          },
          onError: (error) => {
            toast.error(`Failed to update user: ${error.message}`);
            console.error("Update Error:", error);
          },
        },
      );
    } else {
      // ------------- CREATE user ---------------
      // ...existing create logic...
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
      if (signUpError) {
        toast.error(`Signup failed: ${signUpError.message}`);
        return;
      }
      const userId = signUpData?.user?.id;
      if (!userId) throw new Error("No userId returned from Supabase");
      createUser(
        {
          email: data.email,
          role_id: data.role_id,
          region_id: data.region_id || null,
          depot_id: data.depot_id || null,
          organization_id: selectedOrganization?.id || null,
          user_id: userId,
          active: data.active,
          password: data.password, // Store password if needed for your backend, but be cautious about security
        },
        {
          onSuccess: () => {
            toast.success("User created successfully");
            reset(); // Reset form after successful creation
            if (onUserCreated) onUserCreated();
          },
          onError: (error) => {
            toast.error(`Failed to create user: ${error.message}`);
            console.error("Creation Error:", error);
          },
        },
      );
    }
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col items-start gap-4 bg-default-background px-6 py-6",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-3 font-heading-3 text-default-font">
          {isEditMode ? "Edit User" : "Create User"}
        </span>
        <span className="text-caption font-caption text-subtext-color">
          Fill in the details below to{" "}
          {isEditMode ? "edit the user" : "create a new user"}
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

        {(selectedRole?.name === "region_admin" ||
          selectedRole?.name === "depot_admin") && (
          <Controller
            control={control}
            name="region_id"
            render={({ field }) => (
              <Select
                className="h-auto w-full flex-none"
                label="Select Region"
                placeholder="Select"
                {...field}
                value={field.value || "null"}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("depot_id", null); // Reset depot when region changes
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
                value={field.value || null}
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

        {!isEditMode && (
          <>
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
            />{" "}
          </>
        )}

        <FeatureToggle
          label="Active"
          description="Toggle to activate or deactivate the user"
          toggle={
            <Switch
              checked={watch("active")}
              onCheckedChange={(checked) => setValue("active", checked)}
            />
          }
        />

        <div className="flex w-full flex-col items-start gap-2">
          <Button
            className="h-9 w-full flex-none"
            icon={<FeatherCheck />}
            type="submit"
            disabled={isSubmitting}
          >
            {isEditMode ? "Update User" : "Create User"}
          </Button>
          <Button
            className="h-9 w-full flex-none"
            variant="neutral-secondary"
            type="button"
            onClick={() => {
              if (onCancel) onCancel();
              else reset(); // fallback to just resetting form if no onCancel provided
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
});

export const CreateUserForm2 = CreateUserForm2Root;
