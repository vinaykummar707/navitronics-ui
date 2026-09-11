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
import { IOrganization, getOrgInitials } from "@/types/organization";
import { toast } from "react-toastify";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  Building2,
  Mail,
  Phone,
  Copy,
  RotateCcw,
} from "lucide-react";

interface OrganizationCardProps {
  organization: IOrganization;
  onEdit?: (org: IOrganization) => void;
  onDelete?: (org: IOrganization) => void;
  onRestore?: (org: IOrganization) => void;
  isDeleted?: boolean;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onEdit,
  onDelete,
  onRestore,
  isDeleted = false,
}) => {
  const [copied, setCopied] = useState(false);

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

  return (
    <Card.Root
      size="sm"
      variant="outline"
      bg="bg.panel"
      borderColor="border.default"
      transition="border-color 0.15s ease"
      _hover={{ borderColor: "blue.500" }}
    >
      <Card.Body p="4" display="flex" flexDirection="column" justifyContent="space-between" h="full">
        <div>
          {/* Header: Logo / Avatar + Name + Status + Menu */}
        <Flex justify="space-between" align="flex-start" mb="3">
          <HStack gap="3" minW="0">
            <Avatar.Root
              size="sm"
              shape="rounded"
              colorPalette={isDeleted ? "red" : "blue"}
              borderWidth="1px"
              borderColor={isDeleted ? "red.subtle" : "border.subtle"}
            >
              <Avatar.Fallback name={organization.name}>
                {getOrgInitials(organization.name)}
              </Avatar.Fallback>
              <Avatar.Image src={organization.logo || undefined} />
            </Avatar.Root>

            <VStack align="flex-start" gap="0.5" minW="0">
              <Text
                fontSize="sm"
                fontWeight="600"
                color="fg.default"
                truncate
                lineHeight="1.2"
              >
                {organization.name}
              </Text>
              <HStack gap="1.5">
                {isDeleted ? (
                  <Badge
                    size="xs"
                    variant="subtle"
                    colorPalette="red"
                    borderRadius="xs"
                    px="1.5"
                    py="0.2"
                    fontSize="10px"
                    fontWeight="600"
                  >
                    Deleted
                  </Badge>
                ) : (
                  <Badge
                    size="xs"
                    variant="subtle"
                    colorPalette={organization.active !== false ? "green" : "gray"}
                    borderRadius="xs"
                    px="1.5"
                    py="0.2"
                    fontSize="10px"
                    fontWeight="500"
                  >
                    {organization.active !== false ? "Active" : "Inactive"}
                  </Badge>
                )}
                {isProtected && (
                  <Badge
                    size="xs"
                    variant="subtle"
                    colorPalette="purple"
                    borderRadius="xs"
                    px="1.5"
                    py="0.2"
                    fontSize="10px"
                  >
                    System
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
                borderRadius="xs"
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
                  borderRadius="sm"
                  borderColor="border.default"
                  bg="bg.surface"
                  p="1"
                >
                  {isDeleted ? (
                    onRestore && (
                      <Menu.Item
                        value="restore"
                        borderRadius="xs"
                        px="2"
                        py="1.5"
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
                          borderRadius="xs"
                          px="2"
                          py="1.5"
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
                    borderRadius="xs"
                    px="2"
                    py="1.5"
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
                      borderRadius="xs"
                      px="2"
                      py="1.5"
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

        {/* Contact Details */}
        <VStack align="stretch" gap="1.5" my="3">
          {organization.email && (
            <HStack gap="2" fontSize="xs" color="fg.muted">
              <Mail size={13} style={{ flexShrink: 0 }} />
              <Text truncate>{organization.email}</Text>
            </HStack>
          )}
          {organization.phone && (
            <HStack gap="2" fontSize="xs" color="fg.muted">
              <Phone size={13} style={{ flexShrink: 0 }} />
              <Text truncate>{organization.phone}</Text>
            </HStack>
          )}
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
        <HStack gap="1.5" wrap="wrap">
          {organization.PIS && (
            <Badge size="xs" variant="outline" colorPalette="blue" borderRadius="xs">
              PIS
            </Badge>
          )}
          {organization.PAS && (
            <Badge size="xs" variant="outline" colorPalette="amber" borderRadius="xs">
              PAS
            </Badge>
          )}
          {organization.ITMS && (
            <Badge size="xs" variant="outline" colorPalette="purple" borderRadius="xs">
              ITMS
            </Badge>
          )}
          {!organization.PIS && !organization.PAS && !organization.ITMS && (
            <Text fontSize="11px" color="fg.subtle">
              Standard Tier
            </Text>
          )}
        </HStack>
        {isDeleted && onRestore && (
          <Button
            size="xs"
            variant="outline"
            colorPalette="green"
            borderRadius="xs"
            onClick={() => onRestore(organization)}
          >
            <RotateCcw size={12} style={{ marginRight: "4px" }} />
            Restore
          </Button>
        )}
      </Flex>
      </Card.Body>
    </Card.Root>
  );
};

export default OrganizationCard;
