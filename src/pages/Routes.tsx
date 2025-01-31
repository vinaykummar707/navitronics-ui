import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routeService } from "../services/routeService";
import { areaService } from "../services/areaService";
import { depotService } from "../services/depotService";
import { useOrganizationStore } from "../store/useOrganizationStore";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify-icon/react";
import { Container, Group } from "@chakra-ui/react";
import { AreaSelector } from "@/components/common/AreaSelector";
import useAuthStore from "@/store/authStore";
import SimulationDialog from "@/components/SimulationDialog";
import RBAC from '../components/RBAC';
import { ROLES } from '../constants/roles';

const Routes = () => {
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedDepotId, setSelectedDepotId] = useState<string>("");
  const { selectedOrganization } = useOrganizationStore();
  const [route, setRoute] = useState({});
  const [showSimulation, setShowSimulation] = useState(false);
  const [finalObj, setFinalObj] = useState({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Reset selections when organization changes
  useEffect(() => {
    setSelectedAreaId("");
    setSelectedDepotId("");
  }, [selectedOrganization?.organizationId]);

  // Queries
  const { data: areas } = useQuery({
    queryKey: ["areas", selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization
        ? areaService.getAll(selectedOrganization.organizationId)
        : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });
  const filteredAreas = user.area && (user.userRole === 'area_admin' || user.userRole === 'depot_admin') ? areas?.filter(area => area.areaId === user.area.areaId) : areas;

  const { data: depots } = useQuery({
    queryKey: ["depots", selectedAreaId],
    queryFn: () => depotService.getAll(selectedAreaId),
    enabled: !!selectedAreaId,
  });

  const filteredDepots = user.depot && user.userRole === 'depot_admin' ? depots?.filter(depot => depot.depotId === user.depot.depotId) : depots;

  const { data: routes, isLoading } = useQuery({
    queryKey: ["routes", selectedDepotId],
    queryFn: () =>
      routeService.getAll(
        selectedOrganization?.organizationId,
        selectedAreaId,
        selectedDepotId
      ),
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
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.error("Error creating route:", error);
      // Handle error appropriately
    },
  });

  const generateJson = (data: any) => {
    // Convert to JSON string with proper formatting
    const jsonString = JSON.stringify(data, null, 2);

    // Create blob and download link
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `route_config_${selectedDepotId || "new"}_${new Date().toISOString().split("T")[0]
      }.json`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also log to console for reference
    console.log("Configuration Saved:", data);
  };

  const getAllWithConfigMutation = useMutation({
    mutationFn: routeService.getAllWithConfig,
    onSuccess: (data) => {
      console.log(data);
      generateJson(data);
    },
  });

  const getRouteDetaildWithIdMutation = useMutation({
    mutationFn: routeService.getRouteWithRouteId,
    onSuccess: (data) => {
      setFinalObj(data[0]);

      const {
        routeNumber,
        source,
        destination,
        separation,
        via,

        routeNumberUpperHalf,
        routeNumberLowerHalf,
      } = data[0];


      setRoute({
        routeNumber,
        source,
        destination,
        separation,
        via,
        splitRoute: false,
        routeNumberUpperHalf,
        routeNumberLowerHalf
      });
      setShowSimulation(true);
    },
  });

  if (!selectedOrganization) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-stone-500">
          Please select an organization first
        </div>
      </div>
    );
  }

  const filteredRoutes = routes?.filter((route) => !route.deleted);

  return (
    <Container fluid className="py-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2 ">
          <div className="mb-4 flex flex-col items-start justify-start">
            <label htmlFor="area" className="block text-sm font-medium text-stone-700">
              Select Area
            </label>
            <select
              id="area"
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value)}
              className="border text-sm border-neutral-300 text-neutral-900 p-2 rounded-lg "
            >
              <option value="">Select Area</option>
              {filteredAreas?.map((area) => (
                <option key={area.areaId} value={area.areaId}>
                  {area.areaName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="depot" className="block text-sm font-medium text-stone-700">
              Select Depot
            </label>
            <select
              id="depot"
              value={selectedDepotId}
              onChange={(e) => setSelectedDepotId(e.target.value)}
              className="border text-sm border-neutral-300 text-neutral-900 p-2 rounded-lg "
            >
              <option value="">Select Depot</option>
              {filteredDepots?.map((depot) => (
                <option key={depot.depotId} value={depot.depotId}>
                  {depot.depotName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Group>
          <RBAC roles={[ROLES.ORGANIZATION_ADMIN, ROLES.AREA_ADMIN, ROLES.DEPOT_ADMIN, ROLES.MASTER]}>
            <button
              onClick={() =>
                navigate("/home/create-route", {
                  state: { areaId: selectedAreaId, depotId: selectedDepotId },
                })
              }
              disabled={!selectedDepotId}
              className={`bg-indigo-600 text-white text-sm px-3 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${!selectedDepotId ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              Create Route
            </button>
          </RBAC>
          <button
            onClick={() => getAllWithConfigMutation.mutate(selectedDepotId)}
            disabled={!selectedDepotId}
            className={`bg-green-600 text-white text-sm px-3 py-2 rounded-md hover:bg-green-700  ${!selectedDepotId ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {getAllWithConfigMutation.isPending ? "Exporting..." : 'Export All Routes'}
          </button>
        </Group>
      </div>

      {/* Area and Depot Selection */}


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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                  >
                    Route Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                  >
                    Source
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                  >
                    Destination
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                  >
                    Via
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {filteredRoutes && filteredRoutes.length > 0 ? (
                  filteredRoutes.map((route) => (
                    <tr key={route?.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-stone-900">
                          {route.routeNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-500">
                          {route.source}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-500">
                          {route.destination}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-500">
                          {route.via}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${route.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {route.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            getRouteDetaildWithIdMutation.mutate(route.id);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Icon
                            icon="solar:eye-bold"
                            className="inline-block"
                          />
                        </button>
                        <RBAC roles={[ROLES.ORGANIZATION_ADMIN, ROLES.AREA_ADMIN, ROLES.DEPOT_ADMIN, ROLES.MASTER]}>
                          <button
                            onClick={() =>
                              navigate(`/edit-route/${route.id}`)
                            }
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <Icon
                              icon="solar:pen-bold"
                              className="inline-block"
                            />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this route?"
                                )
                              ) {
                                deleteMutation.mutate(route.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Icon
                              icon="solar:trash-bin-trash-bold"
                              className="inline-block"
                            />
                          </button>
                        </RBAC>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-stone-500"
                    >
                      No routes found for this depot
                    </td>
                  </tr>
                )}
              </tbody>
            </table>


            {showSimulation && (
              <SimulationDialog
                route={route}
                showSimulation={showSimulation}
                displayConfig={finalObj["displayConfig"]}
                closeSimulation={() => setShowSimulation(false)}
                saveToDatabase={null}
                showSaveButton={false}
              />
            )}
          </div>
        )
      ) : (
        <div className="text-center text-stone-500">
          Please select a depot to view routes
        </div>
      )}
    </Container>
  );
};

export default Routes;
