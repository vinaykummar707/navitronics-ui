import React from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Tooltip,
  Portal,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { ROLES } from "@/constants/roles";
import AppOrgSwitcher from "./AppOrgSwitcher";
import {
  Bus,
  MapPin,
  Building,
  Globe,
  Building2,
  Users,
  ShieldCheck,
  Type,
  Wrench,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  CircleHelp,
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
    title: "Operations & Transit",
    items: [
      {
        label: "Routes",
        path: "/home/routes",
        icon: <Bus size={17} />,
        badge: "PIS",
        roles: [
          ROLES.DEPOT_ADMIN,
          ROLES.REGION_ADMIN,
          ROLES.ORGANIZATION_ADMIN,
          ROLES.MASTER,
        ],
      },
      {
        label: "Stops & Audio",
        path: "/home/stops",
        icon: <MapPin size={17} />,
        badge: "TTS",
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
        icon: <Building size={17} />,
        roles: [
          ROLES.REGION_ADMIN,
          ROLES.ORGANIZATION_ADMIN,
          ROLES.MASTER,
        ],
      },
      {
        label: "Regional Sectors",
        path: "/home/regions",
        icon: <Globe size={17} />,
        roles: [
          ROLES.REGION_ADMIN,
          ROLES.ORGANIZATION_ADMIN,
          ROLES.MASTER,
        ],
      },
    ],
  },
  {
    title: "Enterprise Governance",
    roles: [ROLES.MASTER],
    items: [
      {
        label: "Agencies & Orgs",
        path: "/home/organizations",
        icon: <Building2 size={17} />,
        roles: [ROLES.MASTER],
      },
      {
        label: "Operators & Users",
        path: "/home/users",
        icon: <Users size={17} />,
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
        icon: <ShieldCheck size={17} />,
        roles: [ROLES.MASTER],
      },
    ],
  },
  {
    title: "Hardware & Tools",
    items: [
      {
        label: "LED Matrix & Glyphs",
        path: "/home/font-configuration",
        icon: <Type size={17} />,
        roles: [
          ROLES.MASTER,
          ROLES.ORGANIZATION_ADMIN,
          ROLES.REGION_ADMIN,
          ROLES.DEPOT_ADMIN,
        ],
      },
      {
        label: "Diagnostics & Tools",
        path: "/home/utility",
        icon: <Wrench size={17} />,
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
  const userRole = user?.role?.name || "";

  const handleItemClick = (path: string) => {
    navigate(path);
    if (onNavigate) onNavigate();
  };

  const isRoleAllowed = (allowedRoles?: readonly string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (userRole === ROLES.MASTER) return true;
    return allowedRoles.includes(userRole);
  };

  return (
    <Box
      as="aside"
      w={isCollapsed ? "64px" : "240px"}
      h="full"
      bg="bg.surface"
      borderRightWidth="1px"
      borderColor="border.default"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      transition="width 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      py="3"
      px={isCollapsed ? "2" : "3"}
      shrink="0"
    >
      {/* Organization Selector */}
      <Box mb="3" pb="2.5" borderBottomWidth="1px" borderColor="border.subtle">
        <AppOrgSwitcher isCollapsed={isCollapsed} />
      </Box>

      {/* Top Nav Sections */}
      <VStack align="stretch" gap="5" overflowY="auto" overflowX="hidden" flex="1">
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
                    px="2.5"
                    mb="1.5"
                    fontSize="10px"
                    fontWeight="600"
                    color="fg.muted"
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                  >
                    {section.title}
                  </Text>
                )}

                <VStack align="stretch" gap="1">
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
                        px={isCollapsed ? "2" : "2.5"}
                        py="2"
                        borderRadius="sm"
                        display="flex"
                        alignItems="center"
                        justifyContent={isCollapsed ? "center" : "space-between"}
                        position="relative"
                        bg={isActive ? "blue.subtle" : "transparent"}
                        color={isActive ? "blue.600" : "fg.default"}
                        fontWeight={isActive ? "600" : "500"}
                        fontSize="xs"
                        _hover={{
                          bg: isActive ? "blue.subtle" : "bg.subtle",
                          color: isActive ? "blue.600" : "fg.default",
                        }}
                        transition="all 0.12s ease"
                        outline="none"
                        cursor="pointer"
                      >
                        {/* Active vertical accent bar */}
                        {isActive && (
                          <Box
                            position="absolute"
                            left="0"
                            top="15%"
                            bottom="15%"
                            w="3px"
                            borderRadius="2px"
                            bg="blue.600"
                          />
                        )}

                        <HStack gap="2.5" minW="0">
                          <Box
                            color={isActive ? "blue.600" : "fg.muted"}
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
                            size="xs"
                            variant="subtle"
                            colorPalette={isActive ? "blue" : "gray"}
                            borderRadius="xs"
                            px="1.5"
                            py="0.2"
                            fontSize="9px"
                            fontWeight="500"
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

      {/* Bottom Nav: Settings, Documentation, and Collapse Trigger */}
      <VStack
        align="stretch"
        gap="1"
        pt="3"
        borderTopWidth="1px"
        borderColor="border.default"
      >
        {/* Settings Button */}
        {(() => {
          const isSettingsActive = location.pathname === "/home/settings";
          const settingsBtn = (
            <Box
              as="button"
              onClick={() => handleItemClick("/home/settings")}
              w="full"
              px={isCollapsed ? "2" : "2.5"}
              py="2"
              borderRadius="sm"
              display="flex"
              alignItems="center"
              justifyContent={isCollapsed ? "center" : "flex-start"}
              bg={isSettingsActive ? "blue.subtle" : "transparent"}
              color={isSettingsActive ? "blue.600" : "fg.default"}
              fontWeight={isSettingsActive ? "600" : "500"}
              fontSize="xs"
              _hover={{
                bg: isSettingsActive ? "blue.subtle" : "bg.subtle",
                color: isSettingsActive ? "blue.600" : "fg.default",
              }}
              transition="all 0.12s ease"
              outline="none"
              cursor="pointer"
            >
              <HStack gap="2.5">
                <Box color={isSettingsActive ? "blue.600" : "fg.muted"}>
                  <Settings size={17} />
                </Box>
                {!isCollapsed && <Text>Settings</Text>}
              </HStack>
            </Box>
          );

          if (isCollapsed) {
            return (
              <Tooltip.Root positioning={{ placement: "right" }}>
                <Tooltip.Trigger asChild>
                  {settingsBtn}
                </Tooltip.Trigger>
                <Portal>
                  <Tooltip.Positioner>
                    <Tooltip.Content>Settings</Tooltip.Content>
                  </Tooltip.Positioner>
                </Portal>
              </Tooltip.Root>
            );
          }
          return settingsBtn;
        })()}

        {/* Collapse / Expand Toggle */}
        {onToggleCollapse && (
          <Box
            as="button"
            onClick={onToggleCollapse}
            w="full"
            px={isCollapsed ? "2" : "2.5"}
            py="2"
            borderRadius="sm"
            display={{ base: "none", md: "flex" }}
            alignItems="center"
            justifyContent={isCollapsed ? "center" : "flex-start"}
            color="fg.muted"
            fontSize="xs"
            fontWeight="500"
            _hover={{ bg: "bg.subtle", color: "fg.default" }}
            transition="all 0.12s ease"
            outline="none"
            cursor="pointer"
          >
            <HStack gap="2.5">
              {isCollapsed ? (
                <PanelLeftOpen size={17} />
              ) : (
                <PanelLeftClose size={17} />
              )}
              {!isCollapsed && <Text>Collapse sidebar</Text>}
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default AppSidebar;
