import { useState, useEffect, useRef } from "react";
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
import RBAC from "../components/RBAC";
import { ROLES } from "../constants/roles";
import { AgGridReact } from "ag-grid-react";
import { toast } from "react-toastify";

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
  const gridRef = useRef<GridApi | null>(null); // Reference to AG Grid
  const [selectedRows, setSelectedRows] = useState<any[]>([]); // State to hold selected rows

  // Update the useEffect for organization change
  useEffect(() => {
    if (selectedOrganization?.organizationId) {
      // Clear selections when organization changes
      setSelectedAreaId("");
      setSelectedDepotId("");
      //   localStorage.removeItem('selectedAreaId');
      //   localStorage.removeItem('selectedDepotId');
    }
  }, [selectedOrganization?.organizationId]);

  // Update select handlers
  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAreaId = e.target.value;
    setSelectedAreaId(newAreaId);
    setSelectedDepotId(""); // Reset depot when area changes
    localStorage.setItem("selectedAreaId", newAreaId);
    localStorage.removeItem("selectedDepotId"); // Clear saved depot when area changes
  };

  const handleDepotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDepotId = e.target.value;
    setSelectedDepotId(newDepotId);
    localStorage.setItem("selectedDepotId", newDepotId);
  };

  // Queries
  const { data: areas } = useQuery({
    queryKey: ["areas", selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization
        ? areaService.getAll(selectedOrganization.organizationId)
        : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });
  const filteredAreas =
    user.area &&
    (user.userRole === "area_admin" || user.userRole === "depot_admin")
      ? areas?.filter((area) => area.areaId === user.area.areaId)
      : areas;

  const { data: depots } = useQuery({
    queryKey: ["depots", selectedAreaId],
    queryFn: () => depotService.getAll(selectedAreaId),
    enabled: !!selectedAreaId,
  });

  // Update area selection effect
  useEffect(() => {
    if (areas?.length > 0 && !selectedAreaId) {
      const savedAreaId = localStorage.getItem("selectedAreaId");
      const areaToSelect =
        savedAreaId && areas.find((area) => area.areaId === savedAreaId)
          ? savedAreaId
          : areas[0].areaId;

      setSelectedAreaId(areaToSelect);
      localStorage.setItem("selectedAreaId", areaToSelect);
    }
  }, [areas]);

  // Update depot selection effect
  useEffect(() => {
    if (depots?.length > 0 && !selectedDepotId) {
      const savedDepotId = localStorage.getItem("selectedDepotId");
      const depotToSelect =
        savedDepotId && depots.find((depot) => depot.depotId === savedDepotId)
          ? savedDepotId
          : depots[0].depotId;

      setSelectedDepotId(depotToSelect);
      localStorage.setItem("selectedDepotId", depotToSelect);
    }
  }, [depots]);

  const filteredDepots =
    user.depot && user.userRole === "depot_admin"
      ? depots?.filter((depot) => depot.depotId === user.depot.depotId)
      : depots;

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

  // // Auto-select first area and depot
  // useEffect(() => {
  // 	if (areas && areas.length > 0 && !selectedAreaId) {
  // 		setSelectedAreaId(areas[0].areaId);
  // 	}
  // }, [areas]);

  // useEffect(() => {
  // 	if (depots && depots.length > 0 && !selectedDepotId) {
  // 		setSelectedDepotId(depots[0].depotId);
  // 	}
  // }, [depots]);

  const deleteMutation = useMutation({
    mutationFn: routeService.delete,
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["routes", selectedDepotId] });
      toast.success("Route deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting route:", error);
      toast.error("Failed to delete route.");
    },
  });

  const multipleDeleteMutation = useMutation({
    mutationFn: routeService.deleteBulk,
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["routes", selectedDepotId] });
      toast.success("Routes deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting routes:", error);
      toast.error("Failed to delete routes.");
    },
  });

  const onSelectAllRoutes = () => {
    const allRouteIds = routes?.map((route) => route.id) || [];
    setSelectedRows(allRouteIds); // Set all route IDs as selected
    console.log("All selected IDs:", allRouteIds); // Log all selected IDs
  };

  const getAllWithConfigMutation = useMutation({
    mutationFn: async ({
      areaId,
      depotId,
      selectedIds, // Add selectedIds as part of the parameters
    }: {
      areaId: string;
      depotId: string;
      selectedIds: string[]; // Expecting an array of selected IDs
    }) => await routeService.getAllWithConfig(depotId, areaId, selectedIds), // Pass selectedIds to the service call
    onSuccess: (response) => {
      // Create a download link for the response (which is a Blob for file download)
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "Routes.zip"; // Set the desired filename for the downloaded file
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); // Clean up after download
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
        routeNumberLowerHalf,
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

  // Custom cell renderer for actions column
  const ActionCellRenderer = (params: any) => {
    const route = params.data.route; // Extracting route data
    console.log(params.data);

    return (
      <RBAC
        roles={[
          ROLES.ORGANIZATION_ADMIN,
          ROLES.AREA_ADMIN,
          ROLES.DEPOT_ADMIN,
          ROLES.MASTER,
        ]}
      >
        {/* Edit Button */}
        <button
          
          onClick={() =>
                window.open(
                  `http://31.97.228.29:9091/route-create/${selectedAreaId}/${selectedDepotId}/${params.data.id}`,
                  "_blank" // Open in a new tab
                )
              }
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          <Icon icon="solar:pen-bold" className="inline-block" />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => {
            if (
              confirm(
                `Are you sure you want to delete route ${route.routeNumber}?`
              )
            ) {
              deleteMutation.mutate(params.data.id);
            }
          }}
          className="text-red-600 hover:text-red-900"
        >
          <Icon icon="solar:trash-bin-trash-bold" className="inline-block" />
        </button>
      </RBAC>
    );
  };

  // Event handler for selection change
  const onSelectionChanged = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes(); // Get selected nodes
    const selectedIds = selectedNodes?.map((node) => node.data.id); // Extract only the IDs from the selected nodes
    setSelectedRows(selectedIds); // Store only the selected IDs
    console.log("Selected IDs:", selectedIds); // Log the selected IDs
  };

  const onRouteNumberSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    gridRef.current.setQuickFilter(searchValue); // Use AG Grid's quick filter for searching
  };

  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50,
    },
    {
      headerName: "Sl No",
      field: "rowNumber",
      width: 70,
      sortable: true,
      comparator: (a, b) => a - b,
      valueGetter: (params) => params.node.rowIndex + 1,
    },
    {
      headerName: "Route No",
      field: "route.routeNumber",
      filter: true,
      valueGetter: (params) =>
        params.data.route.splitRoute
          ? `${params.data.route.routeNumber1} / ${params.data.route.routeNumber2}`
          : params.data.route.routeNumber,
      editable: false, // Since it's dynamically generated
    },
    {
      headerName: "Source - Destination",
      field: "route.combinedRoute",
      filter: true,
      valueGetter: (params) =>
        `${params.data.route.source} ${params.data.route.separation} ${params.data.route.destination}`,
      editable: false,
      flex: 1,
    },
    { headerName: "Via", field: "route.via", flex: 1 },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: ActionCellRenderer, // Use custom renderer
      width: 150,
      pinned: "right", // Keep actions column fixed on right
    },
    {
      headerName: "Created At",
      field: "createdAt",
      valueGetter: (params) => {
        const raw = params.data.createdAt;
        // Ensure correct parsing (assuming it's UTC)
        return new Date(raw + "Z"); // Add 'Z' if server time is UTC
      },
      comparator: (a, b) => {
        return new Date(a).getTime() - new Date(b).getTime(); // FIFO: older comes first
      },
      valueFormatter: (params) =>
        new Date(params.value).toLocaleString("en-IN", {
          dateStyle: "short",
          timeStyle: "medium",
        }),
      sortable: true,
      sort: "desc", // Optional: default sort FIFO (oldest first)
      width: 200,
    },
  ];

  return (
    <Container overflow={"scroll"} fluid className="py-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2 ">
          <div className="mb-4 flex flex-col items-start justify-start">
            <label
              htmlFor="area"
              className="block text-sm font-medium text-stone-700"
            >
              Select Area
            </label>
            <select
              id="area"
              value={selectedAreaId}
              onChange={handleAreaChange}
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
            <label
              htmlFor="depot"
              className="block text-sm font-medium text-stone-700"
            >
              Select Depot
            </label>
            <select
              id="depot"
              value={selectedDepotId}
              onChange={handleDepotChange}
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
          <RBAC
            roles={[
              ROLES.ORGANIZATION_ADMIN,
              ROLES.AREA_ADMIN,
              ROLES.DEPOT_ADMIN,
              ROLES.MASTER,
            ]}
          >
            <button
              onClick={() =>
                window.open(
                  `http://31.97.228.29:9091/route-create/${selectedAreaId}/${selectedDepotId}`,
                  "_blank" // Open in a new tab
                )
              }
              disabled={!selectedDepotId}
              className={`bg-indigo-600 text-white text-sm px-3 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                !selectedDepotId ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Create Route
            </button>
          </RBAC>
          <button
            onClick={() =>
              getAllWithConfigMutation.mutate({
                areaId: selectedAreaId,
                depotId: selectedDepotId,
                selectedIds: selectedRows,
              })
            }
            disabled={!selectedDepotId}
            className={`bg-green-600 text-white text-sm px-3 py-2 rounded-md hover:bg-green-700  ${
              !selectedDepotId ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {getAllWithConfigMutation.isPending
              ? "Exporting..."
              : "Export All Routes"}
          </button>
          {selectedRows.length && (
            <RBAC
              roles={[
                ROLES.ORGANIZATION_ADMIN,
                ROLES.AREA_ADMIN,
                ROLES.DEPOT_ADMIN,
                ROLES.MASTER,
              ]}
            >
              <button
                onClick={() => {
                  if (selectedRows.length > 0) {
                    if (
                      confirm(
                        `Are you sure you want to delete ${selectedRows.length} routes?`
                      )
                    ) {
                      multipleDeleteMutation.mutate(selectedRows);
                    }
                  } else {
                    alert("Please select at least one route to delete");
                  }
                }}
                disabled={!selectedDepotId || selectedRows.length === 0}
                className={`bg-red-600 text-white text-sm px-3 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  !selectedDepotId || selectedRows.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {multipleDeleteMutation.isPending
                  ? "Deleting..."
                  : "Delete Selected Routes"}
              </button>
            </RBAC>
          )}

          <RBAC
            roles={[
              ROLES.ORGANIZATION_ADMIN,
              ROLES.AREA_ADMIN,
              ROLES.DEPOT_ADMIN,
              ROLES.MASTER,
            ]}
          >
            <button
              onClick={() => {
                if (gridRef.current) {
                  if (
                    confirm(
                      `Are you sure you want to delete ${selectedRows.length} routes?`
                    )
                  ) {
                    const routeIds = routes.map((route) => parseInt(route.id));
                    console.log("Route IDs to delete:", routeIds);
                    multipleDeleteMutation.mutate(routeIds);
                  }
                }
              }}
              className="bg-red-600 text-white text-sm px-3 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete All Routes
            </button>
          </RBAC>
        </Group>
      </div>

      {/* Area and Depot Selection */}

      {/* Routes Display */}
      {routes && (
        <h1 className="text-lg pb-4 font-bold">
          Showing Total {routes.length} Routes{" "}
        </h1>
      )}

      {selectedDepotId ? (
        isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-lg">Loading...</div>
          </div>
        ) : (
          <div
            className="ag-theme-alpine"
            style={{ height: 400, width: "100%" }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={routes}
              columnDefs={columnDefs}
              rowSelection="multiple"
              onSelectionChanged={onSelectionChanged} // Bind selection change event
            />
          </div>
          // <div className="bg-white rounded-lg  shadow overflow-hidden">
          // 	<table className="min-w-full divide-y divide-stone-200">
          // 		<thead className="bg-stone-50">
          // 			<tr>
          // 				<th
          // 					scope="col"
          // 					className="px-3 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
          // 				>
          // 					Route Number
          // 				</th>
          // 				<th
          // 					scope="col"
          // 					className="px-3 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
          // 				>
          // 					Source
          // 				</th>
          // 				<th
          // 					scope="col"
          // 					className="px-3 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
          // 				>
          // 					Destination
          // 				</th>
          // 				<th
          // 					scope="col"
          // 					className="px-3 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
          // 				>
          // 					Via
          // 				</th>
          // 				<th
          // 					scope="col"
          // 					className="px-3 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
          // 				>
          // 					Status
          // 				</th>
          // 				<th
          // 					scope="col"
          // 					className="px-3 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider"
          // 				>
          // 					Actions
          // 				</th>
          // 			</tr>
          // 		</thead>
          // 		<tbody className="bg-white divide-y divide-stone-200">
          // 			{filteredRoutes && filteredRoutes.length > 0 ? (
          // 				filteredRoutes.map((route) => (
          // 					<tr key={route?.id} className="hover:bg-stone-50">
          // 						<td className="px-3 py-4  ">
          // 							<div className="text-sm font-medium text-stone-900">
          // 								{route.route.routeNumber}
          // 							</div>
          // 						</td>
          // 						<td className="px-3 py-4 max-w-[300px] w-[300px] ">
          // 							<div className="text-sm text-stone-500">
          // 								{route.route.source}
          // 							</div>
          // 						</td>
          // 						<td className="px-3 py-4  ">
          // 							<div className="text-sm text-stone-500">
          // 								{route.route.destination}
          // 							</div>
          // 						</td>
          // 						<td className="px-3 py-4 max-w-[300px] w-[300px] ">
          // 							<div className="text-sm text-stone-500">
          // 								{route.route.via}
          // 							</div>
          // 						</td>
          // 						<td className="px-3 py-4  ">
          // 							<span
          // 								className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          // 									route.active
          // 										? 'bg-green-100 text-green-800'
          // 										: 'bg-red-100 text-red-800'
          // 								}`}
          // 							>
          // 								{route.active ? 'Active' : 'Inactive'}
          // 							</span>
          // 						</td>
          // 						<td className="px-3 py-4   text-right text-sm font-medium">
          // 							<button
          // 								onClick={() => {
          // 									getRouteDetaildWithIdMutation.mutate(route.id);
          // 								}}
          // 								className="text-indigo-600 hover:text-indigo-900 mr-4"
          // 							>
          // 								<Icon
          // 									icon="solar:eye-bold"
          // 									className="inline-block"
          // 								/>
          // 							</button>
          // 							<RBAC
          // 								roles={[
          // 									ROLES.ORGANIZATION_ADMIN,
          // 									ROLES.AREA_ADMIN,
          // 									ROLES.DEPOT_ADMIN,
          // 									ROLES.MASTER,
          // 								]}
          // 							>
          // 								<button
          // 									onClick={() =>
          // 										navigate('/home/create-route', {
          // 											state: {
          // 												areaId: selectedAreaId,
          // 												depotId: selectedDepotId,
          // 												isEdit: true,
          // 												gotRouteData: route,
          // 											},
          // 										})
          // 									}
          // 									className="text-indigo-600 hover:text-indigo-900 mr-4"
          // 								>
          // 									<Icon
          // 										icon="solar:pen-bold"
          // 										className="inline-block"
          // 									/>
          // 								</button>
          // 								<button
          // 									onClick={() => {
          // 										if (
          // 											confirm(
          // 												'Are you sure you want to delete this route?'
          // 											)
          // 										) {
          // 											deleteMutation.mutate(route.id);
          // 										}
          // 									}}
          // 									className="text-red-600 hover:text-red-900"
          // 								>
          // 									<Icon
          // 										icon="solar:trash-bin-trash-bold"
          // 										className="inline-block"
          // 									/>
          // 								</button>
          // 							</RBAC>
          // 						</td>
          // 					</tr>
          // 				))
          // 			) : (
          // 				<tr>
          // 					<td
          // 						colSpan={6}
          // 						className="px-3 py-4 text-center text-stone-500"
          // 					>
          // 						No routes found for this depot
          // 					</td>
          // 				</tr>
          // 			)}
          // 		</tbody>
          // 	</table>

          // 	{showSimulation && (
          // 		<SimulationDialog
          // 			route={route}
          // 			showSimulation={showSimulation}
          // 			displayConfig={finalObj['displayConfig']}
          // 			closeSimulation={() => setShowSimulation(false)}
          // 			saveToDatabase={null}
          // 			showSaveButton={false}
          // 		/>
          // 	)}
          // </div>
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
