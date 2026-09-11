import React, { useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Separator,
  Drawer,
  Field,
  Switch,
  CheckboxCard,
  Portal,
  CloseButton,
  Avatar,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IOrganization, organizationCrud, getOrgInitials } from "@/types/organization";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { toast } from "react-toastify";
import { Building2, Save } from "lucide-react";

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;

const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(60, "Organization name cannot exceed 60 characters")
    .refine(
      (val) => /[a-zA-Z0-9]/.test(val),
      "Organization name must contain at least one letter or number"
    )
    .refine(
      (val) => !/^[^\s]{35,}$/.test(val),
      "Organization name cannot contain unbroken strings exceeding 35 characters"
    ),
  email: z
    .string()
    .trim()
    .min(1, "Contact email is required")
    .email("Please enter a valid email address (e.g. contact@agency.org)")
    .max(100, "Email cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional()
    .refine(
      (val) => !val || phoneRegex.test(val),
      "Please enter a valid phone format (e.g. +91 98765 43210)"
    ),
  logo: z
    .string()
    .trim()
    .max(255, "Logo URL cannot exceed 255 characters")
    .optional()
    .refine(
      (val) => !val || /^(https?:\/\/).+/i.test(val),
      "Logo URL must start with http:// or https://"
    )
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      "Please enter a valid image URL (e.g. https://example.com/logo.png)"
    ),
  PIS: z.boolean().optional(),
  PAS: z.boolean().optional(),
  ITMS: z.boolean().optional(),
  active: z.boolean().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

const formatErrorMessage = (error: any): string => {
  const msg = error?.message || "";
  if (msg.includes("unique") || msg.includes("duplicate") || error?.code === "23505") {
    return "An organization with this name already exists. Please choose a different name.";
  }
  return msg || "An unexpected error occurred. Please try again.";
};

interface CreateOrganizationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IOrganization | null;
  onSuccess?: () => void;
}

export const CreateOrganizationDrawer: React.FC<CreateOrganizationDrawerProps> = ({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}) => {
  const isEditMode = !!initialData;
  const { selectedOrganization, setSelectedOrganization } = useOrganizationStore();
  const { useCreate, useUpdate } = organizationCrud;
  const { mutate: createOrganization, isPending: isCreating } = useCreate();
  const { mutate: updateOrganization, isPending: isUpdating } = useUpdate();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
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

  const watchedName = watch("name");
  const watchedLogo = watch("logo");

  // Reset form when initialData changes or drawer opens
  useEffect(() => {
    if (open) {
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
    }
  }, [initialData, open, reset]);

  const onSubmit = (values: OrganizationFormValues) => {
    if (isEditMode && initialData) {
      const payload = {
        id: initialData.id,
        name: values.name.trim(),
        email: values.email?.trim().toLowerCase() || null,
        phone: values.phone?.trim() || null,
        logo: values.logo?.trim() || null,
        PIS: values.PIS ?? false,
        PAS: values.PAS ?? false,
        ITMS: values.ITMS ?? false,
        active: values.active ?? true,
      };

      updateOrganization(
        {
          id: initialData.id,
          payload,
        },
        {
          onSuccess: (data: any) => {
            if (selectedOrganization?.id === initialData.id) {
              setSelectedOrganization({
                ...selectedOrganization,
                ...payload,
                ...(data || {}),
              });
            }
            toast.success("Organization updated successfully");
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error(`Failed to update organization: ${formatErrorMessage(error)}`);
          },
        }
      );
    } else {
      createOrganization(
        {
          name: values.name.trim(),
          email: values.email?.trim().toLowerCase() || null,
          phone: values.phone?.trim() || null,
          logo: values.logo?.trim() || null,
          PIS: values.PIS ?? false,
          PAS: values.PAS ?? false,
          ITMS: values.ITMS ?? false,
          active: values.active ?? true,
        },
        {
          onSuccess: () => {
            toast.success("Organization created successfully");
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error(`Failed to create organization: ${formatErrorMessage(error)}`);
          },
        }
      );
    }
  };

  const isBusy = isSubmitting || isCreating || isUpdating;

  const previewName = watchedName?.trim() || initialData?.name || (isEditMode ? "Edit Agency" : "New Agency");
  const previewLogo = watchedLogo?.trim() || initialData?.logo || undefined;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!isBusy) onOpenChange(e.open);
      }}
      size="md"
      placement="end"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="bg.surface" borderColor="border.default" borderWidth="1px">
            <Drawer.Header borderBottomWidth="1px" borderColor="border.default">
              <HStack gap="3">
                <Avatar.Root
                  size="sm"
                  shape="rounded"
                  colorPalette="blue"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  shrink="0"
                >
                  <Avatar.Fallback name={previewName}>
                    {getOrgInitials(previewName)}
                  </Avatar.Fallback>
                  <Avatar.Image src={previewLogo} />
                </Avatar.Root>
                <VStack align="start" gap="0">
                  <Drawer.Title fontSize="sm" fontWeight="600" color="fg.default">
                    {isEditMode ? "Edit Organization" : "Create New Organization"}
                  </Drawer.Title>
                  <Text fontSize="xs" color="fg.muted">
                    {isEditMode
                      ? "Update transit corporation settings and module access"
                      : "Register a new transit corporation or transport agency"}
                  </Text>
                </VStack>
              </HStack>
              <Drawer.CloseTrigger asChild disabled={isBusy}>
                <CloseButton size="sm" position="absolute" top="2" insetEnd="2" disabled={isBusy} />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <Drawer.Body overflowY="auto">
                <VStack align="stretch" gap="4">
                  {/* Organization Name */}
                  <Field.Root invalid={!!errors.name} required>
                    <Field.Label>
                      Organization Name
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      placeholder="e.g. APSRTC or Bangalore Metro"
                      borderRadius="sm"
                      size="sm"
                      maxLength={60}
                      {...register("name")}
                    />
                    {errors.name && <Field.ErrorText>{errors.name.message}</Field.ErrorText>}
                  </Field.Root>

                  {/* Email Address */}
                  <Field.Root invalid={!!errors.email} required>
                    <Field.Label>
                      Contact Email
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      type="email"
                      placeholder="contact@transit.org"
                      borderRadius="sm"
                      size="sm"
                      maxLength={100}
                      {...register("email")}
                    />
                    {errors.email && <Field.ErrorText>{errors.email.message}</Field.ErrorText>}
                  </Field.Root>

                  {/* Phone Number */}
                  <Field.Root invalid={!!errors.phone}>
                    <Field.Label>Contact Phone</Field.Label>
                    <Input
                      placeholder="+91 98765 43210"
                      borderRadius="sm"
                      size="sm"
                      maxLength={20}
                      {...register("phone")}
                    />
                    {errors.phone && <Field.ErrorText>{errors.phone.message}</Field.ErrorText>}
                    <Field.HelperText>Primary dispatch or control room contact number</Field.HelperText>
                  </Field.Root>

                  {/* Logo URL */}
                  <Field.Root invalid={!!errors.logo}>
                    <Field.Label>Logo Image URL</Field.Label>
                    <Input
                      placeholder="https://example.com/logo.png"
                      borderRadius="sm"
                      size="sm"
                      maxLength={255}
                      {...register("logo")}
                    />
                    {errors.logo && <Field.ErrorText>{errors.logo.message}</Field.ErrorText>}
                    <Field.HelperText>Public image URL for the organization emblem (max 255 chars)</Field.HelperText>
                  </Field.Root>

                  <Separator my="1" borderColor="border.subtle" />

                  {/* Feature Entitlements using Chakra UI CheckboxCard */}
                  <VStack align="stretch" gap="2.5">
                    <Text fontSize="xs" fontWeight="600" color="fg.muted" textTransform="uppercase" letterSpacing="0.04em">
                      Feature Entitlements
                    </Text>

                    <Controller
                      name="PIS"
                      control={control}
                      render={({ field }) => (
                        <CheckboxCard.Root
                          checked={field.value}
                          onCheckedChange={(details) => field.onChange(details.checked)}
                          colorPalette="blue"
                          size="sm"
                          borderRadius="sm"
                        >
                          <CheckboxCard.HiddenInput />
                          <CheckboxCard.Control>
                            <CheckboxCard.Content>
                              <CheckboxCard.Label>Passenger Information System (PIS)</CheckboxCard.Label>
                              <CheckboxCard.Description>
                                Enables front, rear, and internal LED display boards
                              </CheckboxCard.Description>
                            </CheckboxCard.Content>
                            <CheckboxCard.Indicator />
                          </CheckboxCard.Control>
                        </CheckboxCard.Root>
                      )}
                    />

                    <Controller
                      name="PAS"
                      control={control}
                      render={({ field }) => (
                        <CheckboxCard.Root
                          checked={field.value}
                          onCheckedChange={(details) => field.onChange(details.checked)}
                          colorPalette="blue"
                          size="sm"
                          borderRadius="sm"
                        >
                          <CheckboxCard.HiddenInput />
                          <CheckboxCard.Control>
                            <CheckboxCard.Content>
                              <CheckboxCard.Label>Public Address System (PAS)</CheckboxCard.Label>
                              <CheckboxCard.Description>
                                Enables multilingual Indic TTS audio announcements
                              </CheckboxCard.Description>
                            </CheckboxCard.Content>
                            <CheckboxCard.Indicator />
                          </CheckboxCard.Control>
                        </CheckboxCard.Root>
                      )}
                    />

                    <Controller
                      name="ITMS"
                      control={control}
                      render={({ field }) => (
                        <CheckboxCard.Root
                          checked={field.value}
                          onCheckedChange={(details) => field.onChange(details.checked)}
                          colorPalette="blue"
                          size="sm"
                          borderRadius="sm"
                        >
                          <CheckboxCard.HiddenInput />
                          <CheckboxCard.Control>
                            <CheckboxCard.Content>
                              <CheckboxCard.Label>Intelligent Transit Management (ITMS)</CheckboxCard.Label>
                              <CheckboxCard.Description>
                                Enables telemetry, stop scheduling, and fleet tracking
                              </CheckboxCard.Description>
                            </CheckboxCard.Content>
                            <CheckboxCard.Indicator />
                          </CheckboxCard.Control>
                        </CheckboxCard.Root>
                      )}
                    />
                  </VStack>

                  <Separator my="1" borderColor="border.subtle" />

                  {/* Status Toggle */}
                  <Box
                    p="3.5"
                    borderRadius="sm"
                    borderWidth="1px"
                    borderColor="border.default"
                    bg="bg.subtle"
                  >
                    <Controller
                      name="active"
                      control={control}
                      render={({ field }) => (
                        <Flex align="center" justify="space-between">
                          <VStack align="start" gap="0">
                            <Text fontSize="xs" fontWeight="600" color="fg.default">
                              Organization Status
                            </Text>
                            <Text fontSize="11px" color="fg.muted">
                              {field.value
                                ? "Active: Users and depots can operate normally"
                                : "Suspended: Operations for this organization are halted"}
                            </Text>
                          </VStack>
                          <Switch.Root
                            checked={field.value}
                            onCheckedChange={(e) => field.onChange(e.checked)}
                            colorPalette="green"
                            size="sm"
                          >
                            <Switch.HiddenInput />
                            <Switch.Control>
                              <Switch.Thumb />
                            </Switch.Control>
                          </Switch.Root>
                        </Flex>
                      )}
                    />
                  </Box>
                </VStack>
              </Drawer.Body>

              <Drawer.Footer borderTopWidth="1px" borderColor="border.default" gap="2.5">
                <Button
                  variant="outline"
                  borderRadius="sm"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  borderRadius="sm"
                  size="sm"
                  colorPalette="blue"
                  loading={isBusy}
                  fontWeight="600"
                >
                  <Save size={14} style={{ marginRight: "6px" }} />
                  {isEditMode ? "Save Changes" : "Create Organization"}
                </Button>
              </Drawer.Footer>
            </form>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default CreateOrganizationDrawer;
