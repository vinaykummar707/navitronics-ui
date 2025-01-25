import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/roleService';
import { Role } from '../types/role';
import { RoleForm } from '../components/roles/RoleForm';
import { Dialog } from '@headlessui/react';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { Icon } from '@iconify-icon/react';
import { Container } from '@chakra-ui/react';

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
    },
  });

  const updateMutation = useMutation({
    mutationFn: roleService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: roleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  if (!selectedOrganization) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-stone-500">Please select an organization first</div>
      </div>
    );
  }

  return (
    <Container maxW={'6xl'} className="py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-=">Roles</h1>
         
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Role
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-lg">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Role Name
                </th>
              
               
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {roles && roles.length > 0 ? (
                roles.map((role) => (
                  <tr key={role.roleId} className="hover:bg-stone-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-stone-900">{role.roleName}</div>
                    </td>
                   
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        role.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {role.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingRole(role)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Icon icon="solar:pen-bold" className="inline-block" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this role?')) {
                            deleteMutation.mutate(role.roleId);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="inline-block" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-stone-500">
                    No roles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
            <Dialog.Title className="text-lg font-medium mb-4">Create Role</Dialog.Title>
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
            <Dialog.Title className="text-lg font-medium mb-4">Edit Role</Dialog.Title>
            {editingRole && (
              <RoleForm
                initialData={editingRole}
                onSubmit={(data) => updateMutation.mutate(data)}
                onCancel={() => setEditingRole(null)}
              />
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </Container>
  );
};

export default Roles;
