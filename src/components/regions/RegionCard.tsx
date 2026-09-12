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
import { IRegionWithDepotCount, getRegionInitials } from "@/types/IRegion";
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
} from "lucide-react";

export interface RegionCardProps {
  region: IRegionWithDepotCount;
  onEdit?: (region: IRegionWithDepotCount) => void;
  onDelete?: (region: IRegionWithDepotCount) => void;
  onRestore?: (region: IRegionWithDepotCount) => void;
  onViewDepots?: (region: IRegionWithDepotCount) => void;
  isDeleted?: boolean;
}

export const RegionCard: React.FC<RegionCardProps> = ({
  region,
  onEdit,
  onDelete,
  onRestore,
  onViewDepots,
  isDeleted = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(region.id);
    setCopied(true);
    toast.success("Region ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const accentColor = isDeleted ? "red" : "blue";
  const depotCount = region.depot_count ?? 0;

  return (
    <Card.Root
      size="sm"
      variant="outline"
      bg="bg.panel"
      borderRadius="2xl"
      borderColor="border.subtle"
      position="relative"
      overflow="hidden"
      transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      _hover={{
        borderColor: isDeleted ? "red.muted" : "blue.muted",
        transform: "translateY(-3px)",
        boxShadow: "md",
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
                colorPalette={isDeleted ? "red" : "blue"}
                borderWidth="1px"
                borderColor={isDeleted ? "red.subtle" : "border.subtle"}
                shrink="0"
              >
                <Avatar.Fallback name={region.name}>
                  {getRegionInitials(region.name)}
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
                  title={region.name}
                >
                  {region.name}
                </Text>
                <HStack gap="1.5" wrap="wrap">
                  {isDeleted ? (
                    <Badge colorPalette="red" borderRadius="full" px="2.5">
                      Archived
                    </Badge>
                  ) : (
                    <Badge colorPalette="green" borderRadius="full" px="2.5">
                      Active Zone
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    colorPalette="gray"
                    fontFamily="mono"
                    borderRadius="full"
                    px="2"
                  >
                    {region.id.slice(0, 8)}
                  </Badge>
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
                    borderColor="border.subtle"
                    borderRadius="xl"
                    bg="bg.surface"
                    p="1.5"
                    boxShadow="md"
                  >
                    {!isDeleted && onViewDepots && (
                      <Menu.Item
                        value="view-depots"
                        cursor="pointer"
                        _hover={{ bg: "bg.subtle" }}
                        onClick={() => onViewDepots(region)}
                      >
                        <HStack gap="2">
                          <Building2 size={13} color="var(--chakra-colors-blue-600)" />
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
                          onClick={() => onRestore(region)}
                        >
                          <HStack gap="2">
                            <RotateCcw size={13} color="var(--chakra-colors-green-600)" />
                            <Text fontSize="xs" color="green.600" fontWeight="600">
                              Restore Region
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
                            onClick={() => onEdit(region)}
                          >
                            <HStack gap="2">
                              <Pencil size={13} color="var(--chakra-colors-fg-muted)" />
                              <Text fontSize="xs">Edit Region</Text>
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
                        <Text fontSize="xs">Copy Region ID</Text>
                      </HStack>
                    </Menu.Item>

                    {!isDeleted && onDelete && (
                      <Menu.Item
                        value="delete"
                        cursor="pointer"
                        _hover={{ bg: "red.500/10" }}
                        onClick={() => onDelete(region)}
                      >
                        <HStack gap="2">
                          <Trash2 size={13} color="var(--chakra-colors-red-600)" />
                          <Text fontSize="xs" color="red.600">Delete Region</Text>
                        </HStack>
                      </Menu.Item>
                    )}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Flex>

          {/* Assigned Depots Cardlet */}
          <HStack
            justify="space-between"
            align="center"
            p="2.5"
            bg="bg.subtle"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border.subtle"
            my="3"
          >
            <HStack gap="2.5">
              <Box
                w="28px"
                h="28px"
                borderRadius="lg"
                bg="blue.subtle"
                color="blue.fg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shrink="0"
              >
                <Building2 size={14} />
              </Box>
              <VStack align="start" gap="0">
                <Text fontSize="xs" fontWeight="600" color="fg.default">
                  {depotCount} Bus {depotCount === 1 ? "Depot" : "Depots"}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  Transit operational facilities
                </Text>
              </VStack>
            </HStack>

            {!isDeleted && onViewDepots && (
              <Button
                size="xs"
                variant="subtle"
                colorPalette="blue"
                borderRadius="full"
                onClick={() => onViewDepots(region)}
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
              {region.created_at
                ? new Date(region.created_at).toLocaleDateString("en-US", {
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
              borderRadius="full"
              onClick={() => onRestore(region)}
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

export default RegionCard;
