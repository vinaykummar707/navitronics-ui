import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '../services/organizationService';
import { Organization, UpdateOrganizationDto } from '../types/organization';
import { OrganizationForm } from '../components/organizations/OrganizationForm';
import { Dialog } from '@headlessui/react';

const Organizations = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const queryClient = useQueryClient();

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
    mutationFn: ({  data }: { data: UpdateOrganizationDto }) =>
      organizationService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setEditingOrganization(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: organizationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Organization
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations && organizations?.length > 0 && organizations?.map((org) => (
          <div
            key={org.organizationId}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{org.organizationName}</h3>
              <span className={`px-2 py-1 rounded text-sm ${
                org.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {org.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="font-medium">Contact:</span> {org.contactPerson}
              </p>
              <p>
                <span className="font-medium">Email:</span> {org.emailId}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {org.phoneNumber}
              </p>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setEditingOrganization(org)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this organization?')) {
                    deleteMutation.mutate(org.organizationId);
                  }
                }}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

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
                    ...data
                   }
                  })
                }
                onCancel={() => setEditingOrganization(null)}
              />
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Organizations;
