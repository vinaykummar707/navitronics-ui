import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/roleService';
import { Role } from '../types/role';
import { RoleForm } from '../components/roles/RoleForm';
import { Dialog } from '@headlessui/react';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { Icon } from '@iconify-icon/react';
import { Box, Button, Card, Table, Badge, IconButton } from '@chakra-ui/react';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
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
    onError: (error) => {
      toast.error('Failed to create role');
    }
  });

  const updateMutation = useMutation({
    mutationFn: roleService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update role');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: roleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete role');
    }
  });

  if (!selectedOrganization) {
    return (
      <Box w="full">
        <PageHeader
          title="Role Permissions & Access"
          description="Manage security roles and user permission levels"
          breadcrumbs={[
            { label: "Home", href: "/home" },
            { label: "Roles" },
          ]}
        />
        <EmptyState
          title="Select an Organization"
          description="Please choose an organization first to configure its access roles."
        />
      </Box>
    );
  }

  return (
    <Box w="full">
      <PageHeader
        title="Role Permissions & Access"
        description={`Manage security roles and capability access for ${selectedOrganization.name || "selected organization"}`}
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Roles" },
        ]}
        badge={`${roles?.length || 0} Roles`}
        badgeColorPalette="purple"
        actions={
          <Button
            size="sm"
            colorPalette="purple"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Role
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-sm text-stone-500">Loading roles...</div>
        </div>
      ) : (
        <Box overflow="hidden">
          <Table.Root size="md" interactive>
            <Table.Header bg="bg.subtle">
              <Table.Row borderColor="border.subtle">
                <Table.ColumnHeader
                  py="3.5"
                  px="6"
                  textTransform="uppercase"
                  fontSize="xs"
                  fontWeight="semibold"
                  color="fg.muted"
                >
                  Role Name
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  py="3.5"
                  px="6"
                  textTransform="uppercase"
                  fontSize="xs"
                  fontWeight="semibold"
                  color="fg.muted"
                >
                  Status
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  py="3.5"
                  px="6"
                  textAlign="end"
                  textTransform="uppercase"
                  fontSize="xs"
                  fontWeight="semibold"
                  color="fg.muted"
                >
                  Actions
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {roles && roles.length > 0 ? (
                roles.map((role) => (
                  <Table.Row
                    key={role.id}
                    borderColor="border.subtle"
                    _hover={{ bg: "bg.subtle" }}
                    transition="colors 0.15s"
                  >
                    <Table.Cell py="3.5" px="6" fontWeight="semibold" color="fg.default">
                      {role.roleName}
                    </Table.Cell>
                    <Table.Cell py="3.5" px="6">
                      <Badge colorPalette={role.active ? "green" : "red"}>
                        {role.active ? "Active" : "Inactive"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell py="3.5" px="6" textAlign="end">
                      <IconButton
                        aria-label="Edit role"
                        size="xs"
                        variant="ghost"
                        color="blue.600"
                        _hover={{ bg: "blue.subtle" }}
                        mr="2"
                        onClick={() => setEditingRole(role)}
                      >
                        <Icon icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton
                        aria-label="Delete role"
                        size="xs"
                        variant="ghost"
                        color="red.600"
                        _hover={{ bg: "red.subtle" }}
                        onClick={() => {
                          if (
                            confirm(
                              'Are you sure you want to delete this role?'
                            )
                          ) {
                            deleteMutation.mutate(role.id);
                          }
                        }}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={3}
                    py="8"
                    textAlign="center"
                    color="fg.muted"
                    fontSize="sm"
                  >
                    No roles found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

			{/* Create Modal */}
			<Dialog
				open={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				className="relative z-50"
			>
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
				<div className="fixed inset-0 flex items-center justify-center p-4">
					<Dialog.Panel className="mx-auto max-w-md rounded bg-white p-6">
						<Dialog.Title className="text-lg font-medium mb-4">
							Create Role
						</Dialog.Title>
						<RoleForm
							onSubmit={(data) => createMutation.mutate(data)}
							onCancel={() => setIsCreateModalOpen(false)}
						/>
					</Dialog.Panel>
				</div>
			</Dialog>

			{/* Edit Modal */}
			<Dialog
				open={!!editingRole}
				onClose={() => setEditingRole(null)}
				className="relative z-50"
			>
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
				<div className="fixed inset-0 flex items-center justify-center p-4">
					<Dialog.Panel className="mx-auto max-w-md rounded bg-white p-6">
						<Dialog.Title className="text-lg font-medium mb-4">
							Edit Role
						</Dialog.Title>
						{editingRole && (
							<RoleForm
								initialData={editingRole}
								onSubmit={(data) => updateMutation.mutate({ id: editingRole.id, data })}
								onCancel={() => setEditingRole(null)}
							/>
						)}
					</Dialog.Panel>
				</div>
			</Dialog>
		</Box>
	);
};

export default Roles;
