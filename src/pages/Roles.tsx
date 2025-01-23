import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/roleService';
import { Role, UpdateRoleDto } from '../types/role';
import { RoleForm } from '../components/roles/RoleForm';
import { Dialog } from '@headlessui/react';

const Roles = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsCreateModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ data, roleId }: { data: UpdateRoleDto; roleId: string }) =>
      roleService.update(data, roleId),
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

  const handleStatusChange = (role: Role, active: boolean) => {
    updateMutation.mutate({
      data: {
        roleName: role.roleName,
        active,
        deleted: role.deleted,
      },
      roleId: role.id,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Roles</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Role
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-lg">Loading...</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles && roles.length > 0 ? (
            roles.map((role) => (
              <div
                key={role.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{role.roleName}</h3>
                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={role.active}
                        onChange={(e) => handleStatusChange(role, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setEditingRole(role)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this role?')) {
                        deleteMutation.mutate(role.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">No roles found</div>
          )}
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
                onSubmit={(data) =>
                  updateMutation.mutate({
                    data: {
                      ...data,
                      active: editingRole.active,
                      deleted: editingRole.deleted,
                    },
                    roleId: editingRole.id,
                  })
                }
                onCancel={() => setEditingRole(null)}
              />
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Roles;
