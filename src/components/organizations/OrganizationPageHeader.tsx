import React from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Heading,
  Badge,
  Button,
  Input,
  IconButton,
} from "@chakra-ui/react";
import RBAC from "@/components/RBAC";
import { ROLES } from "@/constants/roles";
import {
  LuBuilding2,
  LuPlus,
  LuRefreshCw,
  LuSearch,
  LuX,
} from "react-icons/lu";
import { toast } from "react-toastify";

interface OrganizationPageHeaderProps {
  count: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
  onAdd: () => void;
  isLoading?: boolean;
}

export const OrganizationPageHeader: React.FC<OrganizationPageHeaderProps> = ({
  count,
  searchQuery,
  onSearchChange,
  onRefresh,
  onAdd,
  isLoading = false,
}) => {

  return (
    <Box w="full" pb="2">
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "start", md: "center" }}
        justify="space-between"
        gap="4"
        mb="4"
      >
        <VStack align="start" gap="1">
          <HStack gap="3">
            <Heading size="2xl" fontWeight="extrabold" color="fg.default" letterSpacing="tight">
              Organizations
            </Heading>
            <Badge
              size="md"
              variant="surface"
              colorPalette="rose"
              borderRadius="full"
              px="2.5"
              fontWeight="bold"
            >
              {count} {count === 1 ? "Agency" : "Agencies"}
            </Badge>
          </HStack>
          <Text fontSize="xs" color="fg.muted">
            Manage multi-tenant transport corporations, fleet entitlements, and active agency accounts
          </Text>
        </VStack>

        {/* Action Buttons */}
        <HStack gap="2.5" w={{ base: "full", md: "auto" }}>
          <Button
            size="sm"
            variant="outline"
            borderRadius="xl"
            onClick={() => {
              toast.success("Organizations refreshed");
              onRefresh();
            }}
            loading={isLoading}
          >
            <LuRefreshCw style={{ marginRight: "6px" }} />
            Refresh
          </Button>

          <RBAC roles={[ROLES.MASTER]} features={[]}>
            <Button
              size="sm"
              borderRadius="xl"
              bg="linear-gradient(135deg, #ec4899 0%, #be123c 100%)"
              color="white"
              shadow="0 4px 12px -2px rgba(236, 72, 153, 0.4)"
              _hover={{ transform: "translateY(-1px)", shadow: "md" }}
              fontWeight="bold"
              onClick={onAdd}
            >
              <LuPlus style={{ marginRight: "6px" }} />
              Add Organization
            </Button>
          </RBAC>
        </HStack>
      </Flex>

      {/* Search & Filter Bar */}
      <HStack
        w={{ base: "full", md: "360px" }}
        bg="bg.panel"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border.subtle"
        px="3"
        py="1.5"
        shadow="xs"
      >
        <LuSearch size={15} style={{ color: "var(--chakra-colors-gray-400)", flexShrink: 0 }} />
        <Input
          size="sm"
          variant="subtle"
          border="none"
          outline="none"
          px="2"
          bg="transparent"
          placeholder="Filter organizations by name or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          _focus={{ outline: "none", boxShadow: "none" }}
        />
        {searchQuery && (
          <IconButton
            size="xs"
            variant="ghost"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
          >
            <LuX size={12} />
          </IconButton>
        )}
      </HStack>
    </Box>
  );
};
export default OrganizationPageHeader;
