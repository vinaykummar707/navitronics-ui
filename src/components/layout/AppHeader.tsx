import React from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import AppOrgSwitcher from "./AppOrgSwitcher";
import AppUserMenu from "./AppUserMenu";
import {
  Menu as MenuIcon,
  Search,
  Bell,
  Radio,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileMenu,
}) => {
  const user = useLoggedUserStore((state) => state.user);
  const navigate = useNavigate();

  const userName = (() => {
    if (user?.email) {
      const prefix = user.email.split("@")[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return "Operator";
  })();

  return (
    <Box
      as="header"
      h={{ base: "64px", md: "76px" }}
      w="full"
      px={{ base: "4", md: "8" }}
      py="3"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      position="sticky"
      top="0"
      zIndex="10"
      bg="bg.workspace"
      borderBottomWidth="1px"
      borderColor="border.subtle"
    >
      {/* Left: Mobile Toggle & "Hello {Name} 👋" greeting */}
      <HStack gap="3" align="center">
        <IconButton
          size="sm"
          variant="ghost"
          borderRadius="full"
          aria-label="Toggle navigation menu"
          display={{ base: "flex", md: "none" }}
          onClick={onToggleMobileMenu}
        >
          <MenuIcon size={18} />
        </IconButton>

        <VStack align="start" gap="0">
          <HStack gap="1.5">
            <Text
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="800"
              color="fg.default"
              letterSpacing="-0.03em"
              lineHeight="1.2"
            >
              Hello {userName}
            </Text>
            <Text fontSize={{ base: "lg", md: "2xl" }} lineHeight="1.2">
              👋
            </Text>
          </HStack>
          <Text
            fontSize="xs"
            color="fg.muted"
            display={{ base: "none", sm: "block" }}
          >
            Transit Operations & Telematics Console
          </Text>
        </VStack>
      </HStack>

      {/* Right: "Choose Account ⬍" Org Switcher + Action Icons cluster */}
      <HStack gap={{ base: "2", md: "3" }} align="center">
        {/* Choose Account / Organization Switcher */}
        <AppOrgSwitcher variant="pill" />

        {/* Search Circular Button */}
        <IconButton
          size="sm"
          variant="subtle"
          borderRadius="full"
          bg="bg.subtle"
          color="fg.muted"
          _hover={{ bg: "bg.muted", color: "fg.default" }}
          aria-label="Search"
          display={{ base: "none", sm: "inline-flex" }}
        >
          <Search size={15} />
        </IconButton>

        {/* Notifications Circular Button */}
        <Box position="relative">
          <IconButton
            size="sm"
            variant="subtle"
            borderRadius="full"
            bg="bg.subtle"
            color="fg.muted"
            _hover={{ bg: "bg.muted", color: "fg.default" }}
            aria-label="Notifications"
          >
            <Bell size={15} />
          </IconButton>
          <Box
            position="absolute"
            top="7px"
            right="7px"
            w="6px"
            h="6px"
            borderRadius="full"
            bg="blue.500"
          />
        </Box>

        {/* Live Gateway Indicator Button */}
        <IconButton
          size="sm"
          variant="subtle"
          borderRadius="full"
          bg="bg.subtle"
          color="green.500"
          _hover={{ bg: "bg.muted" }}
          aria-label="Live Telemetry Status"
          title="Live Telemetry Stream Active"
          display={{ base: "none", md: "inline-flex" }}
        >
          <Radio size={15} />
        </IconButton>

        {/* Settings Quick Icon */}
        <IconButton
          size="sm"
          variant="subtle"
          borderRadius="full"
          bg="bg.subtle"
          color="fg.muted"
          _hover={{ bg: "bg.muted", color: "fg.default" }}
          aria-label="Account Settings"
          onClick={() => navigate("/home/settings")}
          display={{ base: "none", md: "inline-flex" }}
        >
          <Settings size={15} />
        </IconButton>

        {/* User Profile Avatar Menu */}
        <AppUserMenu />
      </HStack>
    </Box>
  );
};

export default AppHeader;
