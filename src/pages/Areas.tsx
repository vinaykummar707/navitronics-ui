import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areaService } from '../services/areaService';
import { Area, UpdateAreaDto } from '../types/area';
import { AreaForm } from '../components/areas/AreaForm';
import { Dialog } from '@headlessui/react';
import { useOrganizationStore } from '../store/useOrganizationStore';

const Areas = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const queryClient = useQueryClient();
  const { selectedOrganization } = useOrganizationStore();

  // Queries
  const { data: areas, isLoading } = useQuery({
    queryKey: ['areas', selectedOrganization?.organizationId],
    queryFn: () => selectedOrganization ? areaService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: areaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', selectedOrganization?.organizationId] });
      setIsCreateModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ data, areaId }: { data: UpdateAreaDto; areaId: string }) => 
      areaService.update(data, areaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', selectedOrganization?.organizationId] });
      setEditingArea(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: areaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', selectedOrganization?.organizationId] });
    },
  });

  if (!selectedOrganization) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-gray-500">
          Please select an organization from the navbar to view areas
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Areas</h1>
          <p className="text-gray-600 mt-1">
            Organization: {selectedOrganization.organizationName}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Area
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-lg">Loading...</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {areas && areas.length > 0 ? (
            areas.map((area) => (
              <div
                key={area.areaId}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{area.areaName}</h3>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      area.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {area.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  <span className="font-medium">Created by:</span> {area.createdBy}
                </p>
                <p className="text-gray-600 mb-4">
                  <span className="font-medium">Created at:</span>{' '}
                  {new Date(area.createdAt || '').toLocaleDateString()}
                </p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setEditingArea(area)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this area?')) {
                        deleteMutation.mutate(area.areaId!);
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
            <div className="col-span-full text-center text-gray-500">
              No areas found for this organization
            </div>
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
            <Dialog.Title className="text-lg font-medium mb-4">Create Area</Dialog.Title>
            <AreaForm
              onSubmit={(data) =>
                createMutation.mutate({
                  ...data,
                  organizationId: selectedOrganization.organizationId,
                })
              }
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={!!editingArea}
        onClose={() => setEditingArea(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium mb-4">Edit Area</Dialog.Title>
            {editingArea && (
              <AreaForm
                initialData={editingArea}
                onSubmit={(data) =>
                  updateMutation.mutate({
                    data: {
                      ...data,
                      areaId: editingArea.areaId!,
                      organizationId: selectedOrganization.organizationId,
                    },
                    areaId: editingArea.areaId!,
                  })
                }
                onCancel={() => setEditingArea(null)}
              />
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Areas;
