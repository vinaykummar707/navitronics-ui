import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { depotService } from '../services/depotService';
import { areaService } from '../services/areaService';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { DepotForm } from '../components/depots/DepotForm';
import { Depot } from '../types/depot';
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
  createListCollection,
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
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

const Depots = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<Depot | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const { selectedOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setSelectedAreaId('');
  }, [selectedOrganization?.organizationId]);

  const { data: areas } = useQuery({
    queryKey: ['areas', selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization ? areaService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  const filteredAreas = user.area && (user.userRole === 'area_admin' || user.userRole === 'depot_admin')
    ? areas?.filter((area) => area.areaId === user.area.areaId)
    : areas;

  useEffect(() => {
    if (areas && areas.length > 0 && !selectedAreaId) {
      setSelectedAreaId(areas[0].areaId);
    }
  }, [areas]);

  const { data: depots, isLoading } = useQuery({
    queryKey: ['depots', selectedOrganization?.organizationId, selectedAreaId],
    queryFn: () => depotService.getAll(selectedAreaId),
    enabled: !!selectedOrganization && !!selectedAreaId,
  });

  const filteredDepots = user.depot && user.userRole === 'depot_admin'
    ? depots?.filter((depot) => depot.depotId === user.depot.depotId)
    : depots;

  const areaCollection = useMemo(() => {
    return createListCollection({
      items: filteredAreas
        ? filteredAreas.map((area) => ({
            label: area.areaName,
            value: area.areaId,
          }))
        : [],
    });
  }, [filteredAreas]);

  const createMutation = useMutation({
    mutationFn: depotService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots'] });
      setIsCreateModalOpen(false);
      toast.success('Depot created successfully');
    },
    onError: () => {
      toast.error('Failed to create depot');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ data, depotId }: { data: any; depotId: string }) => depotService.update(data, depotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots'] });
      setEditingDepot(null);
      toast.success('Depot updated successfully');
    },
    onError: () => {
      toast.error('Failed to update depot');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: depotService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depots'] });
      toast.success('Depot deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete depot');
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
      {/* Top Header & Toolbar */}
      <Flex justify="space-between" align="flex-end" mb="6" flexWrap="wrap" gap="4">
        <Box minW="240px">
          <Field label="Select Area">
            <SelectRoot
              collection={areaCollection}
              size="sm"
              value={selectedAreaId ? [selectedAreaId] : []}
              onValueChange={(e) => setSelectedAreaId(e.value[0] || '')}
            >
              <SelectTrigger bg="white">
                <SelectValueText placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                {areaCollection.items.map((item) => (
                  <SelectItem item={item} key={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Field>
        </Box>

        <RBAC roles={[ROLES.ORGANIZATION_ADMIN, ROLES.AREA_ADMIN, ROLES.MASTER]}>
          <Button
            colorPalette="blue"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!selectedAreaId}
          >
            <Icon icon="solar:add-circle-bold" />
            Create Depot
          </Button>
        </RBAC>
      </Flex>

      {/* Depots Display */}
      {selectedAreaId ? (
        isLoading ? (
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
                  <Table.ColumnHeader>Depot Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader>Created At</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredDepots && filteredDepots.length > 0 ? (
                  filteredDepots
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((depot) => (
                      <Table.Row key={depot.depotId}>
                        <Table.Cell fontWeight="semibold" color="gray.900">
                          {depot.depotName}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            colorPalette={depot.active ? 'green' : 'red'}
                            variant="subtle"
                            size="sm"
                          >
                            {depot.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell color="gray.500" fontSize="xs">
                          {new Date(depot.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Table.Cell>
                        <Table.Cell textAlign="right">
                          <HStack justify="flex-end" gap="1">
                            <IconButton
                              aria-label="Edit Depot"
                              size="xs"
                              variant="ghost"
                              colorPalette="blue"
                              onClick={() => setEditingDepot(depot)}
                            >
                              <Icon icon="solar:pen-bold" />
                            </IconButton>
                            <IconButton
                              aria-label="Delete Depot"
                              size="xs"
                              variant="ghost"
                              colorPalette="red"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this depot?')) {
                                  deleteMutation.mutate(depot.depotId);
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
                      <Text fontSize="sm">No depots found for this area</Text>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </Box>
        )
      ) : (
        <Box p="8" textAlign="center" bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200">
          <Text color="gray.500" fontSize="sm">
            Please select an area to view depots
          </Text>
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
            <DialogTitle>Create Depot</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DepotForm
              selectedAreaId={selectedAreaId}
              selectedOrganizationId={selectedOrganization.organizationId}
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      {/* Edit Modal */}
      <DialogRoot
        open={!!editingDepot}
        onOpenChange={(e) => {
          if (!e.open) setEditingDepot(null);
        }}
        placement="center"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Depot</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {editingDepot && (
              <DepotForm
                initialData={editingDepot}
                selectedAreaId={selectedAreaId}
                selectedOrganizationId={selectedOrganization.organizationId}
                onSubmit={(data) =>
                  updateMutation.mutate({ data, depotId: editingDepot.depotId })
                }
                onCancel={() => setEditingDepot(null)}
              />
            )}
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </Container>
  );
};

export default Depots;
