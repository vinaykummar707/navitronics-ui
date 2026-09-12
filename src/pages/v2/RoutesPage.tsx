import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  SimpleGrid,
  Text,
  Badge,
  Button,
  IconButton,
  Input,
  Tabs,
  Card,
  NativeSelect,
  Dialog,
  Portal,
  CloseButton,
  Menu,
  Avatar,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { IRoute, routeCrud } from "@/types/IRoute";
import { IRegion, regionCrud } from "@/types/IRegion";
import { IDepot, depotCrud } from "@/types/IDepot";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useRegionStore } from "@/store/useRegionStore";
import { useDepotStore } from "@/store/useDepotStore";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { ROLES } from "@/constants/roles";
import { supabase } from "@/supabaseClient";
import { toast } from "react-toastify";
import { saveAs } from "file-saver";
import axios from "axios";
import { convertV2ToV1 } from "@/utils/routeConfigMapper";
import Avvvatars from "avvvatars-react";

// Modern Common Components
import PageHeader from "@/components/common/PageHeader";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import { RouteCard, parseStopsCount } from "@/components/routes/RouteCard";
import { ExportFormatDialog } from "@/components/ExportFormatDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup } from "@/components/ui/input-group";

// Icons
import {
  Route as RouteIcon,
  Plus,
  RotateCw,
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Copy,
  Repeat,
  Download,
  MapPin,
  ArrowRight,
  AlertTriangle,
  X,
  Building2,
  Globe,
  MoreVertical,
  Check,
  Split,
  Navigation,
  Layers,
} from "lucide-react";

export default function RoutesPage() {
  const navigate = useNavigate();

  // Stores
  const { selectedOrganization } = useOrganizationStore();
  const selectedRegion = useRegionStore((state) => state.selectedRegion);
  const { setSelectedRegion } = useRegionStore();
  const selectedDepot = useDepotStore((state) => state.selectedDepot);
  const { setSelectedDepot } = useDepotStore();
  const user = useLoggedUserStore((state) => state.user);

  // Permissions
  const canManageRoutes =
    user?.role?.name === ROLES.MASTER ||
    user?.role?.name === "master" ||
    user?.role?.name === "super_admin" ||
    user?.role?.name === "organization_admin" ||
    user?.role?.name === "region_admin" ||
    user?.role?.name === "depot_admin";

  // Data queries
  const {
    data: regionData,
    isLoading: isRegionsLoading,
    refetch: refetchRegions,
  } = regionCrud.useList({
    filters: {
      organization_id: selectedOrganization?.id || "",
      deleted: false,
    },
    orderBy: { column: "created_at", ascending: true },
    skip: !selectedOrganization?.id,
  });

  const {
    data: depotData,
    isLoading: isDepotsLoading,
    refetch: refetchDepots,
  } = depotCrud.useList({
    filters: {
      region_id: selectedRegion?.id || "",
      deleted: false,
    },
    orderBy: { column: "created_at", ascending: true },
    skip: !selectedRegion?.id,
  });

  const {
    data: routesData,
    isLoading: isRoutesLoading,
    isError: isRoutesError,
    error: routesError,
    refetch: refetchRoutes,
  } = routeCrud.useList({
    filters: {
      depot_id: selectedDepot?.id || "",
      deleted: false,
      organization_id: selectedOrganization?.id || "",
    },
    orderBy: { column: "created_at", ascending: false },
    custom(query) {
      return query.select(`*, created_by_user:created_by (email)`);
    },
    skip: !selectedDepot?.id || !selectedOrganization?.id,
  });

  const regions = (regionData?.data as IRegion[]) || [];
  const depots = (depotData?.data as IDepot[]) || [];
  const allRoutes = (routesData?.data as IRoute[]) || [];

  // Auto-select first region
  useEffect(() => {
    if (regions.length > 0) {
      const exists = regions.some((r) => r.id === selectedRegion?.id);
      if (!selectedRegion || !exists) {
        setSelectedRegion(regions[0]);
      }
    } else if (regions.length === 0 && selectedRegion) {
      setSelectedRegion(null);
    }
  }, [regions, selectedRegion, setSelectedRegion]);

  // Auto-select first depot
  useEffect(() => {
    if (depots.length > 0) {
      const exists = depots.some((d) => d.id === selectedDepot?.id);
      if (!selectedDepot || !exists) {
        setSelectedDepot(depots[0]);
      }
    } else if (depots.length === 0 && selectedDepot) {
      setSelectedDepot(null);
    }
  }, [depots, selectedDepot, setSelectedDepot]);

  // Mutations
  const { mutate: deleteRoute, isPending: isDeletingSingle } = routeCrud.useDelete();
  const { mutate: deleteSelectedRoutes, isPending: isDeletingBatch } = routeCrud.useDeleteAll();
  const { mutate: createRoute, isPending: isCreating } = routeCrud.useCreate();

  // Local View States matching Regions & Depots pages
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "outbound" | "return" | "split">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dialog States
  const [deleteTargetRoute, setDeleteTargetRoute] = useState<IRoute | null>(null);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [routesForExport, setRoutesForExport] = useState<IRoute[]>([]);

  // Duplicate / Return suffix prompt states
  const [duplicateTargetRoute, setDuplicateTargetRoute] = useState<IRoute | null>(null);
  const [duplicateSuffix, setDuplicateSuffix] = useState(" (Copy)");
  const [returnTargetRoute, setReturnTargetRoute] = useState<IRoute | null>(null);
  const [returnSuffix, setReturnSuffix] = useState("(Return)");

  // Filtered Routes
  const filteredRoutes = useMemo(() => {
    let list = allRoutes;

    if (typeFilter === "outbound") {
      list = list.filter((r) => !r.return);
    } else if (typeFilter === "return") {
      list = list.filter((r) => !!r.return);
    } else if (typeFilter === "split") {
      list = list.filter((r) => !!r.is_split_route);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const routeNo = (r.route_number || "").toLowerCase();
        const routeNo1 = (r.route_number_1 || "").toLowerCase();
        const routeNo2 = (r.route_number_2 || "").toLowerCase();
        const src = (r.source || "").toLowerCase();
        const dest = (r.destination || "").toLowerCase();
        const via = (r.via || "").toLowerCase();
        const email = (r.created_by_user?.email || "").toLowerCase();

        return (
          routeNo.includes(q) ||
          routeNo1.includes(q) ||
          routeNo2.includes(q) ||
          src.includes(q) ||
          dest.includes(q) ||
          via.includes(q) ||
          email.includes(q)
        );
      });
    }

    return list;
  }, [allRoutes, typeFilter, searchQuery]);

  // Selected routes map & set
  const selectedRouteIdsSet = useMemo(() => new Set(selectedRouteIds), [selectedRouteIds]);

  const selectedRouteObjects = useMemo(() => {
    return allRoutes.filter((r) => selectedRouteIdsSet.has(r.id));
  }, [allRoutes, selectedRouteIdsSet]);

  // Metrics matching Regions/Depots StatCard calculations
  const metrics = useMemo(() => {
    const total = allRoutes.length;
    const outbound = allRoutes.filter((r) => !r.return).length;
    const returnRoutes = allRoutes.filter((r) => !!r.return).length;
    const splitRoutes = allRoutes.filter((r) => !!r.is_split_route).length;

    const outboundPercent = total > 0 ? Math.round((outbound / total) * 100) : 0;
    const returnPercent = total > 0 ? Math.round((returnRoutes / total) * 100) : 0;
    const splitPercent = total > 0 ? Math.round((splitRoutes / total) * 100) : 0;

    return { total, outbound, returnRoutes, splitRoutes, outboundPercent, returnPercent, splitPercent };
  }, [allRoutes]);

  // Handlers
  const handleRegionChange = (regionId: string) => {
    const found = regions.find((r) => r.id === regionId);
    if (found) {
      setSelectedRegion(found);
      setSelectedRouteIds([]);
    }
  };

  const handleDepotChange = (depotId: string) => {
    const found = depots.find((d) => d.id === depotId);
    if (found) {
      setSelectedDepot(found);
      setSelectedRouteIds([]);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchRegions(), refetchDepots(), refetchRoutes()]);
      toast.success("Routes refreshed successfully");
    } catch {
      toast.error("Failed to refresh routes");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyRoute = (route: IRoute) => {
    const num = route.route_number || "";
    if (!num) return;
    navigator.clipboard.writeText(num);
    setCopiedId(route.id);
    toast.success(`Route ${num} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSelect = (routeId: string, selected: boolean) => {
    setSelectedRouteIds((prev) => {
      if (selected) {
        return prev.includes(routeId) ? prev : [...prev, routeId];
      } else {
        return prev.filter((id) => id !== routeId);
      }
    });
  };

  const handleToggleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRouteIds(filteredRoutes.map((r) => r.id));
    } else {
      setSelectedRouteIds([]);
    }
  };

  const handleEditRoute = (routeId: string) => {
    navigate(`/routes/create/${selectedOrganization?.id}/${selectedDepot?.id}/${routeId}`);
  };

  const handleAddRoute = () => {
    if (!selectedDepot) {
      toast.warning("Please select a depot first");
      return;
    }
    navigate(`/routes/create/${selectedOrganization?.id}/${selectedDepot?.id}`);
  };

  // Confirm and execute single delete
  const handleConfirmSingleDelete = () => {
    if (!deleteTargetRoute) return;
    deleteRoute(deleteTargetRoute.id, {
      onSuccess: () => {
        toast.success(`Route ${deleteTargetRoute.route_number || ""} deleted successfully`);
        setSelectedRouteIds((prev) => prev.filter((id) => id !== deleteTargetRoute.id));
        setDeleteTargetRoute(null);
        refetchRoutes();
      },
      onError: (err: any) => {
        toast.error(`Error deleting route: ${err.message || "Unknown error"}`);
      },
    });
  };

  // Confirm and execute batch delete
  const handleConfirmBatchDelete = () => {
    if (selectedRouteIds.length === 0) return;
    deleteSelectedRoutes(selectedRouteIds, {
      onSuccess: () => {
        toast.success(`${selectedRouteIds.length} route(s) deleted successfully`);
        setSelectedRouteIds([]);
        setIsBatchDeleteDialogOpen(false);
        refetchRoutes();
      },
      onError: (err: any) => {
        toast.error(`Error deleting selected routes: ${err.message || "Unknown error"}`);
      },
    });
  };

  // Duplicate Route
  const handleExecuteDuplicate = async () => {
    if (!duplicateTargetRoute) return;
    const routeId = duplicateTargetRoute.id;

    const { data: originalRoute, error: fetchError } = await supabase
      .from("routes")
      .select("*")
      .eq("id", routeId)
      .single();

    if (fetchError || !originalRoute) {
      toast.error("Error fetching route to duplicate");
      return;
    }

    const { id, ...routeWithoutId } = originalRoute;
    createRoute(
      {
        ...routeWithoutId,
        route_number: `${originalRoute.route_number || ""}${duplicateSuffix}`,
        created_at: new Date().toISOString(),
        created_by: user?.id || "",
      },
      {
        onSuccess: () => {
          toast.success("Route duplicated successfully");
          setDuplicateTargetRoute(null);
          refetchRoutes();
        },
        onError: (error: any) => {
          toast.error(`Error duplicating route: ${error.message || "Unknown error"}`);
        },
      },
    );
  };

  // Make Return Route
  const handleExecuteReturn = async () => {
    if (!returnTargetRoute) return;
    const routeId = returnTargetRoute.id;

    const { data: originalRoute, error: fetchError } = await supabase
      .from("routes")
      .select("*")
      .eq("id", routeId)
      .single();

    if (fetchError || !originalRoute) {
      toast.error("Error fetching route for return creation");
      return;
    }

    const { id, ...routeWithoutId } = originalRoute;

    let reversedStops = originalRoute.stops;
    if (originalRoute.stops) {
      try {
        const parsed =
          typeof originalRoute.stops === "string"
            ? JSON.parse(originalRoute.stops)
            : originalRoute.stops;
        if (Array.isArray(parsed)) {
          reversedStops = JSON.stringify([...parsed].reverse());
        }
      } catch (err) {
        console.error("Error reversing stops for return route:", err);
      }
    }

    createRoute(
      {
        ...routeWithoutId,
        source: originalRoute.destination || originalRoute.source,
        destination: originalRoute.source || originalRoute.destination,
        stops: reversedStops,
        route_number: `${originalRoute.route_number || ""}${returnSuffix}`,
        created_at: new Date().toISOString(),
        return: true,
        created_by: user?.id || "",
      },
      {
        onSuccess: () => {
          toast.success("Return route created successfully");
          setReturnTargetRoute(null);
          refetchRoutes();
        },
        onError: (error: any) => {
          toast.error(`Error creating return route: ${error.message || "Unknown error"}`);
        },
      },
    );
  };

  // Export Trigger
  const handleOpenBatchExport = () => {
    if (selectedRouteObjects.length === 0) {
      toast.warning("No routes selected for export");
      return;
    }
    setRoutesForExport(selectedRouteObjects);
    setIsExportDialogOpen(true);
  };

  const handleOpenSingleExport = (route: IRoute) => {
    setRoutesForExport([route]);
    setIsExportDialogOpen(true);
  };

  const executeExport = async (format: "v1" | "v2") => {
    if (routesForExport.length === 0) {
      toast.warning("No routes selected for export");
      return;
    }

    const parseFieldValue = (fieldValue: any, fieldKey: string, json: IRoute) => {
      const value =
        fieldValue !== undefined && fieldValue !== null
          ? fieldValue
          : json[fieldKey as keyof IRoute];
      if (value === null || value === undefined) return null;
      if (typeof value === "object") return value;
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    };

    const rawRoutesToExport = routesForExport.map((route) => ({
      ...route,
      front: parseFieldValue(route.front, "front", route),
      side: parseFieldValue(route.side, "side", route),
      rear: parseFieldValue(route.rear, "rear", route),
      internal: parseFieldValue(route.internal, "internal", route),
      stops: parseFieldValue(route.stops, "stops", route),
    }));

    const currentDate = new Date().toISOString().split("T")[0];
    const apiBase =
      import.meta.env.VITE_CONTROLLER_API_URL || "https://api.navitronix.in/navitranix/api";
    const areaId = selectedOrganization?.id || "";
    const depotId = selectedDepot?.id || "";

    if (format === "v1") {
      const v1RoutesPayload = rawRoutesToExport.map((route) => convertV2ToV1(route));
      toast.info("Requesting V1 export package...");

      try {
        const exportUrl = `${apiBase}/routes/export?areaId=${areaId}&depotId=${depotId}`;
        const response = await axios.post(exportUrl, v1RoutesPayload, {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
        });

        const blob = new Blob([response.data], { type: "application/zip" });
        saveAs(blob, `routes_export_v1_${currentDate}.zip`);
        toast.success(`Exported ${routesForExport.length} route(s) in V1 format`);
      } catch (error: any) {
        console.error("V1 Export API Error:", error);
        toast.error(
          `V1 Export failed: ${error?.response?.data?.message || error.message || "Server error"}`,
        );
      }
    } else {
      toast.info("Requesting V2 export package...");

      try {
        const exportUrl = `${apiBase}/routes/export-v2?areaId=${areaId}&depotId=${depotId}`;
        const response = await axios.post(exportUrl, rawRoutesToExport, {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
        });

        const blob = new Blob([response.data], { type: "application/zip" });
        saveAs(blob, `routes_export_v2_${currentDate}.zip`);
        toast.success(`Exported ${routesForExport.length} route(s) in V2 format`);
      } catch (error: any) {
        console.error("V2 Export API Error:", error);
        toast.error(
          `V2 Export failed: ${error?.response?.data?.message || error.message || "Server error"}`,
        );
      }
    }
  };

  // Table Columns Definition matching RegionsPage and DepotsPage
  const isAllFilteredSelected =
    filteredRoutes.length > 0 &&
    filteredRoutes.every((r) => selectedRouteIdsSet.has(r.id));

  const tableColumns: ColumnDef<IRoute>[] = [
    {
      id: "select",
      header: (
        <Checkbox
          checked={isAllFilteredSelected}
          onCheckedChange={(details) => handleToggleSelectAll(!!details.checked)}
        />
      ),
      width: "48px",
      align: "center",
      cell: (route) => (
        <Box onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedRouteIdsSet.has(route.id)}
            onCheckedChange={(details) => handleToggleSelect(route.id, !!details.checked)}
          />
        </Box>
      ),
    },
    {
      id: "route_number",
      header: "Route No",
      width: "140px",
      cell: (route) => {
        const displayName = route.is_split_route
          ? `${route.route_number_1 || ""} - ${route.route_number_2 || ""}`
          : route.route_number || "—";

        return (
          <HStack gap="2.5" align="center">
            <Avatar.Root
              size="xs"
              shape="rounded"
              colorPalette={route.return ? "purple" : "blue"}
              borderWidth="1px"
              borderColor={route.return ? "purple.subtle" : "border.subtle"}
              shrink="0"
            >
              <Avatar.Fallback name={displayName}>
                <RouteIcon size={12} />
              </Avatar.Fallback>
            </Avatar.Root>
            <VStack align="flex-start" gap="0">
              <Text fontSize="xs" fontWeight="600" color="fg.default">
                {displayName}
              </Text>
            </VStack>
          </HStack>
        );
      },
    },
    {
      id: "source",
      header: "Source",
      accessorKey: "source",
      cell: (route) => (
        <HStack gap="1.5" align="center" minW="0">
          <MapPin size={12} color="var(--chakra-colors-blue-600)" />
          <Text fontSize="xs" color="fg.default" truncate maxW="160px">
            {route.source || "—"}
          </Text>
        </HStack>
      ),
    },
    {
      id: "destination",
      header: "Destination",
      accessorKey: "destination",
      cell: (route) => (
        <HStack gap="1.5" align="center" minW="0">
          <MapPin size={12} color="var(--chakra-colors-purple-600)" />
          <Text fontSize="xs" color="fg.default" truncate maxW="160px">
            {route.destination || "—"}
          </Text>
        </HStack>
      ),
    },
    {
      id: "direction",
      header: "Direction",
      width: "120px",
      cell: (route) => (
        <Badge colorPalette={route.return ? "purple" : "blue"}>
          <HStack gap="1.5">
            <Box
              w="1.5"
              h="1.5"
              borderRadius="full"
              bg={route.return ? "purple.500" : "blue.500"}
            />
            {route.return ? "Return" : "Outbound"}
          </HStack>
        </Badge>
      ),
    },
    {
      id: "type",
      header: "Split",
      width: "105px",
      cell: (route) => (
        <Badge colorPalette={route.is_split_route ? "amber" : "gray"}>
          {route.is_split_route ? "Split Route" : "Standard"}
        </Badge>
      ),
    },
    {
      id: "stops",
      header: "Stops",
      width: "115px",
      cell: (route) => {
        const count = parseStopsCount(route.stops);
        return (
          <Badge colorPalette={count > 0 ? "teal" : "gray"}>
            {count > 0 ? `${count} Stops` : "Direct"}
          </Badge>
        );
      },
    },
    {
      id: "version",
      header: "Version",
      width: "90px",
      cell: (route) => (
        <Badge colorPalette="gray">
          v{route.version || "1.0"}
        </Badge>
      ),
    },
    {
      id: "created_by",
      header: "Created By",
      width: "170px",
      cell: (route) => (
        <HStack gap="1.5" align="center" minW="0">
          <Avvvatars
            value={route.created_by_user?.email || "Unknown"}
            size={18}
            style="shape"
          />
          <Text fontSize="xs" color="fg.muted" truncate maxW="140px">
            {route.created_by_user?.email || "Unknown"}
          </Text>
        </HStack>
      ),
    },
    {
      id: "created_at",
      header: "Created",
      width: "105px",
      cell: (route) => (
        <Text fontSize="xs" color="fg.muted">
          {new Date(route.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      ),
    },
    {
      id: "actions",
      header: "",
      width: "135px",
      align: "right",
      cell: (route) => (
        <HStack gap="1" justify="flex-end" onClick={(e) => e.stopPropagation()}>
          {/* Direct Copy Button matching RegionsPage / DepotsPage */}
          <IconButton
            size="xs"
            variant="ghost"
            aria-label="Copy Route No"
            color="fg.muted"
            _hover={{ color: "fg.default", bg: "bg.subtle" }}
            onClick={(e) => {
              e.stopPropagation();
              handleCopyRoute(route);
            }}
          >
            {copiedId === route.id ? (
              <Check size={13} color="var(--chakra-colors-green-600)" />
            ) : (
              <Copy size={13} />
            )}
          </IconButton>

          {/* Direct Edit Button matching RegionsPage / DepotsPage */}
          <IconButton
            size="xs"
            variant="ghost"
            aria-label="Edit Route"
            color="fg.muted"
            _hover={{ color: "fg.default", bg: "bg.subtle" }}
            onClick={(e) => {
              e.stopPropagation();
              handleEditRoute(route.id);
            }}
          >
            <Pencil size={13} />
          </IconButton>

          {/* Direct Delete Button matching RegionsPage / DepotsPage */}
          <IconButton
            size="xs"
            variant="ghost"
            aria-label="Delete Route"
            color="red.600"
            _hover={{ bg: "red.500/10" }}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTargetRoute(route);
            }}
          >
            <Trash2 size={13} />
          </IconButton>

          {/* More Actions Menu */}
          <Menu.Root positioning={{ placement: "bottom-end", gutter: 4 }}>
            <Menu.Trigger asChild>
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="More Actions"
                color="fg.muted"
                _hover={{ color: "fg.default", bg: "bg.subtle" }}
              >
                <MoreVertical size={13} />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content
                  minW="160px"
                  borderColor="border.default"
                  bg="bg.surface"
                  p="1"
                >
                  <Menu.Item
                    value="duplicate"
                    cursor="pointer"
                    _hover={{ bg: "bg.subtle" }}
                    onClick={() => {
                      setDuplicateTargetRoute(route);
                      setDuplicateSuffix(" (Copy)");
                    }}
                  >
                    <HStack gap="2">
                      <Copy size={13} color="var(--chakra-colors-gray-600)" />
                      <Text fontSize="xs">Duplicate Route</Text>
                    </HStack>
                  </Menu.Item>

                  <Menu.Item
                    value="return"
                    cursor="pointer"
                    _hover={{ bg: "bg.subtle" }}
                    onClick={() => {
                      setReturnTargetRoute(route);
                      setReturnSuffix("(Return)");
                    }}
                  >
                    <HStack gap="2">
                      <Repeat size={13} color="var(--chakra-colors-purple-600)" />
                      <Text fontSize="xs">Make Return Route</Text>
                    </HStack>
                  </Menu.Item>

                  <Menu.Item
                    value="export"
                    cursor="pointer"
                    _hover={{ bg: "bg.subtle" }}
                    onClick={() => handleOpenSingleExport(route)}
                  >
                    <HStack gap="2">
                      <Download size={13} color="var(--chakra-colors-teal-600)" />
                      <Text fontSize="xs">Export JSON</Text>
                    </HStack>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </HStack>
      ),
    },
  ];

  // If no Organization selected, show guidance screen matching RegionsPage / DepotsPage
  if (!selectedOrganization?.id) {
    return (
      <Box w="full">
        <PageHeader
          title="Operational Transit Routes"
          description="Manage routes and destination display configs"
          breadcrumbs={[
            { label: "Home", href: "/home" },
            { label: "Routes" },
          ]}
        />
        <EmptyState
          icon={<Building2 size={24} />}
          title="No Organization Selected"
          description="Please select a transport agency from the top switcher bar to view and manage depot routes."
        />
      </Box>
    );
  }

  // If no Regions exist
  if (!isRegionsLoading && regions.length === 0) {
    return (
      <Box w="full">
        <PageHeader
          title="Operational Transit Routes"
          description="Manage route itineraries and destination signs"
          breadcrumbs={[
            { label: "Home", href: "/home" },
            { label: "Regions", href: "/home/regions" },
            { label: "Routes" },
          ]}
        />
        <EmptyState
          icon={<Globe size={24} />}
          title="No Regions Configured"
          description="You need to create at least one region for this organization before configuring routes."
          actionLabel="Go to Regions"
          onAction={() => navigate("/home/regions")}
        />
      </Box>
    );
  }

  // If no Depots exist in selected region
  if (!isDepotsLoading && depots.length === 0) {
    return (
      <Box w="full">
        <PageHeader
          title="Operational Transit Routes"
          description="Manage route itineraries and destination signs"
          breadcrumbs={[
            { label: "Home", href: "/home" },
            { label: "Regions", href: "/home/regions" },
            { label: selectedRegion?.name || "Region", href: "/home/depots" },
            { label: "Routes" },
          ]}
          actions={
            <HStack gap="2">
              <NativeSelect.Root size="sm" width="200px">
                <NativeSelect.Field
                  value={selectedRegion?.id || ""}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  bg="bg.subtle"
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                loading={isRefreshing}
              >
                <RotateCw size={14} />
                Refresh
              </Button>
            </HStack>
          }
        />
        <EmptyState
          icon={<Building2 size={24} />}
          title="No Depots in this Region"
          description={`There are no depots configured in ${selectedRegion?.name || "the selected region"}. Create a depot first to start building routes.`}
          actionLabel="Create Depot"
          onAction={() => navigate("/home/depots")}
        />
      </Box>
    );
  }

  return (
    <Box w="full">
      {/* 1. Page Header matching Regions & Depots Page */}
      <PageHeader
        title="Operational Transit Routes"
        description={`Manage route itineraries, destination signs, stops, and waypoints for ${selectedDepot ? selectedDepot.name : selectedOrganization.name}`}
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Regions", href: "/home/regions" },
          { label: selectedRegion?.name || "Region", href: "/home/depots" },
          { label: selectedDepot?.name || "Depot" },
          { label: "Routes" },
        ]}
        badge={`${metrics.total} Active`}
        badgeColorPalette="blue"
        actions={
          <HStack gap="2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              <RotateCw size={14} />
              Refresh
            </Button>

            {canManageRoutes && (
              <Button
                size="sm"
                colorPalette="blue"
                disabled={!selectedDepot}
                onClick={handleAddRoute}
              >
                <Plus size={14} />
                Add Route
              </Button>
            )}
          </HStack>
        }
      />

      {/* 2. Structured Operational Metrics Bar matching Regions & Depots Page */}
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 4 }}
        gap="3.5"
        mb="6"
      >
        <StatCard
          label="Operational Routes"
          value={metrics.total}
          valueColor="blue.600"
          description={`Registered transit itineraries in ${selectedDepot?.name || "selected depot"}`}
          icon={<RouteIcon size={16} />}
          iconColorPalette="blue"
          badge={{ label: `${metrics.total} Routes`, colorPalette: "blue" }}
          progress={{ value: 100, label: "Depot Scope", colorPalette: "blue" }}
        />
        <StatCard
          label="Outbound Routes"
          value={metrics.outbound}
          valueColor="teal.600"
          description="Forward directional passenger transit routes"
          icon={<Navigation size={16} />}
          iconColorPalette="teal"
          badge={{ label: `${metrics.outbound} Outbound`, colorPalette: "teal" }}
          progress={{ value: metrics.outboundPercent, label: "Direction Ratio", colorPalette: "teal" }}
        />
        <StatCard
          label="Return Routes"
          value={metrics.returnRoutes}
          valueColor="purple.600"
          description="Inbound reverse path transit itineraries"
          icon={<Repeat size={16} />}
          iconColorPalette="purple"
          badge={{ label: `${metrics.returnRoutes} Return`, colorPalette: "purple" }}
          progress={{ value: metrics.returnPercent, label: "Return Coverage", colorPalette: "purple" }}
        />
        <StatCard
          label="Split Routes"
          value={metrics.splitRoutes}
          valueColor="amber.600"
          description="Multi-leg route allocations with dual numbers"
          icon={<Split size={16} />}
          iconColorPalette="amber"
          badge={{ label: `${metrics.splitRoutes} Split`, colorPalette: "amber" }}
          progress={{ value: metrics.splitPercent, label: "Multi-Leg Ratio", colorPalette: "amber" }}
        />
      </SimpleGrid>

      {/* 3. Filter & View Toolbar */}
      <Card.Root size="sm" variant="outline" mb="4" bg="bg.panel" borderColor="border.default">
        <Card.Body p="3">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap="3"
          >
            {/* Search Input & Cascading Region/Depot Selectors */}
            <HStack gap="2.5" flex="1" maxW={{ base: "full", md: "580px" }} wrap="wrap">
              <InputGroup
                startElement={<Search size={15} color="var(--chakra-colors-fg-muted)" />}
                endElement={
                  searchQuery ? (
                    <IconButton
                      size="xs"
                      variant="ghost"
                      aria-label="Clear search"
                      onClick={() => setSearchQuery("")}
                      color="fg.muted"
                      _hover={{ color: "fg.default" }}
                    >
                      <X size={13} />
                    </IconButton>
                  ) : undefined
                }
                minW={{ base: "full", sm: "200px" }}
                flex="1"
              >
                <Input
                  size="sm"
                  placeholder="Search routes by route no, source, or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="bg.subtle"
                />
              </InputGroup>

              {/* Region Selector */}
              <Box minW="140px" maxW="180px">
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field
                    value={selectedRegion?.id || ""}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    bg="bg.subtle"
                  >
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Box>

              {/* Depot Selector */}
              <Box minW="140px" maxW="180px">
                <NativeSelect.Root size="sm" disabled={depots.length === 0}>
                  <NativeSelect.Field
                    value={selectedDepot?.id || ""}
                    onChange={(e) => handleDepotChange(e.target.value)}
                    bg="bg.subtle"
                  >
                    {depots.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Box>
            </HStack>

            {/* Right Toolbar Controls: Tabs + View Mode Toggle */}
            <HStack gap="3" justify={{ base: "space-between", md: "flex-end" }} wrap="wrap">
              <Tabs.Root
                value={typeFilter}
                onValueChange={(e) => setTypeFilter(e.value as any)}
                variant="subtle"
                size="sm"
              >
                <Tabs.List bg="bg.subtle" p="1">
                  <Tabs.Trigger value="all">
                    All ({metrics.total})
                  </Tabs.Trigger>
                  <Tabs.Trigger value="outbound">
                    Outbound ({metrics.outbound})
                  </Tabs.Trigger>
                  <Tabs.Trigger value="return">
                    Return ({metrics.returnRoutes})
                  </Tabs.Trigger>
                  <Tabs.Trigger value="split">
                    Split ({metrics.splitRoutes})
                  </Tabs.Trigger>
                </Tabs.List>
              </Tabs.Root>

              {/* View Mode Switcher (Table vs Grid) */}
              <HStack gap="0.5" p="1" bg="bg.subtle" borderRadius="md">
                <IconButton
                  size="xs"
                  variant={viewMode === "table" ? "solid" : "ghost"}
                  colorPalette={viewMode === "table" ? "blue" : "gray"}
                  aria-label="Table view"
                  onClick={() => setViewMode("table")}
                >
                  <List size={14} />
                </IconButton>
                <IconButton
                  size="xs"
                  variant={viewMode === "grid" ? "solid" : "ghost"}
                  colorPalette={viewMode === "grid" ? "blue" : "gray"}
                  aria-label="Grid view"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid size={14} />
                </IconButton>
              </HStack>
            </HStack>
          </Flex>
        </Card.Body>
      </Card.Root>

      {/* Batch Action Banner */}
      {selectedRouteIds.length > 0 && (
        <Card.Root
          size="sm"
          variant="subtle"
          mb="4"
          bg="blue.subtle"
          borderColor="blue.muted"
        >
          <Card.Body p="3">
            <Flex justify="space-between" align="center" wrap="wrap" gap="2.5">
              <HStack gap="2.5">
                <Badge colorPalette="blue">
                  {selectedRouteIds.length} Selected
                </Badge>
                <Text fontSize="xs" color="fg.default">
                  {selectedRouteIds.length === 1
                    ? "1 route selected for batch action"
                    : `${selectedRouteIds.length} routes selected for batch action`}
                </Text>
              </HStack>

              <HStack gap="2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedRouteIds([])}
                >
                  Deselect All
                </Button>
                <Button
                  size="sm"
                  colorPalette="blue"
                  onClick={handleOpenBatchExport}
                >
                  <Download size={14} />
                  Export Selected ({selectedRouteIds.length})
                </Button>
                {canManageRoutes && (
                  <Button
                    size="sm"
                    colorPalette="red"
                    variant="subtle"
                    onClick={() => setIsBatchDeleteDialogOpen(true)}
                  >
                    <Trash2 size={14} />
                    Delete Selected
                  </Button>
                )}
              </HStack>
            </Flex>
          </Card.Body>
        </Card.Root>
      )}

      {/* Routes Content: Table View vs Grid View */}
      {viewMode === "table" ? (
        <DataTable
          columns={tableColumns}
          data={filteredRoutes}
          keyExtractor={(route) => route.id}
          isLoading={isRoutesLoading}
          isError={isRoutesError}
          errorMessage={routesError?.message || "Failed to load routes"}
          onRetry={refetchRoutes}
          selectedIds={selectedRouteIdsSet}
          emptyTitle={
            searchQuery || typeFilter !== "all"
              ? "No routes match your filters"
              : "No routes found in this depot"
          }
          emptyDescription={
            searchQuery || typeFilter !== "all"
              ? `No routes found matching "${searchQuery}". Try adjusting your search query or reset filter options.`
              : `Create your first route for ${selectedDepot?.name || "this depot"} to configure LED signs and passenger information.`
          }
          emptyActionLabel={
            searchQuery || typeFilter !== "all" ? "Reset Filters" : "Add Route"
          }
          onEmptyAction={
            searchQuery || typeFilter !== "all"
              ? () => {
                  setSearchQuery("");
                  setTypeFilter("all");
                }
              : handleAddRoute
          }
          entityName="routes"
          pageSize={10}
        />
      ) : (
        <>
          {isRoutesLoading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card.Root key={i} size="sm" variant="outline" p="6" h="160px" bg="bg.subtle" />
              ))}
            </SimpleGrid>
          ) : filteredRoutes.length === 0 ? (
            <EmptyState
              icon={<RouteIcon size={24} />}
              title={
                searchQuery || typeFilter !== "all"
                  ? "No routes match your filters"
                  : "No routes found in this depot"
              }
              description={
                searchQuery || typeFilter !== "all"
                  ? `No routes found matching "${searchQuery}". Try adjusting your search query or reset filter options.`
                  : `Create your first route for ${selectedDepot?.name || "this depot"} to configure LED signs and passenger information.`
              }
              actionLabel={
                searchQuery || typeFilter !== "all" ? "Reset Filters" : "Add Route"
              }
              onAction={
                searchQuery || typeFilter !== "all"
                  ? () => {
                      setSearchQuery("");
                      setTypeFilter("all");
                    }
                  : handleAddRoute
              }
            />
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
              {filteredRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  isSelected={selectedRouteIdsSet.has(route.id)}
                  onToggleSelect={handleToggleSelect}
                  onEdit={handleEditRoute}
                  onDuplicate={() => {
                    setDuplicateTargetRoute(route);
                    setDuplicateSuffix(" (Copy)");
                  }}
                  onReturn={() => {
                    setReturnTargetRoute(route);
                    setReturnSuffix("(Return)");
                  }}
                  onExportSingle={handleOpenSingleExport}
                  onDelete={(r) => setDeleteTargetRoute(r)}
                />
              ))}
            </SimpleGrid>
          )}
        </>
      )}

      {/* Export Format Dialog */}
      <ExportFormatDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        selectedCount={routesForExport.length}
        onConfirmExport={executeExport}
      />

      {/* Single Route Delete Confirmation Dialog */}
      <Dialog.Root
        open={!!deleteTargetRoute}
        onOpenChange={(e) => {
          if (!e.open) setDeleteTargetRoute(null);
        }}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="bg.panel"
              borderColor="border.default"
              borderWidth="1px"
              borderRadius="md"
              boxShadow="xl"
              maxW="md"
              w="full"
              p="5"
            >
              <VStack align="stretch" gap="4">
                <HStack gap="3" align="flex-start">
                  <Flex
                    w="10"
                    h="10"
                    borderRadius="md"
                    bg="red.subtle"
                    color="red.fg"
                    align="center"
                    justify="center"
                    shrink="0"
                  >
                    <AlertTriangle size={20} />
                  </Flex>
                  <VStack align="flex-start" gap="1">
                    <Dialog.Title fontSize="md" fontWeight="600" color="fg.default">
                      Delete Route
                    </Dialog.Title>
                    <Text fontSize="xs" color="fg.muted">
                      Are you sure you want to delete route{" "}
                      <Text as="span" fontWeight="600" color="fg.default">
                        {deleteTargetRoute?.route_number}
                      </Text>
                      {deleteTargetRoute?.source && deleteTargetRoute?.destination && (
                        <> ({deleteTargetRoute.source} &rarr; {deleteTargetRoute.destination})</>
                      )}
                      ? This action cannot be undone.
                    </Text>
                  </VStack>
                </HStack>

                <HStack justify="flex-end" gap="2.5" pt="2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteTargetRoute(null)}
                    disabled={isDeletingSingle}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    colorPalette="red"
                    onClick={handleConfirmSingleDelete}
                    loading={isDeletingSingle}
                  >
                    Delete Route
                  </Button>
                </HStack>
              </VStack>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Batch Routes Delete Confirmation Dialog */}
      <Dialog.Root
        open={isBatchDeleteDialogOpen}
        onOpenChange={(e) => setIsBatchDeleteDialogOpen(e.open)}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="bg.panel"
              borderColor="border.default"
              borderWidth="1px"
              borderRadius="md"
              boxShadow="xl"
              maxW="md"
              w="full"
              p="5"
            >
              <VStack align="stretch" gap="4">
                <HStack gap="3" align="flex-start">
                  <Flex
                    w="10"
                    h="10"
                    borderRadius="md"
                    bg="red.subtle"
                    color="red.fg"
                    align="center"
                    justify="center"
                    shrink="0"
                  >
                    <AlertTriangle size={20} />
                  </Flex>
                  <VStack align="flex-start" gap="1">
                    <Dialog.Title fontSize="md" fontWeight="600" color="fg.default">
                      Delete Selected Routes
                    </Dialog.Title>
                    <Text fontSize="xs" color="fg.muted">
                      Are you sure you want to delete{" "}
                      <Text as="span" fontWeight="600" color="fg.default">
                        {selectedRouteIds.length} selected route(s)
                      </Text>
                      ? All associated waypoint and display assignments will be removed.
                    </Text>
                  </VStack>
                </HStack>

                <HStack justify="flex-end" gap="2.5" pt="2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsBatchDeleteDialogOpen(false)}
                    disabled={isDeletingBatch}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    colorPalette="red"
                    onClick={handleConfirmBatchDelete}
                    loading={isDeletingBatch}
                  >
                    Delete {selectedRouteIds.length} Routes
                  </Button>
                </HStack>
              </VStack>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Duplicate Route Dialog */}
      <Dialog.Root
        open={!!duplicateTargetRoute}
        onOpenChange={(e) => {
          if (!e.open) setDuplicateTargetRoute(null);
        }}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="bg.panel"
              borderColor="border.default"
              borderWidth="1px"
              borderRadius="md"
              boxShadow="xl"
              maxW="md"
              w="full"
              p="5"
            >
              <VStack align="stretch" gap="4">
                <HStack justify="space-between" align="center">
                  <HStack gap="3">
                    <Flex
                      w="10"
                      h="10"
                      borderRadius="md"
                      bg="blue.subtle"
                      color="blue.fg"
                      align="center"
                      justify="center"
                    >
                      <Copy size={18} />
                    </Flex>
                    <VStack align="flex-start" gap="0">
                      <Dialog.Title fontSize="md" fontWeight="600" color="fg.default">
                        Duplicate Route
                      </Dialog.Title>
                      <Text fontSize="xs" color="fg.muted">
                        Clone configuration for route {duplicateTargetRoute?.route_number}
                      </Text>
                    </VStack>
                  </HStack>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" onClick={() => setDuplicateTargetRoute(null)} />
                  </Dialog.CloseTrigger>
                </HStack>

                <VStack align="stretch" gap="1.5">
                  <Text fontSize="xs" fontWeight="500" color="fg.default">
                    Route Number Suffix
                  </Text>
                  <Input
                    size="sm"
                    value={duplicateSuffix}
                    onChange={(e) => setDuplicateSuffix(e.target.value)}
                    placeholder="e.g.  (Copy) or B"
                  />
                  <Text fontSize="xs" color="fg.muted">
                    New route number will be:{" "}
                    <Text as="span" fontWeight="600" color="fg.default">
                      {duplicateTargetRoute?.route_number}
                      {duplicateSuffix}
                    </Text>
                  </Text>
                </VStack>

                <HStack justify="flex-end" gap="2.5" pt="2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDuplicateTargetRoute(null)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    colorPalette="blue"
                    onClick={handleExecuteDuplicate}
                    loading={isCreating}
                  >
                    Duplicate Route
                  </Button>
                </HStack>
              </VStack>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Make Return Route Dialog */}
      <Dialog.Root
        open={!!returnTargetRoute}
        onOpenChange={(e) => {
          if (!e.open) setReturnTargetRoute(null);
        }}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="bg.panel"
              borderColor="border.default"
              borderWidth="1px"
              borderRadius="md"
              boxShadow="xl"
              maxW="md"
              w="full"
              p="5"
            >
              <VStack align="stretch" gap="4">
                <HStack justify="space-between" align="center">
                  <HStack gap="3">
                    <Flex
                      w="10"
                      h="10"
                      borderRadius="md"
                      bg="purple.subtle"
                      color="purple.fg"
                      align="center"
                      justify="center"
                    >
                      <Repeat size={18} />
                    </Flex>
                    <VStack align="flex-start" gap="0">
                      <Dialog.Title fontSize="md" fontWeight="600" color="fg.default">
                        Make Return Route
                      </Dialog.Title>
                      <Text fontSize="xs" color="fg.muted">
                        Reverse stops and path for route {returnTargetRoute?.route_number}
                      </Text>
                    </VStack>
                  </HStack>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" onClick={() => setReturnTargetRoute(null)} />
                  </Dialog.CloseTrigger>
                </HStack>

                <Box p="3" borderRadius="md" bg="bg.subtle" borderWidth="1px" borderColor="border.subtle">
                  <Text fontSize="xs" color="fg.muted" mb="1">
                    Path Inversion:
                  </Text>
                  <HStack justify="space-between" align="center">
                    <Text fontSize="xs" fontWeight="500" color="fg.default">
                      {returnTargetRoute?.destination || "Destination"}
                    </Text>
                    <ArrowRight size={14} color="var(--chakra-colors-fg-muted)" />
                    <Text fontSize="xs" fontWeight="500" color="fg.default">
                      {returnTargetRoute?.source || "Origin"}
                    </Text>
                  </HStack>
                </Box>

                <VStack align="stretch" gap="1.5">
                  <Text fontSize="xs" fontWeight="500" color="fg.default">
                    Route Number Suffix
                  </Text>
                  <Input
                    size="sm"
                    value={returnSuffix}
                    onChange={(e) => setReturnSuffix(e.target.value)}
                    placeholder="e.g. (Return) or R"
                  />
                  <Text fontSize="xs" color="fg.muted">
                    New return route number:{" "}
                    <Text as="span" fontWeight="600" color="fg.default">
                      {returnTargetRoute?.route_number}
                      {returnSuffix}
                    </Text>
                  </Text>
                </VStack>

                <HStack justify="flex-end" gap="2.5" pt="2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReturnTargetRoute(null)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    colorPalette="purple"
                    onClick={handleExecuteReturn}
                    loading={isCreating}
                  >
                    Create Return Route
                  </Button>
                </HStack>
              </VStack>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
