import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { depotService } from '../services/depotService';
import { areaService } from '../services/areaService';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { Dialog } from '@headlessui/react';
import { DepotForm } from '../components/depots/DepotForm';
import { Depot } from '../types/depot';
import { Icon } from '@iconify-icon/react';
import { Container } from '@chakra-ui/react';

const Depots = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<Depot | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const { selectedOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();

  // Reset area selection when organization changes
  useEffect(() => {
    setSelectedAreaId('');
  }, [selectedOrganization?.organizationId]);

  // Queries
  const { data: areas } = useQuery({
    queryKey: ['areas', selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization ? areaService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  // Auto-select first area when areas are loaded
  useEffect(() => {
    if (areas && areas.length > 0 && !selectedAreaId) {
      setSelectedAreaId(areas[0].areaId);
    }
  }, [areas]);

  const { data: depots, isLoading } = useQuery({
    queryKey: ['depots', selectedOrganization?.organizationId, selectedAreaId],
    queryFn: () => depotService.getAll(selectedAreaId),
    enabled: !!selectedOrganization && !!selectedAreaId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: depotService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots'] });
      setIsCreateModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: depotService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots'] });
      setEditingDepot(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: depotService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots'] });
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
    <Container display={'flex'} flexDirection={'column'} alignItems={'start'} maxW={'6xl'} py={4}>
      <div className="flex justify-between items-center mb-2 w-full">
        <div>
          <h1 className="text-xl font-bold">Depots</h1>
          
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedAreaId}
          className={`bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            !selectedAreaId ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Create Depot
        </button>
      </div>

      {/* Area Selection */}
      <div className="mb-4 flex flex-col items-start justify-start">
        {/* <label htmlFor="area" className="block text-sm font-medium text-stone-700">
          Select Area
        </label> */}
        <select
          id="area"
          value={selectedAreaId}
          onChange={(e) => setSelectedAreaId(e.target.value)}
          className="border text-sm border-neutral-300 text-neutral-900 p-2 rounded-lg "
        >
          <option value="">Select Area</option>
          {areas?.map((area) => (
            <option key={area.areaId} value={area.areaId}>
              {area.areaName}
            </option>
          ))}
        </select>
      </div>

      {/* Depots Display */}
      {selectedAreaId ? (
        isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-lg">Loading...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden w-full">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Depot Name
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
                {depots && depots.length > 0 ? (
                  depots.map((depot) => (
                    <tr key={depot.depotId} className="hover:bg-stone-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-stone-900">{depot.depotName}</div>
                      </td>
                     
                    
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          depot.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {depot.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingDepot(depot)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Icon icon="solar:pen-bold" className="inline-block" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this depot?')) {
                              deleteMutation.mutate(depot.depotId);
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
                      No depots found for this area
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center text-stone-500">Please select an area to view depots</div>
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
                selectedOrganizationId={selectedOrganization.organizationId}
                onSubmit={(data) => updateMutation.mutate(data)}
                onCancel={() => setEditingDepot(null)}
              />
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </Container>
  );
};

export default Depots;
