import React, { useEffect } from "react";
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
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IRegion, regionCrud, getRegionInitials } from "@/types/IRegion";
import { IOrganization, getOrgInitials } from "@/types/organization";
import { useRegionStore } from "@/store/useRegionStore";
import { toast } from "react-toastify";
import { MapPin, Save, Building2 } from "lucide-react";

const regionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Region name must be at least 2 characters")
    .max(50, "Region name cannot exceed 50 characters")
    .refine(
      (val) => /[a-zA-Z0-9]/.test(val),
      "Region name must contain at least one letter or number"
    )
    .refine(
      (val) => !/^[^\s]{30,}$/.test(val),
      "Region name cannot contain unbroken strings exceeding 30 characters"
    ),
});

type RegionFormValues = z.infer<typeof regionSchema>;

const formatErrorMessage = (error: any): string => {
  const msg = error?.message || "";
  if (msg.includes("unique") || msg.includes("duplicate") || error?.code === "23505") {
    return "A region with this name already exists in this organization. Please choose a different name.";
  }
  return msg || "An unexpected error occurred. Please try again.";
};

interface CreateRegionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IRegion | null;
  organization: IOrganization | null;
  onSuccess?: () => void;
}

export const CreateRegionDrawer: React.FC<CreateRegionDrawerProps> = ({
  open,
  onOpenChange,
  initialData,
  organization,
  onSuccess,
}) => {
  const isEditMode = !!initialData;
  const { selectedRegion, setSelectedRegion } = useRegionStore();
  const { useCreate, useUpdate } = regionCrud;
  const { mutate: createRegion, isPending: isCreating } = useCreate();
  const { mutate: updateRegion, isPending: isUpdating } = useUpdate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegionFormValues>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      name: "",
    },
  });

  const watchedName = watch("name");

  // Reset form when initialData changes or drawer opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name || "",
        });
      } else {
        reset({
          name: "",
        });
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = (values: RegionFormValues) => {
    if (!organization?.id) {
      toast.error("No organization selected. Please select an agency first.");
      return;
    }

    if (isEditMode && initialData) {
      const payload = {
        id: initialData.id,
        name: values.name.trim(),
        organization_id: organization.id,
      };

      updateRegion(
        {
          id: initialData.id,
          payload,
        },
        {
          onSuccess: (data: any) => {
            if (selectedRegion?.id === initialData.id) {
              setSelectedRegion({
                ...selectedRegion,
                ...payload,
                ...(data || {}),
              });
            }
            toast.success("Region updated successfully");
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error(`Failed to update region: ${formatErrorMessage(error)}`);
          },
        }
      );
    } else {
      createRegion(
        {
          name: values.name.trim(),
          organization_id: organization.id,
        },
        {
          onSuccess: () => {
            toast.success("Region created successfully");
            reset();
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error(`Failed to create region: ${formatErrorMessage(error)}`);
          },
        }
      );
    }
  };

  const isBusy = isSubmitting || isCreating || isUpdating;
  const previewName = watchedName?.trim() || initialData?.name || (isEditMode ? "Edit Region" : "New Region");

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
                    {getRegionInitials(previewName)}
                  </Avatar.Fallback>
                </Avatar.Root>
                <VStack align="start" gap="0">
                  <Drawer.Title fontSize="sm" fontWeight="600" color="fg.default">
                    {isEditMode ? "Edit Region" : "Create New Region"}
                  </Drawer.Title>
                  <Text fontSize="xs" color="fg.muted">
                    {isEditMode
                      ? "Update regional zone name and operational boundaries"
                      : "Define a new operational jurisdiction zone"}
                  </Text>
                </VStack>
              </HStack>
              <Drawer.CloseTrigger asChild disabled={isBusy}>
                <CloseButton size="sm" position="absolute" top="2" insetEnd="2" disabled={isBusy} />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "contents" }}>
              <Drawer.Body py="5" display="flex" flexDirection="column" gap="4">
                {/* Active Organization Context Banner */}
                {organization && (
                  <HStack
                    p="3"
                    borderRadius="md"
                    bg="blue.subtle"
                    borderWidth="1px"
                    borderColor="blue.muted"
                    justify="space-between"
                  >
                    <HStack gap="2.5">
                      <Avatar.Root size="xs" shape="rounded" colorPalette="blue">
                        <Avatar.Fallback name={organization.name}>
                          {getOrgInitials(organization.name)}
                        </Avatar.Fallback>
                        <Avatar.Image src={organization.logo || undefined} />
                      </Avatar.Root>
                      <VStack align="start" gap="0">
                        <Text fontSize="xs" fontWeight="600" color="blue.fg">
                          {organization.name}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                          Parent Transport Authority
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge colorPalette="blue" variant="outline">
                      Target Agency
                    </Badge>
                  </HStack>
                )}

                {/* Region Name Field */}
                <Field.Root invalid={!!errors.name} required>
                  <Field.Label fontSize="xs" fontWeight="600" color="fg.default">
                    Region Name
                  </Field.Label>
                  <Input
                    size="sm"
                    placeholder="e.g. Central Zone, North Division, Bangalore Metro"
                    {...register("name")}
                    maxLength={50}
                    bg="bg.subtle"
                    _focus={{ borderColor: "blue.500", bg: "bg.surface" }}
                    disabled={isBusy}
                  />
                  {errors.name && (
                    <Field.ErrorText fontSize="xs" color="red.500">
                      {errors.name.message}
                    </Field.ErrorText>
                  )}
                  <Field.HelperText fontSize="xs" color="fg.muted">
                    Unique operational zone or geographic transit district.
                  </Field.HelperText>
                </Field.Root>

                {/* Helpful Guidelines Card */}
                <Box p="3" borderRadius="md" bg="bg.subtle" borderWidth="1px" borderColor="border.subtle" mt="2">
                  <HStack gap="2" mb="1" color="fg.default">
                    <MapPin size={13} color="var(--chakra-colors-blue-600)" />
                    <Text fontSize="xs" fontWeight="600">
                      Regional Zone Hierarchy
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="fg.muted" lineHeight="1.4">
                    Bus depots and transit fleets are grouped under regions. Creating distinct regions enables localized dispatching, route planning, and depot-level telemetry isolation.
                  </Text>
                </Box>
              </Drawer.Body>

              <Drawer.Footer borderTopWidth="1px" borderColor="border.default" gap="2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  colorPalette="blue"
                  loading={isBusy}
                  disabled={isBusy}
                >
                  <Save size={14} />
                  {isEditMode ? "Save Changes" : "Create Region"}
                </Button>
              </Drawer.Footer>
            </form>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default CreateRegionDrawer;
