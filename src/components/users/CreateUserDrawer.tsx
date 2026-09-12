import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Field,
  Badge,
  Portal,
  CloseButton,
  Avatar,
  NativeSelect,
  IconButton,
} from "@chakra-ui/react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ILoggedUser,
  IRole,
  loggedUserCrud,
  roleCrud,
  getUserInitials,
} from "@/types/IUser";
import { IOrganization, organizationCrud } from "@/types/organization";
import { IRegion, regionCrud } from "@/types/IRegion";
import { IDepot, depotCrud } from "@/types/IDepot";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { supabase, supabaseAuthHelper } from "@/supabaseClient";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Globe,
  Building,
  ShieldCheck,
  Save,
  Tv,
  Volume2,
  Cpu,
} from "lucide-react";

// Senior QA Input Validation Schema
const createUserSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .max(100, "Email address cannot exceed 100 characters")
      .email("Please enter a valid work email address")
      .transform((val) => val.toLowerCase()),
    password: z.string().optional(),
    role_id: z.string().min(1, "Please select an operator role"),
    organization_id: z.string().min(1, "Please select an organization"),
    region_id: z.string().nullable().optional(),
    depot_id: z.string().nullable().optional(),
    active: z.boolean(),
    PIS: z.boolean(),
    PAS: z.boolean(),
    ITMS: z.boolean(),
  });

type UserFormValues = z.infer<typeof createUserSchema>;

interface CreateUserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ILoggedUser | null;
  onUserSaved: () => void;
}

export const CreateUserDrawer: React.FC<CreateUserDrawerProps> = ({
  open,
  onOpenChange,
  initialData,
  onUserSaved,
}) => {
  const isEditMode = !!initialData;
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);

  const loggedInUser = useLoggedUserStore((state) => state.user);
  const { selectedOrganization } = useOrganizationStore();
  const isSuperAdmin = loggedInUser?.role?.name === "master";

  // Data queries
  const { useList: useOrgList } = organizationCrud;
  const { data: orgsData } = useOrgList({
    filters: { deleted: false },
  });
  const organizations = (orgsData?.data as IOrganization[]) || [];

  const { useList: useRoleList } = roleCrud;
  const { data: rolesData } = useRoleList();
  const roles = rolesData
    ? (rolesData.data.filter((r) => isSuperAdmin || r.name !== "master") as IRole[])
    : [];

  const defaultOrgId =
    initialData?.organization?.id ||
    initialData?.organization_id ||
    selectedOrganization?.id ||
    (organizations.length > 0 ? organizations[0].id : "");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: initialData?.email || "",
      password: "",
      role_id: initialData?.role?.id || initialData?.role_id || "",
      organization_id: defaultOrgId,
      region_id: initialData?.region?.id || initialData?.region_id || null,
      depot_id: initialData?.depot?.id || initialData?.depot_id || null,
      active: initialData?.active ?? true,
      PIS: initialData?.PIS ?? selectedOrganization?.PIS ?? true,
      PAS: initialData?.PAS ?? selectedOrganization?.PAS ?? true,
      ITMS: initialData?.ITMS ?? selectedOrganization?.ITMS ?? false,
    },
  });

  const selectedRoleId = useWatch({ control, name: "role_id" });
  const selectedOrgId = useWatch({ control, name: "organization_id" });
  const selectedRegionId = useWatch({ control, name: "region_id" });
  const enteredEmail = useWatch({ control, name: "email" });

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  // Region and Depot queries
  const { useList: useRegionList } = regionCrud;
  const { data: regionsData } = useRegionList({
    filters: {
      organization_id: selectedOrgId || defaultOrgId || "",
      deleted: false,
    },
    skip: !selectedOrgId && !defaultOrgId,
  });
  const regions = (regionsData?.data as IRegion[]) || [];

  const { useList: useDepotList } = depotCrud;
  const { data: depotsData } = useDepotList({
    filters: {
      organization_id: selectedOrgId || defaultOrgId || "",
      region_id: selectedRegionId || null,
      deleted: false,
    },
    skip: (!selectedOrgId && !defaultOrgId) || !selectedRegionId,
  });
  const depots = (depotsData?.data as IDepot[]) || [];

  // Reset form when drawer opens or initialData changes
  useEffect(() => {
    if (open) {
      reset({
        email: initialData?.email || "",
        password: "",
        role_id: initialData?.role?.id || initialData?.role_id || "",
        organization_id: defaultOrgId,
        region_id: initialData?.region?.id || initialData?.region_id || null,
        depot_id: initialData?.depot?.id || initialData?.depot_id || null,
        active: initialData?.active ?? true,
        PIS: initialData?.PIS ?? selectedOrganization?.PIS ?? true,
        PAS: initialData?.PAS ?? selectedOrganization?.PAS ?? true,
        ITMS: initialData?.ITMS ?? selectedOrganization?.ITMS ?? false,
      });
      setShowPassword(false);
      setIsSubmittingInternal(false);
    }
  }, [open, initialData, defaultOrgId, reset, selectedOrganization]);

  // Handle role change cascading logic
  useEffect(() => {
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

  const { useCreate, useUpdate } = loggedUserCrud;
  const { mutateAsync: createUserMutate } = useCreate();
  const { mutateAsync: updateUserMutate } = useUpdate();

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmittingInternal(true);
    const targetOrgId = data.organization_id || defaultOrgId;

    try {
      // Validate role requirements
      if (selectedRole?.name === "region_admin" && !data.region_id) {
        throw new Error("Please select an operating region for this Region Admin.");
      }
      if (selectedRole?.name === "depot_admin") {
        if (!data.region_id) {
          throw new Error("Please select a region for this Depot Admin.");
        }
        if (!data.depot_id) {
          throw new Error("Please select a bus depot for this Depot Admin.");
        }
      }

      if (isEditMode && initialData) {
        // Update existing user
        await updateUserMutate({
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
        });

        toast.success("User account updated successfully");
        onUserSaved();
        onOpenChange(false);
      } else {
        // Create new user: password validation
        if (!data.password || data.password.length < 6) {
          throw new Error("Password is required and must be at least 6 characters.");
        }

        // Check if user record already exists (including soft-deleted)
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", data.email)
          .maybeSingle();

        if (existingUser) {
          if (existingUser.deleted) {
            // Reactivate soft-deleted user
            const { error: reactivateErr } = await supabase
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

            if (reactivateErr) {
              throw new Error(`Failed to reactivate account: ${reactivateErr.message}`);
            }

            toast.success("Archived user account reactivated successfully");
            onUserSaved();
            onOpenChange(false);
            return;
          } else {
            throw new Error("A user account with this email address already exists.");
          }
        }

        // Fresh user signup in Supabase Auth
        const { data: signUpData, error: signUpError } =
          await supabaseAuthHelper.auth.signUp({
            email: data.email,
            password: data.password,
          });

        if (signUpError) {
          throw new Error(`Auth provisioning failed: ${signUpError.message}`);
        }

        const authUserId = signUpData?.user?.id;
        if (!authUserId) {
          throw new Error("Authentication provider did not return a valid user identity.");
        }

        // Insert user record in public users table
        await createUserMutate({
          email: data.email,
          role_id: data.role_id,
          region_id: data.region_id || null,
          depot_id: data.depot_id || null,
          organization_id: targetOrgId,
          user_id: authUserId,
          active: data.active,
          PIS: data.PIS,
          PAS: data.PAS,
          ITMS: data.ITMS,
        });

        toast.success("User account created successfully");
        onUserSaved();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save user account. Please try again.");
    } finally {
      setIsSubmittingInternal(false);
    }
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!isSubmittingInternal) {
          onOpenChange(e.open);
        }
      }}
      placement="end"
      size="md"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="bg.panel" borderColor="border.default" boxShadow="2xl">
            {/* Header */}
            <Drawer.Header
              borderBottomWidth="1px"
              borderColor="border.subtle"
              py="4"
              px="6"
            >
              <HStack justify="space-between" align="center" w="full">
                <HStack gap="3">
                  <Avatar.Root
                    size="md"
                    shape="rounded"
                    borderWidth="1px"
                    borderColor="border.default"
                    bg="bg.muted"
                  >
                    <Avatar.Fallback
                      name={enteredEmail || "New Operator"}
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {getUserInitials(enteredEmail)}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <VStack align="start" gap="0">
                    <Drawer.Title fontSize="md" fontWeight="600" color="fg.default">
                      {isEditMode ? "Edit User Account" : "Create Operator Account"}
                    </Drawer.Title>
                    <Text fontSize="xs" color="fg.muted">
                      {isEditMode
                        ? "Configure user role, territorial scope, and module access"
                        : "Provision credentials and security permissions for transit staff"}
                    </Text>
                  </VStack>
                </HStack>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" disabled={isSubmittingInternal} />
                </Drawer.CloseTrigger>
              </HStack>
            </Drawer.Header>

            {/* Body Form */}
            <Drawer.Body py="5" px="6">
              <form id="create-user-form" onSubmit={handleSubmit(onSubmit)}>
                <VStack align="stretch" gap="4">
                  {/* Agency Selector (Super Admins) */}
                  {isSuperAdmin ? (
                    <Field.Root invalid={!!errors.organization_id}>
                      <Field.Label fontSize="xs" fontWeight="500" color="fg.default">
                        Transit Agency *
                      </Field.Label>
                      <NativeSelect.Root size="sm">
                        <NativeSelect.Field
                          {...register("organization_id")}
                          disabled={isSubmittingInternal}
                        >
                          <option value="">Select Transit Organization</option>
                          {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                      {errors.organization_id?.message && (
                        <Field.ErrorText color="red.500">
                          {errors.organization_id.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>
                  ) : (
                    <Box
                      p="2.5"
                      bg="bg.muted"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="border.subtle"
                    >
                      <HStack justify="space-between">
                        <HStack gap="2" color="fg.muted" fontSize="xs">
                          <Building2 size={13} />
                          <Text>Transit Agency</Text>
                        </HStack>
                        <Badge colorPalette="blue">
                          {selectedOrganization?.name || "Global"}
                        </Badge>
                      </HStack>
                    </Box>
                  )}

                  {/* Role Selector */}
                  <Field.Root invalid={!!errors.role_id}>
                    <Field.Label fontSize="xs" fontWeight="500" color="fg.default">
                      System Role *
                    </Field.Label>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field
                        {...register("role_id")}
                        disabled={isSubmittingInternal}
                      >
                        <option value="">Select Operator Role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name === "master"
                              ? "Super Admin"
                              : role.name
                                  .split("_")
                                  .map(
                                    (w) =>
                                      w.charAt(0).toUpperCase() +
                                      w.slice(1).toLowerCase()
                                  )
                                  .join(" ")}
                          </option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                    {errors.role_id?.message && (
                      <Field.ErrorText color="red.500">
                        {errors.role_id.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  {/* Conditional Region Selector */}
                  {(selectedRole?.name === "region_admin" ||
                    selectedRole?.name === "depot_admin") && (
                    <Field.Root invalid={!!errors.region_id}>
                      <Field.Label fontSize="xs" fontWeight="500" color="fg.default">
                        Assigned Region *
                      </Field.Label>
                      <NativeSelect.Root size="sm">
                        <NativeSelect.Field
                          {...register("region_id")}
                          disabled={isSubmittingInternal}
                          onChange={(e) => {
                            setValue("region_id", e.target.value);
                            setValue("depot_id", null);
                          }}
                        >
                          <option value="">Select Regional Sector</option>
                          {regions.map((reg) => (
                            <option key={reg.id} value={reg.id}>
                              {reg.name}
                            </option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                      {errors.region_id?.message && (
                        <Field.ErrorText color="red.500">
                          {errors.region_id.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>
                  )}

                  {/* Conditional Depot Selector */}
                  {selectedRole?.name === "depot_admin" && (
                    <Field.Root invalid={!!errors.depot_id}>
                      <Field.Label fontSize="xs" fontWeight="500" color="fg.default">
                        Assigned Bus Depot *
                      </Field.Label>
                      <NativeSelect.Root size="sm">
                        <NativeSelect.Field
                          {...register("depot_id")}
                          disabled={isSubmittingInternal || !selectedRegionId}
                        >
                          <option value="">
                            {selectedRegionId
                              ? "Select Bus Depot Facility"
                              : "Select a region first"}
                          </option>
                          {depots.map((dep) => (
                            <option key={dep.id} value={dep.id}>
                              {dep.name}
                            </option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                      {errors.depot_id?.message && (
                        <Field.ErrorText color="red.500">
                          {errors.depot_id.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>
                  )}

                  {/* Work Email */}
                  <Field.Root invalid={!!errors.email}>
                    <Field.Label fontSize="xs" fontWeight="500" color="fg.default">
                      Work Email *
                    </Field.Label>
                    <Box position="relative" w="full">
                      <Box
                        position="absolute"
                        left="3"
                        top="50%"
                        transform="translateY(-50%)"
                        color="fg.muted"
                        pointerEvents="none"
                        zIndex={1}
                      >
                        <Mail size={14} />
                      </Box>
                      <Input
                        {...register("email")}
                        placeholder="operator@transit.gov"
                        type="email"
                        size="sm"
                        pl="9"
                        maxLength={100}
                        disabled={isEditMode || isSubmittingInternal}
                      />
                    </Box>
                    {errors.email?.message ? (
                      <Field.ErrorText color="red.500">
                        {errors.email.message}
                      </Field.ErrorText>
                    ) : (
                      <Field.HelperText fontSize="xs" color="fg.muted">
                        {isEditMode
                          ? "User email is permanently mapped to Supabase authentication."
                          : "Enter registered operator email for single sign-on & credential delivery."}
                      </Field.HelperText>
                    )}
                  </Field.Root>

                  {/* Password (Create Mode Only) */}
                  {!isEditMode && (
                    <Field.Root invalid={!!errors.password}>
                      <Field.Label fontSize="xs" fontWeight="500" color="fg.default">
                        Initial Password *
                      </Field.Label>
                      <Box position="relative" w="full">
                        <Box
                          position="absolute"
                          left="3"
                          top="50%"
                          transform="translateY(-50%)"
                          color="fg.muted"
                          pointerEvents="none"
                          zIndex={1}
                        >
                          <Lock size={14} />
                        </Box>
                        <Input
                          {...register("password")}
                          placeholder="Min 6 characters"
                          type={showPassword ? "text" : "password"}
                          size="sm"
                          pl="9"
                          pr="9"
                          maxLength={100}
                          disabled={isSubmittingInternal}
                        />
                        <IconButton
                          type="button"
                          size="xs"
                          variant="ghost"
                          position="absolute"
                          right="2"
                          top="50%"
                          transform="translateY(-50%)"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          color="fg.muted"
                          _hover={{ color: "fg.default", bg: "transparent" }}
                          onClick={() => setShowPassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </IconButton>
                      </Box>
                      {errors.password?.message ? (
                        <Field.ErrorText color="red.500">
                          {errors.password.message}
                        </Field.ErrorText>
                      ) : (
                        <Field.HelperText fontSize="xs" color="fg.muted">
                          Temporary password. User will be encouraged to update upon first login.
                        </Field.HelperText>
                      )}
                    </Field.Root>
                  )}

                  {/* Module Access Configuration */}
                  <Box
                    p="3"
                    bg="bg.muted"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="border.subtle"
                  >
                    <VStack align="stretch" gap="2.5">
                      <HStack justify="space-between">
                        <Text fontSize="xs" fontWeight="600" color="fg.default">
                          Module Privileges
                        </Text>
                        <Badge colorPalette="blue">
                          Access Control
                        </Badge>
                      </HStack>

                      {/* PIS */}
                      <Controller
                        control={control}
                        name="PIS"
                        render={({ field }) => (
                          <HStack justify="space-between" align="center" py="1">
                            <HStack gap="2">
                              <Tv size={14} color="var(--chakra-colors-blue-500)" />
                              <VStack align="start" gap="0">
                                <Text fontSize="xs" fontWeight="500" color="fg.default">
                                  PIS (Passenger Information)
                                </Text>
                                <Text fontSize="xs" color="fg.muted">
                                  Display LED matrix, routes, and station boards
                                </Text>
                              </VStack>
                            </HStack>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(e: any) => field.onChange(e.checked)}
                              disabled={isSubmittingInternal}
                              size="sm"
                              colorPalette="blue"
                            />
                          </HStack>
                        )}
                      />

                      {/* PAS */}
                      <Controller
                        control={control}
                        name="PAS"
                        render={({ field }) => (
                          <HStack justify="space-between" align="center" py="1">
                            <HStack gap="2">
                              <Volume2 size={14} color="var(--chakra-colors-cyan-500)" />
                              <VStack align="start" gap="0">
                                <Text fontSize="xs" fontWeight="500" color="fg.default">
                                  PAS (Public Address)
                                </Text>
                                <Text fontSize="xs" color="fg.muted">
                                  TTS audio synthesis & announcements
                                </Text>
                              </VStack>
                            </HStack>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(e: any) => field.onChange(e.checked)}
                              disabled={isSubmittingInternal}
                              size="sm"
                              colorPalette="cyan"
                            />
                          </HStack>
                        )}
                      />

                      {/* ITMS */}
                      <Controller
                        control={control}
                        name="ITMS"
                        render={({ field }) => (
                          <HStack justify="space-between" align="center" py="1">
                            <HStack gap="2">
                              <Cpu size={14} color="var(--chakra-colors-purple-500)" />
                              <VStack align="start" gap="0">
                                <Text fontSize="xs" fontWeight="500" color="fg.default">
                                  ITMS (Fleet Telemetry)
                                </Text>
                                <Text fontSize="xs" color="fg.muted">
                                  Live AVL telemetry, headways, and tracking
                                </Text>
                              </VStack>
                            </HStack>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(e: any) => field.onChange(e.checked)}
                              disabled={isSubmittingInternal}
                              size="sm"
                              colorPalette="purple"
                            />
                          </HStack>
                        )}
                      />
                    </VStack>
                  </Box>

                  {/* Active Account Switch */}
                  <Controller
                    control={control}
                    name="active"
                    render={({ field }) => (
                      <Box
                        p="3"
                        bg="bg.muted"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="border.subtle"
                      >
                        <HStack justify="space-between" align="center">
                          <HStack gap="2">
                            <ShieldCheck
                              size={15}
                              color={field.value ? "var(--chakra-colors-green-500)" : "var(--chakra-colors-gray-400)"}
                            />
                            <VStack align="start" gap="0">
                              <Text fontSize="xs" fontWeight="500" color="fg.default">
                                Account Active Status
                              </Text>
                              <Text fontSize="xs" color="fg.muted">
                                Inactive accounts cannot sign in to the transit console
                              </Text>
                            </VStack>
                          </HStack>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(e: any) => field.onChange(e.checked)}
                            disabled={isSubmittingInternal}
                            size="sm"
                            colorPalette="green"
                          />
                        </HStack>
                      </Box>
                    )}
                  />
                </VStack>
              </form>
            </Drawer.Body>

            {/* Footer Actions */}
            <Drawer.Footer
              borderTopWidth="1px"
              borderColor="border.subtle"
              py="3.5"
              px="6"
              gap="3"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSubmittingInternal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="create-user-form"
                colorPalette="blue"
                size="sm"
                loading={isSubmittingInternal}
                disabled={isSubmittingInternal}
              >
                <Save size={14} />
                {isEditMode ? "Save Changes" : "Create Operator"}
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default CreateUserDrawer;
