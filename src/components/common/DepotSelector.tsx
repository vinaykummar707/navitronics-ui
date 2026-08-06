import { useQuery } from '@tanstack/react-query';
import { depotService } from '../../services/depotService';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { useAreaStore } from '../../store/useAreaStore';
import { useDepotStore } from '../../store/useDepotStore';
import useAuthStore from '@/store/authStore';
import { useMemo, useEffect } from 'react';
import { createListCollection, Box } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export const DepotSelector = () => {
  const { selectedOrganization } = useOrganizationStore();
  const { selectedArea } = useAreaStore();
  const { selectedDepot, setSelectedDepot } = useDepotStore();
  const user = useAuthStore((state) => state.user);

  const { data: depots } = useQuery({
    queryKey: ['depots', selectedOrganization?.organizationId, selectedArea?.areaId],
    queryFn: () => (selectedArea?.areaId ? depotService.getAll(selectedArea.areaId) : Promise.resolve([])),
    enabled: !!selectedOrganization && !!selectedArea?.areaId,
  });

  const filteredDepots = user.depot
    ? depots?.filter((depot: any) => (depot.depotId || depot.id) === user.depot.depotId)
    : depots;

  useEffect(() => {
    if (filteredDepots && filteredDepots.length > 0 && !selectedDepot) {
      setSelectedDepot(filteredDepots[0]);
    }
  }, [filteredDepots, selectedDepot, setSelectedDepot]);

  const collection = useMemo(() => {
    return createListCollection({
      items: filteredDepots
        ? filteredDepots.map((depot: any) => ({
            label: depot.depotName || depot.name || '',
            value: String(depot.depotId || depot.id || ''),
          }))
        : [],
    });
  }, [filteredDepots]);

  return (
    <Box mb="4">
      <Field label="Select Depot">
        <SelectRoot
          collection={collection}
          size="sm"
          disabled={!selectedArea}
          value={selectedDepot?.depotId ? [selectedDepot.depotId] : []}
          onValueChange={(e) => {
            const selectedDepotId = e.value[0];
            const depot = depots?.find((d: any) => (d.depotId || d.id) === selectedDepotId) || null;
            setSelectedDepot(depot);
          }}
        >
          <SelectTrigger bg="white">
            <SelectValueText placeholder="Select Depot" />
          </SelectTrigger>
          <SelectContent>
            {collection.items.map((item) => (
              <SelectItem item={item} key={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Field>
    </Box>
  );
};
