"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  FeatherAlertTriangle,
  FeatherCheck,
  FeatherEye,
  FeatherEyeOff,
  FeatherKey,
  FeatherUser,
  FeatherX,
} from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Alert } from "./Alert";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { Select } from "./Select";
import { TextField } from "./TextField";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useForm, Controller, useWatch } from "react-hook-form";
import { supabase, supabaseAuthHelper } from "@/supabaseClient";
import { FeatureToggle } from "./FeatureToggle";
import { Switch } from "./Switch";
import { getRoleLabel } from "@/constants/roles";
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
import { isSuperAdmin as checkIsSuperAdmin } from "@/utils/customerType";
import { toast } from "react-toastify";

interface CreateUserForm2RootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onUserCreated?: () => void;
  initialData?: ILoggedUser | null;
  onCancel?: () => void;
  fixedTier?: "stu" | "regular";
}

const CreateUserForm2Root = React.forwardRef<
  HTMLDivElement,
  CreateUserForm2RootProps
>(function CreateUserForm2Root(
  { className, onUserCreated, initialData, onCancel, fixedTier, ...otherProps },
  ref,
) {
  const { selectedOrganization } = useOrganizationStore();
  const loggedInUser = useLoggedUserStore((state) => state.user);
  const isSuperAdmin =
    checkIsSuperAdmin(loggedInUser) ||
    loggedInUser?.role?.name?.toLowerCase() === "master" ||
    loggedInUser?.role?.name?.toLowerCase() === "super_admin";

  const isEditMode = Boolean(initialData && (initialData.id || initialData.user_id));
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  const loggedInRoleName = loggedInUser?.role?.name?.toLowerCase();
  const userOrgId = loggedInUser?.organization?.id || loggedInUser?.organization_id;
  const userRegionId = loggedInUser?.region?.id || loggedInUser?.region_id;
  const userDepotId = loggedInUser?.depot?.id || loggedInUser?.depot_id;

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

  // Fetch organizations
  const { useList: useOrgList } = organizationCrud;
  const { data: orgsData } = useOrgList();
  const organizations = orgsData?.data || [];

  // Fetch roles
  const { useList: useRoleList } = roleCrud;
  const { data: rolesData, isLoading: rolesLoading } = useRoleList();

  const allRoles = useMemo(() => {
    const listData = Array.isArray(rolesData)
      ? rolesData
      : Array.isArray(rolesData?.data)
      ? rolesData.data
      : [];
    return listData as IRole[];
  }, [rolesData]);

  const regularRole = useMemo(
    () => allRoles.find((r) => r.name?.toLowerCase() === "user"),
    [allRoles]
  );
  const regularRoleId = regularRole?.id || "fd72d0e0-831e-494c-96a5-3e153ab3e2db";

  // STU roles: only organization staff roles (never master, never regular user)
  const roles = useMemo(() => {
    return allRoles.filter((role: any) => {
      const name = role.name?.toLowerCase();
      return (
        name !== "master" &&
        name !== "super_admin" &&
        name !== "super admin" &&
        name !== "superadmin" &&
        name !== "user" &&
        name !== "regular" &&
        name !== "regular_customer"
      );
    });
  }, [allRoles]);

  const getUserCreationRoleLabel = (roleName?: string | null): string => {
    const baseLabel = getRoleLabel(roleName);
    return baseLabel.replace(/\bAdmin\b/g, "User");
  };

  const availableRoles = useMemo(() => {
    return roles.filter((role: any) => {
      const rName = role.name?.toLowerCase();
      // 1. Organization admin can ONLY be created by master (super admin)
      if (rName === "organization_admin" && !isSuperAdmin) {
        return false;
      }
      // 2. Every role cannot create a self role type account
      if (rName === loggedInRoleName) {
        return false;
      }
      // Hierarchy filtering
      if (isSuperAdmin) {
        return (
          rName === "organization_admin" ||
          rName === "region_admin" ||
          rName === "depot_admin"
        );
      }
      if (loggedInRoleName === "organization_admin") {
        return rName === "region_admin" || rName === "depot_admin";
      }
      if (loggedInRoleName === "region_admin") {
        return rName === "depot_admin";
      }
      return false;
    });
  }, [roles, isSuperAdmin, loggedInRoleName]);

  const initialTier = fixedTier
    ? fixedTier
    : initialData
    ? (!initialData.organization_id || initialData.customer_type === "regular" || initialData.role?.name === "user" ? "regular" : "stu")
    : (isSuperAdmin ? "regular" : "stu");

  const [customerTier, setCustomerTier] = useState<"regular" | "stu">(initialTier);
  const isRegular = customerTier === "regular";

  const defaultOrgId = isSuperAdmin
    ? (initialData?.organization?.id ||
       initialData?.organization_id ||
       selectedOrganization?.id ||
       (organizations.length > 0 ? organizations[0].id : ""))
    : (userOrgId || selectedOrganization?.id || "");

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
      role_id: initialData?.role?.id || initialData?.role_id || (initialTier === "regular" ? regularRoleId : ""),
      region_id: initialData?.region?.id || initialData?.region_id || userRegionId || null,
      depot_id: initialData?.depot?.id || initialData?.depot_id || userDepotId || null,
      email: initialData?.email || "",
      password: "",
      organization_id: initialTier === "regular" ? null : defaultOrgId,
      user_id: initialData?.user_id || "",
      active: initialData?.active ?? true,
      v1_routes: initialData?.v1_routes ?? selectedOrganization?.v1_routes ?? false,
      v2_routes: initialData?.v2_routes ?? selectedOrganization?.v2_routes ?? true,
      PIS: (initialData as any)?.PIS ?? true,
      PAS: (initialData as any)?.PAS ?? false,
      ITMS: (initialData as any)?.ITMS ?? false,
    } as any,
  });

  // Sync regular role when tier is regular
  useEffect(() => {
    if (!initialData && customerTier === "regular") {
      setValue("role_id", regularRoleId);
      setValue("organization_id", null);
      setValue("region_id", null);
      setValue("depot_id", null);
    }
  }, [customerTier, regularRoleId, initialData, setValue]);

  const selectedRoleId = useWatch({ control, name: "role_id" });
  const selectedOrgId = useWatch({ control, name: "organization_id" });
  const selectedRegionId = useWatch({ control, name: "region_id" });

  const selectedRole = roles.find((role) => role.id === selectedRoleId);

  const { useList: useDepotList } = depotCrud;
  const { useList: useRegionList } = regionCrud;

  // Depots hook based on organization & region
  const { data: depotsData } = useDepotList({
    filters: {
      organization_id: selectedOrgId || selectedOrganization?.id,
      region_id: selectedRegionId,
    },
    skip: !selectedOrgId && !selectedOrganization?.id,
  });
  const depots = depotsData?.data || [];

  // Regions hook based on organization
  const { data: regionsData } = useRegionList({
    filters: {
      organization_id: selectedOrgId || selectedOrganization?.id,
    },
    skip: !selectedOrgId && !selectedOrganization?.id,
  });
  const regions = regionsData?.data || [];

  const { useCreate, useUpdate } = loggedUserCrud;
  const { mutate: createUser, isPending: isCreating } = useCreate();
  const { mutate: updateUser, isPending: isUpdating } = useUpdate();

  // Reset region and depot if role doesn't require them
  React.useEffect(() => {
    if (!selectedRoleId || roles.length === 0) return;
    if (
      selectedRole?.name !== "region_admin" &&
      selectedRole?.name !== "depot_admin"
    ) {
      setValue("region_id", null);
      setValue("depot_id", null);
    } else if (selectedRole?.name === "region_admin") {
      setValue("depot_id", null);
    }
  }, [selectedRole?.name, selectedRoleId, roles.length, setValue]);

  // Sync form when initialData or defaultOrgId changes
  React.useEffect(() => {
    if (initialData && (initialData.id || initialData.user_id)) {
      reset({
        role_id: initialData.role?.id || initialData.role_id || "",
        region_id: initialData.region?.id || initialData.region_id || null,
        depot_id: initialData.depot?.id || initialData.depot_id || null,
        email: initialData.email || "",
        password: "",
        organization_id:
          initialData.organization?.id ||
          initialData.organization_id ||
          defaultOrgId,
        user_id: initialData.user_id || "",
        active: initialData.active ?? true,
        v1_routes: initialData.v1_routes ?? selectedOrganization?.v1_routes ?? false,
        v2_routes: initialData.v2_routes ?? selectedOrganization?.v2_routes ?? true,
      } as any);
    } else {
      const defaultRole = loggedInRoleName === "region_admin" || loggedInRoleName === "depot_admin"
        ? (roles.find((r) => r.name === "depot_admin")?.id || "")
        : "";
      reset({
        role_id: defaultRole,
        region_id: userRegionId || null,
        depot_id: userDepotId || null,
        email: "",
        password: "",
        organization_id: defaultOrgId,
        user_id: "",
        active: true,
        v1_routes: selectedOrganization?.v1_routes ?? false,
        v2_routes: selectedOrganization?.v2_routes ?? true,
      } as any);
    }
  }, [initialData, reset, selectedOrganization, defaultOrgId, userRegionId, userDepotId, loggedInRoleName, roles]);

  // Helper to ensure valid UUID or null (never empty string "")
  const toNullableUuid = (val?: string | null) => {
    if (!val) return null;
    const trimmed = String(val).trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  // Handle form submit
  const onSubmit = async (data: ILoggedUser) => {
    const isRegular = customerTier === "regular";
    const targetOrgId = isRegular ? null : toNullableUuid(data.organization_id || selectedOrganization?.id);
    const targetRoleId = isRegular ? regularRoleId : toNullableUuid(data.role_id);
    if (!targetRoleId) {
      toast.error("Please select a role for this user.");
      return;
    }
    if (!isRegular && targetRoleId === regularRoleId) {
      toast.error("Regular Customer role cannot be assigned to an STU organization user.");
      return;
    }
    const targetRegionId = isRegular ? null : toNullableUuid(data.region_id);
    const targetDepotId = isRegular ? null : toNullableUuid(data.depot_id);

    if (!isRegular) {
      // Strict 1:1 Hierarchy Uniqueness Check
      if (selectedRole?.name === "organization_admin" && targetOrgId) {
        let query = supabase
          .from("users")
          .select("id")
          .eq("organization_id", targetOrgId)
          .eq("role_id", targetRoleId);
        if (isEditMode && initialData?.id) {
          query = query.neq("id", initialData.id);
        }
        const { data: existing } = await query;
        if (existing && existing.length > 0) {
          toast.error("Only one user is allowed for the selected organization/region/depot.");
          return;
        }
      } else if (selectedRole?.name === "region_admin" && targetRegionId) {
        let query = supabase
          .from("users")
          .select("id")
          .eq("region_id", targetRegionId)
          .eq("role_id", targetRoleId);
        if (isEditMode && initialData?.id) {
          query = query.neq("id", initialData.id);
        }
        const { data: existing } = await query;
        if (existing && existing.length > 0) {
          toast.error("Only one user is allowed for the selected organization/region/depot.");
          return;
        }
      } else if (selectedRole?.name === "depot_admin" && targetDepotId) {
        let query = supabase
          .from("users")
          .select("id")
          .eq("depot_id", targetDepotId)
          .eq("role_id", targetRoleId);
        if (isEditMode && initialData?.id) {
          query = query.neq("id", initialData.id);
        }
        const { data: existing } = await query;
        if (existing && existing.length > 0) {
          toast.error("Only one user is allowed for the selected organization/region/depot.");
          return;
        }
      }
    }

    // Password complexity check
    if (!isEditMode) {
      if (!data.password || !PASSWORD_REGEX.test(data.password)) {
        toast.error("Password must be at least 8 characters and include uppercase, lowercase, number, and a special character");
        return;
      }
    } else {
      if (data.password && data.password.trim().length > 0) {
        if (!PASSWORD_REGEX.test(data.password)) {
          toast.error("Password must be at least 8 characters and include uppercase, lowercase, number, and a special character");
          return;
        }
      }
    }

    const basePayload: any = {
      role_id: targetRoleId,
      region_id: targetRegionId,
      depot_id: targetDepotId,
      organization_id: targetOrgId,
      customer_type: customerTier,
      active: isSuperAdmin ? Boolean(data.active) : (initialData?.active ?? true),
      v1_routes: isSuperAdmin ? Boolean(data.v1_routes) : (initialData?.v1_routes ?? false),
      v2_routes: isSuperAdmin ? Boolean(data.v2_routes) : (initialData?.v2_routes ?? true),
    };

    if (isEditMode && initialData) {
      // If super admin specified a new password, include it in payload
      if (isSuperAdmin && data.password && data.password.trim().length >= 6) {
        basePayload.password = data.password.trim();
      }

      // Update existing user
      try {
        const { error: updateError } = await supabase
          .from("users")
          .update(basePayload)
          .eq("id", initialData.id);

        if (updateError) {
          // If columns don't exist yet in public.users, fallback without them
          if (updateError.code === "42703") {
            const fallbackPayload = {
              role_id: targetRoleId,
              region_id: targetRegionId,
              depot_id: targetDepotId,
              organization_id: targetOrgId,
              active: data.active,
            };
            const { error: fbErr } = await supabase
              .from("users")
              .update(fallbackPayload)
              .eq("id", initialData.id);
            if (fbErr) throw fbErr;
          } else {
            throw updateError;
          }
        }

        toast.success("User updated successfully");
        reset();
        if (onUserCreated) onUserCreated();
      } catch (error: any) {
        toast.error(`Failed to update user: ${error.message || "Unknown error"}`);
        console.error("Update Error:", error);
      }
    } else {
      // Create user: Check if email already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", data.email)
        .maybeSingle();

      if (existingUser) {
        toast.error("A user with this email address already exists.");
        return;
      }

      // New signup in Supabase Auth using session-isolated client
      const { data: signUpData, error: signUpError } =
        await supabaseAuthHelper.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              customer_type: customerTier,
              v1_routes: Boolean(data.v1_routes),
              v2_routes: Boolean(data.v2_routes),
              ...(customerTier === "regular"
                ? {
                    PIS: Boolean((data as any).PIS ?? true),
                    PAS: Boolean((data as any).PAS ?? false),
                    ITMS: Boolean((data as any).ITMS ?? false),
                  }
                : {}),
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
          // Check if user exists in public.users
          const { data: dbUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", data.email)
            .maybeSingle();

          if (dbUser) {
            toast.error("A user with this email address already exists.");
            return;
          }

          // User exists in Supabase Auth but not in public.users (orphaned auth account from a failed insert)
          // Authenticate with isolated auth helper to retrieve the auth user ID
          const { data: signInData, error: signInErr } =
            await supabaseAuthHelper.auth.signInWithPassword({
              email: data.email,
              password: data.password,
            });

          if (signInData?.user?.id) {
            userId = signInData.user.id;
          } else {
            toast.error(
              `User is already registered in authentication. ${signInErr?.message ? `(${signInErr.message})` : "Please verify password or use a different email."}`
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
        // Supabase email enumeration protection (returns user with empty identities when user already exists)
        const { data: dbUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", data.email)
          .maybeSingle();

        if (dbUser) {
          toast.error("A user with this email address already exists.");
          return;
        }

        const { data: signInData, error: signInErr } =
          await supabaseAuthHelper.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

        if (signInData?.user?.id) {
          userId = signInData.user.id;
        } else {
          toast.error(
            `User is already registered in authentication. ${signInErr?.message ? `(${signInErr.message})` : "Please verify password or use a different email."}`
          );
          return;
        }
      }

      if (!userId) {
        toast.error("No user ID returned from authentication provider");
        return;
      }

      try {
        const { error: insErr } = await supabase.from("users").insert({
          email: data.email,
          user_id: userId,
          password: data.password,
          ...basePayload,
        });

        if (insErr) {
          if (insErr.code === "42703") {
            const fallbackPayload = {
              email: data.email,
              user_id: userId,
              password: data.password,
              role_id: targetRoleId,
              region_id: targetRegionId,
              depot_id: targetDepotId,
              organization_id: targetOrgId,
              active: Boolean(data.active),
            };
            const { error: fbErr } = await supabase
              .from("users")
              .insert(fallbackPayload);
            if (fbErr) throw fbErr;
          } else {
            throw insErr;
          }
        }

        toast.success("User created successfully");
        reset();
        if (onUserCreated) onUserCreated();
      } catch (error: any) {
        toast.error(`Failed to create user: ${error.message || "Unknown error"}`);
        console.error("Creation Error:", error);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={SubframeUtils.twClassNames(
        "flex h-full w-full sm:w-[500px] max-w-[100vw] flex-col bg-default-background overflow-hidden",
        className,
      )}
      ref={ref as any}
      {...otherProps}
    >
      {/* Fixed Header */}
      <div className="flex flex-none w-full items-start justify-between gap-4 border-b border-neutral-border px-6 py-4 bg-default-background">
        <div className="flex flex-col items-start gap-1">
          <span className="text-heading-3 font-heading-3 text-default-font">
            {isEditMode ? "Edit User" : "Create User"}
          </span>
          <span className="text-caption font-caption text-subtext-color">
            Fill in the details below to{" "}
            {isEditMode ? "edit user and permissions" : "create a new user with configured access"}
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

      {/* Scrollable Center Form Fields */}
      <div className="flex flex-1 min-h-0 w-full flex-col items-start gap-4 overflow-y-auto px-6 py-5">
        {!fixedTier && isSuperAdmin && (
          <div className="flex w-full flex-col items-start gap-1.5 pb-1">
            <span className="text-caption-bold font-caption-bold text-default-font">
              Customer Tier
            </span>
            <div className="flex w-full rounded-md border border-neutral-border bg-neutral-100 p-1">
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${
                  customerTier === "regular"
                    ? "bg-white text-brand-primary shadow-xs font-semibold"
                    : "text-subtext-color hover:text-default-font"
                }`}
                onClick={() => {
                  setCustomerTier("regular");
                  if (regularRole) setValue("role_id", regularRole.id);
                  setValue("organization_id", null);
                  setValue("region_id", null);
                  setValue("depot_id", null);
                }}
              >
                Regular Customer (Standalone)
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${
                  customerTier === "stu"
                    ? "bg-white text-brand-primary shadow-xs font-semibold"
                    : "text-subtext-color hover:text-default-font"
                }`}
                onClick={() => {
                  setCustomerTier("stu");
                  setValue("organization_id", defaultOrgId || "");
                }}
              >
                STU Organization User
              </button>
            </div>
            <span className="text-micro text-subtext-color">
              {customerTier === "regular"
                ? "Standalone freelancer or body builder. No organization, regions, or depots required."
                : "STU enterprise customer with structured regions, depots, and assigned roles."}
            </span>
          </div>
        )}

        {customerTier === "regular" ? (
          <div className="flex w-full items-start gap-3 rounded-md border border-brand-200 bg-brand-50/60 p-3 text-xs text-brand-900">
            <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-200 text-brand-primary font-bold text-micro">
              ✓
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-brand-900">Direct Route Creator Role</span>
              <span className="text-brand-700 text-micro">
                This user can immediately add and manage their own routes without needing any organizations, regions, or depots.
              </span>
            </div>
          </div>
        ) : (
          <>
            {isSuperAdmin && (
              <Controller
                control={control}
                name="organization_id"
                rules={{ required: customerTier === "stu" ? "Organization is required" : false }}
                render={({ field }) => (
                  <Select
                    className="h-auto w-full flex-none"
                    label={
                      <span>
                        Organization <span className="text-red-500">*</span>
                      </span>
                    }
                    placeholder="Select Organization"
                    value={field.value || undefined}
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
                  label={
                    <span>
                      Select Role <span className="text-red-500">*</span>
                    </span>
                  }
                  placeholder={rolesLoading ? "Loading roles..." : "Select Role"}
                  disabled={rolesLoading}
                  error={!!fieldState.error}
                  helpText={fieldState.error?.message}
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  {availableRoles.map((role) => {
                    const roleName = role.name || (role as any).roleName || "";
                    return (
                      <Select.Item key={role.id} value={role.id}>
                        {getUserCreationRoleLabel(roleName)}
                      </Select.Item>
                    );
                  })}
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
                    label={
                      <span>
                        Select Region <span className="text-red-500">*</span>
                      </span>
                    }
                    placeholder="Select Region"
                    disabled={loggedInRoleName === "region_admin" || loggedInRoleName === "depot_admin"}
                    error={!!fieldState.error}
                    helpText={fieldState.error?.message}
                    value={field.value || undefined}
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
              <>
                <Controller
                  control={control}
                  name="depot_id"
                  rules={{ required: "Depot is required" }}
                  render={({ field, fieldState }) => (
                    <Select
                      className="h-auto w-full flex-none"
                      label={
                        <span>
                          Select Depot <span className="text-red-500">*</span>
                        </span>
                      }
                      placeholder="Select Depot"
                      disabled={loggedInRoleName === "depot_admin"}
                      error={!!fieldState.error}
                      helpText={fieldState.error?.message}
                      value={field.value || undefined}
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
                {selectedRegionId && depots.length === 0 && (
                  <Alert
                    variant="warning"
                    icon={<FeatherAlertTriangle className="h-5 w-5" />}
                    description="No depots found in this region"
                  />
                )}
              </>
            )}
          </>
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
              icon={<FeatherUser />}
              disabled
            >
              <TextField.Input
                value={initialData?.email || watch("email") || ""}
                readOnly
                disabled
                className="cursor-not-allowed opacity-75"
              />
            </TextField>

            {/* Password Reset Field & Action (Only Super Admin / Master) */}
            {isSuperAdmin && (
              <div className="flex w-full flex-col gap-3 pt-1">
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    pattern: {
                      value: PASSWORD_REGEX,
                      message: "Must be >= 8 characters with uppercase, lowercase, number, and special character",
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
            )}
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
                pattern: {
                  value: PASSWORD_REGEX,
                  message: "Must be >= 8 characters with uppercase, lowercase, number, and special character",
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
                  helpText={fieldState.error?.message || "Min 8 chars with uppercase, lowercase, number & special character"}
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

        {/* Route Version Capabilities & Account Status (Super Admin / Master Only) */}
        {isSuperAdmin && (
          <>
            {customerTier === "regular" && (
              <div className="flex flex-col gap-3 w-full border-t border-neutral-border pt-3">
                <span className="text-caption-bold font-caption-bold text-default-font">
                  Module Access
                </span>
                <div className="flex flex-col gap-2 w-full">
                  <FeatureToggle
                    label="PIS"
                    description="Passenger Information System"
                    toggle={
                      <Switch
                        checked={Boolean(watch("PIS" as any) ?? true)}
                        onCheckedChange={(checked) => setValue("PIS" as any, checked)}
                      />
                    }
                  />
                  <FeatureToggle
                    label="PAS"
                    description="Public Address System"
                    toggle={
                      <Switch
                        checked={Boolean(watch("PAS" as any) ?? false)}
                        onCheckedChange={(checked) => setValue("PAS" as any, checked)}
                      />
                    }
                  />
                  <FeatureToggle
                    label="ITMS"
                    description="Intelligent Transit Management System"
                    toggle={
                      <Switch
                        checked={Boolean(watch("ITMS" as any) ?? false)}
                        onCheckedChange={(checked) => setValue("ITMS" as any, checked)}
                      />
                    }
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 w-full border-t border-neutral-border pt-3">
              <span className="text-caption-bold font-caption-bold text-default-font">
                Route Version Access
              </span>
              <div className="flex flex-col gap-2 w-full">
                <FeatureToggle
                  label="V1 Routes (Legacy Format)"
                  description="Enable creation, editing, and export of V1 route configurations"
                  toggle={
                    <Switch
                      checked={Boolean(watch("v1_routes"))}
                      onCheckedChange={(checked) => setValue("v1_routes", checked)}
                    />
                  }
                />
                <FeatureToggle
                  label="V2 Routes (Modern Format)"
                  description="Enable creation, editing, and export of V2 multi-screen LED configurations"
                  toggle={
                    <Switch
                      checked={Boolean(watch("v2_routes"))}
                      onCheckedChange={(checked) => setValue("v2_routes", checked)}
                    />
                  }
                />
              </div>
            </div>

            <div className="flex flex-col w-full border-t border-b border-neutral-border py-3">
              <FeatureToggle
                label="Active Account"
                description="Toggle to activate or deactivate this user account"
                toggle={
                  <Switch
                    checked={Boolean(watch("active"))}
                    onCheckedChange={(checked) => setValue("active", checked)}
                  />
                }
              />
            </div>
          </>
        )}

      </div>

      {/* Fixed Footer Actions */}
      <div className="flex flex-none w-full flex-col items-start gap-2 border-t border-neutral-border bg-default-background px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <Button
          className="h-9 w-full flex-none"
          icon={<FeatherCheck />}
          type="submit"
          disabled={isSubmitting || isCreating || isUpdating}
          loading={isCreating || isUpdating}
        >
          {isCreating || isUpdating
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update User"
            : "Create User"}
        </Button>
        <Button
          className="h-9 w-full flex-none"
          variant="neutral-secondary"
          type="button"
          onClick={() => {
            if (onCancel) onCancel();
            else reset();
          }}
          disabled={isSubmitting || isCreating || isUpdating}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
});

export const CreateUserForm2 = CreateUserForm2Root;
