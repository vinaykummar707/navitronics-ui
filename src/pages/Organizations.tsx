import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '../services/organizationService';
import { Organization, CreateOrganizationDto } from '../types/organization';
import { OrganizationForm } from '../components/organizations/OrganizationForm';
import { Dialog } from '@headlessui/react';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { Icon } from '@iconify-icon/react';
import { Container } from '@chakra-ui/react';

const Organizations = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const queryClient = useQueryClient();
  const { selectedOrganization, setSelectedOrganization } = useOrganizationStore();

  // Queries
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: organizationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setIsCreateModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ data }: { data: CreateOrganizationDto }) =>
      organizationService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setEditingOrganization(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: organizationService.delete,
    onSuccess: (_, deletedOrganizationId) => {
      // Clear selected organization if it was deleted
      if (selectedOrganization?.organizationId === deletedOrganizationId) {
        setSelectedOrganization(null);
      }
      setEditingOrganization(null);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  return (
    <Container maxW={'6xl'} py={4}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold">Organizations</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 text-sm text-white flex items-center px-3 text-sm py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Organization
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-lg">Loading...</div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg border shadow-sm overflow-hidden">
          <table className="min-w-full text-sm divide-y divide-stone-200">
            <thead className="">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Organization
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm divide-y divide-stone-100">
              {organizations && organizations.length > 0 ? (
                organizations.map((org) => (
                  <tr key={org.organizationId} className="">
                    <td className="px-6 py-4 gap-3 whitespace-nowrap flex items-center">
                      <div className="size-7 bg-red-500 text-sm text-white flex items-center justify-center flex-shrink-0  rounded-full">
                      {org.organizationName.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm font-medium text-stone-900">{org.organizationName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-stone-500">{org.contactPerson}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-stone-500">{org.emailId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-stone-500">{org.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg ${
                        org.active ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {org.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingOrganization(org)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Icon icon="solar:pen-bold" className="inline-block" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this organization?')) {
                            deleteMutation.mutate(org.organizationId);
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
                    No organizations found
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
            <Dialog.Title className="text-lg font-medium mb-4">Create Organization</Dialog.Title>
            <OrganizationForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={!!editingOrganization}
        onClose={() => setEditingOrganization(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium mb-4">Edit Organization</Dialog.Title>
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
          </Dialog.Panel>
        </div>
      </Dialog>
    </Container>
  );
};

export default Organizations;
