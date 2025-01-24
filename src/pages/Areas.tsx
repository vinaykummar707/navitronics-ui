import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areaService } from '../services/areaService';
import { Area, UpdateAreaDto } from '../types/area';
import { AreaForm } from '../components/areas/AreaForm';
import { Dialog } from '@headlessui/react';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { Icon } from '@iconify-icon/react';
import { Container } from '@chakra-ui/react';

const Areas = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const { selectedOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();

  const { data: areas, isLoading } = useQuery({
    queryKey: ['areas', selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization ? areaService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

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
        <div className="text-center text-stone-500">Please select an organization first</div>
      </div>
    );
  }

  return (
    <Container maxW={'6xl'} py={4}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Areas</h1>
          {/* <p className="text-stone-600">
            Organization: {selectedOrganization.organizationName}
          </p> */}
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Area
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
                  Area Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Created By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Created At
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
              {areas && areas.length > 0 ? (
                areas.map((area) => (
                  <tr key={area.areaId} className="hover:bg-stone-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-stone-900">{area.areaName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-stone-500">{area.createdBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-stone-500">
                        {new Date(area.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        area.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {area.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingArea(area)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Icon icon="solar:pen-bold" className="inline-block" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this area?')) {
                            deleteMutation.mutate(area.areaId);
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
                  <td colSpan={5} className="px-6 py-4 text-center text-stone-500">
                    No areas found
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
    </Container>
  );
};

export default Areas;
