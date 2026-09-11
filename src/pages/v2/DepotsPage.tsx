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
  Avatar,
  InputGroup,
  Dialog,
  Portal,
  CloseButton,
  Skeleton,
  NativeSelect,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  IDepot,
  IDepotWithRouteCount,
  depotCrud,
  getDepotInitials,
} from "@/types/IDepot";
import { IRegion, regionCrud } from "@/types/IRegion";
import { IRoute, routeCrud } from "@/types/IRoute";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import DepotCard from "@/components/depots/DepotCard";
import CreateDepotDrawer from "@/components/depots/CreateDepotDrawer";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useRegionStore } from "@/store/useRegionStore";
import { useDepotStore } from "@/store/useDepotStore";
import { ROLES } from "@/constants/roles";
import {
  Building2,
  Plus,
  RotateCw,
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Copy,
  Check,
  MapPin,
  AlertTriangle,
  RotateCcw,
  X,
  Layers,
  GitBranch,
  ArrowRight,
  Radio,
} from "lucide-react";

export default function DepotsPage() {
  const navigate = useNavigate();
  const user = useLoggedUserStore((state) => state.user);
  const { selectedOrganization } = useOrganizationStore();
  const { selectedRegion, setSelectedRegion } = useRegionStore();
  const { selectedDepot, setSelectedDepot } = useDepotStore();

  const isSuperAdmin =
    user?.role?.name === ROLES.MASTER ||
    user?.role?.name === "master" ||
    user?.role?.name === "super_admin";

  const { useList, useDelete, useRestore } = depotCrud;
  const { useList: useRegionList } = regionCrud;
  const { useList: useRouteList } = routeCrud;

  // Active depots
  const {
    data: activeData,
    isLoading: isActiveLoading,
    isError: isActiveError,
    refetch: refetchActive,
  } = useList({
    filters: {
      organization_id: selectedOrganization?.id || "",
      deleted: false,
    },
    orderBy: { column: "created_at", ascending: true },
    skip: !selectedOrganization?.id,
  });

  // Deleted depots (Super Admin only)
  const {
    data: deletedData,
    isLoading: isDeletedLoading,
    isError: isDeletedError,
    refetch: refetchDeleted,
  } = useList({
    filters: {
      organization_id: selectedOrganization?.id || "",
      deleted: true,
    },
    orderBy: { column: "created_at", ascending: false },
    skip: !selectedOrganization?.id || !isSuperAdmin,
  });

  // Active regions for filtering and parent mapping
  const { data: regionData, isLoading: isRegionLoading } = useRegionList({
    filters: {
      organization_id: selectedOrganization?.id || "",
      deleted: false,
    },
    orderBy: { column: "name", ascending: true },
    skip: !selectedOrganization?.id,
  });

  // Routes data to calculate route counts per depot
  const {
    data: routeData,
    isLoading: isRouteLoading,
    refetch: refetchRoutes,
  } = useRouteList({
    filters: {
      organization_id: selectedOrganization?.id || "",
      deleted: false,
    },
    skip: !selectedOrganization?.id,
  });

  const { mutate: deleteDepot, isPending: isDeleting } = useDelete();
  const { mutate: restoreDepot, isPending: isRestoring } = useRestore();

  const regions = (regionData?.data as IRegion[]) || [];
  const allRoutes = (routeData?.data as IRoute[]) || [];

  // Map route counts by depot_id
  const routeCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of allRoutes) {
      if (r.depot_id) {
        map.set(r.depot_id, (map.get(r.depot_id) || 0) + 1);
      }
    }
    return map;
  }, [allRoutes]);

  // Map region names by region_id
  const regionNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const reg of regions) {
      map.set(reg.id, reg.name);
    }
    return map;
  }, [regions]);

  const activeDepots: IDepotWithRouteCount[] = useMemo(() => {
    const raw = (activeData?.data as IDepot[]) || [];
    return raw.map((d) => ({
      ...d,
      route_count: routeCountMap.get(d.id) || 0,
      region_name: regionNameMap.get(d.region_id) || undefined,
    }));
  }, [activeData?.data, routeCountMap, regionNameMap]);

  const deletedDepots: IDepotWithRouteCount[] = useMemo(() => {
    const raw = (deletedData?.data as IDepot[]) || [];
    return raw.map((d) => ({
      ...d,
      route_count: routeCountMap.get(d.id) || 0,
      region_name: regionNameMap.get(d.region_id) || undefined,
    }));
  }, [deletedData?.data, routeCountMap, regionNameMap]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<"all" | "deleted">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [editData, setEditData] = useState<IDepot | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [depotToDelete, setDepotToDelete] = useState<IDepotWithRouteCount | null>(null);
  const [depotToRestore, setDepotToRestore] = useState<IDepotWithRouteCount | null>(null);

  // Sync selectedRegion from store if navigated from Regions page
  useEffect(() => {
    if (selectedRegion?.id && regions.some((r) => r.id === selectedRegion.id)) {
      setSelectedRegionFilter(selectedRegion.id);
    }
  }, [selectedRegion, regions]);

  // Safety fallback if non-superadmin tries to access deleted tab
  const currentTab = !isSuperAdmin && selectedTab === "deleted" ? "all" : selectedTab;

  // Filter depots by region, search, and tab
  const filteredDepots = useMemo(() => {
    const sourceList = currentTab === "deleted" ? deletedDepots : activeDepots;
    return sourceList.filter((depot) => {
      // Region filter
      if (selectedRegionFilter !== "all" && depot.region_id !== selectedRegionFilter) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        depot.name?.toLowerCase().includes(q) ||
        depot.id?.toLowerCase().includes(q) ||
        depot.region_name?.toLowerCase().includes(q)
      );
    });
  }, [currentTab, activeDepots, deletedDepots, selectedRegionFilter, searchQuery]);

  // Operational metrics calculations
  const totalCount = activeDepots.length;
  const totalRoutes = allRoutes.length;
  const deletedCount = deletedDepots.length;
  const avgRoutesPerDepot = totalCount > 0 ? (totalRoutes / totalCount).toFixed(1) : "0";
  const depotsWithRoutes = activeDepots.filter((d) => (d.route_count || 0) > 0).length;
  const activeCoveragePercent = totalCount > 0 ? Math.round((depotsWithRoutes / totalCount) * 100) : 0;

  const handleAddNew = () => {
    if (!selectedOrganization?.id) {
      toast.error("Please select an organization first.");
      return;
    }
    setEditData(null);
    setDrawerOpen(true);
  };

  const handleEdit = (depot: IDepotWithRouteCount) => {
    setEditData(depot);
    setDrawerOpen(true);
  };

  const handleDeleteClick = (depot: IDepotWithRouteCount) => {
    setDepotToDelete(depot);
  };

  const handleRestoreClick = (depot: IDepotWithRouteCount) => {
    setDepotToRestore(depot);
  };

  const handleViewRoutes = (depot: IDepotWithRouteCount) => {
    setSelectedDepot(depot);
    toast.info(`Selected depot: "${depot.name}"`);
    navigate("/home/routes");
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Depot ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmDelete = () => {
    if (!depotToDelete || isDeleting) return;

    const deletedId = depotToDelete.id;
    const deletedName = depotToDelete.name;

    deleteDepot(deletedId, {
      onSuccess: () => {
        if (selectedDepot?.id === deletedId) {
          setSelectedDepot(null);
        }
        refetchActive();
        refetchRoutes();
        if (isSuperAdmin) refetchDeleted();
        toast.success(`Depot "${deletedName}" deleted successfully`);
        setDepotToDelete(null);
      },
      onError: (error: any) => {
        toast.error(`Failed to delete depot: ${error?.message || "Unknown error"}`);
      },
    });
  };

  const handleConfirmRestore = () => {
    if (!depotToRestore || isRestoring) return;
    const restoredName = depotToRestore.name;

    restoreDepot(depotToRestore.id, {
      onSuccess: () => {
        refetchActive();
        refetchRoutes();
        refetchDeleted();
        toast.success(`Depot "${restoredName}" restored successfully`);
        setDepotToRestore(null);
      },
      onError: (error: any) => {
        toast.error(`Failed to restore depot: ${error?.message || "Unknown error"}`);
      },
    });
  };

  const isCurrentLoading = currentTab === "deleted" ? isDeletedLoading : (isActiveLoading || isRouteLoading || isRegionLoading);
  const isCurrentError = currentTab === "deleted" ? isDeletedError : isActiveError;

  const handleCurrentRetry = () => {
    if (currentTab === "deleted") {
      refetchDeleted();
    } else {
      refetchActive();
      refetchRoutes();
    }
  };

  // Table columns definition
  const columns: ColumnDef<IDepotWithRouteCount>[] = [
    {
      id: "name",
      header: "Depot Name",
      accessorKey: "name",
      sortable: true,
      cell: (depot) => (
        <HStack
          gap="2.5"
          minW="0"
          maxW={{ base: "200px", sm: "280px", md: "380px", lg: "480px" }}
        >
          <Avatar.Root
            size="xs"
            shape="rounded"
            colorPalette={depot.deleted ? "red" : "green"}
            borderWidth="1px"
            borderColor={depot.deleted ? "red.subtle" : "border.subtle"}
            shrink="0"
          >
            <Avatar.Fallback name={depot.name}>
              {getDepotInitials(depot.name)}
            </Avatar.Fallback>
          </Avatar.Root>
          <VStack align="flex-start" gap="0" minW="0" overflow="hidden" flex="1">
            <HStack gap="1.5" maxW="full" minW="0">
              <Text
                fontWeight="600"
                color="fg.default"
                truncate
                title={depot.name}
              >
                {depot.name}
              </Text>
              {depot.deleted && (
                <Badge
                  size="xs"
                  variant="subtle"
                  colorPalette="red"
                  borderRadius="xs"
                  px="1.5"
                  fontSize="9px"
                  shrink="0"
                >
                  Archived
                </Badge>
              )}
            </HStack>
            <Text fontSize="11px" color="fg.muted" fontFamily="mono" truncate maxW="full">
              ID: {depot.id.slice(0, 8)}...
            </Text>
          </VStack>
        </HStack>
      ),
    },
    {
      id: "region",
      header: "Region",
      sortable: true,
      cell: (depot) => (
        <Badge size="xs" variant="subtle" colorPalette="blue" borderRadius="xs" px="2" py="0.5">
          <HStack gap="1">
            <MapPin size={10} />
            <Text truncate maxW="150px">{depot.region_name || "Unassigned"}</Text>
          </HStack>
        </Badge>
      ),
    },
    {
      id: "routes",
      header: "Assigned Routes",
      sortable: true,
      cell: (depot) => {
        const count = depot.route_count ?? 0;
        return (
          <HStack gap="2">
            <Badge
              size="xs"
              variant={count > 0 ? "subtle" : "outline"}
              colorPalette={count > 0 ? "green" : "gray"}
              borderRadius="xs"
              px="2"
              py="0.5"
            >
              <HStack gap="1">
                <GitBranch size={11} />
                <Text fontWeight="600">{count} {count === 1 ? "Route" : "Routes"}</Text>
              </HStack>
            </Badge>
            {!depot.deleted && (
              <IconButton
                size="2xs"
                variant="ghost"
                aria-label="Manage routes"
                color="fg.muted"
                _hover={{ color: "green.500" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewRoutes(depot);
                }}
              >
                <ArrowRight size={12} />
              </IconButton>
            )}
          </HStack>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "deleted",
      sortable: true,
      width: "120px",
      cell: (depot) => {
        if (depot.deleted) {
          return (
            <Badge size="xs" variant="subtle" colorPalette="red" borderRadius="xs" px="2" py="0.5">
              Archived
            </Badge>
          );
        }
        return (
          <HStack
            gap="1.5"
            px="2"
            py="0.5"
            borderRadius="xs"
            bg="green.500/10"
            borderWidth="1px"
            borderColor="green.500/25"
            w="fit-content"
          >
            <Box w="5px" h="5px" borderRadius="full" bg="green.500" />
            <Text fontSize="11px" fontWeight="600" color="green.600">
              Operational
            </Text>
          </HStack>
        );
      },
    },
    {
      id: "created_at",
      header: "Created",
      accessorKey: "created_at",
      sortable: true,
      width: "120px",
      cell: (depot) => (
        <Text color="fg.muted" fontSize="11px">
          {depot.created_at
            ? new Date(depot.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </Text>
      ),
    },
    {
      id: "actions",
      header: "",
      width: currentTab === "deleted" ? "120px" : "110px",
      align: "right",
      cell: (depot) => {
        if (currentTab === "deleted" || depot.deleted) {
          return (
            <Button
              size="xs"
              variant="outline"
              colorPalette="green"
              borderRadius="xs"
              onClick={(e) => {
                e.stopPropagation();
                handleRestoreClick(depot);
              }}
            >
              <RotateCcw size={12} style={{ marginRight: "4px" }} />
              Restore
            </Button>
          );
        }
        return (
          <HStack gap="1" justify="flex-end">
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="Copy ID"
              color="fg.muted"
              _hover={{ color: "fg.default", bg: "bg.subtle" }}
              onClick={(e) => {
                e.stopPropagation();
                handleCopyId(depot.id);
              }}
            >
              {copiedId === depot.id ? (
                <Check size={13} color="var(--chakra-colors-green-600)" />
              ) : (
                <Copy size={13} />
              )}
            </IconButton>
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="Edit Depot"
              color="fg.muted"
              _hover={{ color: "fg.default", bg: "bg.subtle" }}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(depot);
              }}
            >
              <Pencil size={13} />
            </IconButton>
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="Delete Depot"
              color="red.600"
              _hover={{ bg: "red.500/10" }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(depot);
              }}
            >
              <Trash2 size={13} />
            </IconButton>
          </HStack>
        );
      },
    },
  ];

  // Empty state copy
  const emptyTitle = searchQuery
    ? "No depots match your search"
    : selectedRegionFilter !== "all"
    ? "No depots in this region"
    : currentTab === "deleted"
    ? "No archived depots found"
    : "No transit depots registered";

  const emptyDescription = searchQuery
    ? `No depots found matching "${searchQuery}". Try searching with a different term.`
    : selectedRegionFilter !== "all"
    ? "There are no depots registered under the selected region. You can add one now."
    : currentTab === "deleted"
    ? "There are no soft-deleted depots in the archive for this organization."
    : `Set up fleet maintenance and vehicle parking terminals for ${selectedOrganization?.name || "this agency"}.`;

  const emptyActionLabel =
    searchQuery ? "Clear Search" : currentTab === "deleted" ? undefined : "Add First Depot";

  const emptyActionHandler = searchQuery
    ? () => setSearchQuery("")
    : currentTab === "deleted"
    ? undefined
    : handleAddNew;

  // If no organization selected, show guidance screen
  if (!selectedOrganization?.id) {
    return (
      <Box w="full">
        <PageHeader
          title="Transit Bus Depots"
          description="Manage vehicle parking depots, maintenance facilities, and route dispatch terminals"
          breadcrumbs={[
            { label: "Home", href: "/home" },
            { label: "Depots" },
          ]}
        />
        <EmptyState
          title="Select an Organization"
          description="Please choose a transport agency from the top switcher bar to view and manage its fleet depot facilities."
        />
      </Box>
    );
  }

  return (
    <Box w="full">
      {/* 1. Page Header */}
      <PageHeader
        title="Transit Bus Depots"
        description={`Manage maintenance facilities, bus terminals, and operational route allocations for ${selectedOrganization.name}`}
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Depots" },
        ]}
        badge={`${totalCount} Operational`}
        badgeColorPalette="green"
        actions={
          <HStack gap="2">
            <Button
              size="xs"
              variant="outline"
              borderRadius="sm"
              fontWeight="500"
              onClick={handleCurrentRetry}
              loading={isCurrentLoading}
            >
              <RotateCw size={13} style={{ marginRight: "5px" }} />
              Refresh
            </Button>
            <Button
              size="xs"
              colorPalette="green"
              borderRadius="sm"
              fontWeight="600"
              onClick={handleAddNew}
            >
              <Plus size={14} style={{ marginRight: "4px" }} />
              Add Depot
            </Button>
          </HStack>
        }
      />

      {/* 2. Structured Operational Metrics Bar using real Chakra UI Cards */}
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 3, xl: isSuperAdmin && deletedCount > 0 ? 5 : 4 }}
        gap="3.5"
        mb="6"
      >
        <StatCard
          label="Operational Depots"
          value={totalCount}
          description={`Registered transit stations in ${selectedOrganization.name}`}
          icon={<Building2 size={16} />}
          iconColorPalette="green"
          badge={{ label: "Facilities", colorPalette: "green" }}
          progress={{ value: 100, label: "Operating Fleet", colorPalette: "green" }}
        />
        <StatCard
          label="Scheduled Routes"
          value={totalRoutes}
          valueColor="blue.600"
          description="Active passenger transit itineraries dispatched"
          icon={<GitBranch size={16} />}
          iconColorPalette="blue"
          badge={{ label: `${totalRoutes} Routes`, colorPalette: "blue" }}
          progress={{ value: 100, label: "Network Coverage", colorPalette: "blue" }}
        />
        <StatCard
          label="Fleet Density"
          value={avgRoutesPerDepot}
          valueColor="purple.600"
          description="Average transit routes operating per depot"
          icon={<Layers size={16} />}
          iconColorPalette="purple"
          badge={{ label: "Routes / Depot", colorPalette: "purple" }}
          progress={{
            value: Math.min(Math.round(Number(avgRoutesPerDepot) * 15), 100),
            label: "Routing Ratio",
            colorPalette: "purple",
          }}
        />
        <StatCard
          label="Active Utilization"
          value={`${depotsWithRoutes}/${totalCount}`}
          valueColor="cyan.600"
          description="Depots with active transit route assignments"
          icon={<Radio size={16} />}
          iconColorPalette="cyan"
          badge={{ label: `${activeCoveragePercent}% Active`, colorPalette: "cyan" }}
          progress={{
            value: activeCoveragePercent,
            label: "Utilization Rate",
            colorPalette: "cyan",
          }}
        />
        {isSuperAdmin && deletedCount > 0 && (
          <StatCard
            label="Archived Depots"
            value={deletedCount}
            valueColor="red.600"
            description="Soft-deleted facility records in archive"
            icon={<Trash2 size={16} />}
            iconColorPalette="red"
            badge={{ label: "Archived", colorPalette: "red" }}
            progress={{ value: 100, label: "Recoverable", colorPalette: "red" }}
          />
        )}
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
            {/* Search Input using real Chakra UI InputGroup */}
            <HStack gap="2.5" flex="1" maxW={{ base: "full", md: "520px" }}>
              <InputGroup
                startElement={<Search size={15} color="var(--chakra-colors-fg-muted)" />}
                endElement={
                  searchQuery ? (
                    <IconButton
                      size="2xs"
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
                w="full"
              >
                <Input
                  size="sm"
                  borderRadius="sm"
                  placeholder={
                    currentTab === "deleted"
                      ? "Search archived depots..."
                      : "Search depots by name or ID..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="bg.subtle"
                  _focus={{ borderColor: "green.500", bg: "bg.surface" }}
                />
              </InputGroup>

              {/* Region Filter Selector */}
              <Box minW="160px" maxW="200px">
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field
                    value={selectedRegionFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedRegionFilter(val);
                      if (val === "all") {
                        setSelectedRegion(null);
                      } else {
                        const target = regions.find((r) => r.id === val);
                        if (target) setSelectedRegion(target);
                      }
                    }}
                    bg="bg.subtle"
                    borderRadius="sm"
                  >
                    <option value="all">All Regions ({regions.length})</option>
                    {regions.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.name}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Box>
            </HStack>

            {/* Right Toolbar Controls: Tabs + View Mode Toggle */}
            <HStack gap="3" justify={{ base: "space-between", md: "flex-end" }} wrap="wrap">
              {/* Chakra UI Tabs for Status Selection & Deleted Tab for Super Admin */}
              <Tabs.Root
                value={currentTab}
                onValueChange={(e) => setSelectedTab(e.value as any)}
                variant="subtle"
                size="sm"
              >
                <Tabs.List
                  bg="bg.subtle"
                  p="1"
                  borderRadius="sm"
                  borderWidth="1px"
                  borderColor="border.subtle"
                >
                  <Tabs.Trigger value="all">
                    Active ({totalCount})
                  </Tabs.Trigger>
                  {isSuperAdmin && (
                    <Tabs.Trigger value="deleted" colorPalette="red">
                      <HStack gap="1.5">
                        <Trash2 size={12} />
                        <Text>Archived ({deletedCount})</Text>
                      </HStack>
                    </Tabs.Trigger>
                  )}
                </Tabs.List>
              </Tabs.Root>

              {/* View Mode Switcher (Table vs Grid) */}
              <HStack
                gap="0.5"
                p="1"
                bg="bg.subtle"
                borderRadius="sm"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <IconButton
                  size="xs"
                  variant={viewMode === "table" ? "solid" : "ghost"}
                  colorPalette={viewMode === "table" ? "green" : "gray"}
                  borderRadius="xs"
                  aria-label="Table view"
                  onClick={() => setViewMode("table")}
                >
                  <List size={14} />
                </IconButton>
                <IconButton
                  size="xs"
                  variant={viewMode === "grid" ? "solid" : "ghost"}
                  colorPalette={viewMode === "grid" ? "green" : "gray"}
                  borderRadius="xs"
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

      {/* Super Admin Notice Banner when viewing Deleted Depots */}
      {currentTab === "deleted" && (
        <Card.Root size="sm" variant="subtle" bg="red.subtle" borderColor="red.muted" mb="4">
          <Card.Body p="3">
            <Flex justify="space-between" align="center" gap="3" wrap="wrap">
              <HStack gap="2.5">
                <Box color="red.600">
                  <Trash2 size={16} />
                </Box>
                <VStack align="start" gap="0">
                  <Text fontSize="xs" fontWeight="600" color="red.fg">
                    Archived Depots Repository (Super Admin Access)
                  </Text>
                  <Text fontSize="11px" color="fg.muted">
                    These transit depot facilities have been soft-deleted. Click "Restore" on any record to reinstate it back to operational status.
                  </Text>
                </VStack>
              </HStack>
              <Badge colorPalette="red" variant="outline" size="xs">
                {deletedCount} Archived
              </Badge>
            </Flex>
          </Card.Body>
        </Card.Root>
      )}

      {/* 4. Main Content: Table or Grid */}
      {viewMode === "table" ? (
        <DataTable<IDepotWithRouteCount>
          columns={columns}
          data={filteredDepots}
          keyExtractor={(depot) => depot.id}
          isLoading={isCurrentLoading}
          isError={isCurrentError}
          errorMessage="Could not connect to the database to load operational depots."
          onRetry={handleCurrentRetry}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          emptyActionLabel={emptyActionLabel}
          onEmptyAction={emptyActionHandler}
          pageSize={10}
        />
      ) : isCurrentLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card.Root key={i} size="sm" variant="outline" bg="bg.panel" borderColor="border.default" p="4" minH="180px">
              <HStack gap="3" mb="4">
                <Skeleton boxSize="36px" borderRadius="md" />
                <VStack align="start" gap="1" flex="1">
                  <Skeleton h="14px" w="60%" />
                  <Skeleton h="11px" w="40%" />
                </VStack>
              </HStack>
              <Skeleton h="42px" w="full" borderRadius="sm" mb="4" />
              <HStack justify="space-between" pt="2" borderTopWidth="1px" borderColor="border.subtle">
                <Skeleton h="16px" w="70px" />
                <Skeleton h="16px" w="50px" />
              </HStack>
            </Card.Root>
          ))}
        </SimpleGrid>
      ) : isCurrentError ? (
        <ErrorState
          message="Could not connect to the database to load operational depots."
          onRetry={handleCurrentRetry}
        />
      ) : filteredDepots.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={emptyActionHandler}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="3.5">
          {filteredDepots.map((depot) => (
            <DepotCard
              key={depot.id}
              depot={depot}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onRestore={handleRestoreClick}
              onViewRoutes={handleViewRoutes}
              isDeleted={currentTab === "deleted" || depot.deleted}
            />
          ))}
        </SimpleGrid>
      )}

      {/* 5. Create / Edit Depot Drawer */}
      <CreateDepotDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialData={editData}
        organization={selectedOrganization}
        regions={regions}
        defaultRegionId={selectedRegionFilter !== "all" ? selectedRegionFilter : regions[0]?.id}
        onSuccess={() => {
          refetchActive();
          refetchRoutes();
          if (isSuperAdmin) refetchDeleted();
        }}
      />

      {/* 6. Delete Confirmation Dialog */}
      <Dialog.Root
        role="alertdialog"
        open={!!depotToDelete}
        onOpenChange={(e) => {
          if (!isDeleting && !e.open) setDepotToDelete(null);
        }}
        size="sm"
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <HStack gap="2.5">
                  <Box
                    w="32px"
                    h="32px"
                    borderRadius="sm"
                    bg="red.subtle"
                    color="red.600"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    shrink="0"
                  >
                    <AlertTriangle size={18} />
                  </Box>
                  <Dialog.Title fontSize="md" fontWeight="600">
                    Delete Depot
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              <Dialog.Body>
                <VStack align="stretch" gap="3">
                  <HStack
                    gap="3"
                    p="2.5"
                    bg="bg.subtle"
                    borderRadius="sm"
                    borderWidth="1px"
                    borderColor="border.subtle"
                  >
                    <Avatar.Root size="sm" shape="rounded" colorPalette="red">
                      <Avatar.Fallback name={depotToDelete?.name}>
                        {getDepotInitials(depotToDelete?.name)}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <VStack align="start" gap="0" overflow="hidden">
                      <Text fontSize="sm" fontWeight="600" color="fg.default" truncate>
                        {depotToDelete?.name}
                      </Text>
                      <Text fontSize="xs" color="fg.muted" truncate>
                        {depotToDelete?.route_count ?? 0} scheduled routes operating
                      </Text>
                    </VStack>
                  </HStack>

                  {(depotToDelete?.route_count ?? 0) > 0 && (
                    <Box p="2.5" bg="amber.subtle" borderRadius="sm" borderWidth="1px" borderColor="amber.muted">
                      <HStack gap="2" align="start">
                        <Box color="amber.fg" shrink="0" mt="0.5">
                          <AlertTriangle size={14} />
                        </Box>
                        <Text fontSize="11px" color="amber.fg" lineHeight="1.4">
                          <strong>Active Routes Assigned:</strong> This depot currently has {depotToDelete?.route_count} scheduled transit route(s) operating from it. Soft-deleting this facility will impact fleet dispatch.
                        </Text>
                      </HStack>
                    </Box>
                  )}

                  <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
                    This will soft-delete the depot facility from the agency directory. As a Super Admin, you can restore it at any time from the "Archived" tab.
                  </Text>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer gap="2">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!isDeleting) setDepotToDelete(null);
                    }}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  size="sm"
                  loading={isDeleting}
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                >
                  Delete Depot
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  position="absolute"
                  top="2"
                  insetEnd="2"
                  disabled={isDeleting}
                />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* 7. Restore Confirmation Dialog */}
      <Dialog.Root
        role="alertdialog"
        open={!!depotToRestore}
        onOpenChange={(e) => {
          if (!isRestoring && !e.open) setDepotToRestore(null);
        }}
        size="sm"
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <HStack gap="2.5">
                  <Box
                    w="32px"
                    h="32px"
                    borderRadius="sm"
                    bg="green.subtle"
                    color="green.600"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    shrink="0"
                  >
                    <RotateCcw size={18} />
                  </Box>
                  <Dialog.Title fontSize="md" fontWeight="600">
                    Restore Depot
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              <Dialog.Body>
                <VStack align="stretch" gap="3">
                  <HStack
                    gap="3"
                    p="2.5"
                    bg="bg.subtle"
                    borderRadius="sm"
                    borderWidth="1px"
                    borderColor="border.subtle"
                  >
                    <Avatar.Root size="sm" shape="rounded" colorPalette="green">
                      <Avatar.Fallback name={depotToRestore?.name}>
                        {getDepotInitials(depotToRestore?.name)}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <VStack align="start" gap="0" overflow="hidden">
                      <Text fontSize="sm" fontWeight="600" color="fg.default" truncate>
                        {depotToRestore?.name}
                      </Text>
                      <Text fontSize="xs" color="fg.muted" truncate>
                        {depotToRestore?.region_name || "Regional facility"}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
                    This depot facility will be reinstated back to operational status, allowing routes, passenger signs, and audio telematics to dispatch from it.
                  </Text>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer gap="2">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!isRestoring) setDepotToRestore(null);
                    }}
                    disabled={isRestoring}
                  >
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="green"
                  size="sm"
                  loading={isRestoring}
                  disabled={isRestoring}
                  onClick={handleConfirmRestore}
                >
                  Restore Depot
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  position="absolute"
                  top="2"
                  insetEnd="2"
                  disabled={isRestoring}
                />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
