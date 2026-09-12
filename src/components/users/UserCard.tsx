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
import { ILoggedUser, getUserInitials, formatRoleName } from "@/types/IUser";
import { toast } from "react-toastify";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  RotateCcw,
  Building2,
  Globe,
  Building,
  Check,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export interface UserCardProps {
  user: ILoggedUser;
  onEdit?: (user: ILoggedUser) => void;
  onDelete?: (user: ILoggedUser) => void;
  onRestore?: (user: ILoggedUser) => void;
  isCurrentLoggedInUser?: boolean;
  isDeleted?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onRestore,
  isCurrentLoggedInUser = false,
  isDeleted = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    if (!user.email) return;
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    toast.success("User email copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const roleName = user.role?.name || "";
  const roleColorPalette =
    roleName === "master"
      ? "purple"
      : roleName === "organization_admin"
      ? "blue"
      : roleName === "region_admin"
      ? "cyan"
      : roleName === "depot_admin"
      ? "teal"
      : "indigo";

  const topAccentColor = isDeleted
    ? "red.500"
    : user.active
    ? "green.500"
    : "amber.500";

  return (
    <Card.Root
      size="sm"
      variant="outline"
      bg="bg.panel"
      borderColor="border.default"
      borderRadius="md"
      position="relative"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      transition="all 0.15s ease"
      _hover={{
        borderColor: "border.emphasized",
        boxShadow: "sm",
      }}
    >
      {/* Top Status Accent Bar */}
      <Box position="absolute" top="0" left="0" right="0" h="3px" bg={topAccentColor} />

      <Card.Body p="4" pt="5">
        <VStack align="stretch" gap="3.5">
          {/* Identity Header */}
          <HStack justify="space-between" align="flex-start" gap="2.5">
            <HStack gap="3" minW="0" flex="1">
              <Avatar.Root
                size="md"
                shape="rounded"
                borderWidth="1px"
                borderColor="border.default"
                bg="bg.muted"
                shrink="0"
              >
                <Avatar.Fallback
                  name={user.email || "Operator"}
                  fontSize="xs"
                  fontWeight="600"
                  color="fg.default"
                >
                  {getUserInitials(user.email)}
                </Avatar.Fallback>
              </Avatar.Root>

              <VStack align="start" gap="0.5" minW="0" flex="1">
                <HStack gap="1.5" w="full" minW="0">
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="fg.default"
                    truncate
                    title={user.email || "Unknown User"}
                  >
                    {user.email || "No Email Specified"}
                  </Text>
                  {user.email && (
                    <IconButton
                      aria-label="Copy email"
                      variant="ghost"
                      size="xs"
                      color="fg.muted"
                      _hover={{ color: "fg.default", bg: "bg.muted" }}
                      onClick={handleCopyEmail}
                      shrink="0"
                    >
                      {copied ? <Check size={12} color="var(--chakra-colors-green-500)" /> : <Copy size={12} />}
                    </IconButton>
                  )}
                </HStack>

                <HStack gap="1.5" wrap="wrap">
                  <Badge colorPalette={roleColorPalette}>
                    {formatRoleName(roleName)}
                  </Badge>
                  {isCurrentLoggedInUser && (
                    <Badge colorPalette="green" variant="solid">
                      You
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </HStack>

            {/* Context Menu */}
            <Menu.Root positioning={{ placement: "bottom-end" }}>
              <Menu.Trigger asChild>
                <IconButton
                  aria-label="User actions"
                  variant="ghost"
                  size="xs"
                  color="fg.muted"
                  _hover={{ color: "fg.default", bg: "bg.muted" }}
                  shrink="0"
                >
                  <MoreVertical size={15} />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content bg="bg.panel" borderColor="border.default" boxShadow="md" minW="160px" p="1">
                    {user.email && (
                      <Menu.Item value="copy" onClick={handleCopyEmail}>
                        <HStack gap="2">
                          <Copy size={13} />
                          <Text fontSize="xs">Copy Email</Text>
                        </HStack>
                      </Menu.Item>
                    )}
                    {!isDeleted && onEdit && (
                      <Menu.Item value="edit" onClick={() => onEdit(user)}>
                        <HStack gap="2">
                          <Pencil size={13} />
                          <Text fontSize="xs">Edit Account</Text>
                        </HStack>
                      </Menu.Item>
                    )}
                    {isDeleted && onRestore && (
                      <Menu.Item value="restore" color="blue.fg" onClick={() => onRestore(user)}>
                        <HStack gap="2">
                          <RotateCcw size={13} />
                          <Text fontSize="xs">Restore Account</Text>
                        </HStack>
                      </Menu.Item>
                    )}
                    {!isDeleted && onDelete && (
                      <Menu.Item
                        value="delete"
                        color="red.fg"
                        disabled={isCurrentLoggedInUser}
                        onClick={() => !isCurrentLoggedInUser && onDelete(user)}
                      >
                        <HStack gap="2">
                          <Trash2 size={13} />
                          <Text fontSize="xs">{isCurrentLoggedInUser ? "Cannot Delete Self" : "Deactivate Account"}</Text>
                        </HStack>
                      </Menu.Item>
                    )}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </HStack>

          {/* Scope Assignment Cardlet with Badges */}
          <Box
            p="2.5"
            bg="bg.muted"
            borderRadius="md"
            borderWidth="1px"
            borderColor="border.subtle"
          >
            <VStack align="stretch" gap="2" fontSize="xs">
              <HStack justify="space-between" align="center" minW="0">
                <HStack gap="1.5" color="fg.muted" shrink="0">
                  <Building2 size={12} />
                  <Text>Agency</Text>
                </HStack>
                <Badge colorPalette="purple" maxW="180px">
                  <HStack gap="1">
                    <Building2 size={11} />
                    <Text truncate title={user.organization?.name || "Agency-Wide"}>
                      {user.organization?.name || "Agency-Wide"}
                    </Text>
                  </HStack>
                </Badge>
              </HStack>

              {user.region && (
                <HStack justify="space-between" align="center" minW="0">
                  <HStack gap="1.5" color="fg.muted" shrink="0">
                    <Globe size={12} />
                    <Text>Region</Text>
                  </HStack>
                  <Badge colorPalette="cyan" maxW="180px">
                    <HStack gap="1">
                      <Globe size={11} />
                      <Text truncate title={user.region.name}>{user.region.name}</Text>
                    </HStack>
                  </Badge>
                </HStack>
              )}

              {user.depot && (
                <HStack justify="space-between" align="center" minW="0">
                  <HStack gap="1.5" color="fg.muted" shrink="0">
                    <Building size={12} />
                    <Text>Depot</Text>
                  </HStack>
                  <Badge colorPalette="teal" maxW="180px">
                    <HStack gap="1">
                      <Building size={11} />
                      <Text truncate title={user.depot.name}>{user.depot.name}</Text>
                    </HStack>
                  </Badge>
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Module Access Flags */}
          <HStack justify="space-between" align="center" pt="1">
            <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="0.05em" color="fg.muted">
              Modules
            </Text>
            <HStack gap="1.5">
              <Badge
                colorPalette={user.PIS ? "blue" : "gray"}
                opacity={user.PIS ? 1 : 0.45}
                title="Passenger Information System"
              >
                PIS
              </Badge>
              <Badge
                colorPalette={user.PAS ? "orange" : "gray"}
                opacity={user.PAS ? 1 : 0.45}
                title="Public Address System"
              >
                PAS
              </Badge>
              <Badge
                colorPalette={user.ITMS ? "purple" : "gray"}
                opacity={user.ITMS ? 1 : 0.45}
                title="Intelligent Fleet Management"
              >
                ITMS
              </Badge>
            </HStack>
          </HStack>
        </VStack>
      </Card.Body>

      {/* Card Footer: Status Indicator & Quick Edit matching DepotCard */}
      <Card.Footer
        px="4"
        py="2.5"
        bg="bg.muted"
        borderTopWidth="1px"
        borderColor="border.subtle"
        justifyContent="space-between"
        alignItems="center"
      >
        {isDeleted ? (
          <Badge colorPalette="red">
            Archived
          </Badge>
        ) : user.active ? (
          <Badge colorPalette="green">
            Active
          </Badge>
        ) : (
          <Badge colorPalette="amber">
            Inactive
          </Badge>
        )}

        {!isDeleted && onEdit && (
          <Button
            size="xs"
            variant="ghost"
            color="blue.fg"
            _hover={{ bg: "bg.panel" }}
            onClick={() => onEdit(user)}
          >
            <Pencil size={12} />
            Edit
          </Button>
        )}
      </Card.Footer>
    </Card.Root>
  );
};

export default UserCard;
