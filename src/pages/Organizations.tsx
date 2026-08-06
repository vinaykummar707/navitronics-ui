import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationService } from "../services/organizationService";
import { Organization, CreateOrganizationDto } from "../types/organization";
import { OrganizationForm } from "../components/organizations/OrganizationForm";
import { useOrganizationStore } from "../store/useOrganizationStore";
import { Icon } from "@iconify-icon/react";
import {
  Container,
  Flex,
  Heading,
  Button,
  Table,
  Badge,
  IconButton,
  Box,
  Skeleton,
  Stack,
  HStack,
  Text,
} from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from "@/components/ui/dialog";
import useAuthStore from "@/store/authStore";
import { toast } from "react-toastify";

const Organizations = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] =
    useState<Organization | null>(null);
  const queryClient = useQueryClient();
  const { selectedOrganization, setSelectedOrganization } =
    useOrganizationStore();
  const user = useAuthStore((state) => state.user);

  // Queries
  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: organizationService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: organizationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setIsCreateModalOpen(false);
      toast.success("Organization created successfully");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create organization");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ data }: { data: CreateOrganizationDto }) =>
      organizationService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setEditingOrganization(null);
      toast.success("Organization updated successfully");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to update organization"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: organizationService.delete,
    onSuccess: (_, deletedOrganizationId) => {
      if (selectedOrganization?.organizationId === deletedOrganizationId) {
        setSelectedOrganization(null);
      }
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organization deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete organization");
    },
  });

  const displayedOrganizations = organizations
    ? organizations
        .filter((org) =>
          user.userRole === "master"
            ? true
            : user.organization?.organizationId === org.organizationId
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    : [];

  return (
    <Container overflow="auto" fluid py="4">
      {/* Header Bar */}
      <Flex justify="space-between" align="center" mb="4">
        <Heading size="md" color="slate.900" fontWeight="bold">
          Organizations
        </Heading>
        {user.userRole === "master" && (
          <Button
            colorPalette="blue"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Icon icon="solar:add-circle-bold" />
            Create Organization
          </Button>
        )}
      </Flex>

      {/* Content Area */}
      {isLoading ? (
        <Stack gap="3" py="4">
          <Skeleton height="36px" borderRadius="lg" />
          <Skeleton height="48px" borderRadius="lg" />
          <Skeleton height="48px" borderRadius="lg" />
          <Skeleton height="48px" borderRadius="lg" />
        </Stack>
      ) : (
        <Box
          bg="white"
          p="0"
          rounded="xl"
          borderWidth="1px"
          borderColor="gray.200"
          shadow="xs"
          overflow="hidden"
        >
          <Table.Root variant="outline" size="sm" interactive>
            <Table.Header bg="slate.50">
              <Table.Row>
                <Table.ColumnHeader>Organization</Table.ColumnHeader>
                <Table.ColumnHeader>Contact</Table.ColumnHeader>
                <Table.ColumnHeader>Email</Table.ColumnHeader>
                <Table.ColumnHeader>Phone</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Created At</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {displayedOrganizations.length > 0 ? (
                displayedOrganizations.map((org) => (
                  <Table.Row key={org.organizationId}>
                    <Table.Cell fontWeight="semibold" color="slate.900">
                      {org.organizationName}
                    </Table.Cell>
                    <Table.Cell color="slate.600">{org.contactPerson}</Table.Cell>
                    <Table.Cell color="slate.600">{org.emailId}</Table.Cell>
                    <Table.Cell color="slate.600">{org.phoneNumber}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        colorPalette={org.active ? "green" : "red"}
                        variant="subtle"
                        size="sm"
                      >
                        {org.active ? "Active" : "Inactive"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell color="slate.500" fontSize="xs">
                      {new Date(org.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      {org.organizationName !== "NAVITRONIX" && user.userRole === "master" && (
                        <HStack justify="flex-end" gap="1">
                          <IconButton
                            aria-label="Edit Organization"
                            size="xs"
                            variant="ghost"
                            colorPalette="blue"
                            onClick={() => setEditingOrganization(org)}
                          >
                            <Icon icon="solar:pen-bold" />
                          </IconButton>
                          <IconButton
                            aria-label="Delete Organization"
                            size="xs"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this organization?"
                                )
                              ) {
                                deleteMutation.mutate(org.organizationId);
                              }
                            }}
                          >
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </HStack>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={7} textAlign="center" color="slate.500" py="8">
                    <Text fontSize="sm">No organizations found</Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* Create Modal */}
      <DialogRoot
        open={isCreateModalOpen}
        onOpenChange={(e) => setIsCreateModalOpen(e.open)}
        placement="center"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <OrganizationForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      {/* Edit Modal */}
      <DialogRoot
        open={!!editingOrganization}
        onOpenChange={(e) => {
          if (!e.open) setEditingOrganization(null);
        }}
        placement="center"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {editingOrganization && (
              <OrganizationForm
                initialData={editingOrganization}
                onSubmit={(data) =>
                  updateMutation.mutate({
                    data: {
                      organizationId: editingOrganization.organizationId,
                      active: editingOrganization.active,
                      deleted: editingOrganization.deleted,
                      ...data,
                    },
                  })
                }
                onCancel={() => setEditingOrganization(null)}
              />
            )}
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </Container>
  );
};

export default Organizations;
