import React, { useState } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Button,
  Card,
  Avatar,
  Menu,
  Portal,
} from "@chakra-ui/react";
import { IDepotWithRouteCount, getDepotInitials } from "@/types/IDepot";
import { toast } from "react-toastify";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  Building2,
  Copy,
  RotateCcw,
  Calendar,
  ArrowRight,
  MapPin,
  GitBranch,
} from "lucide-react";

export interface DepotCardProps {
  depot: IDepotWithRouteCount;
  onEdit?: (depot: IDepotWithRouteCount) => void;
  onDelete?: (depot: IDepotWithRouteCount) => void;
  onRestore?: (depot: IDepotWithRouteCount) => void;
  onViewRoutes?: (depot: IDepotWithRouteCount) => void;
  isDeleted?: boolean;
}

export const DepotCard: React.FC<DepotCardProps> = ({
  depot,
  onEdit,
  onDelete,
  onRestore,
  onViewRoutes,
  isDeleted = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(depot.id);
    setCopied(true);
    toast.success("Depot ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const accentColor = isDeleted ? "red" : "green";
  const routeCount = depot.route_count ?? 0;

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
        borderColor: isDeleted ? "red.muted" : "green.muted",
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
          {/* Header: Avatar / Initials + Name + Status + Menu */}
          <Flex justify="space-between" align="flex-start" mb="3">
            <HStack gap="3" minW="0" flex="1" overflow="hidden" mr="2">
              <Avatar.Root
                size="sm"
                shape="rounded"
                colorPalette={isDeleted ? "red" : "green"}
                borderWidth="1px"
                borderColor={isDeleted ? "red.subtle" : "border.subtle"}
                shrink="0"
              >
                <Avatar.Fallback name={depot.name}>
                  {getDepotInitials(depot.name)}
                </Avatar.Fallback>
              </Avatar.Root>

              <VStack align="flex-start" gap="0.5" minW="0" overflow="hidden" flex="1">
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="fg.default"
                  truncate
                  maxW="full"
                  lineHeight="1.2"
                  title={depot.name}
                >
                  {depot.name}
                </Text>
                <HStack gap="1.5" wrap="wrap">
                  {isDeleted ? (
                    <Badge colorPalette="red">
                      Archived
                    </Badge>
                  ) : (
                    <Badge colorPalette="green">
                      Operational
                    </Badge>
                  )}

                  {depot.region_name && (
                    <Badge colorPalette="blue" maxW="130px">
                      <HStack gap="1">
                        <MapPin size={11} />
                        <Text truncate>{depot.region_name}</Text>
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
                    minW="150px"
                    borderColor="border.default"
                    bg="bg.surface"
                    p="1"
                  >
                    {!isDeleted && onViewRoutes && (
                      <Menu.Item
                        value="view-routes"
                        cursor="pointer"
                        _hover={{ bg: "bg.subtle" }}
                        onClick={() => onViewRoutes(depot)}
                      >
                        <HStack gap="2">
                          <GitBranch size={13} color="var(--chakra-colors-blue-600)" />
                          <Text fontSize="xs">View Routes ({routeCount})</Text>
                        </HStack>
                      </Menu.Item>
                    )}

                    {isDeleted ? (
                      onRestore && (
                        <Menu.Item
                          value="restore"
                          cursor="pointer"
                          _hover={{ bg: "green.500/10" }}
                          onClick={() => onRestore(depot)}
                        >
                          <HStack gap="2">
                            <RotateCcw size={13} color="var(--chakra-colors-green-600)" />
                            <Text fontSize="xs" color="green.600" fontWeight="600">
                              Restore Depot
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
                            onClick={() => onEdit(depot)}
                          >
                            <HStack gap="2">
                              <Pencil size={13} color="var(--chakra-colors-fg-muted)" />
                              <Text fontSize="xs">Edit Depot</Text>
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
                        <Text fontSize="xs">Copy Depot ID</Text>
                      </HStack>
                    </Menu.Item>

                    {!isDeleted && onDelete && (
                      <Menu.Item
                        value="delete"
                        cursor="pointer"
                        _hover={{ bg: "red.500/10" }}
                        onClick={() => onDelete(depot)}
                      >
                        <HStack gap="2">
                          <Trash2 size={13} color="var(--chakra-colors-red-600)" />
                          <Text fontSize="xs" color="red.600">Delete Depot</Text>
                        </HStack>
                      </Menu.Item>
                    )}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Flex>

          {/* Assigned Routes Cardlet */}
          <HStack
            justify="space-between"
            align="center"
            p="2.5"
            bg="bg.subtle"
            borderRadius="md"
            borderWidth="1px"
            borderColor="border.subtle"
            my="3"
          >
            <HStack gap="2.5">
              <Box
                w="28px"
                h="28px"
                borderRadius="md"
                bg="green.subtle"
                color="green.fg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shrink="0"
              >
                <GitBranch size={14} />
              </Box>
              <VStack align="start" gap="0">
                <Text fontSize="xs" fontWeight="600" color="fg.default">
                  {routeCount} Active {routeCount === 1 ? "Route" : "Routes"}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  Operating transit itineraries
                </Text>
              </VStack>
            </HStack>

            {!isDeleted && onViewRoutes && (
              <Button
                size="xs"
                variant="subtle"
                colorPalette="green"
                onClick={() => onViewRoutes(depot)}
              >
                Manage <ArrowRight size={12} />
              </Button>
            )}
          </HStack>
        </div>

        {/* Footer: Created date + Quick action */}
        <Flex
          pt="3"
          borderTopWidth="1px"
          borderColor="border.subtle"
          justify="space-between"
          align="center"
          gap="2"
          wrap="wrap"
        >
          <HStack gap="1.5" fontSize="xs" color="fg.muted">
            <Calendar size={13} style={{ flexShrink: 0 }} />
            <Text>
              {depot.created_at
                ? new Date(depot.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </Text>
          </HStack>

          {isDeleted && onRestore && (
            <Button
              size="sm"
              variant="outline"
              colorPalette="green"
              onClick={() => onRestore(depot)}
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

export default DepotCard;
