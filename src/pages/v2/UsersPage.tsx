import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  IconButton,
  Input,
  SimpleGrid,
  Dialog,
  Portal,
  Tabs,
  Card,
  Avatar,
  Skeleton,
  NativeSelect,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ILoggedUser, loggedUserCrud, getUserInitials, formatRoleName } from "@/types/IUser";
import { InputGroup } from "@/components/ui/input-group";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { ROLES } from "@/constants/roles";
import PageHeader from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import UserCard from "@/components/users/UserCard";
import CreateUserDrawer from "@/components/users/CreateUserDrawer";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { toast } from "react-toastify";
import {
  Users,
  UserCheck,
  ShieldCheck,
  Radio,
  Trash2,
  Search,
  Plus,
  RefreshCw,
  RotateCw,
  LayoutGrid,
  List,
  Pencil,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  X,
  Building2,
  Globe,
  Building,
  ShieldAlert,
  ArrowRight,
  Tv,
  Volume2,
  Cpu,
  Calendar,
} from "lucide-react";

export default function UsersPage() {
  const navigate = useNavigate();
  const loggedInUser = useLoggedUserStore((state) => state.user);
  const { selectedOrganization } = useOrganizationStore();

  const isSuperAdmin =
    loggedInUser?.role?.name === ROLES.MASTER ||
    loggedInUser?.role?.name === "master" ||
    loggedInUser?.role?.name === "super_admin";

  const { useList, useDelete, useRestore } = loggedUserCrud;

  // Active Users Query
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
    orderBy: { column: "created_at", ascending: false },
    skip: !selectedOrganization?.id,
    custom(query) {
      return query.select(`
        *,
        region:region_id (*),
        organization:organization_id (*),
        depot:depot_id (*),
        role:role_id (*)
      `);
    },
  });

  // Deleted / Archived Users Query (Super Admins)
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
    custom(query) {
      return query.select(`
        *,
        region:region_id (*),
        organization:organization_id (*),
        depot:depot_id (*),
        role:role_id (*)
      `);
    },
  });

  const { mutate: deleteUser, isPending: isDeleting } = useDelete();
  const { mutate: restoreUser, isPending: isRestoring } = useRestore();

  const activeUsers = (activeData?.data as ILoggedUser[]) || [];
  const deletedUsers = (deletedData?.data as ILoggedUser[]) || [];

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState<"active" | "deleted">("active");
  const [viewMode, setViewMode] = useState<"table" | "grid">(() => {
    return (localStorage.getItem("navitronix_users_view_mode") as "table" | "grid") || "table";
  });

  // Modal / Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editData, setEditData] = useState<ILoggedUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<ILoggedUser | null>(null);
  const [userToRestore, setUserToRestore] = useState<ILoggedUser | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Persist View Mode
  useEffect(() => {
    localStorage.setItem("navitronix_users_view_mode", viewMode);
  }, [viewMode]);

  // Operational Metrics
  const totalCount = activeUsers.length;
  const activeCount = useMemo(() => activeUsers.filter((u) => u.active).length, [activeUsers]);
  const adminCount = useMemo(
    () =>
      activeUsers.filter(
        (u) => u.role?.name === "master" || u.role?.name === "organization_admin"
      ).length,
    [activeUsers]
  );
  const fieldStaffCount = useMemo(
    () =>
      activeUsers.filter(
        (u) => u.role?.name === "region_admin" || u.role?.name === "depot_admin"
      ).length,
    [activeUsers]
  );
  const deletedCount = deletedUsers.length;
  const activeRatio = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 100;

  // Filtered Users computation
  const baseUsers = currentTab === "active" ? activeUsers : deletedUsers;

  const filteredUsers = useMemo(() => {
    return baseUsers.filter((user) => {
      // Search matching: email, role, region, depot, id
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchesEmail = user.email?.toLowerCase().includes(q) || false;
        const matchesRole = user.role?.name?.toLowerCase().includes(q) || false;
        const matchesRegion = user.region?.name?.toLowerCase().includes(q) || false;
        const matchesDepot = user.depot?.name?.toLowerCase().includes(q) || false;
        const matchesId = user.id?.toLowerCase().includes(q) || false;
        if (!matchesEmail && !matchesRole && !matchesRegion && !matchesDepot && !matchesId) {
          return false;
        }
      }

      // Role filter matching
      if (selectedRoleFilter !== "all") {
        if (user.role?.name !== selectedRoleFilter) {
          return false;
        }
      }

      return true;
    });
  }, [baseUsers, searchQuery, selectedRoleFilter]);

  // Copy email handler
  const handleCopyEmail = (email?: string | null, id?: string) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    toast.success("Email copied to clipboard");
  };

  // Handlers
  const handleEdit = (user: ILoggedUser) => {
    setEditData(user);
    setDrawerOpen(true);
  };

  const handleCreateClick = () => {
    setEditData(null);
    setDrawerOpen(true);
  };

  const handleDeleteClick = (user: ILoggedUser) => {
    setUserToDelete(user);
  };

  const handleRestoreClick = (user: ILoggedUser) => {
    setUserToRestore(user);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;

    if (userToDelete.id === loggedInUser?.id) {
      toast.error("You cannot delete your own active operator account.");
      setUserToDelete(null);
      return;
    }

    deleteUser(userToDelete.id, {
      onSuccess: () => {
        toast.success(`Operator account "${userToDelete.email}" deactivated successfully.`);
        setUserToDelete(null);
        refetchActive();
        if (isSuperAdmin) refetchDeleted();
      },
      onError: (err: any) => {
        toast.error(`Failed to deactivate user: ${err.message}`);
      },
    });
  };

  const handleConfirmRestore = () => {
    if (!userToRestore) return;

    restoreUser(userToRestore.id, {
      onSuccess: () => {
        toast.success(`Operator account "${userToRestore.email}" restored successfully.`);
        setUserToRestore(null);
        refetchActive();
        if (isSuperAdmin) refetchDeleted();
      },
      onError: (err: any) => {
        toast.error(`Failed to restore user: ${err.message}`);
      },
    });
  };

  const isCurrentLoading = currentTab === "active" ? isActiveLoading : isDeletedLoading;
  const isCurrentError = currentTab === "active" ? isActiveError : isDeletedError;
  const handleCurrentRetry = currentTab === "active" ? refetchActive : refetchDeleted;

  // Empty state copy
  const emptyTitle = searchQuery
    ? "No matching users found"
    : selectedRoleFilter !== "all"
    ? "No users matching selected role"
    : currentTab === "deleted"
    ? "No archived users found"
    : "No operator accounts registered";

  const emptyDescription = searchQuery
    ? `No accounts matched your search term "${searchQuery}". Try searching with a different email, role, or sector.`
    : selectedRoleFilter !== "all"
    ? "There are no operator accounts assigned to the selected role in this agency."
    : currentTab === "deleted"
    ? "There are no soft-deleted or archived operator records in this organization."
    : `Provision credentials and security permissions for ${selectedOrganization?.name || "this agency"}.`;

  const emptyActionLabel =
    searchQuery ? "Clear Search" : currentTab === "deleted" ? undefined : "Add First Operator";
  const emptyActionHandler =
    searchQuery ? () => setSearchQuery("") : currentTab === "deleted" ? undefined : handleCreateClick;

  // Table Columns Definition matching Regions & Depots Page
  const columns: ColumnDef<ILoggedUser>[] = useMemo(
    () => [
      {
        id: "operator",
        header: "Operator",
        width: "280px",
        cell: (user) => {
          const isMe = user.id === loggedInUser?.id;

          return (
            <HStack gap="3" minW="0" maxW={{ base: "180px", md: "260px", lg: "340px" }}>
              <Avatar.Root
                size="sm"
                shape="rounded"
                borderWidth="1px"
                borderColor="blue.muted"
                bg="blue.subtle"
                color="blue.fg"
                shrink="0"
              >
                <Avatar.Fallback fontSize="xs" fontWeight="700">
                  {getUserInitials(user.email)}
                </Avatar.Fallback>
              </Avatar.Root>
              <VStack align="start" gap="1" minW="0" flex="1">
                <HStack gap="1.5" minW="0" maxW="full">
                  <Text
                    fontWeight="600"
                    fontSize="xs"
                    color="fg.default"
                    truncate
                    maxW="full"
                    title={user.email || ""}
                  >
                    {user.email || "No Email"}
                  </Text>
                  {isMe && (
                    <Badge size="2xs" variant="subtle" colorPalette="green" borderRadius="xs" px="1.5">
                      You
                    </Badge>
                  )}
                  {user.deleted && (
                    <Badge size="xs" variant="subtle" colorPalette="red" borderRadius="xs" px="1.5" fontSize="9px">
                      Archived
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </HStack>
          );
        },
      },
      {
        id: "role",
        header: "System Role",
        sortable: true,
        width: "170px",
        cell: (user) => {
          const roleName = user.role?.name || "";
          const palette =
            roleName === "master"
              ? "purple"
              : roleName === "organization_admin"
              ? "blue"
              : roleName === "region_admin"
              ? "cyan"
              : roleName === "depot_admin"
              ? "teal"
              : "indigo";

          const IconComponent =
            roleName === "master"
              ? ShieldCheck
              : roleName === "organization_admin"
              ? Building2
              : roleName === "region_admin"
              ? Globe
              : roleName === "depot_admin"
              ? Building
              : UserCheck;

          return (
            <Badge
              size="xs"
              variant="subtle"
              colorPalette={palette}
              borderRadius="xs"
              px="2"
              py="0.5"
            >
              <HStack gap="1">
                <IconComponent size={11} />
                <Text fontWeight="600">{formatRoleName(roleName)}</Text>
              </HStack>
            </Badge>
          );
        },
      },
      {
        id: "scope",
        header: "Territorial Scope",
        sortable: true,
        width: "230px",
        cell: (user) => {
          if (user.depot) {
            return (
              <HStack gap="1.5" wrap="wrap">
                <Badge size="xs" variant="subtle" colorPalette="teal" borderRadius="xs" px="2" py="0.5">
                  <HStack gap="1">
                    <Building size={10} />
                    <Text truncate maxW="130px" title={user.depot.name}>{user.depot.name}</Text>
                  </HStack>
                </Badge>
                {user.region && (
                  <Badge size="xs" variant="subtle" colorPalette="cyan" borderRadius="xs" px="1.5" py="0.5">
                    <HStack gap="1">
                      <Globe size={10} />
                      <Text truncate maxW="90px" title={user.region.name}>{user.region.name}</Text>
                    </HStack>
                  </Badge>
                )}
              </HStack>
            );
          }
          if (user.region) {
            return (
              <Badge size="xs" variant="subtle" colorPalette="cyan" borderRadius="xs" px="2" py="0.5">
                <HStack gap="1">
                  <Globe size={10} />
                  <Text truncate maxW="160px" title={user.region.name}>{user.region.name}</Text>
                </HStack>
              </Badge>
            );
          }
          return (
            <Badge size="xs" variant="subtle" colorPalette="purple" borderRadius="xs" px="2" py="0.5">
              <HStack gap="1">
                <Building2 size={10} />
                <Text truncate maxW="160px" title={user.organization?.name || "Agency-Wide"}>
                  {user.organization?.name || "Agency-Wide"}
                </Text>
              </HStack>
            </Badge>
          );
        },
      },
      {
        id: "modules",
        header: "Module Access",
        width: "210px",
        cell: (user) => (
          <HStack gap="1.5">
            <Badge
              size="xs"
              variant="subtle"
              colorPalette={user.PIS ? "blue" : "gray"}
              borderRadius="xs"
              px="2"
              py="0.5"
              opacity={user.PIS ? 1 : 0.45}
              title={user.PIS ? "Passenger Information System: Active" : "PIS: Disabled"}
            >
              <HStack gap="1">
                <Tv size={10} />
                <Text fontWeight="600">PIS</Text>
              </HStack>
            </Badge>
            <Badge
              size="xs"
              variant="subtle"
              colorPalette={user.PAS ? "orange" : "gray"}
              borderRadius="xs"
              px="2"
              py="0.5"
              opacity={user.PAS ? 1 : 0.45}
              title={user.PAS ? "Public Address System: Active" : "PAS: Disabled"}
            >
              <HStack gap="1">
                <Volume2 size={10} />
                <Text fontWeight="600">PAS</Text>
              </HStack>
            </Badge>
            <Badge
              size="xs"
              variant="subtle"
              colorPalette={user.ITMS ? "purple" : "gray"}
              borderRadius="xs"
              px="2"
              py="0.5"
              opacity={user.ITMS ? 1 : 0.45}
              title={user.ITMS ? "Intelligent Transit Management: Active" : "ITMS: Disabled"}
            >
              <HStack gap="1">
                <Cpu size={10} />
                <Text fontWeight="600">ITMS</Text>
              </HStack>
            </Badge>
          </HStack>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "active",
        sortable: true,
        width: "120px",
        cell: (user) => {
          if (user.deleted) {
            return (
              <Badge size="xs" variant="subtle" colorPalette="red" borderRadius="xs" px="2" py="0.5">
                <HStack gap="1">
                  <Trash2 size={10} />
                  <Text fontWeight="600">Archived</Text>
                </HStack>
              </Badge>
            );
          }
          if (user.active) {
            return (
              <Badge size="xs" variant="subtle" colorPalette="green" borderRadius="xs" px="2" py="0.5">
                <HStack gap="1.5">
                  <Box w="5px" h="5px" borderRadius="full" bg="green.500" />
                  <Text fontWeight="600">Active</Text>
                </HStack>
              </Badge>
            );
          }
          return (
            <Badge size="xs" variant="subtle" colorPalette="amber" borderRadius="xs" px="2" py="0.5">
              <HStack gap="1.5">
                <Box w="5px" h="5px" borderRadius="full" bg="amber.500" />
                <Text fontWeight="600">Inactive</Text>
              </HStack>
            </Badge>
          );
        },
      },
      {
        id: "created_at",
        header: "Created",
        accessorKey: "created_at",
        sortable: true,
        width: "130px",
        cell: (user) => (
          <Badge size="xs" variant="subtle" colorPalette="gray" borderRadius="xs" px="2" py="0.5">
            <HStack gap="1">
              <Calendar size={10} />
              <Text fontWeight="500">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </Text>
            </HStack>
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        width: currentTab === "deleted" ? "120px" : "110px",
        align: "right",
        cell: (user) => {
          const isMe = user.id === loggedInUser?.id;

          if (currentTab === "deleted" || user.deleted) {
            return (
              <Button
                size="xs"
                variant="outline"
                colorPalette="green"
                borderRadius="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestoreClick(user);
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
                aria-label="Copy Email"
                color="fg.muted"
                _hover={{ color: "fg.default", bg: "bg.subtle" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyEmail(user.email, user.id);
                }}
              >
                {copiedId === user.id ? (
                  <Check size={13} color="var(--chakra-colors-green-600)" />
                ) : (
                  <Copy size={13} />
                )}
              </IconButton>
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Edit User"
                color="fg.muted"
                _hover={{ color: "fg.default", bg: "bg.subtle" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(user);
                }}
              >
                <Pencil size={13} />
              </IconButton>
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Deactivate User"
                color="red.600"
                _hover={{ bg: "red.500/10" }}
                disabled={isMe}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(user);
                }}
              >
                <Trash2 size={13} />
              </IconButton>
            </HStack>
          );
        },
      },
    ],
    [loggedInUser?.id, copiedId, currentTab]
  );

  // Guidance screen if no agency is selected (matching DepotsPage)
  if (!selectedOrganization?.id) {
    return (
      <Box w="full">
        <PageHeader
          title="Operators & Users"
          description="Manage user accounts, roles, and module access permissions"
          breadcrumbs={[
            { label: "Home", href: "/home" },
            { label: "Users" },
          ]}
        />
        <EmptyState
          title="Select an Organization"
          description="Please choose a transport agency from the top switcher bar to view and manage its user accounts."
        />
      </Box>
    );
  }

  return (
    <Box w="full">
      {/* 1. Page Header matching Regions & Depots Page */}
      <PageHeader
        title="Operators & Users"
        description={`Manage operator credentials, roles, and module access permissions for ${selectedOrganization.name}`}
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Users" },
        ]}
        badge={`${activeCount} Operational`}
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
                toast.success("User directory refreshed successfully");
              }}
              loading={isCurrentLoading}
            >
              <RotateCw size={13} style={{ marginRight: "5px" }} />
              Refresh
            </Button>
            <Button
              size="xs"
              colorPalette="blue"
              borderRadius="sm"
              fontWeight="600"
              onClick={handleCreateClick}
            >
              <Plus size={14} style={{ marginRight: "4px" }} />
              Add Operator
            </Button>
          </HStack>
        }
      />

      {/* 2. Operational Metrics Cards */}
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 3, xl: isSuperAdmin && deletedCount > 0 ? 5 : 4 }}
        gap="3.5"
        mb="6"
      >
        <StatCard
          label="Total Operators"
          value={totalCount}
          description="Provisioned personnel accounts"
          icon={<Users size={16} />}
          iconColorPalette="blue"
          badge={{ label: `${activeRatio}% Active`, colorPalette: "blue" }}
          progress={{ value: activeRatio, label: "Enabled", colorPalette: "blue" }}
        />
        <StatCard
          label="Active Accounts"
          value={activeCount}
          valueColor="green.600"
          description={`${activeCount} of ${totalCount} operational`}
          icon={<UserCheck size={16} />}
          iconColorPalette="green"
          badge={{ label: "Operational", colorPalette: "green" }}
          progress={{ value: activeRatio, label: "Active Ratio", colorPalette: "green" }}
        />
        <StatCard
          label="Admin Governance"
          value={adminCount}
          valueColor="purple.600"
          description="Super & Org administrators"
          icon={<ShieldCheck size={16} />}
          iconColorPalette="purple"
          badge={{ label: "Super / Org", colorPalette: "purple" }}
          progress={{
            value: totalCount > 0 ? Math.round((adminCount / totalCount) * 100) : 0,
            label: "Admin Ratio",
            colorPalette: "purple",
          }}
        />
        <StatCard
          label="Field & Depot Staff"
          value={fieldStaffCount}
          valueColor="cyan.600"
          description="Regional & depot staff"
          icon={<Radio size={16} />}
          iconColorPalette="cyan"
          badge={{ label: "Operations", colorPalette: "cyan" }}
          progress={{
            value: totalCount > 0 ? Math.round((fieldStaffCount / totalCount) * 100) : 0,
            label: "Field Ratio",
            colorPalette: "cyan",
          }}
        />
        {isSuperAdmin && deletedCount > 0 && (
          <StatCard
            label="Archived Accounts"
            value={deletedCount}
            valueColor="red.600"
            description="Soft-deleted accounts in archive"
            icon={<Trash2 size={16} />}
            iconColorPalette="red"
            badge={{ label: "Archived", colorPalette: "red" }}
            progress={{ value: 100, label: "Recoverable", colorPalette: "red" }}
          />
        )}
      </SimpleGrid>

      {/* 3. Filter Bar & View Toggle matching DepotsPage */}
      <Card.Root size="sm" variant="outline" mb="4" bg="bg.panel" borderColor="border.default">
        <Card.Body p="3">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap="3"
          >
            {/* Left: Search Input and Role Filter */}
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
                      ? "Search archived operators..."
                      : "Search operators by email, role, depot..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="bg.subtle"
                  _focus={{ borderColor: "blue.500", bg: "bg.surface" }}
                />
              </InputGroup>

              {/* Role Filter Selector */}
              <Box minW="150px" maxW="190px" shrink="0">
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    bg="bg.subtle"
                    borderRadius="sm"
                  >
                    <option value="all">All Roles</option>
                    {isSuperAdmin && <option value="master">Super Admin</option>}
                    <option value="organization_admin">Org Admin</option>
                    <option value="region_admin">Region Admin</option>
                    <option value="depot_admin">Depot Admin</option>
                    <option value="user">Operator</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Box>
            </HStack>

            {/* Right: Status Tabs & View Mode Switcher */}
            <HStack gap="3" justify={{ base: "space-between", md: "flex-end" }} wrap="wrap">
              {/* Status Tabs */}
              <Tabs.Root
                value={currentTab}
                onValueChange={(e) => setCurrentTab(e.value as any)}
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
                  <Tabs.Trigger value="active">
                    Active ({activeUsers.length})
                  </Tabs.Trigger>
                  {isSuperAdmin && (
                    <Tabs.Trigger value="deleted" colorPalette="red">
                      <HStack gap="1.5">
                        <Trash2 size={12} />
                        <Text>Archived ({deletedUsers.length})</Text>
                      </HStack>
                    </Tabs.Trigger>
                  )}
                </Tabs.List>
              </Tabs.Root>

              {/* View Mode Switcher */}
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

      {/* Super Admin Notice Banner for Archived Tab */}
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
                    Archived Operators Repository (Super Admin Access)
                  </Text>
                  <Text fontSize="11px" color="fg.muted">
                    These operator accounts have been deactivated. Click "Restore" on any record to reinstate active console access.
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

      {/* 4. Main Data Content: Table or Grid */}
      {viewMode === "table" ? (
        <DataTable<ILoggedUser>
          columns={columns}
          data={filteredUsers}
          keyExtractor={(user) => user.id || user.user_id}
          isLoading={isCurrentLoading}
          isError={isCurrentError}
          errorMessage="Could not connect to the database to load operator accounts."
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
              <Skeleton h="40px" w="full" mb="4" />
              <Skeleton h="16px" w="30%" />
            </Card.Root>
          ))}
        </SimpleGrid>
      ) : isCurrentError ? (
        <ErrorState
          message="Could not connect to the database to load operator accounts."
          onRetry={handleCurrentRetry}
        />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={emptyActionHandler}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="3.5">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id || user.user_id}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onRestore={handleRestoreClick}
              isCurrentLoggedInUser={user.id === loggedInUser?.id}
              isDeleted={currentTab === "deleted" || user.deleted}
            />
          ))}
        </SimpleGrid>
      )}

      {/* 5. Create / Edit User Drawer */}
      <CreateUserDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialData={editData}
        onUserSaved={() => {
          refetchActive();
          if (isSuperAdmin) refetchDeleted();
        }}
      />

      {/* 6. Deactivate / Delete Confirmation Dialog */}
      <Dialog.Root
        role="alertdialog"
        open={!!userToDelete}
        onOpenChange={(e) => {
          if (!isDeleting && !e.open) setUserToDelete(null);
        }}
        size="sm"
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="bg.panel" borderColor="border.default" boxShadow="2xl">
              <Dialog.Header pt="5" px="6" pb="2">
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
                  <Dialog.Title fontSize="md" fontWeight="600" color="fg.default">
                    Deactivate Operator Account
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              <Dialog.Body px="6" py="3">
                <VStack align="stretch" gap="3">
                  <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
                    Are you sure you want to deactivate operator{" "}
                    <Text as="span" fontWeight="600" color="fg.default">
                      "{userToDelete?.email}"
                    </Text>
                    ?
                  </Text>

                  {userToDelete?.id === loggedInUser?.id ? (
                    <Box
                      p="3"
                      bg="red.subtle"
                      borderRadius="sm"
                      borderWidth="1px"
                      borderColor="red.muted"
                    >
                      <HStack gap="2" align="flex-start">
                        <ShieldAlert size={15} color="var(--chakra-colors-red-600)" style={{ marginTop: "2px", flexShrink: 0 }} />
                        <Text fontSize="xs" color="red.fg" lineHeight="1.4">
                          <strong>Self-Deletion Barred:</strong> You cannot deactivate your own active session account.
                        </Text>
                      </HStack>
                    </Box>
                  ) : (
                    <Box
                      p="3"
                      bg="amber.subtle"
                      borderRadius="sm"
                      borderWidth="1px"
                      borderColor="amber.muted"
                    >
                      <Text fontSize="11px" color="amber.fg" lineHeight="1.4">
                        The user will immediately be barred from authenticating into the transit console. The account can be restored at any time by a Super Admin.
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Dialog.Body>

              <Dialog.Footer px="6" py="3.5" borderTopWidth="1px" borderColor="border.subtle" gap="2">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={isDeleting}
                    onClick={() => setUserToDelete(null)}
                  >
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  size="xs"
                  loading={isDeleting}
                  disabled={isDeleting || userToDelete?.id === loggedInUser?.id}
                  onClick={handleConfirmDelete}
                >
                  <Trash2 size={13} style={{ marginRight: "4px" }} />
                  Deactivate Account
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* 7. Restore Confirmation Dialog */}
      <Dialog.Root
        role="alertdialog"
        open={!!userToRestore}
        onOpenChange={(e) => {
          if (!isRestoring && !e.open) setUserToRestore(null);
        }}
        size="sm"
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="bg.panel" borderColor="border.default" boxShadow="2xl">
              <Dialog.Header pt="5" px="6" pb="2">
                <HStack gap="2.5">
                  <Box
                    w="32px"
                    h="32px"
                    borderRadius="sm"
                    bg="blue.subtle"
                    color="blue.fg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    shrink="0"
                  >
                    <RotateCcw size={18} />
                  </Box>
                  <Dialog.Title fontSize="md" fontWeight="600" color="fg.default">
                    Restore Operator Account
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              <Dialog.Body px="6" py="3">
                <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
                  Reactivate operator account{" "}
                  <Text as="span" fontWeight="600" color="fg.default">
                    "{userToRestore?.email}"
                  </Text>
                  ? The user will immediately be permitted to log in and access their assigned transit sectors.
                </Text>
              </Dialog.Body>

              <Dialog.Footer px="6" py="3.5" borderTopWidth="1px" borderColor="border.subtle" gap="2">
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={isRestoring}
                    onClick={() => setUserToRestore(null)}
                  >
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="blue"
                  size="xs"
                  loading={isRestoring}
                  disabled={isRestoring}
                  onClick={handleConfirmRestore}
                >
                  <RotateCcw size={13} style={{ marginRight: "4px" }} />
                  Restore Account
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
