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
import { IRoute } from "@/types/IRoute";
import { toast } from "react-toastify";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Check,
  Repeat,
  Download,
  MapPin,
  ArrowRight,
  Route as RouteIcon,
  Calendar,
  Layers,
  Split,
} from "lucide-react";
import Avvvatars from "avvvatars-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface RouteCardProps {
  route: IRoute;
  isSelected?: boolean;
  onToggleSelect?: (routeId: string, selected: boolean) => void;
  onEdit?: (routeId: string) => void;
  onDuplicate?: (routeId: string) => void;
  onReturn?: (routeId: string) => void;
  onExportSingle?: (route: IRoute) => void;
  onDelete?: (route: IRoute) => void;
}

export function parseStopsCount(stops: any): number {
  if (!stops) return 0;
  if (Array.isArray(stops)) return stops.length;
  if (typeof stops === "string") {
    try {
      const parsed = JSON.parse(stops);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }
  return 0;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDuplicate,
  onReturn,
  onExportSingle,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  const stopsCount = parseStopsCount(route.stops);
  const routeDisplayName = route.is_split_route
    ? `${route.route_number_1 || ""} - ${route.route_number_2 || ""}`
    : route.route_number || "Unnamed Route";

  const handleCopyRouteNumber = () => {
    if (!route.route_number) return;
    navigator.clipboard.writeText(route.route_number);
    setCopied(true);
    toast.success(`Route ${route.route_number} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const accentColor = route.return ? "purple" : "blue";

  return (
    <Card.Root
      size="sm"
      variant="outline"
      bg="bg.panel"
      borderRadius="2xl"
      borderColor={isSelected ? "blue.solid" : "border.subtle"}
      position="relative"
      overflow="hidden"
      transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      _hover={{
        borderColor: isSelected ? "blue.solid" : `${accentColor}.muted`,
        transform: "translateY(-3px)",
        boxShadow: "md",
      }}
      h="full"
    >
      {/* Top subtle accent bar matching DepotCard / RegionCard */}
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
          {/* Header: Checkbox + Avatar + Route No + Status Badges + Menu */}
          <Flex justify="space-between" align="flex-start" mb="3">
            <HStack gap="3" minW="0" flex="1" overflow="hidden" mr="2">
              {onToggleSelect && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(details) =>
                    onToggleSelect(route.id, !!details.checked)
                  }
                />
              )}

              <Avatar.Root
                size="sm"
                shape="rounded"
                colorPalette={accentColor}
                borderWidth="1px"
                borderColor={`${accentColor}.subtle`}
                shrink="0"
              >
                <Avatar.Fallback name={routeDisplayName}>
                  <RouteIcon size={16} />
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
                  title={routeDisplayName}
                >
                  {routeDisplayName}
                </Text>

                <HStack gap="1.5" wrap="wrap">
                  {/* Status Badge with Live Indicator Dot */}
                  <Badge colorPalette={accentColor} borderRadius="full" px="2.5">
                    <HStack gap="1">
                      <Box
                        w="1.5"
                        h="1.5"
                        borderRadius="full"
                        bg={`${accentColor}.500`}
                      />
                      <Text>{route.return ? "Return Route" : "Outbound Route"}</Text>
                    </HStack>
                  </Badge>

                  {route.is_split_route && (
                    <Badge colorPalette="amber" borderRadius="full" px="2.5">
                      <HStack gap="1">
                        <Split size={11} />
                        <Text>Split</Text>
                      </HStack>
                    </Badge>
                  )}

                  <Badge colorPalette="gray" borderRadius="full" px="2.5">
                    v{route.version || "1.0"}
                  </Badge>
                </HStack>
              </VStack>
            </HStack>

            {/* Action Menu matching DepotCard */}
            <Menu.Root positioning={{ placement: "bottom-end", gutter: 4 }}>
              <Menu.Trigger asChild>
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label="Route Actions"
                  color="fg.muted"
                  _hover={{ color: "fg.default", bg: "bg.subtle" }}
                >
                  <MoreVertical size={15} />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content
                    minW="160px"
                    borderColor="border.subtle"
                    borderRadius="xl"
                    bg="bg.surface"
                    p="1.5"
                    boxShadow="md"
                  >
                    {onEdit && (
                      <Menu.Item
                        value="edit"
                        cursor="pointer"
                        _hover={{ bg: "bg.subtle" }}
                        onClick={() => onEdit(route.id)}
                      >
                        <HStack gap="2">
                          <Pencil size={13} color="var(--chakra-colors-blue-600)" />
                          <Text fontSize="xs">Edit Route</Text>
                        </HStack>
                      </Menu.Item>
                    )}

                    {onDuplicate && (
                      <Menu.Item
                        value="duplicate"
                        cursor="pointer"
                        _hover={{ bg: "bg.subtle" }}
                        onClick={() => onDuplicate(route.id)}
                      >
                        <HStack gap="2">
                          <Copy size={13} color="var(--chakra-colors-fg-muted)" />
                          <Text fontSize="xs">Duplicate Route</Text>
                        </HStack>
                      </Menu.Item>
                    )}

                    {onReturn && (
                      <Menu.Item
                        value="return"
                        cursor="pointer"
                        _hover={{ bg: "bg.subtle" }}
                        onClick={() => onReturn(route.id)}
                      >
                        <HStack gap="2">
                          <Repeat size={13} color="var(--chakra-colors-purple-600)" />
                          <Text fontSize="xs">Make Return Route</Text>
                        </HStack>
                      </Menu.Item>
                    )}

                    {onExportSingle && (
                      <Menu.Item
                        value="export"
                        cursor="pointer"
                        _hover={{ bg: "bg.subtle" }}
                        onClick={() => onExportSingle(route)}
                      >
                        <HStack gap="2">
                          <Download size={13} color="var(--chakra-colors-teal-600)" />
                          <Text fontSize="xs">Export JSON</Text>
                        </HStack>
                      </Menu.Item>
                    )}

                    <Menu.Item
                      value="copy"
                      cursor="pointer"
                      _hover={{ bg: "bg.subtle" }}
                      onClick={handleCopyRouteNumber}
                    >
                      <HStack gap="2">
                        {copied ? (
                          <Check size={13} color="var(--chakra-colors-green-600)" />
                        ) : (
                          <Copy size={13} color="var(--chakra-colors-fg-muted)" />
                        )}
                        <Text fontSize="xs">Copy Route No</Text>
                      </HStack>
                    </Menu.Item>

                    {onDelete && (
                      <>
                        <Menu.Separator my="1" borderColor="border.default" />
                        <Menu.Item
                          value="delete"
                          cursor="pointer"
                          _hover={{ bg: "red.500/10" }}
                          onClick={() => onDelete(route)}
                        >
                          <HStack gap="2">
                            <Trash2 size={13} color="var(--chakra-colors-red-600)" />
                            <Text fontSize="xs" color="red.600">
                              Delete Route
                            </Text>
                          </HStack>
                        </Menu.Item>
                      </>
                    )}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Flex>

          {/* Assigned Path & Stops Cardlet matching DepotCard format */}
          <VStack
            align="stretch"
            gap="2"
            p="2.5"
            bg="bg.subtle"
            borderRadius="md"
            borderWidth="1px"
            borderColor="border.subtle"
            my="3"
          >
            <HStack justify="space-between" align="center">
              <HStack gap="1.5" minW="0" flex="1">
                <MapPin size={12} color="var(--chakra-colors-blue-600)" />
                <Text fontSize="xs" fontWeight="500" color="fg.default" truncate>
                  {route.source || "Origin"}
                </Text>
              </HStack>
              <ArrowRight size={12} color="var(--chakra-colors-fg-muted)" />
              <HStack gap="1.5" minW="0" flex="1" justify="flex-end">
                <MapPin size={12} color="var(--chakra-colors-purple-600)" />
                <Text fontSize="xs" fontWeight="500" color="fg.default" truncate>
                  {route.destination || "Destination"}
                </Text>
              </HStack>
            </HStack>

            {route.via && (
              <Text fontSize="xs" color="fg.muted" truncate>
                via {route.via}
              </Text>
            )}

            <HStack justify="space-between" align="center" pt="1" borderTopWidth="1px" borderColor="border.subtle">
              <HStack gap="1.5">
                <Box
                  w="20px"
                  h="20px"
                  borderRadius="md"
                  bg="teal.subtle"
                  color="teal.fg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  shrink="0"
                >
                  <Layers size={11} />
                </Box>
                <Text fontSize="xs" fontWeight="600" color="fg.default">
                  {stopsCount > 0 ? `${stopsCount} Waypoints & Stops` : "Direct Route (No Stops)"}
                </Text>
              </HStack>

              {onEdit && (
                <Button
                  size="xs"
                  variant="subtle"
                  colorPalette="blue"
                  onClick={() => onEdit(route.id)}
                >
                  Manage <ArrowRight size={12} />
                </Button>
              )}
            </HStack>
          </VStack>
        </div>

        {/* Footer: Created date & Created By info matching DepotCard footer */}
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
            <Calendar size={12} style={{ flexShrink: 0 }} />
            <Text>
              {route.created_at
                ? new Date(route.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </Text>
          </HStack>

          <HStack gap="1.5" align="center" minW="0">
            <Avvvatars
              value={route.created_by_user?.email || "Unknown"}
              size={16}
              style="shape"
            />
            <Text fontSize="xs" color="fg.muted" truncate maxW="120px">
              {route.created_by_user?.email || "Unknown"}
            </Text>
          </HStack>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
};

export default RouteCard;
