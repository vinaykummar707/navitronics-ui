import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routeService } from '../services/routeService';
import { areaService } from '../services/areaService';
import { depotService } from '../services/depotService';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import { Container } from '@chakra-ui/react';

const Routes = () => {
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedDepotId, setSelectedDepotId] = useState<string>('');
  const { selectedOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Reset selections when organization changes
  useEffect(() => {
    setSelectedAreaId('');
    setSelectedDepotId('');
  }, [selectedOrganization?.organizationId]);

  // Queries
  const { data: areas } = useQuery({
    queryKey: ['areas', selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization ? areaService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  const { data: depots } = useQuery({
    queryKey: ['depots', selectedAreaId],
    queryFn: () => depotService.getAll(selectedAreaId),
    enabled: !!selectedAreaId,
  });

  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes', selectedDepotId],
    queryFn: () => routeService.getAll(selectedOrganization?.organizationId, selectedAreaId, selectedDepotId),
    enabled: !!selectedDepotId,
  });

  // Auto-select first area and depot
  useEffect(() => {
    if (areas && areas.length > 0 && !selectedAreaId) {
      setSelectedAreaId(areas[0].areaId);
    }
  }, [areas]);

  useEffect(() => {
    if (depots && depots.length > 0 && !selectedDepotId) {
      setSelectedDepotId(depots[0].depotId);
    }
  }, [depots]);

  const deleteMutation = useMutation({
    mutationFn: routeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
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
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-xl font-bold">Routes</h1>
         
        </div>
        <button
          onClick={() => navigate('/create-route', { state: { areaId: selectedAreaId, depotId: selectedDepotId } })}
          disabled={!selectedDepotId}
          className={`bg-indigo-600 text-white text-sm px-3 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            !selectedDepotId ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Create Route
        </button>
      </div>

      {/* Area and Depot Selection */}
      <div className="flex gap-2 mb-4">
        <div>
          {/* <label htmlFor="area" className="block text-sm font-medium text-stone-700">
            Select Area
          </label> */}
          <select
            id="area"
            value={selectedAreaId}
            onChange={(e) => {
              setSelectedAreaId(e.target.value);
              setSelectedDepotId('');
            }}
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

        <div>
          {/* <label htmlFor="depot" className="block text-sm font-medium text-stone-700">
            Select Depot
          </label> */}
          <select
            id="depot"
            value={selectedDepotId}
            onChange={(e) => setSelectedDepotId(e.target.value)}
            className="border text-sm border-neutral-300 text-neutral-900 p-2 rounded-lg "
          >
            <option value="">Select Depot</option>
            {depots?.map((depot) => (
              <option key={depot.depotId} value={depot.depotId}>
                {depot.depotName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Routes Display */}
      {selectedDepotId ? (
        isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-lg">Loading...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg  shadow overflow-hidden">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Route Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                   Via
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
                {routes && routes.length > 0 ? (
                  routes.map((route) => (
                    <tr key={route.routeId} className="hover:bg-stone-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-stone-900">{route.routeNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-500">{route.source}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-500">{route.destination}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-500">{route.via}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          route.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {route.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/edit-route/${route.routeId}`)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Icon icon="solar:pen-bold" className="inline-block" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this route?')) {
                              deleteMutation.mutate(route.routeId);
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
                      No routes found for this depot
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center text-stone-500">Please select a depot to view routes</div>
      )}
    </Container>
  );
};

export default Routes;
