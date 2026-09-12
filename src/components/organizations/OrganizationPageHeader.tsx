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
              colorPalette="rose"
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
            onClick={() => {
              toast.success("Organizations refreshed");
              onRefresh();
            }}
            loading={isLoading}
          >
            <LuRefreshCw />
            Refresh
          </Button>

          <RBAC roles={[ROLES.MASTER]} features={[]}>
            <Button
              size="sm"
              colorPalette="blue"
              onClick={onAdd}
            >
              <LuPlus />
              Add Organization
            </Button>
          </RBAC>
        </HStack>
      </Flex>

      {/* Search Bar */}
      <Box position="relative" w={{ base: "full", md: "380px" }}>
        <Box
          position="absolute"
          left="3.5"
          top="50%"
          transform="translateY(-50%)"
          color="fg.muted"
          pointerEvents="none"
          zIndex={1}
        >
          <LuSearch size={14} />
        </Box>
        <Input
          size="sm"
          pl="9"
          pr={searchQuery ? "8" : "3.5"}
          placeholder="Filter organizations by name or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <IconButton
            size="xs"
            variant="ghost"
            position="absolute"
            right="2"
            top="50%"
            transform="translateY(-50%)"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
          >
            <LuX size={12} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};
export default OrganizationPageHeader;
