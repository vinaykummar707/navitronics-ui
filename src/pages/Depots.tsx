import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { depotService } from '../services/depotService';
import { areaService } from '../services/areaService';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { Depot, CreateDepotDto, UpdateDepotDto } from '../types/depot';
import { DepotForm } from '../components/depots/DepotForm';
import { Dialog } from '@headlessui/react';

const Depots = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<Depot | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const { selectedOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();

  // Queries
  const { data: areas } = useQuery({
    queryKey: ['areas', selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization ? areaService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  const { data: depots, isLoading } = useQuery({
    queryKey: ['depots', selectedAreaId],
    queryFn: () => depotService.getAll(selectedAreaId),
    enabled: !!selectedAreaId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateDepotDto) => depotService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots', selectedAreaId] });
      setIsCreateModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ data, depotId }: { data: UpdateDepotDto; depotId: string }) =>
      depotService.update(data, depotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots', selectedAreaId] });
      setEditingDepot(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (depotId: string) => depotService.delete(depotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots', selectedAreaId] });
    },
  });

  if (!selectedOrganization) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-gray-500">
          Please select an organization from the navbar to view depots
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Depots</h1>
          <p className="text-gray-600 mt-1">
            Organization: {selectedOrganization.organizationName}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={!selectedAreaId}
        >
          Create Depot
        </button>
      </div>

      {/* Area Selection */}
      <div className="mb-6">
        <label htmlFor="areaSelect" className="block text-sm font-medium text-gray-700 mb-2">
          Select Area
        </label>
        <select
          id="areaSelect"
          value={selectedAreaId}
          onChange={(e) => setSelectedAreaId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select Area</option>
          {areas?.map((area) => (
            <option key={area.areaId} value={area.areaId}>
              {area.areaName}
            </option>
          ))}
        </select>
      </div>

      {/* Depots List */}
      {selectedAreaId ? (
        isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-lg">Loading...</div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {depots && depots.length > 0 ? (
              depots.map((depot) => (
                <div
                  key={depot.depotId}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{depot.depotName}</h3>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        depot.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {depot.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => setEditingDepot(depot)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this depot?')) {
                          deleteMutation.mutate(depot.depotId);
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
                No depots found for this area
              </div>
            )}
          </div>
        )
      ) : (
        <div className="text-center text-gray-500">Please select an area to view depots</div>
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
            <Dialog.Title className="text-lg font-medium mb-4">Create Depot</Dialog.Title>
            <DepotForm
              selectedAreaId={selectedAreaId}
              selectedOrganizationId={selectedOrganization.organizationId}
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={!!editingDepot}
        onClose={() => setEditingDepot(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium mb-4">Edit Depot</Dialog.Title>
            {editingDepot && (
              <DepotForm
                initialData={editingDepot}
                selectedAreaId={selectedAreaId}
                onSubmit={(data) =>
                  updateMutation.mutate({
                    data: {
                      ...data,
                      active: editingDepot.active,
                      deleted: editingDepot.deleted,
                    },
                    depotId: editingDepot.depotId,
                  })
                }
                onCancel={() => setEditingDepot(null)}
              />
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Depots;
