import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/roleService';
import { Role } from '../types/role';
import { RoleForm } from '../components/roles/RoleForm';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { Icon } from '@iconify-icon/react';
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
} from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';

const Roles = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { selectedOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles', selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization ? roleService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  const createMutation = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsCreateModalOpen(false);
      toast.success('Role created successfully');
    },
    onError: () => {
      toast.error('Failed to create role');
    },
  });

  const updateMutation = useMutation({
    mutationFn: roleService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
      toast.success('Role updated successfully');
    },
    onError: () => {
      toast.error('Failed to update role');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: roleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete role');
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
          Roles
        </Heading>
        <Button
          colorPalette="blue"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Icon icon="solar:add-circle-bold" />
          Create Role
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
                <Table.ColumnHeader>Role Name</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {roles && roles.length > 0 ? (
                roles.map((role) => (
                  <Table.Row key={role.roleId}>
                    <Table.Cell fontWeight="semibold" color="gray.900">
                      {role.roleName}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        colorPalette={role.active ? 'green' : 'red'}
                        variant="subtle"
                        size="sm"
                      >
                        {role.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      <HStack justify="flex-end" gap="1">
                        <IconButton
                          aria-label="Edit Role"
                          size="xs"
                          variant="ghost"
                          colorPalette="blue"
                          onClick={() => setEditingRole(role)}
                        >
                          <Icon icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton
                          aria-label="Delete Role"
                          size="xs"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this role?')) {
                              deleteMutation.mutate(role.id);
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
                  <Table.Cell colSpan={3} textAlign="center" color="gray.500" py="8">
                    <Text fontSize="sm">No roles found</Text>
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
            <DialogTitle>Create Role</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <RoleForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      {/* Edit Modal */}
      <DialogRoot
        open={!!editingRole}
        onOpenChange={(e) => {
          if (!e.open) setEditingRole(null);
        }}
        placement="center"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {editingRole && (
              <RoleForm
                initialData={editingRole}
                onSubmit={(data) => updateMutation.mutate(data)}
                onCancel={() => setEditingRole(null)}
              />
            )}
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </Container>
  );
};

export default Roles;
