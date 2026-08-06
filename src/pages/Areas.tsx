import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areaService } from '../services/areaService';
import { Area, UpdateAreaDto } from '../types/area';
import { AreaForm } from '../components/areas/AreaForm';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { Icon } from '@iconify-icon/react';
import {
  Container,
  Flex,
  Heading,
  Button,
  Table,
  Badge,
  IconButton,
  Box,
  Skeleton,
  Stack,
  HStack,
  Text,
} from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from '@/components/ui/dialog';
import useAuthStore from '@/store/authStore';
import RBAC from '../components/RBAC';
import { ROLES } from '../constants/roles';
import { toast } from 'react-toastify';

const Areas = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const { selectedOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data: areas, isLoading } = useQuery({
    queryKey: ['areas', selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization ? areaService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  const filteredAreas = user.area && user.userRole === 'area_admin'
    ? areas?.filter((area) => area.areaId === user.area.areaId)
    : areas;

  const createMutation = useMutation({
    mutationFn: areaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', selectedOrganization?.organizationId] });
      setIsCreateModalOpen(false);
      toast.success('Area created successfully');
    },
    onError: () => {
      toast.error('Failed to create area');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ data, areaId }: { data: UpdateAreaDto; areaId: string }) =>
      areaService.update(data, areaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', selectedOrganization?.organizationId] });
      setEditingArea(null);
      toast.success('Area updated successfully');
    },
    onError: () => {
      toast.error('Failed to update area');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: areaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', selectedOrganization?.organizationId] });
      toast.success('Area deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete area');
    },
  });

  if (!selectedOrganization) {
    return (
      <Box p="8" textAlign="center">
        <Text color="gray.500" fontSize="md">
          Please select an organization first from the sidebar.
        </Text>
      </Box>
    );
  }

  return (
    <Container overflow="auto" fluid py="4">
      {/* Header Bar */}
      <Flex justify="space-between" align="center" mb="6">
        <Heading size="md" color="gray.900" fontWeight="bold">
          Areas
        </Heading>
        <RBAC roles={[ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]}>
          <Button
            colorPalette="blue"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Icon icon="solar:add-circle-bold" />
            Create Area
          </Button>
        </RBAC>
      </Flex>

      {/* Content Area */}
      {isLoading ? (
        <Stack gap="3" py="4">
          <Skeleton height="36px" borderRadius="lg" />
          <Skeleton height="48px" borderRadius="lg" />
          <Skeleton height="48px" borderRadius="lg" />
          <Skeleton height="48px" borderRadius="lg" />
        </Stack>
      ) : (
        <Box
          bg="white"
          p="0"
          rounded="xl"
          borderWidth="1px"
          borderColor="gray.200"
          shadow="xs"
          overflow="hidden"
        >
          <Table.Root variant="outline" size="sm" interactive>
            <Table.Header bg="gray.50">
              <Table.Row>
                <Table.ColumnHeader>Area Name</Table.ColumnHeader>
                <Table.ColumnHeader>Created At</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredAreas && filteredAreas.length > 0 ? (
                filteredAreas.map((area) => (
                  <Table.Row key={area.areaId}>
                    <Table.Cell fontWeight="semibold" color="gray.900">
                      {area.areaName}
                    </Table.Cell>
                    <Table.Cell color="gray.500" fontSize="xs">
                      {new Date(area.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        colorPalette={area.active ? 'green' : 'red'}
                        variant="subtle"
                        size="sm"
                      >
                        {area.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      <HStack justify="flex-end" gap="1">
                        <IconButton
                          aria-label="Edit Area"
                          size="xs"
                          variant="ghost"
                          colorPalette="blue"
                          onClick={() => setEditingArea(area)}
                        >
                          <Icon icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton
                          aria-label="Delete Area"
                          size="xs"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this area?')) {
                              deleteMutation.mutate(area.areaId);
                            }
                          }}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={4} textAlign="center" color="gray.500" py="8">
                    <Text fontSize="sm">No areas found</Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* Create Modal */}
      <DialogRoot
        open={isCreateModalOpen}
        onOpenChange={(e) => setIsCreateModalOpen(e.open)}
        placement="center"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Area</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <AreaForm
              onSubmit={(data) =>
                createMutation.mutate({
                  ...data,
                  organizationId: selectedOrganization.organizationId,
                })
              }
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      {/* Edit Modal */}
      <DialogRoot
        open={!!editingArea}
        onOpenChange={(e) => {
          if (!e.open) setEditingArea(null);
        }}
        placement="center"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Area</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {editingArea && (
              <AreaForm
                initialData={editingArea}
                onSubmit={(data) =>
                  updateMutation.mutate({
                    data: {
                      ...data,
                      organizationId: selectedOrganization.organizationId,
                      active: editingArea.active,
                      deleted: editingArea.deleted,
                    },
                    areaId: editingArea.areaId!,
                  })
                }
                onCancel={() => setEditingArea(null)}
              />
            )}
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </Container>
  );
};

export default Areas;
