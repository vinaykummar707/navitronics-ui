import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { routeService } from '../services/routeService';
import { areaService } from '../services/areaService';
import { depotService } from '../services/depotService';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { useNavigate } from 'react-router-dom';

const Routes = () => {
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedDepotId, setSelectedDepotId] = useState<string>('');
  const { selectedOrganization } = useOrganizationStore();
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
    queryKey: ['depots', selectedOrganization?.organizationId, selectedAreaId],
    queryFn: () => depotService.getAll(selectedAreaId),
    enabled: !!selectedOrganization && !!selectedAreaId,
  });

  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes', selectedOrganization?.organizationId, selectedAreaId, selectedDepotId],
    queryFn: () => routeService.getAll(selectedOrganization?.organizationId || '', selectedAreaId, selectedDepotId),
    enabled: !!selectedOrganization && !!selectedAreaId && !!selectedDepotId,
  });

  if (!selectedOrganization) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-gray-500">Please select an organization first</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Routes</h1>
          <p className="text-gray-600">
            Organization: {selectedOrganization.organizationName}
          </p>
        </div>
        <button
          onClick={() => navigate('/create-route', { state: { areaId: selectedAreaId, depotId: selectedDepotId } })}
          disabled={!selectedAreaId || !selectedDepotId}
          className={`bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            (!selectedAreaId || !selectedDepotId) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Create Route
        </button>
      </div>

      {/* Area and Depot Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700">
            Select Area
          </label>
          <select
            id="area"
            value={selectedAreaId}
            onChange={(e) => {
              setSelectedAreaId(e.target.value);
              setSelectedDepotId(''); // Reset depot when area changes
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Area</option>
            {areas?.map((area: any) => (
              <option key={area.areaId} value={area.areaId}>
                {area.areaName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="depot" className="block text-sm font-medium text-gray-700">
            Select Depot
          </label>
          <select
            id="depot"
            value={selectedDepotId}
            onChange={(e) => setSelectedDepotId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={!selectedAreaId}
          >
            <option value="">Select Depot</option>
            {depots?.map((depot: any) => (
              <option key={depot.depotId} value={depot.depotId}>
                {depot.depotName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Routes Display */}
      {selectedAreaId && selectedDepotId ? (
        isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-lg">Loading...</div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routes && routes.length > 0 ? (
              routes.map((route) => (
                <div
                  key={route.routeNumber}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">Route {route.routeNumber}</h3>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        route.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {route.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Source:</span> {route.source}
                    </p>
                    <p>
                      <span className="font-medium">Destination:</span> {route.destination}
                    </p>
                    <p>
                      <span className="font-medium">Via:</span> {route.via}
                    </p>
                    <p>
                      <span className="font-medium">Separation:</span> {route.separation}
                    </p>
                    <p>
                      <span className="font-medium">Route Number:</span>{' '}
                      {route.routeNumberUpperHalf}/{route.routeNumberLowerHalf}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created by {route.createdBy} on{' '}
                      {new Date(route.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No routes found for this depot
              </div>
            )}
          </div>
        )
      ) : (
        <div className="text-center text-gray-500">
          Please select both an area and a depot to view routes
        </div>
      )}
    </div>
  );
};

export default Routes;
