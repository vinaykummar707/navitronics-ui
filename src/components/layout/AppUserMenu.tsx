import React from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Avatar,
  Menu,
  Portal,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { ROLES } from "@/constants/roles";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { toast } from "react-toastify";
import {
  LogOut,
  Sun,
  Moon,
  Shield,
  ChevronsUpDown,
  Settings,
  User,
} from "lucide-react";

interface AppUserMenuProps {
  isCollapsed?: boolean;
}

export const AppUserMenu: React.FC<AppUserMenuProps> = ({ isCollapsed = false }) => {
  const user = useLoggedUserStore((state) => state.user);
  const logout = useLoggedUserStore((state) => state.logout);
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleLogout = async () => {
    try {
      localStorage.clear();
      logout();
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      navigate("/login");
    }
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

  return (
    <Menu.Root positioning={{ placement: "bottom-end", gutter: 4 }}>
      <Menu.Trigger asChild>
        <Box
          as="button"
          p="0.5"
          borderRadius="full"
          bg="transparent"
          borderWidth="1.5px"
          borderColor="border.default"
          transition="all 0.15s ease"
          _hover={{ borderColor: "blue.500" }}
          cursor="pointer"
          outline="none"
          display="flex"
          alignItems="center"
          justifyContent="center"
          aria-label={`User menu for ${userEmail}`}
        >
          <Avatar.Root
            size="xs"
            colorPalette="blue"
            shape="full"
          >
            <Avatar.Fallback name={userEmail}>
              {userInitial}
            </Avatar.Fallback>
          </Avatar.Root>
        </Box>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content
            minW="220px"
            bg="bg.surface"
            borderColor="border.default"
            borderRadius="sm"
            p="1"
          >
            {/* User Card Header */}
            <Box px="2.5" py="2">
              <HStack gap="2">
                <Avatar.Root size="xs" colorPalette="blue" shape="rounded">
                  <Avatar.Fallback name={userEmail}>
                    {userInitial}
                  </Avatar.Fallback>
                </Avatar.Root>
                <VStack align="start" gap="0" minW="0">
                  <Text fontSize="xs" fontWeight="600" color="fg.default" truncate maxW="150px">
                    {userEmail}
                  </Text>
                  <HStack gap="1">
                    <Badge size="xs" colorPalette="blue" variant="subtle" borderRadius="xs" px="1.5" fontSize="9px">
                      {roleDisplay}
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>
            </Box>

            <Menu.Separator borderColor="border.subtle" my="1" />

            <Menu.Item
              value="profile"
              borderRadius="xs"
              px="2.5"
              py="1.5"
              cursor="pointer"
              _hover={{ bg: "bg.subtle" }}
              onClick={() => navigate("/home/settings")}
            >
              <HStack gap="2">
                <User size={14} color="var(--chakra-colors-fg-muted)" />
                <Text fontSize="xs" color="fg.default">Account Settings</Text>
              </HStack>
            </Menu.Item>

            <Menu.Item
              value="theme"
              borderRadius="xs"
              px="2.5"
              py="1.5"
              cursor="pointer"
              _hover={{ bg: "bg.subtle" }}
              onClick={toggleColorMode}
            >
              <HStack justify="space-between" w="full">
                <HStack gap="2">
                  {colorMode === "dark" ? (
                    <Sun size={14} color="var(--chakra-colors-fg-muted)" />
                  ) : (
                    <Moon size={14} color="var(--chakra-colors-fg-muted)" />
                  )}
                  <Text fontSize="xs" color="fg.default">Theme</Text>
                </HStack>
                <Text fontSize="10px" color="fg.muted" textTransform="capitalize">
                  {colorMode}
                </Text>
              </HStack>
            </Menu.Item>

            <Menu.Separator borderColor="border.subtle" my="1" />

            <Menu.Item
              value="logout"
              borderRadius="xs"
              px="2.5"
              py="1.5"
              cursor="pointer"
              _hover={{ bg: "red.500/10" }}
              onClick={handleLogout}
            >
              <HStack gap="2">
                <LogOut size={14} color="var(--chakra-colors-red-600)" />
                <Text fontSize="xs" color="red.600" fontWeight="500">
                  Sign out
                </Text>
              </HStack>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default AppUserMenu;
