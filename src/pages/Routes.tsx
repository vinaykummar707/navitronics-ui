import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routeService } from "../services/routeService";
import { areaService } from "../services/areaService";
import { depotService } from "../services/depotService";
import { useOrganizationStore } from "../store/useOrganizationStore";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify-icon/react";
import {
  Container,
  Flex,
  Box,
  Heading,
  Button,
  IconButton,
  Skeleton,
  Stack,
  HStack,
  Text,
  createListCollection,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
  const gridRef = useRef<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // Update when organization changes
  useEffect(() => {
    if (selectedOrganization?.organizationId) {
      setSelectedAreaId("");
      setSelectedDepotId("");
      localStorage.removeItem("selectedAreaId");
      localStorage.removeItem("selectedDepotId");
    }
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

  const filteredDepots =
    user.depot && user.userRole === "depot_admin"
      ? depots?.filter((depot) => depot.depotId === user.depot.depotId)
      : depots;

  // Auto-select area on load
  useEffect(() => {
    if (areas && areas.length > 0 && !selectedAreaId) {
      const savedAreaId = localStorage.getItem("selectedAreaId");
      const areaToSelect =
        savedAreaId && areas.find((area) => area.areaId === savedAreaId)
          ? savedAreaId
          : areas[0].areaId;

      setSelectedAreaId(areaToSelect);
      localStorage.setItem("selectedAreaId", areaToSelect);
    }
  }, [areas, selectedAreaId]);

  // Auto-select depot on load
  useEffect(() => {
    if (depots && depots.length > 0 && !selectedDepotId) {
      const savedDepotId = localStorage.getItem("selectedDepotId");
      const depotToSelect =
        savedDepotId && depots.find((depot) => depot.depotId === savedDepotId)
          ? savedDepotId
          : depots[0].depotId;

      setSelectedDepotId(depotToSelect);
      localStorage.setItem("selectedDepotId", depotToSelect);
    }
  }, [depots, selectedDepotId]);

  const areaCollection = useMemo(() => {
    return createListCollection({
      items: filteredAreas
        ? filteredAreas.map((area) => ({
            label: area.areaName,
            value: area.areaId,
          }))
        : [],
    });
  }, [filteredAreas]);

  const depotCollection = useMemo(() => {
    return createListCollection({
      items: filteredDepots
        ? filteredDepots.map((depot) => ({
            label: depot.depotName,
            value: depot.depotId,
          }))
        : [],
    });
  }, [filteredDepots]);

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

  const duplicateMutation = useMutation({
    mutationFn: routeService.duplicate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes", selectedDepotId] });
      toast.success("Route duplicated successfully!");
    },
    onError: (error) => {
      console.error("Duplication failed:", error);
      toast.error("Failed to duplicate route.");
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

  const getAllWithConfigMutation = useMutation({
    mutationFn: async ({
      areaId,
      depotId,
      selectedIds,
    }: {
      areaId: string;
      depotId: string;
      selectedIds: string[];
    }) => await routeService.getAllWithConfig(depotId, areaId, selectedIds),
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "Routes.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
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
      <Box p="8" textAlign="center">
        <Text color="gray.500" fontSize="md">
          Please select an organization first from the sidebar.
        </Text>
      </Box>
    );
  }

  const ActionCellRenderer = (params: any) => {
    const routeItem = params.data?.route || {};

    return (
      <RBAC
        roles={[
          ROLES.ORGANIZATION_ADMIN,
          ROLES.AREA_ADMIN,
          ROLES.DEPOT_ADMIN,
          ROLES.MASTER,
        ]}
      >
        <HStack gap="1" display="inline-flex">
          <IconButton
            aria-label="Edit Route"
            size="xs"
            variant="ghost"
            colorPalette="blue"
            onClick={() =>
              window.open(
                `http://31.97.228.29:9091/route-create/${selectedAreaId}/${selectedDepotId}/${params.data.id}`,
                "_self"
              )
            }
          >
            <Icon icon="solar:pen-bold" />
          </IconButton>
          <IconButton
            aria-label="Duplicate Route"
            size="xs"
            variant="ghost"
            colorPalette="amber"
            onClick={() => {
              if (
                confirm(
                  `Are you sure you want to duplicate route ${routeItem.routeNumber}?`
                )
              ) {
                duplicateMutation.mutate(params.data.id);
              }
            }}
          >
            <Icon icon="solar:copy-bold" />
          </IconButton>
          <IconButton
            aria-label="Delete Route"
            size="xs"
            variant="ghost"
            colorPalette="red"
            onClick={() => {
              if (
                confirm(
                  `Are you sure you want to delete route ${routeItem.routeNumber}?`
                )
              ) {
                deleteMutation.mutate(params.data.id);
              }
            }}
          >
            <Icon icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </HStack>
      </RBAC>
    );
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    const selectedIds = selectedNodes?.map((node: any) => node.data.id);
    setSelectedRows(selectedIds || []);
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
      comparator: (a: any, b: any) => a - b,
      valueGetter: (params: any) => params.node.rowIndex + 1,
    },
    {
      headerName: "Route No",
      field: "route.routeNumber",
      filter: true,
      valueGetter: (params: any) =>
        params.data?.route?.splitRoute
          ? `${params.data?.route?.routeNumber1} / ${params.data?.route?.routeNumber2}`
          : params.data?.route?.routeNumber,
      editable: false,
    },
    {
      headerName: "Source - Destination",
      field: "route.combinedRoute",
      filter: true,
      valueGetter: (params: any) =>
        `${params.data?.route?.source || ""} ${params.data?.route?.separation || ""} ${params.data?.route?.destination || ""}`,
      editable: false,
      flex: 1,
    },
    { headerName: "Via", field: "route.via", flex: 1 },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: ActionCellRenderer,
      width: 150,
      pinned: "right",
    },
    {
      headerName: "Created At",
      field: "createdAt",
      valueGetter: (params: any) => {
        const raw = params.data?.createdAt;
        return raw ? new Date(raw + "Z") : new Date();
      },
      comparator: (a: any, b: any) => {
        return new Date(a).getTime() - new Date(b).getTime();
      },
      valueFormatter: (params: any) =>
        new Date(params.value).toLocaleString("en-IN", {
          dateStyle: "short",
          timeStyle: "medium",
        }),
      sortable: true,
      sort: "desc",
      width: 200,
    },
  ];

  return (
    <Container overflow="auto" fluid py="4">
      {/* Top Header & Selector Toolbar */}
      <Flex justify="space-between" align="flex-end" mb="4" flexWrap="wrap" gap="4">
        <HStack gap="4" flexWrap="wrap">
          <Box minW="200px">
            <Field label="Select Area">
              <SelectRoot
                collection={areaCollection}
                size="sm"
                value={selectedAreaId ? [selectedAreaId] : []}
                onValueChange={(e) => {
                  const newAreaId = e.value[0] || "";
                  setSelectedAreaId(newAreaId);
                  setSelectedDepotId("");
                  localStorage.setItem("selectedAreaId", newAreaId);
                  localStorage.removeItem("selectedDepotId");
                }}
              >
                <SelectTrigger bg="white">
                  <SelectValueText placeholder="Select Area" />
                </SelectTrigger>
                <SelectContent>
                  {areaCollection.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Field>
          </Box>

          <Box minW="200px">
            <Field label="Select Depot">
              <SelectRoot
                collection={depotCollection}
                size="sm"
                disabled={!selectedAreaId}
                value={selectedDepotId ? [selectedDepotId] : []}
                onValueChange={(e) => {
                  const newDepotId = e.value[0] || "";
                  setSelectedDepotId(newDepotId);
                  localStorage.setItem("selectedDepotId", newDepotId);
                }}
              >
                <SelectTrigger bg="white">
                  <SelectValueText placeholder="Select Depot" />
                </SelectTrigger>
                <SelectContent>
                  {depotCollection.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Field>
          </Box>
        </HStack>

        <HStack gap="2">
          <RBAC
            roles={[
              ROLES.ORGANIZATION_ADMIN,
              ROLES.AREA_ADMIN,
              ROLES.DEPOT_ADMIN,
              ROLES.MASTER,
            ]}
          >
            <Button
              colorPalette="blue"
              size="sm"
              disabled={!selectedDepotId}
              onClick={() =>
                window.open(
                  `http://31.97.228.29:9091/route-create/${selectedAreaId}/${selectedDepotId}`,
                  "_self"
                )
              }
            >
              <Icon icon="solar:add-circle-bold" />
              Create Route
            </Button>
          </RBAC>

          {selectedRows.length > 0 && (
            <Button
              colorPalette="green"
              size="sm"
              disabled={!selectedDepotId}
              onClick={() =>
                getAllWithConfigMutation.mutate({
                  areaId: selectedAreaId,
                  depotId: selectedDepotId,
                  selectedIds: selectedRows,
                })
              }
            >
              {getAllWithConfigMutation.isPending
                ? "Exporting..."
                : "Export Selected Routes"}
            </Button>
          )}

          {selectedRows.length > 0 && (
            <RBAC
              roles={[
                ROLES.ORGANIZATION_ADMIN,
                ROLES.AREA_ADMIN,
                ROLES.DEPOT_ADMIN,
                ROLES.MASTER,
              ]}
            >
              <Button
                colorPalette="red"
                size="sm"
                disabled={!selectedDepotId || selectedRows.length === 0}
                onClick={() => {
                  if (selectedRows.length > 0) {
                    if (
                      confirm(
                        `Are you sure you want to delete ${selectedRows.length} routes?`
                      )
                    ) {
                      multipleDeleteMutation.mutate(selectedRows);
                    }
                  }
                }}
              >
                {multipleDeleteMutation.isPending
                  ? "Deleting..."
                  : "Delete Selected Routes"}
              </Button>
            </RBAC>
          )}
        </HStack>
      </Flex>

      {/* Routes Heading */}
      {routes && (
        <Heading size="sm" color="gray.900" fontWeight="bold" mb="4">
          Showing Total {routes.length} Routes
        </Heading>
      )}

      {/* Routes Display */}
      {selectedDepotId ? (
        isLoading ? (
          <Stack gap="3" py="4">
            <Skeleton height="36px" borderRadius="lg" />
            <Skeleton height="350px" borderRadius="lg" />
          </Stack>
        ) : (
          <Box
            className="ag-theme-alpine"
            h="500px"
            w="full"
            rounded="xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="gray.200"
            shadow="xs"
          >
            <AgGridReact
              ref={gridRef}
              rowData={routes}
              columnDefs={columnDefs}
              rowSelection="multiple"
              onSelectionChanged={onSelectionChanged}
            />
          </Box>
        )
      ) : (
        <Box p="8" textAlign="center" bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200">
          <Text color="gray.500" fontSize="sm">
            Please select a depot to view routes
          </Text>
        </Box>
      )}

      {showSimulation && (
        <SimulationDialog
          isOpen={showSimulation}
          onClose={() => setShowSimulation(false)}
          route={route}
          finalObj={finalObj}
        />
      )}
    </Container>
  );
};

export default Routes;
