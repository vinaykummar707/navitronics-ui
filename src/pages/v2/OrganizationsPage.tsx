import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  IOrganization,
  IOrganizationWithCounts,
  organizationCrud,
  getOrgInitials,
} from "@/types/organization";
import { regionCrud, IRegion } from "@/types/IRegion";
import { depotCrud, IDepot } from "@/types/IDepot";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import OrganizationCard from "@/components/organizations/OrganizationCard";
import CreateOrganizationDrawer from "@/components/organizations/CreateOrganizationDrawer";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { ROLES } from "@/constants/roles";
import {
  Building2,
  MapPin,
  ArrowRight,
  Plus,
  RotateCw,
  Search,
  LayoutGrid,
  List,
  Radio,
  Pencil,
  Trash2,
  Copy,
  Check,
  Tv,
  Volume2,
  AlertTriangle,
  RotateCcw,
  X,
  Cpu,
} from "lucide-react";

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const user = useLoggedUserStore((state) => state.user);
  const { selectedOrganization, setSelectedOrganization } = useOrganizationStore();
  const isSuperAdmin =
    user?.role?.name === ROLES.MASTER ||
    user?.role?.name === "master" ||
    user?.role?.name === "super_admin";

  const { useList, useDelete, useRestore } = organizationCrud;

  // Active organizations
  const {
    data: activeData,
    isLoading: isActiveLoading,
    isError: isActiveError,
    refetch: refetchActive,
  } = useList({
    filters: { deleted: false },
    orderBy: { column: "created_at", ascending: true },
  });

  // Deleted organizations (Super Admin only)
  const {
    data: deletedData,
    isLoading: isDeletedLoading,
    isError: isDeletedError,
    refetch: refetchDeleted,
  } = useList({
    filters: { deleted: true },
    orderBy: { column: "created_at", ascending: false },
    skip: !isSuperAdmin,
  });

  // Active regions query across all organizations
  const { data: allRegionsData, refetch: refetchRegions } = regionCrud.useList({
    filters: { deleted: false },
  });

  // Active depots query across all organizations
  const { data: allDepotsData, refetch: refetchDepots } = depotCrud.useList({
    filters: { deleted: false },
  });

  const { mutate: deleteOrganization, isPending: isDeleting } = useDelete();
  const { mutate: restoreOrganization, isPending: isRestoring } = useRestore();

  const organizations = (activeData?.data as IOrganization[]) || [];
  const deletedOrganizations = (deletedData?.data as IOrganization[]) || [];

  // Map organization_id -> region count
  const regionCountsByOrg = useMemo(() => {
    const counts: Record<string, number> = {};
    const regionsList = (allRegionsData?.data as IRegion[]) || [];
    regionsList.forEach((reg) => {
      if (reg.organization_id && !reg.deleted) {
        counts[reg.organization_id] = (counts[reg.organization_id] || 0) + 1;
      }
    });
    return counts;
  }, [allRegionsData]);

  // Map organization_id -> depot count
  const depotCountsByOrg = useMemo(() => {
    const counts: Record<string, number> = {};
    const depotsList = (allDepotsData?.data as IDepot[]) || [];
    depotsList.forEach((dep) => {
      if (dep.organization_id && !dep.deleted) {
        counts[dep.organization_id] = (counts[dep.organization_id] || 0) + 1;
      }
    });
    return counts;
  }, [allDepotsData]);

  // Decorate organizations with regional zones and depot facility counts
  const decoratedOrganizations: IOrganizationWithCounts[] = useMemo(() => {
    return organizations.map((org) => ({
      ...org,
      region_count: regionCountsByOrg[org.id] || 0,
      depot_count: depotCountsByOrg[org.id] || 0,
    }));
  }, [organizations, regionCountsByOrg, depotCountsByOrg]);

  const decoratedDeletedOrganizations: IOrganizationWithCounts[] = useMemo(() => {
    return deletedOrganizations.map((org) => ({
      ...org,
      region_count: regionCountsByOrg[org.id] || 0,
      depot_count: depotCountsByOrg[org.id] || 0,
    }));
  }, [deletedOrganizations, regionCountsByOrg, depotCountsByOrg]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "inactive" | "deleted">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [editData, setEditData] = useState<IOrganization | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [orgToDelete, setOrgToDelete] = useState<IOrganizationWithCounts | null>(null);
  const [orgToRestore, setOrgToRestore] = useState<IOrganizationWithCounts | null>(null);

  // Safety fallback if non-superadmin tries to access deleted tab
  const currentTab = !isSuperAdmin && selectedTab === "deleted" ? "all" : selectedTab;

  // Filter organizations by search and tab
  const filteredOrganizations = useMemo(() => {
    const sourceList = currentTab === "deleted" ? decoratedDeletedOrganizations : decoratedOrganizations;
    return sourceList.filter((org) => {
      // Status filter within active organizations
      if (currentTab === "active" && org.active === false) return false;
      if (currentTab === "inactive" && org.active !== false) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const cleanPhoneQuery = q.replace(/[^0-9]/g, "");
      const cleanOrgPhone = org.phone ? org.phone.replace(/[^0-9]/g, "") : "";

      return (
        org.name?.toLowerCase().includes(q) ||
        org.email?.toLowerCase().includes(q) ||
        org.id?.toLowerCase().includes(q) ||
        (cleanPhoneQuery && cleanOrgPhone.includes(cleanPhoneQuery)) ||
        org.phone?.toLowerCase().includes(q)
      );
    });
  }, [currentTab, decoratedOrganizations, decoratedDeletedOrganizations, searchQuery]);

  const handleViewRegions = (org: IOrganizationWithCounts) => {
    setSelectedOrganization(org);
    navigate("/home/regions");
  };

  const handleViewDepots = (org: IOrganizationWithCounts) => {
    setSelectedOrganization(org);
    navigate("/home/depots");
  };

  const handleDeleteClick = (org: IOrganizationWithCounts) => {
    setOrgToDelete(org);
  };

  const handleRestoreClick = (org: IOrganizationWithCounts) => {
    setOrgToRestore(org);
  };

  const handleConfirmDelete = () => {
    if (!orgToDelete || isDeleting) return;

    const isProtected =
      orgToDelete.name?.toLowerCase() === "navitronix" ||
      (orgToDelete as any).is_default ||
      orgToDelete.id === "6b679098-ef69-45f0-9fb1-b457dd882060";

    if (isProtected) {
      toast.error("System organization cannot be deleted.");
      setOrgToDelete(null);
      return;
    }

    const deletedId = orgToDelete.id;
    const deletedName = orgToDelete.name;

    deleteOrganization(deletedId, {
      onSuccess: () => {
        // If the deleted organization was the currently active organization in store, switch to another active agency
        if (selectedOrganization?.id === deletedId) {
          const nextActiveOrg = organizations.find(
            (o) => o.id !== deletedId && o.active !== false && !o.deleted
          );
          setSelectedOrganization(nextActiveOrg || null);
          if (nextActiveOrg) {
            toast.info(`Switched active organization context to "${nextActiveOrg.name}"`);
          }
        }
        refetchActive();
        if (isSuperAdmin) refetchDeleted();
        toast.success(`Organization "${deletedName}" deleted successfully`);
        setOrgToDelete(null);
      },
      onError: (error: any) => {
        toast.error(`Failed to delete organization: ${error.message}`);
      },
    });
  };

  const handleConfirmRestore = () => {
    if (!orgToRestore || isRestoring) return;
    const restoredName = orgToRestore.name;
    restoreOrganization(orgToRestore.id, {
      onSuccess: () => {
        refetchActive();
        refetchDeleted();
        toast.success(`Organization "${restoredName}" restored successfully`);
        setOrgToRestore(null);
      },
      onError: (error: any) => {
        toast.error(`Failed to restore organization: ${error.message}`);
      },
    });
  };

  const handleEdit = (org: IOrganization) => {
    setEditData(org);
    setDrawerOpen(true);
  };

  const handleAddNew = () => {
    setEditData(null);
    setDrawerOpen(true);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Agency ID copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics calculations
  const totalCount = organizations.length;
  const activeCount = organizations.filter((o) => o.active !== false).length;
  const inactiveCount = totalCount - activeCount;
  const deletedCount = deletedOrganizations.length;

  const itmsEnabledCount = organizations.filter((o) => o.ITMS).length;
  const pisEnabledCount = organizations.filter((o) => o.PIS).length;
  const pasEnabledCount = organizations.filter((o) => o.PAS).length;

  const activePercent = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
  const itmsPercent = totalCount > 0 ? Math.round((itmsEnabledCount / totalCount) * 100) : 0;
  const pisPercent = totalCount > 0 ? Math.round((pisEnabledCount / totalCount) * 100) : 0;
  const pasPercent = totalCount > 0 ? Math.round((pasEnabledCount / totalCount) * 100) : 0;

  // Table columns definition
  const columns: ColumnDef<IOrganizationWithCounts>[] = [
    {
      id: "name",
      header: "Agency Name",
      accessorKey: "name",
      sortable: true,
      cell: (org) => {
        const isProtected =
          org.name?.toLowerCase() === "navitronix" ||
          (org as any).is_default ||
          org.id === "6b679098-ef69-45f0-9fb1-b457dd882060";

        return (
          <HStack
            gap="2.5"
            minW="0"
            maxW={{ base: "200px", sm: "280px", md: "380px", lg: "480px" }}
          >
            <Avatar.Root
              size="xs"
              shape="rounded"
              colorPalette={org.deleted ? "red" : "blue"}
              borderWidth="1px"
              borderColor={org.deleted ? "red.subtle" : "border.subtle"}
              shrink="0"
            >
              <Avatar.Fallback name={org.name}>
                {getOrgInitials(org.name)}
              </Avatar.Fallback>
              <Avatar.Image src={org.logo || undefined} />
            </Avatar.Root>
            <VStack align="flex-start" gap="0" minW="0" overflow="hidden" flex="1">
              <HStack gap="1.5" maxW="full" minW="0">
                <Text
                  fontWeight="600"
                  color="fg.default"
                  truncate
                  title={org.name}
                >
                  {org.name}
                </Text>
                {isProtected && (
                  <Badge colorPalette="blue" shrink="0">
                    System
                  </Badge>
                )}
                {org.deleted && (
                  <Badge colorPalette="red" shrink="0">
                    Deleted
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
        );
      },
    },
    {
      id: "active",
      header: "Status",
      accessorKey: "active",
      sortable: true,
      width: "125px",
      cell: (org) => {
        if (org.deleted) {
          return (
            <Badge colorPalette="red">
              Archived
            </Badge>
          );
        }
        return org.active !== false ? (
          <Badge colorPalette="green">
            Active
          </Badge>
        ) : (
          <Badge colorPalette="gray">
            Inactive
          </Badge>
        );
      },
    },
    {
      id: "modules",
      header: "Entitlements",
      width: "190px",
      cell: (org) => (
        <HStack gap="1.5">
          {org.PIS && (
            <Badge colorPalette="blue">
              PIS
            </Badge>
          )}
          {org.PAS && (
            <Badge colorPalette="amber">
              PAS
            </Badge>
          )}
          {org.ITMS && (
            <Badge colorPalette="purple">
              ITMS
            </Badge>
          )}
          {!org.PIS && !org.PAS && !org.ITMS && (
            <Text fontSize="xs" color="fg.subtle">
              Standard
            </Text>
          )}
        </HStack>
      ),
    },
    {
      id: "region_count",
      header: "Regions",
      accessorKey: "region_count",
      sortable: true,
      width: "140px",
      cell: (org) => {
        const count = org.region_count || 0;
        return (
          <HStack gap="1.5">
            <Badge
              variant={count > 0 ? "subtle" : "outline"}
              colorPalette={count > 0 ? "blue" : "gray"}
              borderRadius="full"
              px="2.5"
              py="0.5"
            >
              <HStack gap="1.5">
                <MapPin size={12} />
                <Text>{count} {count === 1 ? "Zone" : "Zones"}</Text>
              </HStack>
            </Badge>
            {!org.deleted && (
              <IconButton
                size="xs"
                variant="ghost"
                borderRadius="full"
                aria-label="View regions"
                color="fg.muted"
                _hover={{ color: "blue.500" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewRegions(org);
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
      id: "depot_count",
      header: "Depots",
      accessorKey: "depot_count",
      sortable: true,
      width: "140px",
      cell: (org) => {
        const count = org.depot_count || 0;
        return (
          <HStack gap="1.5">
            <Badge
              variant={count > 0 ? "subtle" : "outline"}
              colorPalette={count > 0 ? "green" : "gray"}
              borderRadius="full"
              px="2.5"
              py="0.5"
            >
              <HStack gap="1.5">
                <Building2 size={12} />
                <Text>{count} {count === 1 ? "Depot" : "Depots"}</Text>
              </HStack>
            </Badge>
            {!org.deleted && (
              <IconButton
                size="xs"
                variant="ghost"
                borderRadius="full"
                aria-label="View depots"
                color="fg.muted"
                _hover={{ color: "green.500" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDepots(org);
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
      id: "email",
      header: "Contact Email",
      accessorKey: "email",
      cell: (org) => (
        <Text color="fg.muted" truncate maxW="180px">
          {org.email || "—"}
        </Text>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      accessorKey: "phone",
      cell: (org) => (
        <Text color="fg.muted">
          {org.phone || "—"}
        </Text>
      ),
    },
    {
      id: "created_at",
      header: "Created",
      accessorKey: "created_at",
      sortable: true,
      width: "120px",
      cell: (org) => (
        <Text color="fg.muted">
          {org.created_at
            ? new Date(org.created_at).toLocaleDateString("en-US", {
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
      cell: (org) => {
        if (currentTab === "deleted" || org.deleted) {
          return (
            <Button
              size="sm"
              variant="outline"
              colorPalette="green"
              borderRadius="full"
              onClick={() => handleRestoreClick(org)}
            >
              <RotateCcw size={13} />
              Restore
            </Button>
          );
        }

        const isProtected =
          org.name?.toLowerCase() === "navitronix" ||
          (org as any).is_default ||
          org.id === "6b679098-ef69-45f0-9fb1-b457dd882060";

        return (
          <HStack gap="1" justify="flex-end">
            <IconButton
              size="xs"
              variant="ghost"
              borderRadius="full"
              aria-label="Copy ID"
              onClick={() => handleCopyId(org.id)}
              color="fg.muted"
              _hover={{ color: "fg.default", bg: "bg.muted" }}
            >
              {copiedId === org.id ? (
                <Check size={13} color="var(--chakra-colors-green-400)" />
              ) : (
                <Copy size={13} />
              )}
            </IconButton>

            <IconButton
              size="xs"
              variant="ghost"
              borderRadius="full"
              aria-label="Edit organization"
              onClick={() => handleEdit(org)}
              color="fg.muted"
              _hover={{ color: "blue.500", bg: "bg.muted" }}
            >
              <Pencil size={13} />
            </IconButton>

            {!isProtected && (
              <IconButton
                size="xs"
                variant="ghost"
                borderRadius="full"
                aria-label="Delete organization"
                onClick={() => handleDeleteClick(org)}
                color="fg.muted"
                _hover={{ color: "red.400", bg: "red.500/10" }}
              >
                <Trash2 size={13} />
              </IconButton>
            )}
          </HStack>
        );
      },
    },
  ];

  const isCurrentLoading = currentTab === "deleted" ? isDeletedLoading : isActiveLoading;
  const isCurrentError = currentTab === "deleted" ? isDeletedError : isActiveError;
  const handleCurrentRetry = () => {
    if (currentTab === "deleted") {
      refetchDeleted();
    } else {
      refetchActive();
    }
  };

  const emptyTitle = currentTab === "deleted"
    ? searchQuery ? "No matching deleted agencies" : "No deleted agencies"
    : searchQuery ? "No matching agencies" : "No agencies registered";

  const emptyDescription = currentTab === "deleted"
    ? searchQuery
      ? `No deleted agencies found matching "${searchQuery}".`
      : "There are currently no deleted or archived agencies. Deleted agencies will appear here and can be restored."
    : searchQuery
      ? `No agency found matching "${searchQuery}". Try revising your search term.`
      : "Register your first transit agency to configure routes, stops, and hardware display boards.";

  const emptyActionLabel = currentTab === "deleted" ? undefined : (searchQuery ? undefined : "+ Register First Agency");
  const emptyActionHandler = currentTab === "deleted" ? undefined : handleAddNew;

  return (
    <Box w="full">
      {/* 1. Page Header with Breadcrumbs and Actions */}
      <PageHeader
        title="Agencies & Organizations"
        description="Manage transit authorities, state transport corporations, and module licensing."
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Governance" },
          { label: "Agencies & Organizations", isCurrent: true },
        ]}
        badge={`${totalCount} Active`}
        badgeColorPalette="blue"
        actions={
          <HStack gap="2">
            <Button
              size="sm"
              variant="outline"
              borderRadius="full"
              onClick={() => {
                refetchActive();
                refetchRegions();
                refetchDepots();
                if (isSuperAdmin) refetchDeleted();
                toast.success("Agencies directory refreshed");
              }}
            >
              <RotateCw size={14} />
              Refresh
            </Button>
            <Button
              size="sm"
              colorPalette="blue"
              borderRadius="full"
              onClick={handleAddNew}
            >
              <Plus size={15} />
              Register Agency
            </Button>
          </HStack>
        }
      />

      {/* 2. Structured Operational Metrics Bar using real Chakra UI Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 5 }} gap="3.5" mb="6">
        <StatCard
          label="Registered Agencies"
          value={totalCount}
          description="Active transit authorities"
          icon={<Building2 size={16} />}
          iconColorPalette="blue"
          badge={{ label: "Directory", colorPalette: "blue" }}
          progress={{ value: 100, label: "Total Fleet", colorPalette: "blue" }}
        />
        <StatCard
          label="Active Networks"
          value={activeCount}
          valueColor="green.600"
          description="Dispatching live telemetry"
          icon={<Radio size={16} />}
          iconColorPalette="green"
          badge={{ label: `${activePercent}% Online`, colorPalette: "green" }}
          progress={{ value: activePercent, label: "Operational Rate", colorPalette: "green" }}
        />
        <StatCard
          label="ITMS Telemetry"
          value={itmsEnabledCount}
          valueColor="purple.600"
          description="Fleet tracking & GPS AVL"
          icon={<Cpu size={16} />}
          iconColorPalette="purple"
          badge={{ label: `${itmsPercent}% Fleet`, colorPalette: "purple" }}
          progress={{ value: itmsPercent, label: "Fleet Adoption", colorPalette: "purple" }}
        />
        <StatCard
          label="PIS Displays"
          value={pisEnabledCount}
          valueColor="blue.600"
          description="LED & LCD destination signs"
          icon={<Tv size={16} />}
          iconColorPalette="cyan"
          badge={{ label: `${pisPercent}% Signs`, colorPalette: "cyan" }}
          progress={{ value: pisPercent, label: "Signage Coverage", colorPalette: "cyan" }}
        />
        <StatCard
          label="PAS Audio Engine"
          value={pasEnabledCount}
          valueColor="orange.600"
          description="Indic TTS announcements"
          icon={<Volume2 size={16} />}
          iconColorPalette="orange"
          badge={{ label: `${pasPercent}% Audio`, colorPalette: "orange" }}
          progress={{ value: pasPercent, label: "Announce Coverage", colorPalette: "orange" }}
        />
      </SimpleGrid>

      {/* 3. Filter & View Toolbar using real Chakra UI Card */}
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
                    ? "Search deleted agencies..."
                    : "Search agencies by name, email, or phone..."
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
                    All ({totalCount})
                  </Tabs.Trigger>
                  <Tabs.Trigger value="active">
                    Active ({activeCount})
                  </Tabs.Trigger>
                  <Tabs.Trigger value="inactive">
                    Inactive ({inactiveCount})
                  </Tabs.Trigger>
                  {isSuperAdmin && (
                    <Tabs.Trigger value="deleted" colorPalette="red">
                      <HStack gap="1.5">
                        <Trash2 size={12} />
                        <Text>Deleted ({deletedCount})</Text>
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

      {/* Super Admin Notice Banner when viewing Deleted Organizations */}
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
                    Deleted Organizations Archive (Super Admin Access)
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    These organizations have been soft-deleted. Click "Restore" on any record to reinstate the organization and its route network.
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
        <DataTable<IOrganizationWithCounts>
          columns={columns}
          data={filteredOrganizations}
          keyExtractor={(org) => org.id}
          isLoading={isCurrentLoading}
          isError={isCurrentError}
          errorMessage="Could not connect to the database to load transport agencies."
          onRetry={handleCurrentRetry}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          emptyActionLabel={emptyActionLabel}
          onEmptyAction={emptyActionHandler}
          pageSize={10}
        />
      ) : isCurrentLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card.Root key={i} size="sm" variant="outline" bg="bg.panel" borderColor="border.default" p="4" minH="180px">
              <HStack gap="3" mb="4">
                <Skeleton boxSize="36px" borderRadius="md" />
                <VStack align="start" gap="1" flex="1">
                  <Skeleton h="14px" w="60%" />
                  <Skeleton h="11px" w="40%" />
                </VStack>
              </HStack>
              <VStack align="stretch" gap="2" mb="4">
                <Skeleton h="12px" w="80%" />
                <Skeleton h="12px" w="50%" />
              </VStack>
              <HStack justify="space-between" pt="2" borderTopWidth="1px" borderColor="border.subtle">
                <Skeleton h="20px" w="60px" borderRadius="md" />
                <Skeleton h="20px" w="50px" borderRadius="md" />
              </HStack>
            </Card.Root>
          ))}
        </SimpleGrid>
      ) : isCurrentError ? (
        <ErrorState
          message="Could not connect to the database to load transport agencies."
          onRetry={handleCurrentRetry}
        />
      ) : filteredOrganizations.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={emptyActionHandler}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="3">
          {filteredOrganizations.map((org) => (
            <OrganizationCard
              key={org.id}
              organization={org}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onRestore={handleRestoreClick}
              onViewRegions={handleViewRegions}
              onViewDepots={handleViewDepots}
              isDeleted={currentTab === "deleted" || org.deleted}
            />
          ))}
        </SimpleGrid>
      )}

      {/* 5. Create / Edit Organization Drawer */}
      <CreateOrganizationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialData={editData}
        onSuccess={() => {
          refetchActive();
          refetchRegions();
          refetchDepots();
          if (isSuperAdmin) refetchDeleted();
        }}
      />

      {/* 6. Delete Confirmation Dialog */}
      <Dialog.Root
        role="alertdialog"
        open={!!orgToDelete}
        onOpenChange={(e) => {
          if (!isDeleting && !e.open) setOrgToDelete(null);
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
                    Delete Organization
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              <Dialog.Body>
                <VStack align="stretch" gap="3">
                  <HStack gap="3" p="2.5" bg="bg.subtle" borderRadius="md" borderWidth="1px" borderColor="border.subtle">
                    <Avatar.Root size="sm" shape="rounded" colorPalette="red">
                      <Avatar.Fallback name={orgToDelete?.name}>
                        {getOrgInitials(orgToDelete?.name)}
                      </Avatar.Fallback>
                      <Avatar.Image src={orgToDelete?.logo || undefined} />
                    </Avatar.Root>
                    <VStack align="start" gap="0" overflow="hidden">
                      <Text fontSize="sm" fontWeight="600" color="fg.default" truncate>
                        {orgToDelete?.name}
                      </Text>
                      <Text fontSize="xs" color="fg.muted" truncate>
                        {orgToDelete?.email || "No contact email"}
                      </Text>
                    </VStack>
                  </HStack>

                  {((orgToDelete?.region_count || 0) > 0 || (orgToDelete?.depot_count || 0) > 0) && (
                    <Box p="2.5" bg="amber.subtle" borderRadius="md" borderWidth="1px" borderColor="amber.muted">
                      <HStack align="flex-start" gap="2">
                        <AlertTriangle size={15} color="var(--chakra-colors-amber-600)" style={{ marginTop: "2px", flexShrink: 0 }} />
                        <VStack align="start" gap="0.5">
                          <Text fontSize="xs" fontWeight="600" color="amber.fg">
                            Active Operational Infrastructure Detected
                          </Text>
                          <Text fontSize="xs" color="fg.muted" lineHeight="1.4">
                            This transit authority manages {orgToDelete?.region_count || 0} regional operational zone(s) and {orgToDelete?.depot_count || 0} bus depot facility(ies). Soft-deleting this agency will affect operational jurisdictions and fleet dispatch schedules.
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  )}

                  <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
                    This will soft-delete the organization. As a Super Admin, you will be able to view and restore it from the "Deleted" tab.
                  </Text>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer gap="2">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!isDeleting) setOrgToDelete(null);
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
                  Delete Organization
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top="2" insetEnd="2" disabled={isDeleting} />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* 7. Restore Confirmation Dialog */}
      <Dialog.Root
        role="alertdialog"
        open={!!orgToRestore}
        onOpenChange={(e) => {
          if (!isRestoring && !e.open) setOrgToRestore(null);
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
                    Restore Organization
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              <Dialog.Body>
                <VStack align="stretch" gap="3">
                  <HStack gap="3" p="2.5" bg="bg.subtle" borderRadius="md" borderWidth="1px" borderColor="border.subtle">
                    <Avatar.Root size="sm" shape="rounded" colorPalette="green">
                      <Avatar.Fallback name={orgToRestore?.name}>
                        {getOrgInitials(orgToRestore?.name)}
                      </Avatar.Fallback>
                      <Avatar.Image src={orgToRestore?.logo || undefined} />
                    </Avatar.Root>
                    <VStack align="start" gap="0" overflow="hidden">
                      <Text fontSize="sm" fontWeight="600" color="fg.default" truncate>
                        {orgToRestore?.name}
                      </Text>
                      <Text fontSize="xs" color="fg.muted" truncate>
                        {orgToRestore?.email || "No contact email"}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
                    This organization will be reinstated back to active status in the directory, and its configurations and displays will be restored.
                  </Text>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer gap="2">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!isRestoring) setOrgToRestore(null);
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
                  Restore Organization
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top="2" insetEnd="2" disabled={isRestoring} />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
