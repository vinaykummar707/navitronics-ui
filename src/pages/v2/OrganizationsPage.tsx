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
} from "@chakra-ui/react";
import { IOrganization, organizationCrud, getOrgInitials } from "@/types/organization";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import OrganizationCard from "@/components/organizations/OrganizationCard";
import CreateOrganizationDrawer from "@/components/organizations/CreateOrganizationDrawer";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { ROLES } from "@/constants/roles";
import {
  Building2,
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
} from "lucide-react";

export default function OrganizationsPage() {
  const user = useLoggedUserStore((state) => state.user);
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

  const { mutate: deleteOrganization, isPending: isDeleting } = useDelete();
  const { mutate: restoreOrganization, isPending: isRestoring } = useRestore();

  const organizations = (activeData?.data as IOrganization[]) || [];
  const deletedOrganizations = (deletedData?.data as IOrganization[]) || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "inactive" | "deleted">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [editData, setEditData] = useState<IOrganization | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [orgToDelete, setOrgToDelete] = useState<IOrganization | null>(null);
  const [orgToRestore, setOrgToRestore] = useState<IOrganization | null>(null);

  // Safety fallback if non-superadmin tries to access deleted tab
  const currentTab = !isSuperAdmin && selectedTab === "deleted" ? "all" : selectedTab;

  // Filter organizations by search and tab
  const filteredOrganizations = useMemo(() => {
    const sourceList = currentTab === "deleted" ? deletedOrganizations : organizations;
    return sourceList.filter((org) => {
      // Status filter within active organizations
      if (currentTab === "active" && org.active === false) return false;
      if (currentTab === "inactive" && org.active !== false) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        org.name?.toLowerCase().includes(q) ||
        org.email?.toLowerCase().includes(q) ||
        org.phone?.includes(q)
      );
    });
  }, [currentTab, organizations, deletedOrganizations, searchQuery]);

  const handleDeleteClick = (org: IOrganization) => {
    setOrgToDelete(org);
  };

  const handleConfirmDelete = () => {
    if (!orgToDelete) return;
    deleteOrganization(orgToDelete.id, {
      onSuccess: () => {
        refetchActive();
        if (isSuperAdmin) refetchDeleted();
        toast.success(`Organization "${orgToDelete.name}" deleted successfully`);
        setOrgToDelete(null);
      },
      onError: (error: any) => {
        toast.error(`Failed to delete organization: ${error.message}`);
      },
    });
  };

  const handleRestoreClick = (org: IOrganization) => {
    setOrgToRestore(org);
  };

  const handleConfirmRestore = () => {
    if (!orgToRestore) return;
    restoreOrganization(orgToRestore.id, {
      onSuccess: () => {
        refetchActive();
        refetchDeleted();
        toast.success(`Organization "${orgToRestore.name}" restored successfully`);
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

  const pisEnabledCount = organizations.filter((o) => o.PIS).length;
  const pasEnabledCount = organizations.filter((o) => o.PAS).length;

  // Table columns definition
  const columns: ColumnDef<IOrganization>[] = [
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
          <HStack gap="2.5">
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
            <VStack align="flex-start" gap="0">
              <HStack gap="1.5">
                <Text fontWeight="600" color="fg.default">
                  {org.name}
                </Text>
                {isProtected && (
                  <Badge size="xs" variant="subtle" colorPalette="blue" borderRadius="xs" px="1.5" fontSize="9px">
                    System
                  </Badge>
                )}
                {org.deleted && (
                  <Badge size="xs" variant="subtle" colorPalette="red" borderRadius="xs" px="1.5" fontSize="9px">
                    Deleted
                  </Badge>
                )}
              </HStack>
              <Text fontSize="11px" color="fg.muted">
                ID: {org.id.slice(0, 8)}...
              </Text>
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
      width: "115px",
      cell: (org) => {
        if (org.deleted) {
          return (
            <Badge
              size="xs"
              variant="subtle"
              colorPalette="red"
              borderRadius="xs"
              px="2"
              py="0.5"
              fontSize="11px"
              fontWeight="600"
            >
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
            bg={org.active !== false ? "green.500/10" : "gray.500/10"}
            borderWidth="1px"
            borderColor={org.active !== false ? "green.500/25" : "gray.500/20"}
            w="fit-content"
          >
            <Box
              w="5px"
              h="5px"
              borderRadius="full"
              bg={org.active !== false ? "green.400" : "gray.400"}
            />
            <Text
              fontSize="11px"
              fontWeight="600"
              color={org.active !== false ? "green.400" : "gray.400"}
            >
              {org.active !== false ? "Active" : "Inactive"}
            </Text>
          </HStack>
        );
      },
    },
    {
      id: "modules",
      header: "Entitlements",
      width: "180px",
      cell: (org) => (
        <HStack gap="1.5">
          {org.PIS && (
            <Badge
              size="xs"
              variant="subtle"
              colorPalette="blue"
              borderRadius="xs"
              px="1.5"
              py="0.2"
              fontSize="10px"
              fontWeight="600"
            >
              PIS
            </Badge>
          )}
          {org.PAS && (
            <Badge
              size="xs"
              variant="subtle"
              colorPalette="amber"
              borderRadius="xs"
              px="1.5"
              py="0.2"
              fontSize="10px"
              fontWeight="600"
            >
              PAS
            </Badge>
          )}
          {org.ITMS && (
            <Badge
              size="xs"
              variant="subtle"
              colorPalette="purple"
              borderRadius="xs"
              px="1.5"
              py="0.2"
              fontSize="10px"
              fontWeight="600"
            >
              ITMS
            </Badge>
          )}
          {!org.PIS && !org.PAS && !org.ITMS && (
            <Text fontSize="11px" color="fg.subtle">
              Standard
            </Text>
          )}
        </HStack>
      ),
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
        <Text color="fg.muted" fontSize="11px">
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
              size="xs"
              variant="outline"
              colorPalette="green"
              borderRadius="xs"
              onClick={() => handleRestoreClick(org)}
              fontWeight="600"
            >
              <RotateCcw size={12} style={{ marginRight: "4px" }} />
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
              aria-label="Copy ID"
              onClick={() => handleCopyId(org.id)}
              color="fg.muted"
              _hover={{ color: "fg.default", bg: "bg.muted" }}
              borderRadius="xs"
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
              aria-label="Edit organization"
              onClick={() => handleEdit(org)}
              color="fg.muted"
              _hover={{ color: "blue.500", bg: "bg.muted" }}
              borderRadius="xs"
            >
              <Pencil size={13} />
            </IconButton>

            {!isProtected && (
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Delete organization"
                onClick={() => handleDeleteClick(org)}
                color="fg.muted"
                _hover={{ color: "red.400", bg: "red.500/10" }}
                borderRadius="xs"
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
              size="xs"
              variant="outline"
              borderRadius="sm"
              fontWeight="500"
              onClick={() => {
                refetchActive();
                if (isSuperAdmin) refetchDeleted();
                toast.success("Agencies directory refreshed");
              }}
            >
              <RotateCw size={13} style={{ marginRight: "5px" }} />
              Refresh
            </Button>
            <Button
              size="xs"
              colorPalette="blue"
              borderRadius="sm"
              fontWeight="600"
              onClick={handleAddNew}
            >
              <Plus size={14} style={{ marginRight: "4px" }} />
              Register Agency
            </Button>
          </HStack>
        }
      />

      {/* 2. Structured Operational Metrics Bar using real Chakra UI Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="3.5" mb="6">
        <StatCard
          label="Registered Agencies"
          value={totalCount}
          description="Active transit authorities"
          icon={<Building2 size={16} />}
          iconColorPalette="blue"
        />
        <StatCard
          label="Active Networks"
          value={activeCount}
          valueColor="green.600"
          description="Dispatching live telemetry"
          icon={<Radio size={16} />}
          iconColorPalette="green"
        />
        <StatCard
          label="PIS Displays"
          value={pisEnabledCount}
          valueColor="blue.600"
          description="LED signs enabled"
          icon={<Tv size={16} />}
          iconColorPalette="blue"
        />
        <StatCard
          label="PAS Audio Engine"
          value={pasEnabledCount}
          valueColor="purple.600"
          description="Indic TTS announcements"
          icon={<Volume2 size={16} />}
          iconColorPalette="purple"
        />
      </SimpleGrid>

      {/* 3. Filter & View Toolbar using real Chakra UI Card */}
      <Card.Root size="sm" variant="outline" mb="4" bg="bg.panel" borderColor="border.default">
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
              maxW={{ base: "full", md: "340px" }}
              w="full"
            >
              <Input
                size="sm"
                borderRadius="sm"
                placeholder={
                  currentTab === "deleted"
                    ? "Search deleted agencies..."
                    : "Search agencies by name, email, or phone..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="bg.subtle"
                _focus={{ borderColor: "blue.500", bg: "bg.surface" }}
              />
            </InputGroup>

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
                borderRadius="sm"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <IconButton
                  size="xs"
                  variant={viewMode === "table" ? "solid" : "ghost"}
                  colorPalette={viewMode === "table" ? "blue" : "gray"}
                  borderRadius="xs"
                  aria-label="Table view"
                  onClick={() => setViewMode("table")}
                >
                  <List size={14} />
                </IconButton>
                <IconButton
                  size="xs"
                  variant={viewMode === "grid" ? "solid" : "ghost"}
                  colorPalette={viewMode === "grid" ? "blue" : "gray"}
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

      {/* Super Admin Notice Banner when viewing Deleted Organizations */}
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
                    Deleted Organizations Archive (Super Admin Access)
                  </Text>
                  <Text fontSize="11px" color="fg.muted">
                    These organizations have been soft-deleted. Click "Restore" on any record to reinstate the organization and its route network.
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
        <DataTable<IOrganization>
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
          if (isSuperAdmin) refetchDeleted();
        }}
      />

      {/* 6. Delete Confirmation Dialog */}
      <Dialog.Root
        role="alertdialog"
        open={!!orgToDelete}
        onOpenChange={(e) => !e.open && setOrgToDelete(null)}
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
                    Delete Organization
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              <Dialog.Body>
                <VStack align="stretch" gap="3">
                  <HStack gap="3" p="2.5" bg="bg.subtle" borderRadius="sm" borderWidth="1px" borderColor="border.subtle">
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
                    onClick={() => setOrgToDelete(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  size="sm"
                  loading={isDeleting}
                  onClick={handleConfirmDelete}
                >
                  Delete Organization
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top="2" insetEnd="2" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* 7. Restore Confirmation Dialog */}
      <Dialog.Root
        role="alertdialog"
        open={!!orgToRestore}
        onOpenChange={(e) => !e.open && setOrgToRestore(null)}
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
                    Restore Organization
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              <Dialog.Body>
                <VStack align="stretch" gap="3">
                  <HStack gap="3" p="2.5" bg="bg.subtle" borderRadius="sm" borderWidth="1px" borderColor="border.subtle">
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
                    onClick={() => setOrgToRestore(null)}
                    disabled={isRestoring}
                  >
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="green"
                  size="sm"
                  loading={isRestoring}
                  onClick={handleConfirmRestore}
                >
                  Restore Organization
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top="2" insetEnd="2" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
