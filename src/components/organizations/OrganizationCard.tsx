import React, { useState } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Text,
  Badge,
  IconButton,
  Button,
  Card,
  Avatar,
  Menu,
  Portal,
} from "@chakra-ui/react";
import { IOrganizationWithCounts, getOrgInitials } from "@/types/organization";
import { toast } from "react-toastify";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  Building2,
  MapPin,
  ArrowRight,
  Mail,
  Phone,
  Copy,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Tv,
  Volume2,
} from "lucide-react";

interface OrganizationCardProps {
  organization: IOrganizationWithCounts;
  onEdit?: (org: IOrganizationWithCounts) => void;
  onDelete?: (org: IOrganizationWithCounts) => void;
  onRestore?: (org: IOrganizationWithCounts) => void;
  onViewRegions?: (org: IOrganizationWithCounts) => void;
  onViewDepots?: (org: IOrganizationWithCounts) => void;
  isDeleted?: boolean;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onEdit,
  onDelete,
  onRestore,
  onViewRegions,
  onViewDepots,
  isDeleted = false,
}) => {
  const [copied, setCopied] = useState(false);
  const regionCount = organization.region_count || 0;
  const depotCount = organization.depot_count || 0;

  const isProtected =
    organization.name?.toLowerCase() === "navitronix" ||
    (organization as any).is_default ||
    organization.id === "6b679098-ef69-45f0-9fb1-b457dd882060";

  const handleCopyId = () => {
    navigator.clipboard.writeText(organization.id);
    setCopied(true);
    toast.success("Agency ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const accentColor = isDeleted
    ? "red"
    : organization.active !== false
    ? "blue"
    : "gray";

  return (
    <Card.Root
      size="sm"
      variant="outline"
      bg="bg.panel"
      borderColor="border.default"
      position="relative"
      overflow="hidden"
      transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      _hover={{
        borderColor: isDeleted ? "red.muted" : "blue.muted",
        transform: "translateY(-2px)",
        boxShadow: "sm",
      }}
      h="full"
    >
      {/* Top subtle accent bar */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        h="2.5px"
        bg={`${accentColor}.solid`}
        opacity="0.85"
      />

      <Card.Body p="4" display="flex" flexDirection="column" justifyContent="space-between" h="full">
        <div>
          {/* Header: Logo / Avatar + Name + Status + Menu */}
          <Flex justify="space-between" align="flex-start" mb="3">
            <HStack gap="3" minW="0" flex="1" overflow="hidden" mr="2">
              <Avatar.Root
                size="sm"
                shape="rounded"
                colorPalette={isDeleted ? "red" : "blue"}
                borderWidth="1px"
                borderColor={isDeleted ? "red.subtle" : "border.subtle"}
                shrink="0"
              >
                <Avatar.Fallback name={organization.name}>
                  {getOrgInitials(organization.name)}
                </Avatar.Fallback>
                <Avatar.Image src={organization.logo || undefined} />
              </Avatar.Root>

              <VStack align="flex-start" gap="0.5" minW="0" overflow="hidden" flex="1">
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="fg.default"
                  truncate
                  maxW="full"
                  lineHeight="1.2"
                  title={organization.name}
                >
                  {organization.name}
                </Text>
                <HStack gap="1.5" wrap="wrap">
                  {isDeleted ? (
                    <Badge colorPalette="red">
                      Deleted
                    </Badge>
                  ) : (
                    <Badge colorPalette={organization.active !== false ? "green" : "gray"}>
                      {organization.active !== false ? "Active" : "Inactive"}
                    </Badge>
                  )}
                  {isProtected && (
                    <Badge colorPalette="purple">
                      <HStack gap="1">
                        <ShieldCheck size={12} />
                        <Text>System</Text>
                      </HStack>
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </HStack>

            {/* Action Menu */}
            <Menu.Root positioning={{ placement: "bottom-end", gutter: 4 }}>
              <Menu.Trigger asChild>
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label="Actions"
                  color="fg.muted"
                  _hover={{ color: "fg.default", bg: "bg.subtle" }}
                >
                  <MoreVertical size={15} />
                </IconButton>
              </Menu.Trigger>

              <Portal>
                <Menu.Positioner>
                  <Menu.Content
                    minW="140px"
                    borderColor="border.default"
                    bg="bg.surface"
                    p="1"
                  >
                    {!isDeleted && onViewRegions && (
                      <Menu.Item
                        value="view-regions"
                        cursor="pointer"
                        _hover={{ bg: "bg.subtle" }}
                        onClick={() => onViewRegions(organization)}
                      >
                        <HStack gap="2">
                          <MapPin size={13} color="var(--chakra-colors-blue-600)" />
                          <Text fontSize="xs">View Regions ({regionCount})</Text>
                        </HStack>
                      </Menu.Item>
                    )}

                    {!isDeleted && onViewDepots && (
                      <Menu.Item
                        value="view-depots"
                        cursor="pointer"
                        _hover={{ bg: "bg.subtle" }}
                        onClick={() => onViewDepots(organization)}
                      >
                        <HStack gap="2">
                          <Building2 size={13} color="var(--chakra-colors-green-600)" />
                          <Text fontSize="xs">View Depots ({depotCount})</Text>
                        </HStack>
                      </Menu.Item>
                    )}

                    {isDeleted ? (
                      onRestore && (
                        <Menu.Item
                          value="restore"
                          cursor="pointer"
                          _hover={{ bg: "green.500/10" }}
                          onClick={() => onRestore(organization)}
                        >
                          <HStack gap="2">
                            <RotateCcw size={13} color="var(--chakra-colors-green-600)" />
                            <Text fontSize="xs" color="green.600" fontWeight="600">
                              Restore Agency
                            </Text>
                          </HStack>
                        </Menu.Item>
                      )
                    ) : (
                      <>
                        {onEdit && (
                          <Menu.Item
                            value="edit"
                            cursor="pointer"
                            _hover={{ bg: "bg.subtle" }}
                            onClick={() => onEdit(organization)}
                          >
                            <HStack gap="2">
                              <Pencil size={13} color="var(--chakra-colors-fg-muted)" />
                              <Text fontSize="xs">Edit Agency</Text>
                            </HStack>
                          </Menu.Item>
                        )}
                      </>
                    )}

                    <Menu.Item
                      value="copy"
                      cursor="pointer"
                      _hover={{ bg: "bg.subtle" }}
                      onClick={handleCopyId}
                    >
                      <HStack gap="2">
                        {copied ? (
                          <Check size={13} color="var(--chakra-colors-green-600)" />
                        ) : (
                          <Copy size={13} color="var(--chakra-colors-fg-muted)" />
                        )}
                        <Text fontSize="xs">Copy ID</Text>
                      </HStack>
                    </Menu.Item>

                    {!isDeleted && !isProtected && onDelete && (
                      <Menu.Item
                        value="delete"
                        cursor="pointer"
                        _hover={{ bg: "red.500/10" }}
                        onClick={() => onDelete(organization)}
                      >
                        <HStack gap="2">
                          <Trash2 size={13} color="var(--chakra-colors-red-600)" />
                          <Text fontSize="xs" color="red.600">Delete</Text>
                        </HStack>
                      </Menu.Item>
                    )}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Flex>

          {/* Operational Infrastructure Cardlet: Regions & Depots */}
          <SimpleGrid columns={2} gap="2" mb="2.5">
            <HStack
              p="2"
              bg="bg.subtle"
              borderRadius="md"
              borderWidth="1px"
              borderColor="border.subtle"
              justify="space-between"
              align="center"
              cursor={!isDeleted && onViewRegions ? "pointer" : "default"}
              _hover={!isDeleted && onViewRegions ? { borderColor: "blue.subtle", bg: "blue.500/10" } : undefined}
              onClick={() => !isDeleted && onViewRegions && onViewRegions(organization)}
              transition="all 0.15s ease"
            >
              <HStack gap="2" minW="0">
                <Box
                  w="24px"
                  h="24px"
                  borderRadius="md"
                  bg="blue.subtle"
                  color="blue.fg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  shrink="0"
                >
                  <MapPin size={13} />
                </Box>
                <VStack align="start" gap="0" minW="0">
                  <Text fontSize="xs" fontWeight="600" color="fg.default" truncate>
                    {regionCount} {regionCount === 1 ? "Zone" : "Zones"}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    Regions
                  </Text>
                </VStack>
              </HStack>
              {!isDeleted && onViewRegions && (
                <ArrowRight size={11} color="var(--chakra-colors-blue-500)" />
              )}
            </HStack>

            <HStack
              p="2"
              bg="bg.subtle"
              borderRadius="md"
              borderWidth="1px"
              borderColor="border.subtle"
              justify="space-between"
              align="center"
              cursor={!isDeleted && onViewDepots ? "pointer" : "default"}
              _hover={!isDeleted && onViewDepots ? { borderColor: "green.subtle", bg: "green.500/10" } : undefined}
              onClick={() => !isDeleted && onViewDepots && onViewDepots(organization)}
              transition="all 0.15s ease"
            >
              <HStack gap="2" minW="0">
                <Box
                  w="24px"
                  h="24px"
                  borderRadius="md"
                  bg="green.subtle"
                  color="green.fg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  shrink="0"
                >
                  <Building2 size={13} />
                </Box>
                <VStack align="start" gap="0" minW="0">
                  <Text fontSize="xs" fontWeight="600" color="fg.default" truncate>
                    {depotCount} {depotCount === 1 ? "Depot" : "Depots"}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    Facilities
                  </Text>
                </VStack>
              </HStack>
              {!isDeleted && onViewDepots && (
                <ArrowRight size={11} color="var(--chakra-colors-green-500)" />
              )}
            </HStack>
          </SimpleGrid>

          {/* Contact Details Cardlet */}
          <VStack
            align="stretch"
            gap="1.5"
            my="2.5"
            p="2.5"
            bg="bg.subtle"
            borderRadius="md"
            borderWidth="1px"
            borderColor="border.subtle"
          >
            <HStack gap="2" fontSize="xs" color={organization.email ? "fg.muted" : "fg.subtle"}>
              <Mail size={12} style={{ flexShrink: 0 }} />
              <Text truncate>
                {organization.email || "No contact email listed"}
              </Text>
            </HStack>
            <HStack gap="2" fontSize="xs" color={organization.phone ? "fg.muted" : "fg.subtle"}>
              <Phone size={12} style={{ flexShrink: 0 }} />
              <Text truncate>
                {organization.phone || "No contact phone listed"}
              </Text>
            </HStack>
          </VStack>
        </div>

        {/* Feature tags and action */}
        <Flex
          pt="3"
          borderTopWidth="1px"
          borderColor="border.subtle"
          justify="space-between"
          align="center"
          gap="2"
          wrap="wrap"
        >
          {/* Visual feature matrix */}
          <HStack gap="1.5" wrap="wrap">
            <Badge
              variant={organization.ITMS ? "subtle" : "outline"}
              colorPalette="purple"
              opacity={organization.ITMS ? 1 : 0.35}
              title={organization.ITMS ? "ITMS Telemetry active" : "ITMS not enabled"}
            >
              <HStack gap="1">
                <Cpu size={11} />
                <Text>ITMS</Text>
              </HStack>
            </Badge>

            <Badge
              variant={organization.PIS ? "subtle" : "outline"}
              colorPalette="cyan"
              opacity={organization.PIS ? 1 : 0.35}
              title={organization.PIS ? "PIS Displays active" : "PIS not enabled"}
            >
              <HStack gap="1">
                <Tv size={11} />
                <Text>PIS</Text>
              </HStack>
            </Badge>

            <Badge
              variant={organization.PAS ? "subtle" : "outline"}
              colorPalette="orange"
              opacity={organization.PAS ? 1 : 0.35}
              title={organization.PAS ? "PAS Audio active" : "PAS not enabled"}
            >
              <HStack gap="1">
                <Volume2 size={11} />
                <Text>PAS</Text>
              </HStack>
            </Badge>
          </HStack>

          {isDeleted && onRestore && (
            <Button
              size="sm"
              variant="outline"
              colorPalette="green"
              onClick={() => onRestore(organization)}
            >
              <RotateCcw size={13} />
              Restore
            </Button>
          )}
        </Flex>
      </Card.Body>
    </Card.Root>
  );
};

export default OrganizationCard;
