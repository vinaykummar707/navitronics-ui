import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { User } from "../types/user";
import { UserForm } from "../components/users/UserForm";
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
import { toast } from "react-toastify";

const Users = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { selectedOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization
        ? userService.getAll(selectedOrganization.organizationId)
        : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateModalOpen(false);
      toast.success("User created successfully!");
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      toast.error("Failed to create user.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ data, userId }: { data: any; userId: string }) =>
      userService.update(data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      toast.success("User updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Failed to update user.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    },
  });

  if (!selectedOrganization) {
    return (
      <Box p="8" textAlign="center">
        <Text color="gray.500" fontSize="md">
          Please select an organization first from the sidebar.
        </Text>
      </Box>
    );
  }

  return (
    <Container overflow="auto" fluid py="4">
      {/* Header Bar */}
      <Flex justify="space-between" align="center" mb="6">
        <Heading size="md" color="gray.900" fontWeight="bold">
          Users
        </Heading>
        <Button
          colorPalette="blue"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Icon icon="solar:add-circle-bold" />
          Create User
        </Button>
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
            <Table.Header bg="gray.50">
              <Table.Row>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Username</Table.ColumnHeader>
                <Table.ColumnHeader>Role</Table.ColumnHeader>
                <Table.ColumnHeader>Area</Table.ColumnHeader>
                <Table.ColumnHeader>Depot</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <Table.Row key={user.userId}>
                    <Table.Cell fontWeight="semibold" color="gray.900">
                      {user.name}
                    </Table.Cell>
                    <Table.Cell color="gray.600">{user.userName}</Table.Cell>
                    <Table.Cell color="gray.600">{user.roleName || "-"}</Table.Cell>
                    <Table.Cell color="gray.600">{user.areaName || "-"}</Table.Cell>
                    <Table.Cell color="gray.600">{user.depotName || "-"}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        colorPalette={user.active ? "green" : "red"}
                        variant="subtle"
                        size="sm"
                      >
                        {user.active ? "Active" : "Inactive"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      <HStack justify="flex-end" gap="1">
                        <IconButton
                          aria-label="Delete User"
                          size="xs"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this user?")) {
                              deleteMutation.mutate(user.userId);
                            }
                          }}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={7} textAlign="center" color="gray.500" py="8">
                    <Text fontSize="sm">No users found</Text>
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
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <UserForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateModalOpen(false)}
              selectedOrganizationId={selectedOrganization.organizationId}
            />
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      {/* Edit Modal */}
      <DialogRoot
        open={!!editingUser}
        onOpenChange={(e) => {
          if (!e.open) setEditingUser(null);
        }}
        placement="center"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {editingUser && (
              <UserForm
                initialData={editingUser}
                onSubmit={(data) =>
                  updateMutation.mutate({
                    data: {
                      ...data,
                      active: editingUser.active,
                      deleted: editingUser.deleted,
                    },
                    userId: editingUser.userId,
                  })
                }
                onCancel={() => setEditingUser(null)}
                selectedOrganizationId={selectedOrganization.organizationId}
              />
            )}
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </Container>
  );
};

export default Users;
