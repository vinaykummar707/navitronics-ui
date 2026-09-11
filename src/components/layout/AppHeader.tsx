import React from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Badge,
  IconButton,
  Input,
  Kbd,
  InputGroup,
} from "@chakra-ui/react";
import { ColorModeButton } from "@/components/ui/color-mode";
import AppUserMenu from "./AppUserMenu";
import {
  Menu as MenuIcon,
  Search,
  Bell,
  Radio,
  Layers,
} from "lucide-react";

interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileMenu,
}) => {
  return (
    <Box
      as="header"
      h="56px"
      w="full"
      px="4"
      bg="bg.surface"
      borderBottomWidth="1px"
      borderColor="border.default"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      position="sticky"
      top="0"
      zIndex="20"
    >
      {/* Left: Mobile menu toggle + Brand Mark + Org Switcher */}
      <HStack gap="3" align="center">
        {/* Mobile menu button */}
        <IconButton
          size="sm"
          variant="ghost"
          aria-label="Toggle navigation menu"
          display={{ base: "flex", md: "none" }}
          onClick={onToggleMobileMenu}
          borderRadius="xs"
        >
          <MenuIcon size={18} />
        </IconButton>

        {/* Brand Logo & Name */}
        <HStack gap="2.5" align="center">
          <Box
            w="28px"
            h="28px"
            borderRadius="xs"
            bg="blue.600"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            shrink="0"
          >
            <Layers size={16} strokeWidth={2.4} />
          </Box>
          <Text
            fontSize="sm"
            fontWeight="700"
            color="fg.default"
            letterSpacing="-0.02em"
            lineHeight="1"
          >
            Navitronix
          </Text>
        </HStack>
      </HStack>

      {/* Center: Global Search Bar */}
      <Box
        flex="1"
        maxW="420px"
        mx="4"
        display={{ base: "none", md: "block" }}
      >
        <InputGroup
          startElement={<Search size={14} color="var(--chakra-colors-fg-muted)" />}
          endElement={<Kbd size="sm" fontSize="10px">⌘K</Kbd>}
          w="full"
        >
          <Input
            placeholder="Search routes, stops, agencies... (⌘K)"
            size="sm"
            borderRadius="md"
            bg="bg.subtle"
            borderWidth="1px"
            borderColor="border.default"
            _hover={{ borderColor: "blue.500" }}
            _focus={{
              borderColor: "blue.500",
              outline: "none",
              bg: "bg.surface",
            }}
          />
        </InputGroup>
      </Box>

      {/* Right: Connectivity Indicator + Notifications + Theme + User Menu */}
      <HStack gap="2" align="center">
        {/* System online indicator */}
        <HStack
          gap="1.5"
          px="2"
          py="1"
          borderRadius="xs"
          bg="bg.subtle"
          borderWidth="1px"
          borderColor="border.subtle"
          display={{ base: "none", lg: "flex" }}
        >
          <Box w="6px" h="6px" borderRadius="full" bg="green.500" />
          <Text fontSize="11px" fontWeight="500" color="fg.muted">
            Live Gateway
          </Text>
        </HStack>

        {/* Notifications Icon */}
        <Box position="relative">
          <IconButton
            size="xs"
            variant="ghost"
            aria-label="Notifications"
            borderRadius="xs"
            color="fg.muted"
            _hover={{ color: "fg.default", bg: "bg.subtle" }}
          >
            <Bell size={15} />
          </IconButton>
          {/* Unread indicator dot */}
          <Box
            position="absolute"
            top="5px"
            right="5px"
            w="5px"
            h="5px"
            borderRadius="full"
            bg="blue.500"
          />
        </Box>

        {/* Color Mode Toggle */}
        <ColorModeButton
          size="xs"
          variant="ghost"
          borderRadius="xs"
          color="fg.muted"
          _hover={{ color: "fg.default", bg: "bg.subtle" }}
        />

        {/* User Profile Dropdown Menu */}
        <AppUserMenu />
      </HStack>
    </Box>
  );
};

export default AppHeader;
