import React, { useState, useMemo } from "react";
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
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  IRegion,
  IRegionWithDepotCount,
  regionCrud,
  getRegionInitials,
} from "@/types/IRegion";
import { IDepot, depotCrud } from "@/types/IDepot";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import RegionCard from "@/components/regions/RegionCard";
import CreateRegionDrawer from "@/components/regions/CreateRegionDrawer";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useRegionStore } from "@/store/useRegionStore";
import { ROLES } from "@/constants/roles";
import {
  MapPin,
  Plus,
  RotateCw,
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Copy,
  Check,
  Building2,
  AlertTriangle,
  RotateCcw,
  X,
  Layers,
  Compass,
  ArrowRight,
} from "lucide-react";

export default function RegionsPage() {
  const navigate = useNavigate();
  const user = useLoggedUserStore((state) => state.user);
  const { selectedOrganization } = useOrganizationStore();
  const { selectedRegion, setSelectedRegion } = useRegionStore();

  const isSuperAdmin =
    user?.role?.name === ROLES.MASTER ||
    user?.role?.name === "master" ||
    user?.role?.name === "super_admin";

  const { useList, useDelete, useRestore } = regionCrud;
  const { useList: useDepotList } = depotCrud;

  // Active regions
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

  // Deleted regions (Super Admin only)
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

  // Depots data to calculate counts per region
  const {
    data: depotData,
    isLoading: isDepotLoading,
    refetch: refetchDepots,
  } = useDepotList({
    filters: {
      organization_id: selectedOrganization?.id || "",
      deleted: false,
    },
    skip: !selectedOrganization?.id,
  });

  const { mutate: deleteRegion, isPending: isDeleting } = useDelete();
  const { mutate: restoreRegion, isPending: isRestoring } = useRestore();

  const allDepots = (depotData?.data as IDepot[]) || [];

  // Map depot counts by region_id
  const depotCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of allDepots) {
      if (d.region_id) {
        map.set(d.region_id, (map.get(d.region_id) || 0) + 1);
      }
    }
    return map;
  }, [allDepots]);

  const activeRegions: IRegionWithDepotCount[] = useMemo(() => {
    const raw = (activeData?.data as IRegion[]) || [];
    return raw.map((r) => ({
      ...r,
      depot_count: depotCountMap.get(r.id) || 0,
    }));
  }, [activeData?.data, depotCountMap]);

  const deletedRegions: IRegionWithDepotCount[] = useMemo(() => {
    const raw = (deletedData?.data as IRegion[]) || [];
    return raw.map((r) => ({
      ...r,
      depot_count: depotCountMap.get(r.id) || 0,
    }));
  }, [deletedData?.data, depotCountMap]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "deleted">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [editData, setEditData] = useState<IRegion | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [regionToDelete, setRegionToDelete] = useState<IRegionWithDepotCount | null>(null);
  const [regionToRestore, setRegionToRestore] = useState<IRegionWithDepotCount | null>(null);

  // Safety fallback if non-superadmin tries to access deleted tab
  const currentTab = !isSuperAdmin && selectedTab === "deleted" ? "all" : selectedTab;

  // Filter regions by search and tab
  const filteredRegions = useMemo(() => {
    const sourceList = currentTab === "deleted" ? deletedRegions : activeRegions;
    return sourceList.filter((reg) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        reg.name?.toLowerCase().includes(q) ||
        reg.id?.toLowerCase().includes(q)
      );
    });
  }, [currentTab, activeRegions, deletedRegions, searchQuery]);

  // Operational metrics calculations
  const totalCount = activeRegions.length;
  const totalDepots = allDepots.length;
  const deletedCount = deletedRegions.length;
  const avgDepotsPerRegion = totalCount > 0 ? (totalDepots / totalCount).toFixed(1) : "0";
  const regionsWithDepots = activeRegions.filter((r) => (r.depot_count || 0) > 0).length;
  const activeCoveragePercent = totalCount > 0 ? Math.round((regionsWithDepots / totalCount) * 100) : 0;

  const handleAddNew = () => {
    if (!selectedOrganization?.id) {
      toast.error("Please select an organization first.");
      return;
    }
    setEditData(null);
    setDrawerOpen(true);
  };

  const handleEdit = (region: IRegionWithDepotCount) => {
    setEditData(region);
    setDrawerOpen(true);
  };

  const handleDeleteClick = (region: IRegionWithDepotCount) => {
    setRegionToDelete(region);
  };

  const handleRestoreClick = (region: IRegionWithDepotCount) => {
    setRegionToRestore(region);
  };

  const handleViewDepots = (region: IRegionWithDepotCount) => {
    setSelectedRegion(region);
    toast.info(`Selected region: "${region.name}"`);
    navigate("/home/depots");
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Region ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmDelete = () => {
    if (!regionToDelete || isDeleting) return;

    const deletedId = regionToDelete.id;
    const deletedName = regionToDelete.name;

    deleteRegion(deletedId, {
      onSuccess: () => {
        if (selectedRegion?.id === deletedId) {
          setSelectedRegion(null);
        }
        refetchActive();
        refetchDepots();
        if (isSuperAdmin) refetchDeleted();
        toast.success(`Region "${deletedName}" deleted successfully`);
        setRegionToDelete(null);
      },
      onError: (error: any) => {
        toast.error(`Failed to delete region: ${error?.message || "Unknown error"}`);
      },
    });
  };

  const handleConfirmRestore = () => {
    if (!regionToRestore || isRestoring) return;
    const restoredName = regionToRestore.name;

    restoreRegion(regionToRestore.id, {
      onSuccess: () => {
        refetchActive();
        refetchDepots();
        refetchDeleted();
        toast.success(`Region "${restoredName}" restored successfully`);
        setRegionToRestore(null);
      },
      onError: (error: any) => {
        toast.error(`Failed to restore region: ${error?.message || "Unknown error"}`);
      },
    });
  };

  const isCurrentLoading = currentTab === "deleted" ? isDeletedLoading : (isActiveLoading || isDepotLoading);
  const isCurrentError = currentTab === "deleted" ? isDeletedError : isActiveError;

  const handleCurrentRetry = () => {
    if (currentTab === "deleted") {
      refetchDeleted();
    } else {
      refetchActive();
      refetchDepots();
    }
  };

  // Table columns definition
  const columns: ColumnDef<IRegionWithDepotCount>[] = [
    {
      id: "name",
      header: "Region Name",
      accessorKey: "name",
      sortable: true,
      cell: (reg) => (
        <HStack
          gap="2.5"
          minW="0"
          maxW={{ base: "200px", sm: "280px", md: "380px", lg: "480px" }}
        >
          <Avatar.Root
            size="xs"
            shape="rounded"
            colorPalette={reg.deleted ? "red" : "blue"}
            borderWidth="1px"
            borderColor={reg.deleted ? "red.subtle" : "border.subtle"}
            shrink="0"
          >
            <Avatar.Fallback name={reg.name}>
              {getRegionInitials(reg.name)}
            </Avatar.Fallback>
          </Avatar.Root>
          <VStack align="flex-start" gap="0" minW="0" overflow="hidden" flex="1">
            <HStack gap="1.5" maxW="full" minW="0">
              <Text
                fontWeight="600"
                color="fg.default"
                truncate
                title={reg.name}
              >
                {reg.name}
              </Text>
              {reg.deleted && (
                <Badge colorPalette="red" shrink="0">
                  Archived
                </Badge>
              )}
            </HStack>
          </VStack>
        </HStack>
      ),
    },
    {
      id: "depots",
      header: "Assigned Depots",
      sortable: true,
      cell: (reg) => {
        const count = reg.depot_count ?? 0;
        return (
          <HStack gap="2">
            <Badge
              variant={count > 0 ? "subtle" : "outline"}
              colorPalette={count > 0 ? "blue" : "gray"}
            >
              <HStack gap="1.5">
                <Building2 size={13} />
                <Text>{count} {count === 1 ? "Depot" : "Depots"}</Text>
              </HStack>
            </Badge>
            {!reg.deleted && (
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Manage depots"
                color="fg.muted"
                _hover={{ color: "blue.500" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDepots(reg);
                }}
              >
                <ArrowRight size={13} />
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
      cell: (reg) => {
        if (reg.deleted) {
          return (
            <Badge colorPalette="red">
              Archived
            </Badge>
          );
        }
        return (
          <Badge colorPalette="green">
            Active
          </Badge>
        );
      },
    },
    {
      id: "created_at",
      header: "Created",
      accessorKey: "created_at",
      sortable: true,
      width: "120px",
      cell: (reg) => (
        <Text color="fg.muted">
          {reg.created_at
            ? new Date(reg.created_at).toLocaleDateString("en-US", {
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
      cell: (reg) => {
        if (currentTab === "deleted" || reg.deleted) {
          return (
            <Button
              size="sm"
              variant="outline"
              colorPalette="green"
              borderRadius="full"
              onClick={(e) => {
                e.stopPropagation();
                handleRestoreClick(reg);
              }}
            >
              <RotateCcw size={13} />
              Restore
            </Button>
          );
        }
        return (
          <HStack gap="1" justify="flex-end">
            <IconButton
              size="xs"
              variant="ghost"
              borderRadius="full"
              aria-label="Copy ID"
              color="fg.muted"
              _hover={{ color: "fg.default", bg: "bg.subtle" }}
              onClick={(e) => {
                e.stopPropagation();
                handleCopyId(reg.id);
              }}
            >
              {copiedId === reg.id ? (
                <Check size={13} color="var(--chakra-colors-green-600)" />
              ) : (
                <Copy size={13} />
              )}
            </IconButton>
            <IconButton
              size="xs"
              variant="ghost"
              borderRadius="full"
              aria-label="Edit Region"
              color="fg.muted"
              _hover={{ color: "fg.default", bg: "bg.subtle" }}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(reg);
              }}
            >
              <Pencil size={13} />
            </IconButton>
            <IconButton
              size="xs"
              variant="ghost"
              borderRadius="full"
              aria-label="Delete Region"
              color="red.600"
              _hover={{ bg: "red.500/10" }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(reg);
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
    ? "No regions match your search"
    : currentTab === "deleted"
    ? "No archived regions found"
    : "No operational regions registered";

  const emptyDescription = searchQuery
    ? `No regions found matching "${searchQuery}". Try searching with a different term.`
    : currentTab === "deleted"
    ? "There are no soft-deleted regions in the archive for this organization."
    : `Set up geographic operational zones and transit districts for ${selectedOrganization?.name || "this agency"}.`;

  const emptyActionLabel =
    searchQuery ? "Clear Search" : currentTab === "deleted" ? undefined : "Add First Region";

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
          title="Operational Regions"
          description="Manage regional operational zones, transit jurisdictions, and fleet depots"
          breadcrumbs={[
            { label: "Home", href: "/home" },
            { label: "Regions" },
          ]}
        />
        <EmptyState
          title="Select an Organization"
          description="Please choose a transport agency from the top switcher bar to view and manage its regional operational zones."
        />
      </Box>
    );
  }

  return (
    <Box w="full">
      {/* 1. Page Header */}
      <PageHeader
        title="Operational Regions"
        description={`Manage geographic zones, fleet jurisdictions, and depot facilities for ${selectedOrganization.name}`}
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Regions" },
        ]}
        badge={`${totalCount} Active`}
        badgeColorPalette="blue"
        actions={
          <HStack gap="2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCurrentRetry}
              loading={isCurrentLoading}
            >
              <RotateCw size={14} />
              Refresh
            </Button>
            <Button
              size="sm"
              colorPalette="blue"
              onClick={handleAddNew}
            >
              <Plus size={15} />
              Add Region
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
          label="Operational Zones"
          value={totalCount}
          description={`Registered transit districts in ${selectedOrganization.name}`}
          icon={<MapPin size={16} />}
          iconColorPalette="blue"
          badge={{ label: "Directory", colorPalette: "blue" }}
          progress={{ value: 100, label: "Network Scope", colorPalette: "blue" }}
        />
        <StatCard
          label="Operating Depots"
          value={totalDepots}
          valueColor="green.600"
          description="Total active fleet maintenance facilities"
          icon={<Building2 size={16} />}
          iconColorPalette="green"
          badge={{ label: `${totalDepots} Stations`, colorPalette: "green" }}
          progress={{ value: 100, label: "Operating Capacity", colorPalette: "green" }}
        />
        <StatCard
          label="Depot Density"
          value={avgDepotsPerRegion}
          valueColor="purple.600"
          description="Average operating depots per regional zone"
          icon={<Layers size={16} />}
          iconColorPalette="purple"
          badge={{ label: "Avg per Zone", colorPalette: "purple" }}
          progress={{
            value: Math.min(Math.round(Number(avgDepotsPerRegion) * 25), 100),
            label: "Facility Ratio",
            colorPalette: "purple",
          }}
        />
        <StatCard
          label="Active Coverage"
          value={`${regionsWithDepots}/${totalCount}`}
          valueColor="cyan.600"
          description="Zones equipped with operating depot infrastructure"
          icon={<Compass size={16} />}
          iconColorPalette="cyan"
          badge={{ label: `${activeCoveragePercent}% Equipped`, colorPalette: "cyan" }}
          progress={{
            value: activeCoveragePercent,
            label: "Territory Coverage",
            colorPalette: "cyan",
          }}
        />
        {isSuperAdmin && deletedCount > 0 && (
          <StatCard
            label="Archived Zones"
            value={deletedCount}
            valueColor="red.600"
            description="Soft-deleted regional records in archive"
            icon={<Trash2 size={16} />}
            iconColorPalette="red"
            badge={{ label: "Archived", colorPalette: "red" }}
            progress={{ value: 100, label: "Recoverable", colorPalette: "red" }}
          />
        )}
      </SimpleGrid>

      {/* 3. Filter & View Toolbar */}
      <Card.Root size="sm" mb="4">
        <Card.Body p="3">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap="3"
          >
            {/* Search Input using real Chakra UI InputGroup */}
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
              maxW={{ base: "full", md: "340px" }}
              w="full"
            >
              <Input
                size="sm"
                placeholder={
                  currentTab === "deleted"
                    ? "Search archived regions..."
                    : "Search regions by name or ID..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            {/* Right Toolbar Controls: Tabs + View Mode Toggle */}
            <HStack gap="3" justify={{ base: "space-between", md: "flex-end" }} wrap="wrap">
              {/* Chakra UI Tabs for Status Selection & Deleted Tab for Super Admin */}
              <Tabs.Root
                value={currentTab}
                onValueChange={(e) => setSelectedTab(e.value as any)}
                size="sm"
              >
                <Tabs.List>
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
                borderRadius="full"
                borderWidth="1px"
                borderColor="border.subtle"
              >
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

      {/* Super Admin Notice Banner when viewing Deleted Regions */}
      {currentTab === "deleted" && (
        <Card.Root size="sm" variant="subtle" bg="red.subtle" borderColor="red.muted" borderRadius="2xl" mb="4">
          <Card.Body p="3">
            <Flex justify="space-between" align="center" gap="3" wrap="wrap">
              <HStack gap="2.5">
                <Box color="red.600">
                  <Trash2 size={16} />
                </Box>
                <VStack align="start" gap="0">
                  <Text fontSize="xs" fontWeight="600" color="red.fg">
                    Archived Regions Repository (Super Admin Access)
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    These regional zones have been soft-deleted. Click "Restore" on any zone to reinstate it back to active status.
                  </Text>
                </VStack>
              </HStack>
              <Badge colorPalette="red" variant="outline" borderRadius="full" px="2.5">
                {deletedCount} Archived
              </Badge>
            </Flex>
          </Card.Body>
        </Card.Root>
      )}

      {/* 4. Main Content: Table or Grid */}
      {viewMode === "table" ? (
        <DataTable<IRegionWithDepotCount>
          columns={columns}
          data={filteredRegions}
          keyExtractor={(reg) => reg.id}
          isLoading={isCurrentLoading}
          isError={isCurrentError}
          errorMessage="Could not connect to the database to load operational regions."
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
              <Skeleton h="42px" w="full" borderRadius="md" mb="4" />
              <HStack justify="space-between" pt="2" borderTopWidth="1px" borderColor="border.subtle">
                <Skeleton h="16px" w="70px" />
                <Skeleton h="16px" w="50px" />
              </HStack>
            </Card.Root>
          ))}
        </SimpleGrid>
      ) : isCurrentError ? (
        <ErrorState
          message="Could not connect to the database to load operational regions."
          onRetry={handleCurrentRetry}
        />
      ) : filteredRegions.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={emptyActionHandler}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="3.5">
          {filteredRegions.map((reg) => (
            <RegionCard
              key={reg.id}
              region={reg}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onRestore={handleRestoreClick}
              onViewDepots={handleViewDepots}
              isDeleted={currentTab === "deleted" || reg.deleted}
            />
          ))}
        </SimpleGrid>
      )}

      {/* 5. Create / Edit Region Drawer */}
      <CreateRegionDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialData={editData}
        organization={selectedOrganization}
        onSuccess={() => {
          refetchActive();
          refetchDepots();
          if (isSuperAdmin) refetchDeleted();
        }}
      />

      {/* 6. Delete Confirmation Dialog */}
      <Dialog.Root
        role="alertdialog"
        open={!!regionToDelete}
        onOpenChange={(e) => {
          if (!isDeleting && !e.open) setRegionToDelete(null);
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
                    borderRadius="md"
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
                    Delete Region
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              <Dialog.Body>
                <VStack align="stretch" gap="3">
                  <HStack
                    gap="3"
                    p="2.5"
                    bg="bg.subtle"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="border.subtle"
                  >
                    <Avatar.Root size="sm" shape="rounded" colorPalette="red">
                      <Avatar.Fallback name={regionToDelete?.name}>
                        {getRegionInitials(regionToDelete?.name)}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <VStack align="start" gap="0" overflow="hidden">
                      <Text fontSize="sm" fontWeight="600" color="fg.default" truncate>
                        {regionToDelete?.name}
                      </Text>
                      <Text fontSize="xs" color="fg.muted" truncate>
                        {regionToDelete?.depot_count ?? 0} active bus depots attached
                      </Text>
                    </VStack>
                  </HStack>

                  {(regionToDelete?.depot_count ?? 0) > 0 && (
                    <Box p="2.5" bg="amber.subtle" borderRadius="md" borderWidth="1px" borderColor="amber.muted">
                      <HStack gap="2" align="start">
                        <Box color="amber.fg" shrink="0" mt="0.5">
                          <AlertTriangle size={14} />
                        </Box>
                        <Text fontSize="xs" color="amber.fg" lineHeight="1.4">
                          <strong>Active Depots Assigned:</strong> This region currently contains {regionToDelete?.depot_count} operational bus depot(s). Soft-deleting this zone may orphan depots and affect route planning.
                        </Text>
                      </HStack>
                    </Box>
                  )}

                  <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
                    This will soft-delete the region from the agency directory. As a Super Admin, you can restore it at any time from the "Archived" tab.
                  </Text>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer gap="2">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!isDeleting) setRegionToDelete(null);
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
                  Delete Region
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
        open={!!regionToRestore}
        onOpenChange={(e) => {
          if (!isRestoring && !e.open) setRegionToRestore(null);
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
                    borderRadius="md"
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
                    Restore Region
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              <Dialog.Body>
                <VStack align="stretch" gap="3">
                  <HStack
                    gap="3"
                    p="2.5"
                    bg="bg.subtle"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="border.subtle"
                  >
                    <Avatar.Root size="sm" shape="rounded" colorPalette="green">
                      <Avatar.Fallback name={regionToRestore?.name}>
                        {getRegionInitials(regionToRestore?.name)}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <VStack align="start" gap="0" overflow="hidden">
                      <Text fontSize="sm" fontWeight="600" color="fg.default" truncate>
                        {regionToRestore?.name}
                      </Text>
                      <Text fontSize="xs" color="fg.muted" truncate>
                        {regionToRestore?.depot_count ?? 0} bus depots associated
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
                    This regional zone will be reinstated back to active status, re-enabling depot assignment and dispatch monitoring.
                  </Text>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer gap="2">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!isRestoring) setRegionToRestore(null);
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
                  Restore Region
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
