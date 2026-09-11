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
  NativeSelect,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IDepot, depotCrud, getDepotInitials } from "@/types/IDepot";
import { IRegion } from "@/types/IRegion";
import { IOrganization, getOrgInitials } from "@/types/organization";
import { useDepotStore } from "@/store/useDepotStore";
import { toast } from "react-toastify";
import { Building2, Save, MapPin } from "lucide-react";

const depotSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Depot name must be at least 2 characters")
    .max(50, "Depot name cannot exceed 50 characters")
    .refine(
      (val) => /[a-zA-Z0-9]/.test(val),
      "Depot name must contain at least one letter or number"
    )
    .refine(
      (val) => !/^[^\s]{30,}$/.test(val),
      "Depot name cannot contain unbroken strings exceeding 30 characters"
    ),
  region_id: z.string().trim().min(1, "Please select a region"),
});

type DepotFormValues = z.infer<typeof depotSchema>;

const formatErrorMessage = (error: any): string => {
  const msg = error?.message || "";
  if (msg.includes("unique") || msg.includes("duplicate") || error?.code === "23505") {
    return "A depot with this name already exists in this organization/region. Please choose a different name.";
  }
  return msg || "An unexpected error occurred. Please try again.";
};

interface CreateDepotDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IDepot | null;
  organization: IOrganization | null;
  regions: IRegion[];
  defaultRegionId?: string;
  onSuccess?: () => void;
}

export const CreateDepotDrawer: React.FC<CreateDepotDrawerProps> = ({
  open,
  onOpenChange,
  initialData,
  organization,
  regions,
  defaultRegionId,
  onSuccess,
}) => {
  const isEditMode = !!initialData;
  const { selectedDepot, setSelectedDepot } = useDepotStore();
  const { useCreate, useUpdate } = depotCrud;
  const { mutate: createDepot, isPending: isCreating } = useCreate();
  const { mutate: updateDepot, isPending: isUpdating } = useUpdate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DepotFormValues>({
    resolver: zodResolver(depotSchema),
    defaultValues: {
      name: "",
      region_id: defaultRegionId || "",
    },
  });

  const watchedName = watch("name");

  // Reset form when initialData changes or drawer opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name || "",
          region_id: initialData.region_id || defaultRegionId || (regions[0]?.id ?? ""),
        });
      } else {
        reset({
          name: "",
          region_id: defaultRegionId || (regions[0]?.id ?? ""),
        });
      }
    }
  }, [open, initialData, defaultRegionId, regions, reset]);

  const onSubmit = (values: DepotFormValues) => {
    if (!organization?.id) {
      toast.error("No organization selected. Please select an agency first.");
      return;
    }

    if (isEditMode && initialData) {
      const payload = {
        id: initialData.id,
        name: values.name.trim(),
        region_id: values.region_id,
        organization_id: organization.id,
      };

      updateDepot(
        {
          id: initialData.id,
          payload,
        },
        {
          onSuccess: (data: any) => {
            if (selectedDepot?.id === initialData.id) {
              setSelectedDepot({
                ...selectedDepot,
                ...payload,
                ...(data || {}),
              });
            }
            toast.success("Depot updated successfully");
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error(`Failed to update depot: ${formatErrorMessage(error)}`);
          },
        }
      );
    } else {
      createDepot(
        {
          name: values.name.trim(),
          region_id: values.region_id,
          organization_id: organization.id,
        },
        {
          onSuccess: () => {
            toast.success("Depot created successfully");
            reset();
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error(`Failed to create depot: ${formatErrorMessage(error)}`);
          },
        }
      );
    }
  };

  const isBusy = isSubmitting || isCreating || isUpdating;
  const previewName = watchedName?.trim() || initialData?.name || (isEditMode ? "Edit Depot" : "New Depot");

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
                  colorPalette="green"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  shrink="0"
                >
                  <Avatar.Fallback name={previewName}>
                    {getDepotInitials(previewName)}
                  </Avatar.Fallback>
                </Avatar.Root>
                <VStack align="start" gap="0">
                  <Drawer.Title fontSize="sm" fontWeight="600" color="fg.default">
                    {isEditMode ? "Edit Depot" : "Create New Depot"}
                  </Drawer.Title>
                  <Text fontSize="11px" color="fg.muted">
                    {isEditMode
                      ? "Update transit maintenance station and assigned region"
                      : "Register a new transit maintenance and parking depot"}
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
                    borderRadius="sm"
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
                        <Text fontSize="10px" color="fg.muted">
                          Parent Transport Authority
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge size="xs" colorPalette="blue" variant="outline">
                      Target Agency
                    </Badge>
                  </HStack>
                )}

                {/* Depot Name Field */}
                <Field.Root invalid={!!errors.name} required>
                  <Field.Label fontSize="xs" fontWeight="600" color="fg.default">
                    Depot Name
                  </Field.Label>
                  <Input
                    size="sm"
                    borderRadius="sm"
                    placeholder="e.g. Central Maintenance Depot, Terminal 1"
                    {...register("name")}
                    maxLength={50}
                    bg="bg.subtle"
                    _focus={{ borderColor: "blue.500", bg: "bg.surface" }}
                    disabled={isBusy}
                  />
                  {errors.name && (
                    <Field.ErrorText fontSize="11px" color="red.500">
                      {errors.name.message}
                    </Field.ErrorText>
                  )}
                  <Field.HelperText fontSize="11px" color="fg.muted">
                    Unique transit operational facility or bus terminal (max 50 chars).
                  </Field.HelperText>
                </Field.Root>

                {/* Region Selection Field */}
                <Field.Root invalid={!!errors.region_id} required>
                  <Field.Label fontSize="xs" fontWeight="600" color="fg.default">
                    Assigned Region / Zone
                  </Field.Label>
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field
                      {...register("region_id")}
                      bg="bg.subtle"
                      borderRadius="sm"
                      disabled={isBusy || regions.length === 0}
                    >
                      {regions.length === 0 ? (
                        <option value="">No regions available — create a region first</option>
                      ) : (
                        regions.map((reg) => (
                          <option key={reg.id} value={reg.id}>
                            {reg.name}
                          </option>
                        ))
                      )}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  {errors.region_id && (
                    <Field.ErrorText fontSize="11px" color="red.500">
                      {errors.region_id.message}
                    </Field.ErrorText>
                  )}
                  <Field.HelperText fontSize="11px" color="fg.muted">
                    The geographic zone responsible for this depot's vehicle allocation.
                  </Field.HelperText>
                </Field.Root>

                {/* Helpful Guidelines Card */}
                <Box p="3" borderRadius="sm" bg="bg.subtle" borderWidth="1px" borderColor="border.subtle" mt="2">
                  <HStack gap="2" mb="1" color="fg.default">
                    <Building2 size={13} color="var(--chakra-colors-green-600)" />
                    <Text fontSize="xs" fontWeight="600">
                      Depot Operational Role
                    </Text>
                  </HStack>
                  <Text fontSize="11px" color="fg.muted" lineHeight="1.4">
                    Depots serve as origin points for bus routes and house electronic hardware (PIS displays, audio engines, and GPS telematics). Routes can be created and assigned directly to this depot.
                  </Text>
                </Box>
              </Drawer.Body>

              <Drawer.Footer borderTopWidth="1px" borderColor="border.default" gap="2">
                <Button
                  variant="outline"
                  size="sm"
                  borderRadius="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  borderRadius="sm"
                  colorPalette="green"
                  loading={isBusy}
                  disabled={isBusy || regions.length === 0}
                >
                  <Save size={13} style={{ marginRight: "4px" }} />
                  {isEditMode ? "Save Changes" : "Create Depot"}
                </Button>
              </Drawer.Footer>
            </form>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default CreateDepotDrawer;
