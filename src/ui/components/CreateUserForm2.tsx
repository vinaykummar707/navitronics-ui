"use client";
import React, { useMemo, useState } from "react";
import {
  FeatherCheck,
  FeatherEye,
  FeatherEyeOff,
  FeatherKey,
  FeatherUser,
} from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { Select } from "./Select";
import { TextField } from "./TextField";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useForm, Controller, useWatch } from "react-hook-form";
import { supabase, supabaseAuthHelper } from "@/supabaseClient";
import { FeatureToggle } from "./FeatureToggle";
import { Switch } from "./Switch";
import {
  ILoggedUser,
  IRole,
  loggedUserCrud,
  roleCrud,
} from "@/types/IUser";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { depotCrud } from "@/types/IDepot";
import { regionCrud } from "@/types/IRegion";
import { organizationCrud } from "@/types/organization";
import { toast } from "react-toastify";

interface CreateUserForm2RootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onUserCreated?: () => void;
  initialData?: ILoggedUser | null;
  onCancel?: () => void;
}

const CreateUserForm2Root = React.forwardRef<
  HTMLDivElement,
  CreateUserForm2RootProps
>(function CreateUserForm2Root(
  { className, onUserCreated, initialData, onCancel, ...otherProps },
  ref,
) {
  const { selectedOrganization } = useOrganizationStore();
  const loggedInUser = useLoggedUserStore((state) => state.user);
  const isSuperAdmin = loggedInUser?.role?.name === "master";

  const isEditMode = !!initialData;
  const [showPassword, setShowPassword] = useState(false);

  // Fetch organizations
  const { useList: useOrgList } = organizationCrud;
  const { data: orgsData } = useOrgList({
    filters: { deleted: false },
  });
  const organizations = orgsData?.data || [];

  // Fetch roles
  const { useList: useRoleList } = roleCrud;
  const { data: rolesData } = useRoleList();
  const roles = rolesData
    ? (rolesData?.data.filter((role) => role.name !== "master") as IRole[])
    : [];

  const defaultOrgId =
    initialData?.organization?.id ||
    initialData?.organization_id ||
    selectedOrganization?.id ||
    (organizations.length > 0 ? organizations[0].id : "");

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
      role_id: initialData?.role?.id || initialData?.role_id || "",
      region_id: initialData?.region?.id || initialData?.region_id || null,
      depot_id: initialData?.depot?.id || initialData?.depot_id || null,
      email: initialData?.email || "",
      password: initialData?.password || "",
      organization_id: defaultOrgId,
      user_id: initialData?.user_id || "",
      active: initialData?.active ?? true,
      PIS: initialData?.PIS ?? selectedOrganization?.PIS ?? true,
      PAS: initialData?.PAS ?? selectedOrganization?.PAS ?? true,
      ITMS: initialData?.ITMS ?? selectedOrganization?.ITMS ?? false,
    },
  });

  const selectedRoleId = useWatch({ control, name: "role_id" });
  const selectedOrgId = useWatch({ control, name: "organization_id" });
  const selectedRegionId = useWatch({ control, name: "region_id" });

  const selectedRole = roles.find((role) => role.id === selectedRoleId);

  const { useList: useDepotList } = depotCrud;
  const { useList: useRegionList } = regionCrud;

  // Depots hook based on organization & region
  const { data: depotsData } = useDepotList({
    filters: {
      organization_id: selectedOrgId || "",
      region_id: selectedRegionId || null,
    },
  });
  const depots = depotsData?.data || [];

  // Regions hook based on organization
  const { data: regionsData } = useRegionList({
    filters: {
      organization_id: selectedOrgId || "",
    },
  });
  const regions = regionsData?.data || [];

  const { useCreate, useUpdate } = loggedUserCrud;
  const { mutate: createUser, isPending: isCreating } = useCreate();
  const { mutate: updateUser, isPending: isUpdating } = useUpdate();

  // Reset region and depot if role doesn't require them
  React.useEffect(() => {
    if (
      selectedRole?.name !== "region_admin" &&
      selectedRole?.name !== "depot_admin"
    ) {
      setValue("region_id", null);
      setValue("depot_id", null);
    } else if (selectedRole?.name === "region_admin") {
      setValue("depot_id", null);
    }
  }, [selectedRole?.name, selectedRoleId, setValue]);

  // Handle form submit
  const onSubmit = async (data: ILoggedUser) => {
    const targetOrgId = data.organization_id || selectedOrganization?.id || null;

    if (isEditMode && initialData) {
      // Update existing user
      await updateUser(
        {
          id: initialData.id,
          payload: {
            id: initialData.id,
            role_id: data.role_id,
            region_id: data.region_id || null,
            depot_id: data.depot_id || null,
            organization_id: targetOrgId,
            active: data.active,
            PIS: data.PIS,
            PAS: data.PAS,
            ITMS: data.ITMS,
          },
        },
        {
          onSuccess: () => {
            toast.success("User updated successfully");
            reset();
            if (onUserCreated) onUserCreated();
          },
          onError: (error) => {
            toast.error(`Failed to update user: ${error.message}`);
            console.error("Update Error:", error);
          },
        },
      );
    } else {
      // Create user: Check if email already existed (including soft deleted)
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", data.email)
        .maybeSingle();

      if (existingUser) {
        if (existingUser.deleted) {
          // Reactivate soft-deleted user
          const { error: updateErr } = await supabase
            .from("users")
            .update({
              deleted: false,
              active: data.active,
              role_id: data.role_id,
              region_id: data.region_id || null,
              depot_id: data.depot_id || null,
              organization_id: targetOrgId,
              PIS: data.PIS,
              PAS: data.PAS,
              ITMS: data.ITMS,
            })
            .eq("id", existingUser.id);

          if (updateErr) {
            toast.error(`Failed to reactivate user: ${updateErr.message}`);
            return;
          }
          toast.success("User account reactivated successfully");
          reset();
          if (onUserCreated) onUserCreated();
          return;
        } else {
          toast.error("A user with this email already exists.");
          return;
        }
      }

      // New signup in Supabase Auth using session-isolated client
      const { data: signUpData, error: signUpError } =
        await supabaseAuthHelper.auth.signUp({
          email: data.email,
          password: data.password,
        });

      if (signUpError) {
        toast.error(`Signup failed: ${signUpError.message}`);
        return;
      }

      const userId = signUpData?.user?.id;
      if (!userId) {
        toast.error("No user ID returned from authentication provider");
        return;
      }

      createUser(
        {
          email: data.email,
          role_id: data.role_id,
          region_id: data.region_id || null,
          depot_id: data.depot_id || null,
          organization_id: targetOrgId,
          user_id: userId,
          active: data.active,
          PIS: data.PIS,
          PAS: data.PAS,
          ITMS: data.ITMS,
        },
        {
          onSuccess: () => {
            toast.success("User created successfully");
            reset();
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
        "flex h-full w-full flex-col items-start gap-4 bg-default-background px-6 py-6 overflow-y-auto no-scrollbar",
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
          {isEditMode ? "edit user and module permissions" : "create a new user with configured access"}
        </span>
      </div>

      <form
        className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        {isSuperAdmin && (
          <Controller
            control={control}
            name="organization_id"
            render={({ field }) => (
              <Select
                className="h-auto w-full flex-none"
                label="Organization *"
                placeholder="Select Organization"
                {...field}
                value={field.value || ""}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("region_id", null);
                  setValue("depot_id", null);
                }}
              >
                {organizations.map((org) => (
                  <Select.Item key={org.id} value={org.id}>
                    {org.name}
                  </Select.Item>
                ))}
              </Select>
            )}
          />
        )}

        <Controller
          control={control}
          name="role_id"
          rules={{ required: "Role is required" }}
          render={({ field, fieldState }) => (
            <Select
              className="h-auto w-full flex-none"
              label="Select Role *"
              placeholder="Select Role"
              error={!!fieldState.error}
              helpText={fieldState.error?.message}
              {...field}
              value={field.value || ""}
              onValueChange={field.onChange}
            >
              {roles.map((role) => (
                <Select.Item key={role.id} value={role.id}>
                  {role.name.split("_").join(" ")}
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
            rules={{ required: "Region is required" }}
            render={({ field, fieldState }) => (
              <Select
                className="h-auto w-full flex-none"
                label="Select Region *"
                placeholder="Select Region"
                error={!!fieldState.error}
                helpText={fieldState.error?.message}
                {...field}
                value={field.value || ""}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("depot_id", null);
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
            rules={{ required: "Depot is required" }}
            render={({ field, fieldState }) => (
              <Select
                className="h-auto w-full flex-none"
                label="Select Depot *"
                placeholder="Select Depot"
                error={!!fieldState.error}
                helpText={fieldState.error?.message}
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
                  label="Email *"
                  helpText={fieldState.error?.message || ""}
                  icon={<FeatherUser />}
                  error={!!fieldState.error}
                >
                  <TextField.Input {...field} placeholder="user@company.com" />
                </TextField>
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: { value: 6, message: "At least 6 characters" },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  className="h-auto w-full flex-none"
                  label="Password *"
                  helpText={fieldState.error?.message || "Minimum 6 characters"}
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

        {/* Module Access Configuration */}
        <div className="flex flex-col gap-3 w-full border-t border-b border-neutral-border py-3">
          <span className="text-caption-bold font-caption-bold text-default-font">
            Module-Level Access
          </span>
          <div className="flex flex-col gap-2 w-full">
            <FeatureToggle
              label="PIS (Passenger Information System)"
              description="Access to Routes, Regions, and Depots"
              toggle={
                <Switch
                  checked={Boolean(watch("PIS"))}
                  onCheckedChange={(checked) => setValue("PIS", checked)}
                />
              }
            />
            <FeatureToggle
              label="PAS (Public Address System)"
              description="Access to Routes, Stops & Stop Creation"
              toggle={
                <Switch
                  checked={Boolean(watch("PAS"))}
                  onCheckedChange={(checked) => setValue("PAS", checked)}
                />
              }
            />
            <FeatureToggle
              label="ITMS (Intelligent Transit Management)"
              description="Full access to Routes, Stops & Live Streaming"
              toggle={
                <Switch
                  checked={Boolean(watch("ITMS"))}
                  onCheckedChange={(checked) => setValue("ITMS", checked)}
                />
              }
            />
          </div>
        </div>

        <FeatureToggle
          label="Active Account"
          description="Toggle to activate or deactivate this user account"
          toggle={
            <Switch
              checked={watch("active")}
              onCheckedChange={(checked) => setValue("active", checked)}
            />
          }
        />

        <div className="flex w-full flex-col items-start gap-2 pt-2">
          <Button
            className="h-9 w-full flex-none"
            icon={<FeatherCheck />}
            type="submit"
            disabled={isSubmitting || isCreating || isUpdating}
          >
            {isEditMode ? "Update User" : "Create User"}
          </Button>
          <Button
            className="h-9 w-full flex-none"
            variant="neutral-secondary"
            type="button"
            onClick={() => {
              if (onCancel) onCancel();
              else reset();
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
