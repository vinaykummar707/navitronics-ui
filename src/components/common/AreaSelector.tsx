import { useQuery } from '@tanstack/react-query';
import { areaService } from '../../services/areaService';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { useAreaStore } from '../../store/useAreaStore';
import useAuthStore from '@/store/authStore';
import { useMemo } from 'react';
import { createListCollection, Box } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export const AreaSelector = () => {
  const { selectedOrganization } = useOrganizationStore();
  const { selectedArea, setSelectedArea } = useAreaStore();
  const user = useAuthStore((state) => state.user);

  const { data: areas } = useQuery({
    queryKey: ['areas', selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization ? areaService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  const filteredAreas = user.area && user.userRole === 'area_admin'
    ? areas?.filter((area) => area.areaId === user.area.areaId)
    : areas;

  const collection = useMemo(() => {
    return createListCollection({
      items: filteredAreas
        ? filteredAreas.map((area) => ({
            label: area.areaName,
            value: area.areaId,
          }))
        : [],
    });
  }, [filteredAreas]);

  return (
    <Box mb="4">
      <Field label="Select Area">
        <SelectRoot
          collection={collection}
          size="sm"
          disabled={!selectedOrganization}
          value={selectedArea?.areaId ? [selectedArea.areaId] : []}
          onValueChange={(e) => {
            const selectedAreaId = e.value[0];
            const area = areas?.find((a) => a.areaId === selectedAreaId) || null;
            setSelectedArea(area);
          }}
        >
          <SelectTrigger bg="white">
            <SelectValueText placeholder="Select Area" />
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
