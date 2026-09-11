import React, { useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Spinner,
  Avatar,
  Menu,
  Tooltip,
  Portal,
} from "@chakra-ui/react";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { IOrganization, organizationCrud, getOrgInitials } from "@/types/organization";
import { ROLES } from "@/constants/roles";
import { Building2, Check, ChevronsUpDown, Sparkles } from "lucide-react";

interface AppOrgSwitcherProps {
  isCollapsed?: boolean;
}

export const AppOrgSwitcher: React.FC<AppOrgSwitcherProps> = ({
  isCollapsed = false,
}) => {
  const { selectedOrganization, setSelectedOrganization } =
    useOrganizationStore();
  const user = useLoggedUserStore((state) => state.user);
  const { useList } = organizationCrud;

  const { data, isLoading } = useList({
    filters: { deleted: false },
    orderBy: { column: "created_at", ascending: true },
  });

  const orgs = (data?.data as IOrganization[]) || [];

  // Default selection synchronization
  useEffect(() => {
    if (!orgs || orgs.length === 0) return;
    const current = orgs.find((org) => org.id === selectedOrganization?.id);

    if (selectedOrganization && !current) {
      setSelectedOrganization(orgs[0]);
    } else if (
      current &&
      (current.name !== selectedOrganization?.name ||
        current.logo !== selectedOrganization?.logo ||
        current.email !== selectedOrganization?.email ||
        JSON.stringify(current.features) !== JSON.stringify(selectedOrganization?.features))
    ) {
      setSelectedOrganization(current);
    }

    if (!selectedOrganization) {
      if (user?.role?.name === ROLES.MASTER) {
        setSelectedOrganization(orgs[0]);
      } else if (user?.organization?.id) {
        const assignedOrg = orgs.find((org) => org.id === user.organization.id);
        if (assignedOrg) {
          setSelectedOrganization(assignedOrg);
        } else {
          setSelectedOrganization(orgs[0]);
        }
      } else {
        setSelectedOrganization(orgs[0]);
      }
    }
  }, [orgs, selectedOrganization, setSelectedOrganization, user]);

  const availableOrgs = orgs;

  const orgName = selectedOrganization?.name || "Select Organization";

  if (isCollapsed) {
    return (
      <Tooltip.Root positioning={{ placement: "right" }}>
        <Tooltip.Trigger asChild>
          <Box
            p="1.5"
            borderRadius="sm"
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.default"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            _hover={{ borderColor: "blue.500", bg: "bg.subtle" }}
            transition="all 0.15s"
          >
            <Avatar.Root size="2xs" shape="rounded">
              <Avatar.Fallback name={selectedOrganization?.name || orgName}>
                {getOrgInitials(selectedOrganization?.name || orgName)}
              </Avatar.Fallback>
              <Avatar.Image src={selectedOrganization?.logo || undefined} />
            </Avatar.Root>
          </Box>
        </Tooltip.Trigger>
        <Portal>
          <Tooltip.Positioner>
            <Tooltip.Content>{orgName}</Tooltip.Content>
          </Tooltip.Positioner>
        </Portal>
      </Tooltip.Root>
    );
  }

  return (
    <Menu.Root positioning={{ placement: "bottom-start", gutter: 4 }}>
      <Menu.Trigger asChild>
        <Box
          as="button"
          w="full"
          px="2.5"
          py="2"
          borderRadius="sm"
          bg="bg.subtle"
          _hover={{ bg: "bg.muted", borderColor: "blue.500" }}
          transition="all 0.15s ease"
          textAlign="left"
          cursor="pointer"
          borderWidth="1px"
          borderColor="border.default"
          outline="none"
        >
          <Flex align="center" justify="space-between" gap="2">
            <HStack gap="2" minW="0">
              <Avatar.Root size="2xs" shape="rounded" shrink="0">
                <Avatar.Fallback name={selectedOrganization?.name || orgName}>
                  {getOrgInitials(selectedOrganization?.name || orgName)}
                </Avatar.Fallback>
                <Avatar.Image src={selectedOrganization?.logo || undefined} />
              </Avatar.Root>
              <VStack align="start" gap="0" minW="0">
                <Text
                  fontSize="xs"
                  fontWeight="600"
                  color="fg.default"
                  truncate
                  maxW="130px"
                  lineHeight="1.2"
                >
                  {isLoading ? "Loading..." : orgName}
                </Text>
                <Text fontSize="10px" color="fg.muted" truncate maxW="130px" lineHeight="1.2">
                  Transit Agency
                </Text>
              </VStack>
            </HStack>
            <ChevronsUpDown size={13} style={{ opacity: 0.5, flexShrink: 0 }} />
          </Flex>
        </Box>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content
            minW="240px"
            maxW="280px"
            borderRadius="sm"
            borderWidth="1px"
            borderColor="border.default"
            bg="bg.surface"
            p="1"
          >
            <Box px="2.5" py="1.5">
              <Text fontSize="11px" fontWeight="600" color="fg.muted" letterSpacing="0.03em" textTransform="uppercase">
                Transit Agencies ({availableOrgs.length})
              </Text>
            </Box>
            <Menu.Separator borderColor="border.subtle" my="1" />

            {isLoading ? (
              <Flex p="3" justify="center" align="center" gap="2">
                <Spinner size="xs" color="blue.500" />
                <Text fontSize="xs" color="fg.muted">
                  Loading agencies...
                </Text>
              </Flex>
            ) : availableOrgs.length === 0 ? (
              <Box p="3" textAlign="center">
                <Text fontSize="xs" color="fg.muted">
                  No agencies registered
                </Text>
              </Box>
            ) : (
              <Box maxH="220px" overflowY="auto">
                {availableOrgs.map((org) => {
                  const isSelected = selectedOrganization?.id === org.id;
                  return (
                    <Menu.Item
                      key={org.id}
                      value={org.id}
                      onClick={() => setSelectedOrganization(org)}
                      borderRadius="xs"
                      px="2.5"
                      py="2"
                      cursor="pointer"
                      bg={isSelected ? "blue.subtle" : "transparent"}
                      _hover={{ bg: isSelected ? "blue.subtle" : "bg.subtle" }}
                      transition="background-color 0.12s"
                    >
                      <HStack justify="space-between" w="full">
                        <HStack gap="2" minW="0">
                          <Avatar.Root
                            size="2xs"
                            shape="rounded"
                            colorPalette={isSelected ? "blue" : "gray"}
                            shrink="0"
                          >
                            <Avatar.Fallback name={org.name}>
                              {getOrgInitials(org.name)}
                            </Avatar.Fallback>
                            <Avatar.Image src={org.logo || undefined} />
                          </Avatar.Root>
                          <VStack align="start" gap="0" minW="0">
                            <Text
                              fontSize="xs"
                              fontWeight={isSelected ? "600" : "400"}
                              color={isSelected ? "blue.600" : "fg.default"}
                              truncate
                            >
                              {org.name}
                            </Text>
                            {org.phone && (
                              <Text fontSize="10px" color="fg.muted" truncate>
                                {org.phone}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                        {isSelected && (
                          <Check size={14} color="var(--chakra-colors-blue-600)" />
                        )}
                      </HStack>
                    </Menu.Item>
                  );
                })}
              </Box>
            )}

            {user?.role?.name === ROLES.MASTER && (
              <>
                <Menu.Separator borderColor="border.subtle" my="1" />
                <Box px="2.5" py="1.5">
                  <HStack justify="space-between">
                    <Text fontSize="10px" color="fg.muted">
                      Super Admin Access
                    </Text>
                    <Badge size="xs" colorPalette="blue" variant="subtle" borderRadius="xs">
                      All Orgs
                    </Badge>
                  </HStack>
                </Box>
              </>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default AppOrgSwitcher;
