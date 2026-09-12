import React from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Avatar,
  IconButton,
  Tooltip,
  Portal,
  Separator,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { ROLES } from "@/constants/roles";
import { useColorMode } from "@/components/ui/color-mode";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/supabaseClient";
import { toast } from "react-toastify";
import {
  Bus,
  Building,
  Globe,
  Building2,
  Users,
  ShieldCheck,
  Type,
  Wrench,
  Settings,
  HelpCircle,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Sparkles,
} from "lucide-react";

interface NavItemConfig {
  label: string;
  path: string;
  icon: React.ReactElement;
  roles?: readonly string[];
  badge?: string;
}

interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
  roles?: readonly string[];
}

const NAV_SECTIONS: NavSectionConfig[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Routes",
        path: "/home/routes",
        icon: <Bus size={18} strokeWidth={2.2} />,
        badge: "PIS",
        roles: [
          ROLES.DEPOT_ADMIN,
          ROLES.REGION_ADMIN,
          ROLES.ORGANIZATION_ADMIN,
          ROLES.MASTER,
        ],
      },
      {
        label: "Depots & Fleet",
        path: "/home/depots",
        icon: <Building size={18} strokeWidth={2.2} />,
        roles: [
          ROLES.REGION_ADMIN,
          ROLES.ORGANIZATION_ADMIN,
          ROLES.MASTER,
        ],
      },
      {
        label: "Regional Sectors",
        path: "/home/regions",
        icon: <Globe size={18} strokeWidth={2.2} />,
        roles: [
          ROLES.REGION_ADMIN,
          ROLES.ORGANIZATION_ADMIN,
          ROLES.MASTER,
        ],
      },
    ],
  },
  {
    title: "Governance",
    roles: [ROLES.MASTER],
    items: [
      {
        label: "Agencies & Orgs",
        path: "/home/organizations",
        icon: <Building2 size={18} strokeWidth={2.2} />,
        roles: [ROLES.MASTER],
      },
      {
        label: "Operators & Users",
        path: "/home/users",
        icon: <Users size={18} strokeWidth={2.2} />,
        roles: [
          ROLES.MASTER,
          ROLES.ORGANIZATION_ADMIN,
          ROLES.REGION_ADMIN,
          ROLES.DEPOT_ADMIN,
        ],
      },
      {
        label: "RBAC Governance",
        path: "/home/roles",
        icon: <ShieldCheck size={18} strokeWidth={2.2} />,
        roles: [ROLES.MASTER],
      },
    ],
  },
  {
    title: "Hardware & Tools",
    items: [
      {
        label: "LED Matrix",
        path: "/home/font-configuration",
        icon: <Type size={18} strokeWidth={2.2} />,
        roles: [
          ROLES.MASTER,
          ROLES.ORGANIZATION_ADMIN,
          ROLES.REGION_ADMIN,
          ROLES.DEPOT_ADMIN,
        ],
      },
      {
        label: "Diagnostics",
        path: "/home/utility",
        icon: <Wrench size={18} strokeWidth={2.2} />,
        roles: [
          ROLES.MASTER,
          ROLES.ORGANIZATION_ADMIN,
          ROLES.REGION_ADMIN,
          ROLES.DEPOT_ADMIN,
        ],
      },
    ],
  },
];

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onNavigate,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useLoggedUserStore((state) => state.user);
  const logout = useLoggedUserStore((state) => state.logout);
  const userRole = user?.role?.name || "";
  const { colorMode, toggleColorMode } = useColorMode();

  const handleItemClick = (path: string) => {
    navigate(path);
    if (onNavigate) onNavigate();
  };

  const handleLogout = async () => {
    try {
      localStorage.clear();
      logout();
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  const isRoleAllowed = (allowedRoles?: readonly string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (userRole === ROLES.MASTER) return true;
    return allowedRoles.includes(userRole);
  };

  const roleDisplay = (() => {
    if (!user?.role?.name) return "Operator";
    if (user.role.name === ROLES.MASTER) return "Super Admin";
    return user.role.name
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  })();

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";
  const userEmail = user?.email || "operator@navitronix.in";
  const userName = (() => {
    if (user?.email) {
      const prefix = user.email.split("@")[0];
      return prefix
        .split(".")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
    }
    return "Operator";
  })();

  return (
    <Box
      as="aside"
      w={isCollapsed ? "72px" : "240px"}
      h="full"
      bg="bg.shell"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      py="5"
      px={isCollapsed ? "2.5" : "4"}
      userSelect="none"
    >
      {/* Top: Brand Logo + User Profile Widget */}
      <VStack align="stretch" gap="5" shrink="0">
        {/* Brand Mark (Logo icon + Navitronix) */}
        <HStack
          gap="2.5"
          align="center"
          justify={isCollapsed ? "center" : "flex-start"}
          px={isCollapsed ? "0" : "2"}
          cursor="pointer"
          onClick={() => handleItemClick("/home/routes")}
        >
          <Box
            w="32px"
            h="32px"
            borderRadius="xl"
            bg="fg.default"
            color="bg.workspace"
            display="flex"
            alignItems="center"
            justifyContent="center"
            shrink="0"
            shadow="sm"
          >
            <Layers size={18} strokeWidth={2.4} />
          </Box>

          {!isCollapsed && (
            <Text
              fontSize="lg"
              fontWeight="800"
              color="fg.default"
              letterSpacing="-0.03em"
              lineHeight="1"
            >
              Navitronix
            </Text>
          )}
        </HStack>

        {/* User Profile Cardlet matching Darrell Steward widget in mockup */}
        <Box
          p={isCollapsed ? "1" : "3"}
          borderRadius="2xl"
          bg={isCollapsed ? "transparent" : "bg.workspace"}
          borderWidth={isCollapsed ? "0" : "1px"}
          borderColor="border.subtle"
          shadow={isCollapsed ? "none" : "pill"}
          transition="all 0.15s ease"
        >
          {isCollapsed ? (
            <Tooltip.Root positioning={{ placement: "right" }}>
              <Tooltip.Trigger asChild>
                <Box display="flex" justifyContent="center">
                  <Avatar.Root
                    size="sm"
                    colorPalette="pink"
                    shape="full"
                    borderWidth="2px"
                    borderColor="pink.400"
                  >
                    <Avatar.Fallback name={userEmail}>
                      {userInitial}
                    </Avatar.Fallback>
                  </Avatar.Root>
                </Box>
              </Tooltip.Trigger>
              <Portal>
                <Tooltip.Positioner>
                  <Tooltip.Content>
                    {userName} ({roleDisplay})
                  </Tooltip.Content>
                </Tooltip.Positioner>
              </Portal>
            </Tooltip.Root>
          ) : (
            <VStack align="center" gap="2" textAlign="center">
              <Box position="relative">
                <Avatar.Root
                  size="md"
                  colorPalette="pink"
                  shape="full"
                  borderWidth="2.5px"
                  borderColor="pink.400"
                  shadow="sm"
                >
                  <Avatar.Fallback name={userEmail} fontSize="sm" fontWeight="700">
                    {userInitial}
                  </Avatar.Fallback>
                </Avatar.Root>
              </Box>

              <VStack align="center" gap="0">
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="fg.default"
                  letterSpacing="-0.01em"
                  truncate
                  maxW="180px"
                >
                  {userName}
                </Text>
                <Text fontSize="xs" color="fg.muted" fontWeight="500">
                  {roleDisplay}
                </Text>
              </VStack>
            </VStack>
          )}
        </Box>
      </VStack>

      {/* Middle: Navigation Sections */}
      <VStack
        align="stretch"
        gap="4"
        overflowY="auto"
        overflowX="hidden"
        flex="1"
        my="3"
        pt="1"
      >
        {NAV_SECTIONS.filter((section) => isRoleAllowed(section.roles)).map(
          (section) => {
            const visibleItems = section.items.filter((item) =>
              isRoleAllowed(item.roles)
            );

            if (visibleItems.length === 0) return null;

            return (
              <Box key={section.title}>
                {!isCollapsed && (
                  <Text
                    px="2"
                    mb="2"
                    fontSize="11px"
                    fontWeight="700"
                    color="fg.subtle"
                    letterSpacing="0.05em"
                    textTransform="uppercase"
                  >
                    {section.title}
                  </Text>
                )}

                <VStack align="stretch" gap="1.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== "/home" &&
                        location.pathname.startsWith(item.path));

                    const buttonContent = (
                      <Box
                        as="button"
                        key={item.path}
                        onClick={() => handleItemClick(item.path)}
                        w="full"
                        px={isCollapsed ? "2" : "3"}
                        py="2"
                        borderRadius="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent={isCollapsed ? "center" : "space-between"}
                        position="relative"
                        bg={isActive ? "bg.workspace" : "transparent"}
                        color={isActive ? "fg.default" : "fg.muted"}
                        fontWeight={isActive ? "700" : "500"}
                        fontSize="sm"
                        shadow={isActive ? "pill" : "none"}
                        _hover={{
                          bg: isActive ? "bg.workspace" : "bg.workspace/60",
                          color: "fg.default",
                        }}
                        transition="all 0.12s ease"
                        outline="none"
                        cursor="pointer"
                      >
                        <HStack gap="3" minW="0">
                          <Box
                            color={isActive ? "blue.500" : "fg.muted"}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            shrink="0"
                          >
                            {item.icon}
                          </Box>

                          {!isCollapsed && (
                            <Text truncate textAlign="left" lineHeight="1.2">
                              {item.label}
                            </Text>
                          )}
                        </HStack>

                        {!isCollapsed && item.badge && (
                          <Badge
                            colorPalette={isActive ? "blue" : "gray"}
                            variant="subtle"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Box>
                    );

                    if (isCollapsed) {
                      return (
                        <Tooltip.Root
                          key={item.path}
                          positioning={{ placement: "right" }}
                        >
                          <Tooltip.Trigger asChild>
                            {buttonContent}
                          </Tooltip.Trigger>
                          <Portal>
                            <Tooltip.Positioner>
                              <Tooltip.Content>{item.label}</Tooltip.Content>
                            </Tooltip.Positioner>
                          </Portal>
                        </Tooltip.Root>
                      );
                    }

                    return buttonContent;
                  })}
                </VStack>
              </Box>
            );
          }
        )}
      </VStack>

      {/* Bottom Controls: Support, Setting, Theme Switch, Sign Out matching mockup */}
      <VStack
        align="stretch"
        gap="1"
        pt="3"
        borderTopWidth="1px"
        borderColor="border.subtle"
        shrink="0"
      >
        {/* Support Link */}
        <Box
          as="button"
          onClick={() => handleItemClick("/home/utility")}
          w="full"
          px={isCollapsed ? "2" : "3"}
          py="2"
          borderRadius="xl"
          display="flex"
          alignItems="center"
          justifyContent={isCollapsed ? "center" : "flex-start"}
          color="fg.muted"
          _hover={{ bg: "bg.workspace/60", color: "fg.default" }}
          transition="all 0.12s ease"
          outline="none"
          cursor="pointer"
        >
          <HStack gap="3">
            <HelpCircle size={18} strokeWidth={2} />
            {!isCollapsed && (
              <Text fontSize="sm" fontWeight="500">
                Support
              </Text>
            )}
          </HStack>
        </Box>

        {/* Setting Link */}
        <Box
          as="button"
          onClick={() => handleItemClick("/home/settings")}
          w="full"
          px={isCollapsed ? "2" : "3"}
          py="2"
          borderRadius="xl"
          display="flex"
          alignItems="center"
          justifyContent={isCollapsed ? "center" : "flex-start"}
          color="fg.muted"
          _hover={{ bg: "bg.workspace/60", color: "fg.default" }}
          transition="all 0.12s ease"
          outline="none"
          cursor="pointer"
        >
          <HStack gap="3">
            <Settings size={18} strokeWidth={2} />
            {!isCollapsed && (
              <Text fontSize="sm" fontWeight="500">
                Setting
              </Text>
            )}
          </HStack>
        </Box>

        {/* Theme Toggle matching iOS-style switch row in mockup */}
        <Box
          w="full"
          px={isCollapsed ? "2" : "3"}
          py="2"
          display="flex"
          alignItems="center"
          justifyContent={isCollapsed ? "center" : "space-between"}
        >
          {!isCollapsed ? (
            <>
              <Text fontSize="sm" fontWeight="500" color="fg.muted">
                Theme
              </Text>
              <Switch
                checked={colorMode === "dark"}
                onCheckedChange={toggleColorMode}
                size="sm"
                colorPalette="blue"
              />
            </>
          ) : (
            <Tooltip.Root positioning={{ placement: "right" }}>
              <Tooltip.Trigger asChild>
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label="Toggle theme"
                  onClick={toggleColorMode}
                >
                  <Sparkles size={16} />
                </IconButton>
              </Tooltip.Trigger>
              <Portal>
                <Tooltip.Positioner>
                  <Tooltip.Content>
                    Theme: {colorMode === "dark" ? "Dark" : "Light"}
                  </Tooltip.Content>
                </Tooltip.Positioner>
              </Portal>
            </Tooltip.Root>
          )}
        </Box>

        {/* Sign Out Row matching mockup */}
        <Box
          as="button"
          onClick={handleLogout}
          w="full"
          px={isCollapsed ? "2" : "3"}
          py="2"
          borderRadius="xl"
          display="flex"
          alignItems="center"
          justifyContent={isCollapsed ? "center" : "space-between"}
          color="fg.muted"
          _hover={{ bg: "red.500/10", color: "red.500" }}
          transition="all 0.12s ease"
          outline="none"
          cursor="pointer"
        >
          {!isCollapsed ? (
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" fontWeight="500">
                Sign out
              </Text>
              <LogOut size={16} />
            </HStack>
          ) : (
            <Tooltip.Root positioning={{ placement: "right" }}>
              <Tooltip.Trigger asChild>
                <LogOut size={18} />
              </Tooltip.Trigger>
              <Portal>
                <Tooltip.Positioner>
                  <Tooltip.Content>Sign out</Tooltip.Content>
                </Tooltip.Positioner>
              </Portal>
            </Tooltip.Root>
          )}
        </Box>

        {/* Collapse / Expand Toggle Button on desktop */}
        {onToggleCollapse && (
          <Box
            as="button"
            onClick={onToggleCollapse}
            w="full"
            px={isCollapsed ? "2" : "3"}
            py="1.5"
            borderRadius="xl"
            display={{ base: "none", md: "flex" }}
            alignItems="center"
            justifyContent={isCollapsed ? "center" : "flex-start"}
            color="fg.subtle"
            _hover={{ color: "fg.muted" }}
            transition="all 0.12s ease"
            outline="none"
            cursor="pointer"
          >
            <HStack gap="2.5">
              {isCollapsed ? (
                <PanelLeftOpen size={16} />
              ) : (
                <PanelLeftClose size={16} />
              )}
              {!isCollapsed && (
                <Text fontSize="xs" fontWeight="500">
                  Collapse
                </Text>
              )}
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default AppSidebar;
