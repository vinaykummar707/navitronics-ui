import { useQuery } from '@tanstack/react-query';
import { areaService } from '../../services/areaService';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { useAreaStore } from '../../store/useAreaStore';

export const AreaSelector = () => {
  const { selectedOrganization } = useOrganizationStore();
  const { selectedArea, setSelectedArea } = useAreaStore();

  const { data: areas } = useQuery({
    queryKey: ['areas', selectedOrganization?.organizationId],
    queryFn: () =>
      selectedOrganization ? areaService.getAll(selectedOrganization.organizationId) : Promise.resolve([]),
    enabled: !!selectedOrganization,
  });

  return (
    <select
      value={selectedArea?.areaId || ''}
      onChange={(e) => {
        const selectedAreaId = e.target.value;
        const area = areas?.find((a) => a.areaId === selectedAreaId) || null;
        setSelectedArea(area);
      }}
      className="block w-48 rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      disabled={!selectedOrganization}
    >
      <option value="">Select Area</option>
      {areas?.map((area) => (
        <option key={area.areaId} value={area.areaId}>
          {area.areaName}
        </option>
      ))}
    </select>
  );
};
